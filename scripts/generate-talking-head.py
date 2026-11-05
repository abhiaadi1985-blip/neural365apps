import os
import sys
import argparse
import urllib.request
import subprocess
import replicate
from dotenv import load_dotenv

load_dotenv('.env.local')

API_TOKEN = os.getenv('REPLICATE_API_TOKEN')
if not API_TOKEN:
    print("Error: REPLICATE_API_TOKEN is not set in .env.local")
    sys.exit(1)

client = replicate.Client(api_token=API_TOKEN)

def extract_audio_clip(input_wav, output_wav, duration_sec=15):
    ffmpeg_path = os.path.join(
        os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'
    )
    cmd = [
        ffmpeg_path, '-y',
        '-i', input_wav,
        '-t', str(duration_sec),
        '-c:a', 'pcm_s16le',
        output_wav
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Extracted {duration_sec}s preview audio to {output_wav}")

def generate_talking_head(image_path, audio_path, output_mp4, still_mode=False, preprocess='crop'):
    print(f"Submitting to SadTalker on Replicate...")
    print(f"  Image: {image_path}")
    print(f"  Audio: {audio_path}")
    print(f"  Preprocess: {preprocess}, Still Mode: {still_mode}")

    model = client.models.get("cjwbw/sadtalker")
    latest_version = model.latest_version
    print(f"Using SadTalker version: {latest_version.id[:12]}...")

    with open(image_path, 'rb') as img_f, open(audio_path, 'rb') as aud_f:
        output = client.run(
            f"cjwbw/sadtalker:{latest_version.id}",
            input={
                "source_image": img_f,
                "driven_audio": aud_f,
                "use_enhancer": True,      # GFPGAN face restoration
                "use_eyeblink": True,      # Realistic eye blinks
                "still_mode": still_mode,  # Natural head tilt and sway
                "preprocess": preprocess,  # 'crop' or 'full'
                "size_of_image": 512,
                "expression_scale": 1.0,
            }
        )

    print("Output received from Replicate:", output)
    video_url = str(output)
    
    os.makedirs(os.path.dirname(output_mp4), exist_ok=True)
    print(f"Downloading talking head video to {output_mp4}...")
    urllib.request.urlretrieve(video_url, output_mp4)
    print(f"Successfully saved to {output_mp4} ({os.path.getsize(output_mp4)} bytes)")
    return output_mp4

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generate talking head video from headshot and voice audio")
    parser.add_argument('--preview', action='store_true', help="Generate a fast 15-second preview")
    parser.add_argument('--full', action='store_true', help="Generate the full video from voice_sample.wav")
    parser.add_argument('--preprocess', default='crop', choices=['crop', 'full', 'resize', 'extcrop'], help="Preprocessing mode for SadTalker")
    args = parser.parse_args()

    headshot = os.path.join('assets', 'presenter', 'headshot.jpg')
    voice_wav = os.path.join('assets', 'presenter', 'voice_sample.wav')

    if not os.path.exists(headshot):
        print(f"Error: {headshot} not found")
        sys.exit(1)
    if not os.path.exists(voice_wav):
        print(f"Error: {voice_wav} not found")
        sys.exit(1)

    if args.preview or not args.full:
        preview_audio = os.path.join('assets', 'presenter', 'voice_preview_15s.wav')
        extract_audio_clip(voice_wav, preview_audio, duration_sec=15)
        out_file = os.path.join('output', 'talking_head_preview_15s.mp4')
        generate_talking_head(headshot, preview_audio, out_file, preprocess=args.preprocess)
    else:
        out_file = os.path.join('output', 'talking_head_full.mp4')
        generate_talking_head(headshot, voice_wav, out_file, preprocess=args.preprocess)
