from faster_whisper import WhisperModel
from pathlib import Path

v2 = Path("assets/raw/abhi_video_silence_cut_v2.mp4")
model = WhisperModel("base", device="cpu", compute_type="int8")

segments, _ = model.transcribe(str(v2), word_timestamps=True)

print("--- WORD TIMESTAMPS FOR V2 (FIRST 20 SECONDS) ---")
for s in segments:
    if s.start > 20:
        break
    print(f"\n[Segment {s.start:.2f}s - {s.end:.2f}s]: {s.text}")
    if s.words:
        for w in s.words:
            print(f"  {w.start:.2f} - {w.end:.2f}: {w.word}")
