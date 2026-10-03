#!/usr/bin/env python3
"""
Generates the natural-voice clips (offline neural TTS, Piper voice fr_FR "upmc", speaker
"jessica", CC-BY-SA 4.0) with sherpa-onnx, then softens them (de-esser, gentle treble cut,
light compression). No reverb or echo is added.

Usage: pip install sherpa-onnx soundfile
       curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-upmc-medium.tar.bz2 | tar xj
       npx tsx scripts/voice/collect.ts > texts.json
       python3 scripts/voice/synthesize.py texts.json vits-piper-fr_FR-upmc-medium [--force]

Writes public/voice/<key>.mp3 (skips existing clips unless --force) and src/content/voiceManifest.json.
"""
import json, os, subprocess, sys, tempfile
from multiprocessing import Pool

SPEAKER = 0  # jessica
SPEED = 0.9
SOFTEN = ('silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
          'silenceremove=start_periods=1:start_threshold=-50dB,areverse,'
          'deesser=i=0.4,highshelf=f=6000:g=-4,lowpass=f=9000,'
          'acompressor=threshold=0.2:ratio=2:attack=10:release=150,alimiter=limit=0.9')

texts_path, model_dir = sys.argv[1], sys.argv[2]
force = '--force' in sys.argv[3:]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(root, 'public', 'voice')
os.makedirs(out_dir, exist_ok=True)
entries = json.load(open(texts_path))
todo = [e for e in entries if force or not os.path.exists(os.path.join(out_dir, e['key'] + '.mp3'))]
print(f'{len(entries)} segments, {len(todo)} to generate')

tts = None


def init():
    global tts
    import sherpa_onnx
    name = os.path.basename(os.path.normpath(model_dir)).removeprefix('vits-piper-')
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(model_dir, name + '.onnx'),
            tokens=os.path.join(model_dir, 'tokens.txt'),
            data_dir=os.path.join(model_dir, 'espeak-ng-data')),
        num_threads=1)))


def render(e):
    import soundfile as sf
    audio = tts.generate(e['text'], sid=SPEAKER, speed=SPEED)
    with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
        sf.write(wav.name, audio.samples, audio.sample_rate)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav.name, '-af', SOFTEN,
                        '-ac', '1', '-ar', '22050', '-b:a', '32k',
                        os.path.join(out_dir, e['key'] + '.mp3')], check=True)


if todo:
    with Pool(os.cpu_count(), initializer=init) as pool:
        for i, _ in enumerate(pool.imap_unordered(render, todo, chunksize=16), 1):
            if i % 500 == 0:
                print(f'  {i}/{len(todo)}', flush=True)

keys = sorted(e['key'] for e in entries if os.path.exists(os.path.join(out_dir, e['key'] + '.mp3')))
json.dump(keys, open(os.path.join(root, 'src', 'content', 'voiceManifest.json'), 'w'))
print(f'manifest: {len(keys)} clips')
