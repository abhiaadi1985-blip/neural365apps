import os
import subprocess
import time

CHROME_PATH = os.path.join(
    os.getcwd(), 'node_modules', '.remotion', 'chrome-headless-shell', 'win64',
    'chrome-headless-shell-win64', 'chrome-headless-shell.exe'
)

OUTPUT_DIR = os.path.join(os.getcwd(), 'assets', 'screenshots')
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGETS = [
    {
        "name": "01-hero-landing.png",
        "url": "http://localhost:3000",
        "delay": 2
    },
    {
        "name": "02-pulse-radar.png",
        "url": "http://localhost:3000/pulse",
        "delay": 2
    },
    {
        "name": "03-copilot-agents-pillar.png",
        "url": "http://localhost:3000/copilot-ai-agents",
        "delay": 2
    },
    {
        "name": "04-d365-fo-pillar.png",
        "url": "http://localhost:3000/d365-fo",
        "delay": 2
    },
    {
        "name": "05-blog-guides.png",
        "url": "http://localhost:3000/blog",
        "delay": 2
    }
]

def capture_screenshots():
    print(f"Using Chrome Headless Shell at: {CHROME_PATH}")
    for target in TARGETS:
        out_path = os.path.join(OUTPUT_DIR, target["name"])
        print(f"Capturing {target['url']} -> {target['name']}...")
        cmd = [
            CHROME_PATH,
            '--headless',
            '--hide-scrollbars',
            '--window-size=1920,1080',
            f'--screenshot={out_path}',
            target["url"]
        ]
        subprocess.run(cmd, check=True)
        print(f"  Saved {target['name']} ({os.path.getsize(out_path)} bytes)")

if __name__ == '__main__':
    capture_screenshots()
