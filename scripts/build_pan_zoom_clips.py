import os
import sys
import subprocess
from pathlib import Path
from PIL import Image

def find_ffmpeg(project_root: Path) -> str:
    npm_ffmpeg = project_root / "node_modules" / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe"
    if npm_ffmpeg.exists():
        return str(npm_ffmpeg)
    return "ffmpeg"

def generate_smooth_pan_zoom(
    img_path: Path,
    out_mp4: Path,
    ffmpeg_bin: str,
    duration_sec: float = 8.0,
    fps: int = 30,
    zoom_start: float = 1.0,
    zoom_end: float = 1.35,
    pan_focus: tuple = (0.5, 0.45) # (x_pct, y_pct)
):
    print(f"[*] Rendering cinematic pan-zoom for: {img_path.name} -> {out_mp4.name} ({duration_sec}s)")
    img = Image.open(img_path).convert("RGB")
    W, H = 1920, 1080
    img = img.resize((W, H), Image.Resampling.LANCZOS)

    total_frames = int(duration_sec * fps)
    temp_frames_dir = out_mp4.parent / f"_tmp_{out_mp4.stem}"
    temp_frames_dir.mkdir(parents=True, exist_ok=True)

    focus_x, focus_y = pan_focus

    for f in range(total_frames):
        t = f / max(1, total_frames - 1)
        # Smooth ease in out (cubic)
        ease = t * t * (3 - 2 * t)
        zoom = zoom_start + (zoom_end - zoom_start) * ease

        crop_w = W / zoom
        crop_h = H / zoom

        # Center crop around focus
        cx = W * focus_x
        cy = H * focus_y

        left = cx - crop_w / 2
        top = cy - crop_h / 2

        # Clamp
        if left < 0: left = 0
        if top < 0: top = 0
        if left + crop_w > W: left = W - crop_w
        if top + crop_h > H: top = H - crop_h

        cropped = img.crop((left, top, left + crop_w, top + crop_h))
        frame = cropped.resize((W, H), Image.Resampling.BICUBIC)
        frame.save(temp_frames_dir / f"frame_{f:04d}.jpg", quality=95)

    # Encode with FFmpeg
    cmd = [
        ffmpeg_bin, "-y",
        "-framerate", str(fps),
        "-i", str(temp_frames_dir / "frame_%04d.jpg"),
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-t", str(duration_sec),
        str(out_mp4)
    ]
    subprocess.run(cmd, capture_output=True, check=True)

    # Cleanup temp frames
    for p in temp_frames_dir.glob("*.jpg"):
        p.unlink()
    temp_frames_dir.rmdir()
    print(f"[+] Created: {out_mp4} ({out_mp4.stat().st_size / (1024*1024):.2f} MB)")

def main():
    project_root = Path(__file__).resolve().parent.parent
    screenshots_dir = project_root / "public" / "screenshots"
    broll_dir = project_root / "assets" / "broll"
    broll_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg_bin = find_ffmpeg(project_root)

    tasks = [
        {
            "img": screenshots_dir / "02-pulse-radar.png",
            "out": broll_dir / "zoom_pulse_radar.mp4",
            "dur": 10.0,
            "start": 1.0,
            "end": 1.32,
            "focus": (0.5, 0.42)
        },
        {
            "img": screenshots_dir / "03-copilot-agents-pillar.png",
            "out": broll_dir / "zoom_copilot_studio.mp4",
            "dur": 10.0,
            "start": 1.0,
            "end": 1.35,
            "focus": (0.55, 0.45)
        },
        {
            "img": screenshots_dir / "04-d365-fo-pillar.png",
            "out": broll_dir / "zoom_d365_erp.mp4",
            "dur": 10.0,
            "start": 1.0,
            "end": 1.35,
            "focus": (0.48, 0.45)
        },
        {
            "img": screenshots_dir / "05-blog-guides.png",
            "out": broll_dir / "zoom_multimodal_guides.mp4",
            "dur": 10.0,
            "start": 1.0,
            "end": 1.30,
            "focus": (0.5, 0.48)
        }
    ]

    for t in tasks:
        if t["img"].exists():
            generate_smooth_pan_zoom(
                t["img"], t["out"], ffmpeg_bin,
                duration_sec=t["dur"],
                zoom_start=t["start"],
                zoom_end=t["end"],
                pan_focus=t["focus"]
            )
        else:
            print(f"[!] Warning: {t['img']} not found, skipping.")

if __name__ == "__main__":
    main()
