import urllib.request
import urllib.error
import json

KEY = "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb"
url = "http://127.0.0.1:8000/jobs"
payload = json.dumps({"text": "test", "speaker": "Speaker 0"}).encode("utf-8")

header_variations = [
    {"X-API-Key": KEY},
    {"x-api-key": KEY},
    {"Authorization": f"Bearer {KEY}"},
    {"Authorization": KEY},
    {"X-API-KEY": KEY},
]

for h in header_variations:
    headers = {"Content-Type": "application/json", **h}
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"Success with {h}: {resp.status} {resp.read().decode('utf-8')}")
            break
    except urllib.error.HTTPError as e:
        print(f"Failed with {h}: {e.code} {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error with {h}: {e}")
