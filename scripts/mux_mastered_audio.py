import os
import subprocess

FFMPEG = os.path.join(os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
RAW_VIDEO = os.path.join(os.getcwd(), 'assets', 'raw_recordings', 'abhi_video_01.mp4')
RENDERED_VIDEO = os.path.join(os.getcwd(), 'output', 'neural365_keynote_5min_layoutA.mp4')
TEMP_MUXED = os.path.join(os.getcwd(), 'output', 'neural365_keynote_5min_layoutA_muxed.mp4')

audio_filter = "highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11"

cmd = [
    FFMPEG, '-y',
    '-i', RENDERED_VIDEO,
    '-i', RAW_VIDEO,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-af', audio_filter,
    '-c:a', 'aac', '-b:a', '192k',
    '-t', '297.61',
    TEMP_MUXED
]

print("Muxing mastered audio track into rendered 1080p video...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr[-500:])
else:
    # Replace original with the muxed version
    os.replace(TEMP_MUXED, RENDERED_VIDEO)
    print(f"Successfully mastered audio and muxed into: {RENDERED_VIDEO}")
    print(f"Final file size: {os.path.getsize(RENDERED_VIDEO) / (1024*1024):.2f} MB")
