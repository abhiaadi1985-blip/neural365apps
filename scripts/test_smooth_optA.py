import subprocess
from pathlib import Path

ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe").resolve()
raw_video = Path("assets/raw/abhi_video_proper.mp4").resolve()
output_dir = Path("output").resolve()

# Cut directly from raw clean file:
# Part 1: 0 to 10.70s (after "capabilities,")
# Part 2: 11.78s to 18.0s (starts at "multi-agent frameworks")
# This removes "autonomous" and the fumble completely with zero auto-editor chopping!
# We force fps=30 constant frame rate and format=yuv420p to eliminate all flickering.

fc = """
[0:v]trim=start=0:end=10.70,setpts=PTS-STARTPTS,fps=30[v1];
[0:a]atrim=start=0:end=10.70,asetpts=PTS-STARTPTS[a1];
[0:v]trim=start=11.78:end=18.0,setpts=PTS-STARTPTS,fps=30[v2];
[0:a]atrim=start=11.78:end=18.0,asetpts=PTS-STARTPTS[a2];
[v1][a1][v2][a2]concat=n=2:v=1:a=1[vcat][acat];
[vcat]setpts=PTS/1.1,format=yuv420p[vout];
[acat]atempo=1.1[aout]
"""

cmd = [
    str(ffmpeg_bin), "-y",
    "-i", str(raw_video),
    "-filter_complex", fc,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    str(output_dir / "preview_fumble_optA_smooth_cfr.mp4")
]

print("Rendering smooth CFR 30fps Option A cut...")
subprocess.run(cmd, check=True)
print("Finished!")
