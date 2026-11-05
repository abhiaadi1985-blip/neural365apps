from faster_whisper import WhisperModel
from pathlib import Path

raw_video = Path("assets/raw/abhi_video_01.mp4")
model = WhisperModel("base", device="cpu", compute_type="int8")

segments, _ = model.transcribe(str(raw_video), word_timestamps=True)

print("--- WORD TIMESTAMPS FOR FIRST 25 SECONDS ---")
for s in segments:
    if s.start > 25:
        break
    print(f"\n[Segment {s.start:.2f}s - {s.end:.2f}s]: {s.text}")
    if s.words:
        for w in s.words:
            print(f"  {w.start:.2f} - {w.end:.2f}: {w.word}")
