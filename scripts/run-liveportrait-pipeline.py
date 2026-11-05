import os
import sys
import time
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

FFMPEG_PATH = os.path.join(
    os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'
)

def poll_prediction(prediction):
    pred_id = prediction.id
    print(f"Prediction created: {pred_id}. Waiting for completion...")
    start_time = time.time()
    while True:
        p = client.predictions.get(pred_id)
        elapsed = int(time.time() - start_time)
        print(f"[{elapsed}s] Status: {p.status}")
        if p.status == 'succeeded':
            return p.output
        elif p.status in ['failed', 'canceled']:
            raise RuntimeError(f"Prediction {pred_id} failed with error: {p.error}")
        time.sleep(5)

def step1_generate_driving_video(image_path, audio_path, output_driving_mp4):
    print("\n=======================================================")
    print("STAGE 1: Generating driving motion video from speech...")
    print(f"  Face source: {image_path}")
    print(f"  Speech audio: {audio_path}")
    print("=======================================================\n")
    
    st_version = client.models.get("cjwbw/sadtalker").latest_version.id
    print(f"SadTalker version: {st_version[:12]}...")
    
    with open(image_path, 'rb') as img_f, open(audio_path, 'rb') as aud_f:
        prediction = client.predictions.create(
            version=st_version,
            input={
                "source_image": img_f,
                "driven_audio": aud_f,
                "use_enhancer": False,
                "use_eyeblink": True,
                "still_mode": False,
                "preprocess": "crop",
                "size_of_image": 512,
                "expression_scale": 1.0,
            }
        )
        output = poll_prediction(prediction)
    
    video_url = str(output)
    print(f"Stage 1 complete! Driving video URL: {video_url}")
    os.makedirs(os.path.dirname(output_driving_mp4), exist_ok=True)
    urllib.request.urlretrieve(video_url, output_driving_mp4)
    print(f"Saved driving video to: {output_driving_mp4} ({os.path.getsize(output_driving_mp4)} bytes)")
    return output_driving_mp4

def step2_run_liveportrait(image_path, driving_video_path, output_liveportrait_mp4, dsize=780):
    print("\n=======================================================")
    print(f"STAGE 2: Running fofr/live-portrait with Motion Retargeting (Resolution: {dsize}px)...")
    print(f"  Source Face: {image_path}")
    print(f"  Driving Video: {driving_video_path}")
    print("=======================================================\n")
    
    lp_version = client.models.get("fofr/live-portrait").latest_version.id
    print(f"LivePortrait version: {lp_version[:12]}...")
    with open(image_path, 'rb') as img_f, open(driving_video_path, 'rb') as vid_f:
        prediction = client.predictions.create(
            version=lp_version,
            input={
                "face_image": img_f,
                "driving_video": vid_f,
                "live_portrait_dsize": dsize,
                "live_portrait_scale": 2.3,
                "video_frame_load_cap": 0,       # 0 = load all frames (full 15s)
                "video_select_every_n_frames": 1,
                "live_portrait_lip_retargeting": True,
                "live_portrait_lip_retargeting_multiplier": 1.0,
                "live_portrait_eye_retargeting": True,
                "live_portrait_eyes_retargeting_multiplier": 1.0,
                "live_portrait_lip_zero": True,
                "live_portrait_stitching": True,
                "live_portrait_relative": True,
            }
        )
        output = poll_prediction(prediction)
        
    print(f"Stage 2 complete! Output: {output}")
    if isinstance(output, list) and len(output) > 0:
        video_url = output[0]
    else:
        video_url = str(output)
    os.makedirs(os.path.dirname(output_liveportrait_mp4), exist_ok=True)
    urllib.request.urlretrieve(video_url, output_liveportrait_mp4)
    print(f"Saved LivePortrait output to: {output_liveportrait_mp4} ({os.path.getsize(output_liveportrait_mp4)} bytes)")
    return output_liveportrait_mp4

def step3_mux_audio(video_path, audio_path, final_output_mp4):
    print("\n=======================================================")
    print("STAGE 3: Muxing original 48kHz audio track onto video...")
    print(f"  Video: {video_path}")
    print(f"  Audio: {audio_path}")
    print("=======================================================\n")
    
    os.makedirs(os.path.dirname(final_output_mp4), exist_ok=True)
    cmd = [
        FFMPEG_PATH, '-y',
        '-i', video_path,
        '-i', audio_path,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        final_output_mp4
    ]
    subprocess.run(cmd, check=True)
    print(f"Final video rendered successfully: {final_output_mp4} ({os.path.getsize(final_output_mp4)} bytes)")
    return final_output_mp4

if __name__ == '__main__':
    headshot = os.path.join('assets', 'presenter', 'headshot_01.jpg')
    audio = os.path.join('assets', 'presenter', 'voice_preview_15s.wav')
    
    if not os.path.exists(headshot):
        print(f"Error: {headshot} not found")
        sys.exit(1)
    if not os.path.exists(audio):
        print(f"Error: {audio} not found")
        sys.exit(1)
        
    driving_video = os.path.join('output', 'intermediate_driving_15s.mp4')
    liveportrait_raw = os.path.join('output', 'liveportrait_raw_780p.mp4')
    final_video = os.path.join('output', 'liveportrait_retargeted_780p.mp4')
    
    # Check if driving video is already generated or download directly
    if not os.path.exists(driving_video) or os.path.getsize(driving_video) == 0:
        known_url = "https://replicate.delivery/yhqm/mfdtW4ShbN2pSKh7mxRQ4fXsEmTLLb24Pd7LRVrfxq6UfYf6C/out.mp4"
        print(f"Downloading existing Stage 1 output from: {known_url}...")
        os.makedirs('output', exist_ok=True)
        try:
            urllib.request.urlretrieve(known_url, driving_video)
            print(f"Downloaded driving video to: {driving_video} ({os.path.getsize(driving_video)} bytes)")
        except Exception as e:
            print(f"Could not download cached Stage 1: {e}. Re-generating...")
            step1_generate_driving_video(headshot, audio, driving_video)
    else:
        print(f"Using existing driving video: {driving_video} ({os.path.getsize(driving_video)} bytes)")
    
    # 2. LivePortrait motion retargeting with 780px resolution
    step2_run_liveportrait(headshot, driving_video, liveportrait_raw, dsize=780)
    
    # 3. Audio muxing
    step3_mux_audio(liveportrait_raw, audio, final_video)
    
    print("\nAll stages finished successfully!")
