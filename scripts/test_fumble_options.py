import subprocess
from pathlib import Path

ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe").resolve()
v2_video = Path("assets/raw/abhi_video_silence_cut_v2.mp4").resolve()
output_dir = Path("output").resolve()

# Segment 1: 0 to 8.24s (ending at "capabilities,")
# For Option A: Jump from 8.24s straight to 9.32s ("multi-agent frameworks")
# Let's render Option A: 0 to 18s of v2 with fumble removed, sped up by 1.1x

# Cut 1: 0 to 8.24s
# Cut 2: 9.32s to 16.0s
fc_optA = """
[0:v]trim=start=0:end=8.24,setpts=PTS-STARTPTS[v1];
[0:a]atrim=start=0:end=8.24,asetpts=PTS-STARTPTS[a1];
[0:v]trim=start=9.32:end=16.0,setpts=PTS-STARTPTS[v2];
[0:a]atrim=start=9.32:end=16.0,asetpts=PTS-STARTPTS[a2];
[v1][a1][v2][a2]concat=n=2:v=1:a=1[vcat][acat];
[vcat]setpts=PTS/1.1[vout];
[acat]atempo=1.1[aout]
"""

cmdA = [
    str(ffmpeg_bin), "-y",
    "-i", str(v2_video),
    "-filter_complex", fc_optA,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    str(output_dir / "preview_fumble_optA_cut_autonomous_1.1x.mp4")
]

# Option B: Cut out just the gap (8.24 to 8.95), keeping autonomous
fc_optB = """
[0:v]trim=start=0:end=8.24,setpts=PTS-STARTPTS[v1];
[0:a]atrim=start=0:end=8.24,asetpts=PTS-STARTPTS[a1];
[0:v]trim=start=8.95:end=16.0,setpts=PTS-STARTPTS[v2];
[0:a]atrim=start=8.95:end=16.0,asetpts=PTS-STARTPTS[a2];
[v1][a1][v2][a2]concat=n=2:v=1:a=1[vcat][acat];
[vcat]setpts=PTS/1.1[vout];
[acat]atempo=1.1[aout]
"""

cmdB = [
    str(ffmpeg_bin), "-y",
    "-i", str(v2_video),
    "-filter_complex", fc_optB,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    str(output_dir / "preview_fumble_optB_trimmed_gap_1.1x.mp4")
]

print("Rendering Option A...")
subprocess.run(cmdA, check=True)
print("Rendering Option B...")
subprocess.run(cmdB, check=True)
print("Done rendering preview options!")
