import subprocess
from pathlib import Path

ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe").resolve()
raw_video = Path("assets/raw/abhi_video_proper.mp4").resolve()
broll_dir = Path("assets/broll").resolve()
output_dir = Path("output").resolve()
assets_dir = output_dir / "master_assets"
audio_dir = Path("assets/audio").resolve()

audio_cut_wav = audio_dir / "test_audio_30s.wav"
final_test_mp4 = output_dir / "test_broll_masked_sync_30s.mp4"

# Fix PTS offset so pres_punchin delivers frames starting at t=15.56s
# pres_punchin: raw 16.64s to 31.08s (14.44s duration)
# Offset PTS by 15.56/TB so its first frame arrives at t=15.56s!
fc_video = """
color=c=0x090D16:s=1920x1080:d=30:r=30[base];

[2:v]scale=1920:1080,format=rgba[broll_copilot];

[0:v]trim=start=0:end=9.20,setpts=PTS-STARTPTS,scale=1280:720,format=rgba[pres_wide];
[0:v]trim=start=16.64:end=31.08,setpts=PTS-STARTPTS+15.56/TB,crop=1066:600:107:60,scale=1280:720,format=rgba[pres_punchin];

[base][broll_copilot]overlay=0:0:enable='between(t,9.20,15.56)'[bg1];
[bg1][pres_wide]overlay=320:180:enable='between(t,0,9.20)'[bg2];
[bg2][pres_punchin]overlay=320:180:enable='between(t,15.56,30)':eof_action=pass[bg3];
[bg3][3:v]overlay=315:175:enable='between(t,0,9.20)+between(t,15.56,30)'[v_clean];
[v_clean]subtitles=assets/audio/subtitles_test_30s.ass[vout]
"""

cmd_master = [
    str(ffmpeg_bin), "-y",
    "-i", str(raw_video),
    "-i", str(audio_cut_wav),
    "-stream_loop", "-1", "-i", str(broll_dir / "zoom_copilot_studio.mp4"),
    "-loop", "1", "-i", str(assets_dir / "center_border_blue.png"),
    "-filter_complex", fc_video,
    "-map", "[vout]",
    "-map", "1:a",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    "-t", "30",
    str(final_test_mp4)
]

print("Rendering test clip with corrected PTS offset...")
subprocess.run(cmd_master, check=True)
print("Done! Rendered:", final_test_mp4)
