#!/usr/bin/env python3
"""
Generates the natural-voice clips with Piper (offline neural TTS, voice fr "siwis", CC-BY 4.0).

Usage: npx tsx scripts/voice/collect.ts > texts.json
       python3 scripts/voice/synthesize.py texts.json PIPER_DIR

Writes public/voice/<key>.mp3 (skips existing clips) and src/content/voiceManifest.json.
"""
import json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

texts_path, piper_dir = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out_dir = os.path.join(root, 'public', 'voice')
os.makedirs(out_dir, exist_ok=True)
entries = json.load(open(texts_path))
todo = [e for e in entries if not os.path.exists(os.path.join(out_dir, e['key'] + '.mp3'))]
print(f'{len(entries)} segments, {len(todo)} to generate')

with tempfile.TemporaryDirectory() as tmp:
    if todo:
        lines = ''.join(json.dumps({'text': e['text'], 'output_file': os.path.join(tmp, e['key'] + '.wav')}, ensure_ascii=False) + '\n' for e in todo)
        subprocess.run(
            [os.path.join(piper_dir, 'piper', 'piper'), '--model', os.path.join(piper_dir, 'fr-siwis-medium.onnx'),
             '--json-input', '--length_scale', '1.06', '--sentence_silence', '0.15', '--quiet'],
            input=lines.encode('utf-8'), check=True,
        )

    def encode(e):
        wav = os.path.join(tmp, e['key'] + '.wav')
        mp3 = os.path.join(out_dir, e['key'] + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',
                        '-ac', '1', '-ar', '22050', '-b:a', '24k', mp3], check=True)

    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(encode, todo))

keys = sorted(e['key'] for e in entries if os.path.exists(os.path.join(out_dir, e['key'] + '.mp3')))
json.dump(keys, open(os.path.join(root, 'src', 'content', 'voiceManifest.json'), 'w'))
print(f'manifest: {len(keys)} clips')
