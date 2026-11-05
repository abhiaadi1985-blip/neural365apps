import urllib.request
import urllib.error
import ssl

url = "https://tts.neural365apps.com/jobs"
payload = b'{"text": "test", "speaker": "Speaker 0"}'
key = "d728080aa9c4c95e6ea19c4c5dc70c550d079425a25a5bcb"

req = urllib.request.Request(
    url,
    data=payload,
    headers={"Content-Type": "application/json", "X-API-Key": key, "User-Agent": "Antigravity/1.0"},
    method="POST"
)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
        print(f"Success: {resp.status} {resp.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Exception: {e}")
