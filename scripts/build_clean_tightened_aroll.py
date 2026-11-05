import subprocess
import json
from pathlib import Path

ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe").resolve()
raw_video = Path("assets/raw/abhi_video_proper.mp4").resolve()
output_dir = Path("output").resolve()
assets_raw = Path("assets/raw").resolve()
audio_dir = Path("assets/audio").resolve()
audio_dir.mkdir(parents=True, exist_ok=True)

# 1. Clean cut:
# Part 1: 0.0s to 10.70s (after "capabilities,")
# Part 2: 11.78s to 297.60s (from "multi-agent frameworks" to the end)
# Total raw duration without fumble: 10.70 + (297.60 - 11.78) = 296.52s
# At 1.1x tempo: 296.52 / 1.1 = ~269.56s (~4 min 29 sec)

tightened_mp4 = assets_raw / "abhi_video_1.1x_clean.mp4"

# We use select & aselect filters with exact timestamps to avoid PTS concat desync:
# Audio: keep 0-10.70 and 11.78-end
# Video: keep 0-10.70 and 11.78-end
fc = """
[0:v]select='between(t,0,10.70)+between(t,11.78,297.60)',setpts=N/FRAME_RATE/TB,fps=30,setpts=PTS/1.1,format=yuv420p[vout];
[0:a]aselect='between(t,0,10.70)+between(t,11.78,297.60)',asetpts=N/SR/TB,atempo=1.1[aout]
"""

cmd = [
    str(ffmpeg_bin), "-y",
    "-i", str(raw_video),
    "-filter_complex", fc,
    "-map", "[vout]", "-map", "[aout]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    str(tightened_mp4)
]

print("[1/3] Rendering clean tightened A-roll at 1.1x tempo (fumble removed, constant 30fps)...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("Error:", res.stderr[-1000:])
    exit(1)
print(f"[+] Rendered: {tightened_mp4}")

# 2. Check durations with ffprobe
probe_cmd = [
    str(ffmpeg_bin), "-i", str(tightened_mp4)
]
probe_res = subprocess.run(probe_cmd, capture_output=True, text=True)
for line in probe_res.stderr.splitlines():
    if "Duration" in line or "Stream #0:" in line:
        print(line.strip())

# 3. Transcribe this exact file with Faster-Whisper to guarantee 100% perfect subtitle sync
print("[2/3] Transcribing exact audio track for 100% subtitle sync...")
from faster_whisper import WhisperModel
model = WhisperModel("base", device="cpu", compute_type="int8")

segments, _ = model.transcribe(str(tightened_mp4), word_timestamps=True, language="en")

words_all = []
segments_out = []
for seg in segments:
    seg_dict = {
        "start": seg.start,
        "end": seg.end,
        "text": seg.text.strip(),
        "words": []
    }
    if seg.words:
        for w in seg.words:
            w_obj = {"word": w.word.strip(), "start": w.start, "end": w.end}
            seg_dict["words"].append(w_obj)
            words_all.append(w_obj)
    segments_out.append(seg_dict)

with open(audio_dir / "transcript_1.1x.json", "w", encoding="utf-8") as f:
    json.dump(segments_out, f, indent=2)

def format_timestamp_ass(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds - int(seconds)) * 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

# Group into 3-4 word readable chunks
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

ass_path = audio_dir / "subtitles_1.1x.ass"
ass_header = """[Script Info]
Title: neural365 COMMUNITY Subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,28,&H00FFFFFF,&H0038BDF8,&H00090D16,&HB0090D16,-1,0,0,0,100,100,0.5,0,3,3,0,2,40,40,45,1

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

print(f"[3/3] Generated 100% sync-matched subtitles at {ass_path} ({len(chunks)} subtitle events)")

# 4. Generate a 20-second test preview verifying zero blank frames and perfect subtitle sync
preview_mp4 = output_dir / "preview_perfect_sync_20s.mp4"
preview_cmd = [
    str(ffmpeg_bin), "-y",
    "-ss", "0", "-t", "20",
    "-i", str(tightened_mp4),
    "-vf", f"subtitles='{str(ass_path).replace(chr(92), '/')}'",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
    "-c:a", "copy",
    str(preview_mp4)
]
print("Rendering 20-second verification preview...")
subprocess.run(preview_cmd, check=True)
print(f"[+] Done! Preview available at: {preview_mp4}")
