import json
import time
import urllib.request
import urllib.error
from pathlib import Path

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

def submit_job(beat):
    url = f"{BASE_URL}/jobs"
    payload = json.dumps({"text": beat["text"], "speaker": "Speaker 0"}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
            "User-Agent": "Antigravity/1.0"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"[+] Submitted {beat['id']}: job_id={data.get('job_id')} status={data.get('status')}")
            return data.get("job_id")
    except Exception as e:
        print(f"[!] Error submitting {beat['id']}: {e}")
        return None

def main():
    out_dir = Path("assets/audio/ns03")
    out_dir.mkdir(parents=True, exist_ok=True)
    jobs_manifest = out_dir / "jobs.json"

    jobs = []
    for beat in BEATS:
        job_id = submit_job(beat)
        jobs.append({
            "beat_id": beat["id"],
            "text": beat["text"],
            "job_id": job_id,
            "status": "queued" if job_id else "failed"
        })
        time.sleep(0.5)

    with open(jobs_manifest, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2)

    print(f"\n[*] All jobs submitted. Manifest saved to {jobs_manifest}")

if __name__ == "__main__":
    main()
