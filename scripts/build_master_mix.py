import json
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

SR = 24000
ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "assets" / "audio" / "ns03"
RAW_DIR = AUDIO_DIR / "raw"
CLEAN_DIR = AUDIO_DIR / "clean"
CLEAN_DIR.mkdir(parents=True, exist_ok=True)

BEAT_SOURCES = [
    {
        "id": "beat_1",
        "sub_files": ["beat_1a.wav", "beat_1b.wav"],
        "script": "A supplier just delayed purchase order eight forty two by five days. The purchaser usually spends hours chasing spreadsheets."
    },
    {
        "id": "beat_2",
        "sub_files": ["beat_2.wav"],
        "script": "Instead, the Procurement Agent immediately traces marking and pegging chains across Dynamics three sixty-five Supply Chain Management to calculate the downstream blast radius."
    },
    {
        "id": "beat_3",
        "sub_files": ["beat_3.wav"],
        "script": "It checks confirmed incoming supply against projected on-hand inventory, catching the exact day safety stock breaches minimum threshold and flips into a stockout."
    },
    {
        "id": "beat_4",
        "sub_files": ["beat_4.wav"],
        "script": "Before accepting the supplier's new date, the purchaser runs an impact simulation to test expediting options without altering the live purchase order or planning calculations."
    },
    {
        "id": "beat_5",
        "sub_files": ["beat_5.wav"],
        "script": "The agent returns a clear verdict: has impact, exposing every affected production job and customer sales order before anyone on the shop floor is caught off guard."
    },
    {
        "id": "beat_6",
        "sub_files": ["beat_6.wav"],
        "script": "Powered by Copilot Studio capacity, billing is structured around a fixed cost per run and a variable cost per line change."
    },
    {
        "id": "beat_7",
        "sub_files": ["beat_7a.wav", "beat_7b.wav"],
        "script": "Stop guessing your supply chain blast radius. Let the agent map the damage before you approve the delay."
    }
]

def trim_silence(data, sr=SR, threshold_db=-35):
    thresh = 10 ** (threshold_db / 20)
    voiced = np.where(np.abs(data) > thresh)[0]
    if len(voiced) == 0:
        return data
    start = max(0, voiced[0] - int(sr * 0.04))
    end = min(len(data), voiced[-1] + int(sr * 0.08))
    return data[start:end]

def main():
    print("[*] Assembling clean audio for each beat...")
    clean_beats = []
    mini_gap = np.zeros(int(SR * 0.15), dtype=np.float32)

    for item in BEAT_SOURCES:
        bid = item["id"]
        combined = []
        for sf_name in item["sub_files"]:
            data, sr = sf.read(str(RAW_DIR / sf_name))
            trimmed = trim_silence(data, sr)
            if combined:
                combined.append(mini_gap)
            combined.append(trimmed)
        beat_audio = np.concatenate(combined)
        clean_path = CLEAN_DIR / f"{bid}_master.wav"
        sf.write(str(clean_path), beat_audio, SR)
        clean_beats.append({
            "id": bid,
            "path": str(clean_path),
            "duration": len(beat_audio) / SR,
            "script": item["script"]
        })
        print(f"[+] {bid}: duration = {len(beat_audio) / SR:.2f}s")

    print("\n[*] Aligning word timestamps with faster-whisper...")
    model = WhisperModel("tiny.en", device="cpu", compute_type="int8")

    inter_beat_gap = np.zeros(int(SR * 0.35), dtype=np.float32)
    master_timeline = []
    global_words = []
    master_audio_list = []
    current_time = 0.0

    for b in clean_beats:
        bid = b["id"]
        audio_data, sr = sf.read(b["path"])
        beat_start = round(current_time, 3)

        segments, _ = model.transcribe(b["path"], word_timestamps=True)
        for seg in segments:
            for w in seg.words:
                w_start = round(beat_start + w.start, 3)
                w_end = round(beat_start + w.end, 3)
                global_words.append({
                    "beat_id": bid,
                    "word": w.word.strip(),
                    "start": w_start,
                    "end": w_end
                })

        beat_dur = len(audio_data) / sr
        beat_end = round(current_time + beat_dur, 3)

        master_timeline.append({
            "beat_id": bid,
            "start": beat_start,
            "end": beat_end,
            "duration": round(beat_dur, 3),
            "script": b["script"]
        })

        master_audio_list.append(audio_data)
        current_time += beat_dur

        if bid != clean_beats[-1]["id"]:
            master_audio_list.append(inter_beat_gap)
            current_time += 0.35

    final_mix = np.concatenate(master_audio_list)
    mix_path = AUDIO_DIR / "mix.wav"
    sf.write(str(mix_path), final_mix, SR)
    total_dur = len(final_mix) / SR

    print(f"\n[+] Master Mix Assembled: {mix_path}")
    print(f"[+] Total Voice Duration: {total_dur:.2f} seconds")

    # Save words and timeline
    words_file = AUDIO_DIR / "words.json"
    timeline_file = AUDIO_DIR / "timeline.json"
    scene_words = ROOT / "scenes" / "ns03" / "words.json"

    with open(words_file, "w", encoding="utf-8") as f:
        json.dump(global_words, f, indent=2)
    with open(scene_words, "w", encoding="utf-8") as f:
        json.dump(global_words, f, indent=2)
    with open(timeline_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_duration": round(total_dur, 2),
            "beats": master_timeline
        }, f, indent=2)

    print(f"[+] Words and timeline saved. Ready to inject into HyperFrames composition.")

if __name__ == "__main__":
    main()
