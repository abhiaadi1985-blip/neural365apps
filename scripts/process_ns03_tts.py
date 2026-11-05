import json
import time
import os
import sys
import ssl
import urllib.request
import urllib.error
from pathlib import Path
import numpy as np
import soundfile as sf

API_KEY = "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb"
BASE_URL = "http://127.0.0.1:8000"

BEATS = [
    {
        "id": "beat_1",
        "text": "When a supplier emails a five-day delay on purchase order zero zero eight four two, the purchaser usually spends hours chasing spreadsheets."
    },
    {
        "id": "beat_2",
        "text": "Instead, the Procurement Agent immediately traces marking and pegging chains across Dynamics three sixty-five Supply Chain Management to calculate the downstream blast radius."
    },
    {
        "id": "beat_3",
        "text": "It checks confirmed incoming supply against projected on-hand inventory, catching the exact day safety stock breaches minimum threshold and flips into a stockout."
    },
    {
        "id": "beat_4",
        "text": "Before accepting the supplier's new date, the purchaser runs an impact simulation to test expediting options without altering the live purchase order or planning calculations."
    },
    {
        "id": "beat_5",
        "text": "The agent returns a clear verdict: has impact, exposing every affected production job and customer sales order before anyone on the shop floor is caught off guard."
    },
    {
        "id": "beat_6",
        "text": "Powered by Copilot Studio capacity, billing is structured around a fixed cost per run and a variable cost per line change."
    },
    {
        "id": "beat_7",
        "text": "Stop guessing your supply chain blast radius. Let the agent map the damage before you approve the delay."
    }
]

def make_req(endpoint, data=None, method="GET"):
    url = f"{BASE_URL}{endpoint}"
    payload = json.dumps(data).encode("utf-8") if data else None
    headers = {
        "X-API-Key": API_KEY,
        "User-Agent": "Antigravity/1.0"
    }
    if data:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    return req

def submit_beat(beat):
    req = make_req("/jobs", data={"text": beat["text"], "speaker": "Speaker 0"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            print(f"[+] Queued {beat['id']}: job_id={res.get('job_id')}")
            return res.get("job_id")
    except Exception as e:
        print(f"[!] Failed to queue {beat['id']}: {e}")
        return None

def check_job(job_id):
    req = make_req(f"/jobs/{job_id}")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[!] Error checking job {job_id}: {e}")
        return None

def fetch_audio(job_id, out_file: Path):
    req = make_req(f"/jobs/{job_id}/audio")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            out_file.write_bytes(resp.read())
            print(f"[+] Downloaded audio for {job_id} -> {out_file}")
            return True
    except Exception as e:
        print(f"[!] Failed to download audio for {job_id}: {e}")
        return False

def main():
    root = Path(__file__).resolve().parent.parent
    work_dir = root / "assets" / "audio" / "ns03"
    raw_dir = work_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    manifest_file = work_dir / "tts_jobs.json"

    # Load existing manifest or submit new
    jobs = []
    if manifest_file.exists():
        try:
            with open(manifest_file, "r", encoding="utf-8") as f:
                jobs = json.load(f)
        except Exception:
            jobs = []

    if len(jobs) != len(BEATS) or not all(j.get("job_id") for j in jobs):
        print("[*] Submitting all 7 beats to TTS service...")
        jobs = []
        for beat in BEATS:
            jid = submit_beat(beat)
            jobs.append({
                "beat_id": beat["id"],
                "text": beat["text"],
                "job_id": jid,
                "status": "queued" if jid else "failed",
                "wav_path": str(raw_dir / f"{beat['id']}.wav")
            })
            time.sleep(0.5)
        with open(manifest_file, "w", encoding="utf-8") as f:
            json.dump(jobs, f, indent=2)

    # Monitor and download loop
    pending = True
    print("\n[*] Monitoring job progress...")
    while pending:
        pending = False
        all_done = True
        for j in jobs:
            if j.get("status") in ("done", "verified"):
                continue
            all_done = False
            jid = j.get("job_id")
            if not jid:
                continue
            info = check_job(jid)
            if not info:
                continue
            status = info.get("status")
            print(f"[{time.strftime('%H:%M:%S')}] {j['beat_id']} ({jid}): status={status} audio_ready={info.get('audio_ready')}")
            if status == "done" and info.get("audio_ready"):
                wav_file = Path(j["wav_path"])
                if not wav_file.exists():
                    success = fetch_audio(jid, wav_file)
                    if success:
                        j["status"] = "downloaded"
                else:
                    j["status"] = "downloaded"
            elif status == "failed":
                j["status"] = "failed"
                print(f"[!] Job {jid} failed: {info.get('error')}")
            else:
                pending = True

        with open(manifest_file, "w", encoding="utf-8") as f:
            json.dump(jobs, f, indent=2)

        if not all_done and pending:
            time.sleep(15)

    print("\n[+] All audio jobs completed and downloaded!")

if __name__ == "__main__":
    main()
