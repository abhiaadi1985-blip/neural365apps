import json
from pathlib import Path
from faster_whisper import WhisperModel

project_root = Path(__file__).resolve().parent.parent
tightened_video = project_root / "assets" / "raw" / "abhi_video_tightened_1.15x.mp4"
audio_dir = project_root / "assets" / "audio"
audio_dir.mkdir(parents=True, exist_ok=True)

srt_path = audio_dir / "subtitles_tightened.srt"
ass_path = audio_dir / "subtitles_kinetic.ass"
json_path = audio_dir / "transcript_tightened.json"

print(f"Loading faster-whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")

print(f"Transcribing {tightened_video.name} with word-level timestamps...")
segments, info = model.transcribe(
    str(tightened_video),
    beam_size=5,
    word_timestamps=True,
    language="en"
)

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
            w_obj = {"word": w.word.strip(), "start": w.start, "end": w.end, "probability": w.probability}
            seg_dict["words"].append(w_obj)
            words_all.append(w_obj)
    segments_out.append(seg_dict)

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(segments_out, f, indent=2)

print(f"Wrote transcript to {json_path} ({len(segments_out)} segments, {len(words_all)} words)")

def format_timestamp_srt(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def format_timestamp_ass(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds - int(seconds)) * 100)
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"

# Build chunks of 3-5 words for modern fast-reading subtitles
chunks = []
current_chunk = []
for w in words_all:
    current_chunk.append(w)
    # Break chunk if reaches 4 words or has punctuation
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

# 1. Generate standard SRT
with open(srt_path, "w", encoding="utf-8") as f:
    for idx, c in enumerate(chunks, 1):
        txt = " ".join([w["word"] for w in c["words"]])
        f.write(f"{idx}\n")
        f.write(f"{format_timestamp_srt(c['start'])} --> {format_timestamp_srt(c['end'])}\n")
        f.write(f"{txt}\n\n")

print(f"Wrote SRT to {srt_path}")

# 2. Generate styled ASS (Advanced SubStation Alpha)
# High-contrast modern tech style: White text, electric cyan outline/glow, semi-transparent black pill box
ass_header = """[Script Info]
Title: neural365 COMMUNITY Keynote Captions
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KeynoteTitle,Arial,38,&H00FFFFFF,&H0038BDF8,&H00090D16,&HB0090D16,-1,0,0,0,100,100,0.5,0,3,4,0,2,80,80,95,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

with open(ass_path, "w", encoding="utf-8") as f:
    f.write(ass_header)
    for c in chunks:
        start_str = format_timestamp_ass(c["start"])
        end_str = format_timestamp_ass(c["end"])
        text = " ".join([w["word"].upper() for w in c["words"]])
        f.write(f"Dialogue: 0,{start_str},{end_str},KeynoteTitle,,0,0,0,,{text}\n")

print(f"Wrote ASS subtitles to {ass_path}")
