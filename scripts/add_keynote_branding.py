import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

FFMPEG = os.path.join(os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
INPUT_VIDEO = os.path.join(os.getcwd(), 'output', 'user_walkthrough_jumpcut_1080p.mp4')
OVERLAY_PNG = os.path.join(os.getcwd(), 'output', 'keynote_overlay.png')
FINAL_VIDEO = os.path.join(os.getcwd(), 'output', 'user_authentic_keynote_1080p.mp4')

print("[1/2] Generating executive telemetry graphic with Pillow...")
img = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 1. Top Bar Gradient Background (height: 64px)
for y in range(68):
    alpha = int(235 * (1.0 - (y / 68.0) ** 1.8))
    draw.line([(0, y), (1920, y)], fill=(6, 10, 18, alpha))

# Try loading standard Windows fonts
try:
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 13)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 14)
except Exception:
    font_bold = font_badge = font_sub = ImageFont.load_default()

# Logo icon
draw.rounded_rectangle([36, 16, 68, 48], radius=8, fill=(47, 134, 255))
draw.text((45, 19), "N", font=font_bold, fill=(6, 10, 18, 255))

# Brand Title
draw.text((80, 20), "neural365", font=font_bold, fill=(240, 244, 248, 255))

# COMMUNITY Badge
draw.rounded_rectangle([190, 21, 280, 43], radius=4, fill=(52, 216, 176, 35), outline=(52, 216, 176, 120), width=1)
draw.text((199, 24), "COMMUNITY", font=font_badge, fill=(52, 216, 176, 255))

# Right side: Live Executive Walkthrough Tag
draw.rounded_rectangle([1480, 19, 1884, 45], radius=14, fill=(6, 10, 18, 200), outline=(255, 255, 255, 30), width=1)
# Glowing dot
draw.ellipse([1496, 28, 1504, 36], fill=(52, 216, 176, 255))
draw.text((1516, 24), "EXECUTIVE PRODUCT WALKTHROUGH", font=font_badge, fill=(52, 216, 176, 255))

# Bottom glowing accent line
for y in range(1076, 1080):
    draw.line([(0, y), (1920, y)], fill=(52, 216, 176, 180))

img.save(OVERLAY_PNG, 'PNG')
print(f"Overlay PNG created: {OVERLAY_PNG}")

print("[2/2] Compositing overlay with FFmpeg...")
cmd = [
    FFMPEG, '-y',
    '-i', INPUT_VIDEO,
    '-i', OVERLAY_PNG,
    '-filter_complex', '[0:v][1:v]overlay=0:0[vout]',
    '-map', '[vout]',
    '-map', '0:a',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '19',
    '-c:a', 'copy',
    FINAL_VIDEO
]

res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode != 0:
    print("Error compositing overlay:", res.stderr[-500:])
else:
    print(f"Success! Final Keynote Walkthrough Video: {FINAL_VIDEO}")
    print(f"File size: {os.path.getsize(FINAL_VIDEO) / (1024*1024):.2f} MB")
