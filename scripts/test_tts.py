import urllib.request
import json
import ssl

def check_endpoint(url):
    print(f"Checking {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Antigravity/1.0"})
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, timeout=3, context=ctx) as response:
            data = response.read().decode('utf-8')
            print(f"Success from {url}: {data}")
            return True
    except Exception as e:
        print(f"Failed {url}: {e}")
        return False

if __name__ == "__main__":
    check_endpoint("http://127.0.0.1:8000/health")
    check_endpoint("https://tts.neural365apps.com/health")
