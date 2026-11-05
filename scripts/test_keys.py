import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:8000/jobs"
payload = json.dumps({"text": "test", "speaker": "Speaker 0"}).encode("utf-8")

candidates = [
    "",
    "test",
    "antigravity",
    "vibevoice",
    "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb",
    "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb\n",
    "\"d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb\"",
]

for c in candidates:
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json", "X-API-Key": c}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"SUCCESS with key repr={repr(c)}: {resp.status} {resp.read().decode('utf-8')}")
            break
    except urllib.error.HTTPError as e:
        print(f"Failed with key repr={repr(c)}: {e.code}")
    except Exception as e:
        print(f"Error with key repr={repr(c)}: {e}")
