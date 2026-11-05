import json
import time
import os
import sys
import urllib.request
import urllib.error
from pathlib import Path
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

API_KEY = "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb"
BASE_URL = "http://127.0.0.1:8000"

JOBS = [
    {
        "beat_id": "beat_1",
        "job_id": "49871fdd6e7b", # Using regenerated version with period
        "text": "When a supplier emails a five-day delay on purchase order zero zero eight four two. The purchaser usually spends hours chasing spreadsheets."
    },
    {
        "beat_id": "beat_2",
        "job_id": "7b0e99a221d6",
        "text": "Instead, the Procurement Agent immediately traces marking and pegging chains across Dynamics three sixty-five Supply Chain Management to calculate the downstream blast radius."
    },
    {
        "beat_id": "beat_3",
        "job_id": "5d4f5505f68c",
        "text": "It checks confirmed incoming supply against projected on-hand inventory, catching the exact day safety stock breaches minimum threshold and flips into a stockout."
    },
    {
        "beat_id": "beat_4",
        "job_id": "26e769be17f6",
        "text": "Before accepting the supplier's new date, the purchaser runs an impact simulation to test expediting options without altering the live purchase order or planning calculations."
    },
    {
        "beat_id": "beat_5",
        "job_id": "06f1e17f24df",
        "text": "The agent returns a clear verdict: has impact, exposing every affected production job and customer sales order before anyone on the shop floor is caught off guard."
    },
    {
        "beat_id": "beat_6",
        "job_id": "ea89a9ae46b2",
        "text": "Powered by Copilot Studio capacity, billing is structured around a fixed cost per run and a variable cost per line change."
    },
    {
        "beat_id": "beat_7",
        "job_id": "db3f0b0f9a22",
        "text": "Stop guessing your supply chain blast radius. Let the agent map the damage before you approve the delay."
    }
]

def check_job(job_id):
    req = urllib.request.Request(
        f"{BASE_URL}/jobs/{job_id}",
        headers={"X-API-Key": API_KEY, "User-Agent": "Antigravity/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return None

def download_audio(job_id, out_file: Path):
    req = urllib.request.Request(
        f"{BASE_URL}/jobs/{job_id}/audio",
        headers={"X-API-Key": API_KEY, "User-Agent": "Antigravity/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            out_file.write_bytes(resp.read())
            return True
    except Exception as e:
        print(f"[!] Failed to download {job_id}: {e}")
        return False

def trim_silence(audio_data, sr, threshold_db=-35):
    threshold = 10 ** (threshold_db / 20)
    voiced = np.where(np.abs(audio_data) > threshold)[0]
    if len(voiced) == 0:
        return audio_data, 0.0, 0.0
    start_idx = max(0, voiced[0] - int(sr * 0.05)) # keep 50ms lead
    end_idx = min(len(audio_data), voiced[-1] + int(sr * 0.1)) # keep 100ms trail
    trimmed_audio = audio_data[start_idx:end_idx]
    lead_offset = start_idx / sr
    return trimmed_audio, lead_offset, len(trimmed_audio) / sr

def main():
    root = Path(__file__).resolve().parent.parent
    audio_dir = root / "assets" / "audio" / "ns03"
    raw_dir = audio_dir / "raw"
    clean_dir = audio_dir / "clean"
    raw_dir.mkdir(parents=True, exist_ok=True)
    clean_dir.mkdir(parents=True, exist_ok=True)

    print("[*] Loading faster-whisper tiny.en model...")
    model = WhisperModel("tiny.en", device="cpu", compute_type="int8")

    all_done = False
    completed = {}

    while not all_done:
        all_done = True
        for item in JOBS:
            bid = item["beat_id"]
            jid = item["job_id"]
            if bid in completed:
                continue

            info = check_job(jid)
            if not info:
                all_done = False
                continue

            status = info.get("status")
            print(f"[{time.strftime('%H:%M:%S')}] {bid} ({jid}): {status}")

            if status == "done" and info.get("audio_ready"):
                raw_path = raw_dir / f"{bid}.wav"
                if not raw_path.exists():
                    download_audio(jid, raw_path)

                # Transcribe with whisper
                print(f"[*] Transcribing {bid}...")
                segments, _ = model.transcribe(str(raw_path), word_timestamps=True)
                words = []
                full_text = []
                for seg in segments:
                    full_text.append(seg.text.strip())
                    for w in seg.words:
                        words.append({
                            "word": w.word.strip(),
                            "start": round(w.start, 3),
                            "end": round(w.end, 3),
                            "prob": round(w.probability, 3)
                        })

                transcription = " ".join(full_text)
                print(f"[+] {bid} Transcribed: {transcription}")

                # Read audio and trim lead/trail silence
                raw_data, sr = sf.read(str(raw_path))
                clean_data, lead_offset, clean_dur = trim_silence(raw_data, sr)
                clean_path = clean_dir / f"{bid}_clean.wav"
                sf.write(str(clean_path), clean_data, sr)

                # Adjust word timestamps by lead_offset
                aligned_words = []
                for w in words:
                    adj_start = max(0.0, round(w["start"] - lead_offset, 3))
                    adj_end = max(adj_start, round(w["end"] - lead_offset, 3))
                    aligned_words.append({
                        "word": w["word"],
                        "start": adj_start,
                        "end": adj_end,
                        "prob": w["prob"]
                    })

                completed[bid] = {
                    "raw_path": str(raw_path),
                    "clean_path": str(clean_path),
                    "duration": clean_dur,
                    "lead_offset": lead_offset,
                    "transcription": transcription,
                    "words": aligned_words
                }
            else:
                all_done = False

        if not all_done:
            time.sleep(15)

    print("\n[+] All beats completed and aligned!")
    
    # Save beat alignments
    align_file = audio_dir / "aligned_beats.json"
    with open(align_file, "w", encoding="utf-8") as f:
        json.dump(completed, f, indent=2)

    # Concatenate all clean beats with 0.35s gaps
    print("[*] Assembling final audio mix with 0.35s gaps...")
    gap_samples = int(24000 * 0.35)
    gap = np.zeros(gap_samples, dtype=np.float32)

    master_audio = []
    global_words = []
    current_time = 0.0

    for item in JOBS:
        bid = item["beat_id"]
        binfo = completed[bid]
        bdata, sr = sf.read(binfo["clean_path"])
        
        # Add words to global timeline
        for w in binfo["words"]:
            global_words.append({
                "beat_id": bid,
                "word": w["word"],
                "start": round(current_time + w["start"], 3),
                "end": round(current_time + w["end"], 3)
            })

        master_audio.append(bdata)
        current_time += len(bdata) / sr

        # Add gap except after final beat
        if bid != JOBS[-1]["beat_id"]:
            master_audio.append(gap)
            current_time += 0.35

    final_mix = np.concatenate(master_audio)
    mix_path = audio_dir / "mix.wav"
    sf.write(str(mix_path), final_mix, 24000)
    
    # Save global words.json
    words_path = audio_dir / "words.json"
    with open(words_path, "w", encoding="utf-8") as f:
        json.dump(global_words, f, indent=2)

    # Also copy words.json to scenes/ns03/words.json
    scene_words = root / "scenes" / "ns03" / "words.json"
    with open(scene_words, "w", encoding="utf-8") as f:
        json.dump(global_words, f, indent=2)

    total_dur = len(final_mix) / 24000
    print(f"\n[+] FINAL MASTER MIX READY: {mix_path}")
    print(f"[+] Total Duration: {total_dur:.2f} seconds ({len(global_words)} words)")
    print(f"[+] Master words.json written to {words_path} and {scene_words}")

if __name__ == "__main__":
    main()
