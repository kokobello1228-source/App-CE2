#!/usr/bin/env python3
"""
Generates the natural-voice clips (offline neural TTS, Piper voice fr_FR "upmc", speaker
"jessica", CC-BY-SA 4.0) with sherpa-onnx, softened (de-esser, gentle treble cut, light
compression, no reverb).

Every clip is checked by ear by a speech recogniser (Whisper large-v3 turbo): a neural voice
sometimes garbles a word, differently at each run. Each text is generated up to ATTEMPTS
times and the take whose transcription sounds closest to the text is kept (compared as
phonemes, so homophones such as "riz" / "ri" count as correct). A text that never sounds
right is left out of the manifest: the app then reads it with the device voice.

Setup (once):
  pip install sherpa-onnx soundfile numpy espeakng-loader phonemizer-fork && pip install --no-deps num2words
  curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-upmc-medium.tar.bz2 | tar xj
  curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2 | tar xj
Usage:
  npx tsx scripts/voice/collect.ts > texts.json
  python3 scripts/voice/synthesize.py texts.json vits-piper-fr_FR-upmc-medium sherpa-onnx-whisper-turbo [--force] [--verify] [--workers N]
  (--verify listens again to every published clip before generating the missing ones)

Writes public/voice/<key>.mp3, src/content/voiceManifest.json and scripts/voice/report.json
(score of every clip; existing clips keep their recorded score unless --force).
"""
import difflib, json, os, re, subprocess, sys, tempfile
from multiprocessing import Pool

SPEAKER = 0  # jessica
SPEED = 0.9
ATTEMPTS = 6
GOOD = 0.95   # accept this take at once
KEEP = 0.92   # best take below this: left to the device voice
SOFTEN = ('silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
          'silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
          'deesser=i=0.4,highshelf=f=6000:g=-4,lowpass=f=9000,'
          'acompressor=threshold=0.2:ratio=2:attack=10:release=150,alimiter=limit=0.9')
MIN_WORDS = 3  # same rule as MIN_SEGMENT_WORDS in src/services/voiceClips.ts

args = [a for a in sys.argv[1:] if not a.startswith('--')]
texts_path, model_dir, asr_dir = args[0], args[1], args[2]
force = '--force' in sys.argv
workers = int(sys.argv[sys.argv.index('--workers') + 1]) if '--workers' in sys.argv else 2
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(root, 'public', 'voice')
report_path = os.path.join(root, 'scripts', 'voice', 'report.json')


def tts_input(text):
    """Short sentences are joined to their neighbour with a comma: synthesized alone, they are garbled."""
    parts = re.split(r'(?<=[.!?…])\s+', text.strip())
    words = lambda s: len([w for w in s.split() if re.search(r'\w', w)])
    for i in range(len(parts) - 1):
        if words(parts[i]) < MIN_WORDS or words(parts[i + 1]) < MIN_WORDS:
            parts[i] = re.sub(r'\s*[.!?…]+$', ',', parts[i])
    return ' '.join(parts)


tts = rec = phonemizer = None


def init():
    global tts, rec, phonemizer
    import sherpa_onnx, espeakng_loader
    from phonemizer.backend import EspeakBackend
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    threads = max(1, (os.cpu_count() or 2) // workers)
    name = os.path.basename(os.path.normpath(model_dir)).removeprefix('vits-piper-')
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(model_dir, name + '.onnx'),
            tokens=os.path.join(model_dir, 'tokens.txt'),
            data_dir=os.path.join(model_dir, 'espeak-ng-data')),
        num_threads=1)))
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=os.path.join(asr_dir, 'turbo-encoder.int8.onnx'),
        decoder=os.path.join(asr_dir, 'turbo-decoder.int8.onnx'),
        tokens=os.path.join(asr_dir, 'turbo-tokens.txt'),
        language='fr', task='transcribe', num_threads=threads)
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    phonemizer = EspeakBackend('fr-fr', language_switch='remove-flags')


# The part of a text that must be heard exactly (dictated word or number, fraction, answer choice).
KEY_PATTERNS = [re.compile(p) for p in (
    r'^Le mot à écrire est (.+)\.$',
    r'^Je répète : le mot (.+)\.$',
    r'^Le nombre à écrire est (.+)\.$',
    r'^La fraction est (.+)\.$',
    r'^Je répète : (.+)\.$',
    r'^Est-ce que ça veut dire (.+) \?$',
    r'^Voici le mot (.+)\.$',
)]
# Vowels the recogniser and espeak often swap without any audible difference (est / et…).
CLOSE = str.maketrans({'ɛ': 'e', 'ɔ': 'o', 'œ': 'ø', 'ə': 'ø'})


def sounds(text):
    from num2words import num2words
    text = re.sub(r'\d+', lambda m: ' ' + num2words(int(m.group()), lang='fr') + ' ', text)  # the recogniser writes "83"
    text = re.sub(r'\b(\w)(?:-(?=\w\b))', r'\1, ', text)  # "C-A-B" (spelled by the recogniser) -> "C, A, B"
    text = re.sub(r'[«»"“”()]', ' ', text)
    phones = phonemizer.phonemize([text], strip=True)[0]
    return re.sub(r'(.)\1+', r'\1', re.sub(r'[\sˈˌː.,!?;:…-]', '', phones).translate(CLOSE))


def number_value(words):
    """0-999 written in words ("quatre-vingt-trois") -> 83, else None."""
    global NUMBERS
    if NUMBERS is None:
        from num2words import num2words
        NUMBERS = {re.sub(r'[\s-]|\bet\b', '', num2words(n, lang='fr')): n for n in range(1000)}
    return NUMBERS.get(re.sub(r'[\s-]|\bet\b', '', words.lower()))


NUMBERS = None


LETTER = re.compile(r'^(deux )?([a-z]|euh|o euh collés)( (accent (aigu|grave|circonflexe)|tréma|cédille))?$')


def spelled_tail(text):
    """The letters spelled at the end of a text ("…: c, a, b, a, n, euh.") or None."""
    tokens = [t.strip() for t in re.split(r'[,:]', re.sub(r'[.!?…]+$', '', text))]
    tail = []
    while tokens and LETTER.match(tokens[-1]):
        tail.insert(0, tokens.pop())
    return ', '.join(tail) if len(tail) >= 2 else None


def score(text, heard):
    heard_sounds = sounds(heard)
    spelled = spelled_tail(text)
    if spelled and sounds(spelled) not in heard_sounds:
        return 0.0  # every spelled letter must be heard
    for pattern in KEY_PATTERNS:
        match = pattern.match(text)
        if not match:
            continue
        value = number_value(match.group(1))
        digits = [int(d) for d in re.findall(r'\d+', heard)]
        if value is not None and digits and digits != [value]:
            return 0.0  # a number heard as another number
        if sounds(match.group(1)) not in heard_sounds:
            return 0.0
    return difflib.SequenceMatcher(None, sounds(text), heard_sounds).ratio()


def hear(mp3_bytes):
    """What the recogniser understands in an MP3, exactly as the app will play it."""
    import numpy as np
    pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', '-', '-f', 'f32le', '-ar', '16000', '-ac', '1', '-'],
                         input=mp3_bytes, capture_output=True, check=True).stdout
    # Half a second of silence around the take: without it, Whisper drops the last word.
    pad = np.zeros(8000, dtype=np.float32)
    stream = rec.create_stream()
    stream.accept_waveform(16000, np.concatenate([pad, np.frombuffer(pcm, dtype=np.float32), pad]))
    rec.decode_stream(stream)
    return stream.result.text


def take(text):
    """One take: synthesized, softened, encoded to MP3, then listened to."""
    import numpy as np
    audio = tts.generate(tts_input(text), sid=SPEAKER, speed=SPEED)
    mp3 = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(audio.sample_rate), '-ac', '1', '-i', '-',
                          '-af', SOFTEN, '-ac', '1', '-ar', '22050', '-b:a', '32k', '-f', 'mp3', '-'],
                         input=np.asarray(audio.samples, dtype=np.float32).tobytes(), capture_output=True, check=True).stdout
    return mp3, hear(mp3)


def render(e):
    best = None
    for _ in range(ATTEMPTS):
        mp3, heard = take(e['text'])
        s = score(e['text'], heard)
        if best is None or s > best[0]:
            best = (s, mp3, heard)
        if s >= GOOD:
            break
    s, mp3, heard = best
    path = os.path.join(out_dir, e['key'] + '.mp3')
    if s >= KEEP:
        with open(path, 'wb') as f:
            f.write(mp3)
    elif os.path.exists(path):
        os.remove(path)
    return e['key'], {'text': e['text'], 'score': round(s, 3), 'heard': heard}


def verify(item):
    """Listens again to a published clip; a clip no longer understood is removed (and generated again)."""
    key, text = item
    path = os.path.join(out_dir, key + '.mp3')
    heard = hear(open(path, 'rb').read())
    s = score(text, heard)
    if s < KEEP:
        os.remove(path)
    return key, {'text': text, 'score': round(s, 3), 'heard': heard}


if __name__ == '__main__':
    os.makedirs(out_dir, exist_ok=True)
    entries = json.load(open(texts_path))
    report = json.load(open(report_path)) if os.path.exists(report_path) and not force else {}
    # New texts, and texts that never sounded right last time (another try may succeed).
    if '--verify' in sys.argv:
        # Listen again to every published clip, as the app plays it (MP3).
        check = [(k, v['text']) for k, v in report.items() if v['score'] >= KEEP and os.path.exists(os.path.join(out_dir, k + '.mp3'))]
        print(f'verifying {len(check)} clips', flush=True)
        with Pool(workers, initializer=init) as pool:
            for i, (key, result) in enumerate(pool.imap_unordered(verify, check, chunksize=8), 1):
                report[key] = result
                if i % 500 == 0:
                    json.dump(report, open(report_path, 'w'), ensure_ascii=False, indent=0)
                    print(f'  {i}/{len(check)}', flush=True)
        print(f'{sum(1 for k, _ in check if report[k]["score"] < KEEP)} clips no longer understood', flush=True)
    todo = [e for e in entries if force or e['key'] not in report or report[e['key']]['score'] < KEEP]
    print(f'{len(entries)} segments, {len(todo)} to generate', flush=True)
    if todo:
        with Pool(workers, initializer=init) as pool:
            for i, (key, result) in enumerate(pool.imap_unordered(render, todo, chunksize=4), 1):
                report[key] = result
                if i % 100 == 0:
                    json.dump(report, open(report_path, 'w'), ensure_ascii=False, indent=0)
                    print(f'  {i}/{len(todo)}', flush=True)
    wanted = {e['key'] for e in entries}
    report = {k: v for k, v in report.items() if k in wanted}
    json.dump(dict(sorted(report.items())), open(report_path, 'w'), ensure_ascii=False, indent=0)
    keys = sorted(k for k, v in report.items() if v['score'] >= KEEP and os.path.exists(os.path.join(out_dir, k + '.mp3')))
    json.dump(keys, open(os.path.join(root, 'src', 'content', 'voiceManifest.json'), 'w'))
    left = [v for v in report.values() if v['score'] < KEEP]
    print(f'manifest: {len(keys)} clips; {len(left)} left to the device voice')
