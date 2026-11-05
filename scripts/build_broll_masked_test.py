import subprocess
import json
from pathlib import Path
from faster_whisper import WhisperModel

ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe").resolve()
raw_video = Path("assets/raw/abhi_video_proper.mp4").resolve()
broll_dir = Path("assets/broll").resolve()
output_dir = Path("output").resolve()
assets_dir = output_dir / "master_assets"
audio_dir = Path("assets/audio").resolve()

# 1. Build the clean 30-second audio track with fumble removed:
# Part 1: 0.00s to 10.70s (after "capabilities,")
# Part 2: 11.78s to 31.08s (starts at "multi-agent frameworks", cutting the 1.08s fumble)
audio_cut_wav = audio_dir / "test_audio_30s.wav"

fc_audio = """
[0:a]atrim=start=0:end=10.70,asetpts=PTS-STARTPTS[a1];
[0:a]atrim=start=11.78:end=31.08,asetpts=PTS-STARTPTS[a2];
[a1][a2]concat=n=2:v=0:a=1,highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.8,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11[aout]
"""

cmd_audio = [
    str(ffmpeg_bin), "-y",
    "-i", str(raw_video),
    "-filter_complex", fc_audio,
    "-map", "[aout]",
    str(audio_cut_wav)
]

print("[1/4] Rendering clean 30s audio track with fumble removed & broadcast EQ...")
subprocess.run(cmd_audio, check=True)

# 2. Transcribe this exact audio with Faster-Whisper to create 100% sync-locked subtitles
print("[2/4] Generating exact word-level subtitles from the clean audio track...")
model = WhisperModel("base", device="cpu", compute_type="int8")
segments, _ = model.transcribe(str(audio_cut_wav), word_timestamps=True, language="en")

words_all = []
for seg in segments:
    if seg.words:
        for w in seg.words:
            words_all.append({"word": w.word.strip(), "start": w.start, "end": w.end})

chunks = []
current_chunk = []
for w in words_all:
    current_chunk.append(w)
    if len(current_chunk) >= 4 or w["word"].endswith((".", ",", "!", "?", ":")):
        chunks.append({
            "start": current_chunk[0]["start"],
            "end": current_chunk[-1]["end"],
            "words": current_chunk
        })
        current_chunk = []
if current_chunk:
    chunks.append({
        "start": current_chunk[0]["start"],
        "end": current_chunk[-1]["end"],
        "words": current_chunk
    })

def format_timestamp_ass(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds - int(seconds)) * 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

ass_path = audio_dir / "subtitles_test_30s.ass"
ass_header = """[Script Info]
Title: neural365 COMMUNITY Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,34,&H00FFFFFF,&H0038BDF8,&H00090D16,&HB0090D16,-1,0,0,0,100,100,0.5,0,3,4,0,2,60,60,65,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

with open(ass_path, "w", encoding="utf-8") as f:
    f.write(ass_header)
    for c in chunks:
        start_str = format_timestamp_ass(c["start"])
        end_str = format_timestamp_ass(c["end"])
        text = " ".join([w["word"].upper() for w in c["words"]])
        f.write(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{text}\n")

print(f"[+] Wrote {len(chunks)} subtitle events to {ass_path}")

# 3. Build Video Timeline:
# 0.00s to 9.20s: Presenter 1.0x wide shot (100% natural authentic lip sync)
# 9.20s to 15.56s: Full-screen Copilot Studio UI Zoom B-roll (covers the fumble and release docs smoothly)
# 15.56s to 30.00s: Presenter punches in 1.2x ("Like many architects, engineers...") with 100% authentic lip sync
# All composited at 1920x1080 with obsidian background, glowing border, and burned-in subtitles!

final_test_mp4 = output_dir / "test_broll_masked_sync_30s.mp4"

# Raw video inputs:
# 0: raw_video
# 1: audio_cut_wav
# 2: zoom_copilot_studio.mp4
# 3: center_border_blue.png

# Video segments from raw:
# Segment 1 (0 to 9.20s): wide shot
# Segment 2 (11.78 + (15.56 - 10.70) = 16.64s to 31.08s): punch-in shot
# Note: 15.56s in master corresponds to 16.64s in raw because of the 1.08s cut!
fc_video = f"""
color=c=0x090D16:s=1920x1080:d=30:r=30[base];

[2:v]scale=1920:1080,format=rgba[broll_copilot];

[0:v]trim=start=0:end=9.20,setpts=PTS-STARTPTS,scale=1280:720,format=rgba[pres_wide];
[0:v]trim=start=16.64:end=31.08,setpts=PTS-STARTPTS,crop=1066:600:107:60,scale=1280:720,format=rgba[pres_punchin];

[base][broll_copilot]overlay=0:0:enable='between(t,9.20,15.56)'[bg1];
[bg1][pres_wide]overlay=320:180:enable='between(t,0,9.20)'[bg2];
[bg2][pres_punchin]overlay=320:180:enable='between(t,15.56,30)'[bg3];
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

print("[3/4] Rendering composite 30s master video with B-roll masking & 100% locked lip sync...")
subprocess.run(cmd_master, check=True)
print(f"[+] SUCCESS! Master test clip rendered to: {final_test_mp4}")
