import os
import subprocess

FFMPEG = os.path.join(os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
RAW_VIDEO = os.path.join(os.getcwd(), 'assets', 'raw_recordings', 'neural365 COMMUNITY - 2026-10-16 10_16 PM.mp4')
OUT_DIR = os.path.join(os.getcwd(), 'public', 'cap_segments')
os.makedirs(OUT_DIR, exist_ok=True)

# 5 Scenes to match the 107.33s master audio (3220 frames @ 30fps)
SEGMENTS = [
    {
        "name": "scene1.mp4",
        "ss": 3.0,
        "input_duration": 18.5,
        "target_duration": 18.5, # 555 frames
        "speed": 1.0,
        "description": "Scene 1: Welcome & Community Mission"
    },
    {
        "name": "scene2.mp4",
        "ss": 24.0,
        "input_duration": 32.0,
        "target_duration": 24.0, # 720 frames (speed 1.33x)
        "speed": 32.0 / 24.0,
        "description": "Scene 2: The Pulse Radar & Weekly Updates"
    },
    {
        "name": "scene3.mp4",
        "ss": 57.0,
        "input_duration": 26.4,
        "target_duration": 22.0, # 660 frames (speed 1.2x)
        "speed": 26.4 / 22.0,
        "description": "Scene 3: Copilot & Autonomous AI Agents"
    },
    {
        "name": "scene4.mp4",
        "ss": 84.0,
        "input_duration": 26.4,
        "target_duration": 22.0, # 660 frames (speed 1.2x)
        "speed": 26.4 / 22.0,
        "description": "Scene 4: Industry Solutions & Enterprise ERP"
    },
    {
        "name": "scene5.mp4",
        "ss": 112.0,
        "input_duration": 25.0,
        "target_duration": 20.833, # 625 frames (speed 1.2x)
        "speed": 25.0 / 20.833,
        "description": "Scene 5: Hands-on Guides & Community CTA"
    }
]

def render_segments():
    print("=" * 60)
    print("EXTRACTING & CONFORMING CAP RECORDING SEGMENTS (1080p @ 30fps)")
    print("=" * 60)
    
    for seg in SEGMENTS:
        out_file = os.path.join(OUT_DIR, seg["name"])
        print(f"\nProcessing {seg['description']} -> {seg['name']}")
        print(f"  Source start: {seg['ss']}s, Duration: {seg['input_duration']}s -> Target: {seg['target_duration']}s (Speed {seg['speed']:.2f}x)")
        
        # Scale & pad to 1920x1080 with deep dark background (#060A12)
        # video pts: setpts=(1/speed)*PTS, fps=30
        pts_factor = 1.0 / seg["speed"]
        vf = (
            f"setpts={pts_factor}*PTS,"
            f"scale=1340:1080:force_original_aspect_ratio=decrease,"
            f"pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x060A12,"
            f"fps=30"
        )
        
        cmd = [
            FFMPEG, '-y',
            '-ss', str(seg["ss"]),
            '-i', RAW_VIDEO,
            '-t', str(seg["input_duration"]),
            '-an', # Remove raw mic audio (we sync master voiceover in Remotion)
            '-vf', vf,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '18',
            '-pix_fmt', 'yuv420p',
            out_file
        ]
        
        subprocess.run(cmd, check=True)
        print(f"  Saved {seg['name']} ({os.path.getsize(out_file)} bytes)")
        
    print("\nAll 5 video segments successfully generated in public/cap_segments/!")

if __name__ == '__main__':
    render_segments()
