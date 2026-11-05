import os
import sys
import time
import json
import ctypes
import subprocess
from ctypes import wintypes

CAP_CLI = os.path.expandvars(r'%LOCALAPPDATA%\Cap\cap-cli.exe')
CHROME_EXE = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PROJECT_DIR = os.getcwd()
DEV_URL = 'http://localhost:3000'

def smooth_move_cursor(start_x, start_y, end_x, end_y, steps=30, delay=0.015):
    for i in range(steps + 1):
        t = i / steps
        # smooth easing
        ease = t * t * (3 - 2 * t)
        curr_x = int(start_x + (end_x - start_x) * ease)
        curr_y = int(start_y + (end_y - start_y) * ease)
        ctypes.windll.user32.SetCursorPos(curr_x, curr_y)
        time.sleep(delay)

def run_test_recording(duration_sec=10):
    print("=" * 60)
    print("TEST: Automated Cap Recording Proof-of-Concept (10 seconds)")
    print("=" * 60)
    
    # 1. Launch Chrome maximized
    print("\n1. Launching Chrome maximized to", DEV_URL)
    chrome_proc = subprocess.Popen([
        CHROME_EXE,
        '--new-window',
        '--start-maximized',
        DEV_URL
    ])
    time.sleep(3) # Wait for browser window to render
    
    cap_path = os.path.join(PROJECT_DIR, 'output', 'test_poc.cap')
    mp4_out = os.path.join(PROJECT_DIR, 'output', 'test_poc_walkthrough.mp4')
    
    # Clean up previous test
    if os.path.exists(cap_path):
        import shutil
        shutil.rmtree(cap_path, ignore_errors=True)
    if os.path.exists(mp4_out):
        os.remove(mp4_out)
        
    # 2. Start Cap record in background
    print("\n2. Starting Cap screen recording...")
    start_cmd = [
        CAP_CLI, 'record', 'start',
        '--screen', '372641049',
        '--mode', 'studio',
        '--fps', '60',
        '--path', cap_path,
        '--detach',
        '--json'
    ]
    res = subprocess.run(start_cmd, capture_output=True, text=True)
    print("Cap start output:", res.stdout.strip())
    
    recording_id = None
    for line in res.stdout.splitlines():
        try:
            data = json.loads(line)
            if data.get("type") == "started":
                recording_id = data.get("recordingId")
                break
        except Exception:
            pass
            
    print(f"Recording ID: {recording_id}")
    
    # 3. Simulate smooth human mouse movements & scrolling on the page
    print("\n3. Performing simulated smooth user interactions on page...")
    start_time = time.time()
    
    # Move from top center to hero button
    smooth_move_cursor(500, 300, 960, 520, steps=40)
    time.sleep(1.5)
    
    # Click on the button / hero
    ctypes.windll.user32.mouse_event(0x0002, 0, 0, 0, 0) # MOUSEEVENTF_LEFTDOWN
    time.sleep(0.05)
    ctypes.windll.user32.mouse_event(0x0004, 0, 0, 0, 0) # MOUSEEVENTF_LEFTUP
    time.sleep(1.0)
    
    # Scroll down smoothly
    for _ in range(8):
        ctypes.windll.user32.mouse_event(0x0800, 0, 0, -120, 0) # MOUSEEVENTF_WHEEL down
        time.sleep(0.2)
        
    # Move to the feature cards
    smooth_move_cursor(960, 520, 600, 700, steps=30)
    time.sleep(1.5)
    smooth_move_cursor(600, 700, 1100, 700, steps=30)
    time.sleep(1.5)
    
    # 4. Stop Cap recording
    print("\n4. Stopping Cap recording...")
    stop_cmd = [CAP_CLI, 'record', 'stop', '--json']
    if recording_id:
        stop_cmd.extend(['--id', recording_id])
    res_stop = subprocess.run(stop_cmd, capture_output=True, text=True)
    print("Cap stop output:", res_stop.stdout.strip())
    
    # Close Chrome
    chrome_proc.terminate()
    
    # 5. Export Cap project to MP4
    print("\n5. Exporting Cap recording to MP4...")
    export_cmd = [
        CAP_CLI, 'export',
        cap_path,
        mp4_out,
        '--resolution', '1920x1080',
        '--fps', '60',
        '--quality', 'maximum',
        '--json'
    ]
    res_export = subprocess.run(export_cmd, capture_output=True, text=True)
    
    if os.path.exists(mp4_out):
        print(f"\nSUCCESS! Exported video: {mp4_out} ({os.path.getsize(mp4_out)} bytes)")
    else:
        print(f"\nExport finished. Output log: {res_export.stdout}")

if __name__ == '__main__':
    run_test_recording(duration_sec=10)
