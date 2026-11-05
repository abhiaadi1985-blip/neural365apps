import os
import subprocess
import re
from PIL import Image, ImageDraw, ImageFont

FFMPEG = os.path.join(os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
RAW_VIDEO = os.path.join(os.getcwd(), 'assets', 'raw_recordings', 'abhi_video_01.mp4')
OUT_DIR = os.path.join(os.getcwd(), 'output')
ASSETS_DIR = os.path.join(OUT_DIR, 'keynote_assets')
FINAL_VIDEO = os.path.join(OUT_DIR, 'neural365_keynote_5min_layoutA.mp4')

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

TOTAL_DURATION = 297.61 # 4m 57.6s

print("[1/4] Generating executive UI overlays with Pillow...")

# Load fonts
try:
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 12)
    font_callout_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
    font_callout_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
except Exception:
    font_bold = font_badge = font_callout_title = font_callout_sub = ImageFont.load_default()

ACTS_CONFIG = [
    {
        "id": "act1",
        "tag": "ACT 1: ORIGIN & MISSION",
        "title": "Why I Built neural365: An Open AI Learning Lab",
        "sub": "Personal journey mastering enterprise AI through visuals, audio & practical sandboxes",
        "accent": (47, 134, 255), # blue
    },
    {
        "id": "act2",
        "tag": "ACT 2: HERMES RADAR & HITL",
        "title": "The Pulse: Automated Weekly Signals & Hermes Pipeline",
        "sub": "Daily tracking of Microsoft Learn & roadmaps — verified hands-on with Human-in-the-Loop",
        "accent": (52, 216, 176), # turquoise
    },
    {
        "id": "act3",
        "tag": "ACT 3: STRATEGIC PILLARS",
        "title": "4 Core Pillars: D365 F&O, Dataverse, Copilot & Industry",
        "sub": "Autonomous reconciliation, virtual table groundings & Spoke Demo Lab sandboxes",
        "accent": (155, 140, 255), # purple
    },
    {
        "id": "act4",
        "tag": "ACT 4: MULTI-FORMAT INTELLIGENCE",
        "title": "Learning That Fits Your Schedule: Shorts & Podcasts",
        "sub": "Weekly visual radars, 60-second hands-on Neural Shorts & 3-minute executive micro-podcasts",
        "accent": (242, 181, 68), # amber
    },
    {
        "id": "act5",
        "tag": "ACT 5: COMMUNITY & FEEDBACK",
        "title": "Every Feedback Counts: Shaping Enterprise AI Together",
        "sub": "Initial effort evolving weekly — subscribe to topic tracks & join the community discussions",
        "accent": (52, 216, 176), # turquoise
    }
]

# Generate 5 overlay PNGs
for act in ACTS_CONFIG:
    img = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Top Bar Gradient Background
    for y in range(70):
        alpha = int(240 * (1.0 - (y / 70.0) ** 1.8))
        draw.line([(0, y), (1920, y)], fill=(6, 10, 18, alpha))

    # Logo Mark
    draw.rounded_rectangle([36, 16, 68, 48], radius=8, fill=(47, 134, 255))
    draw.text((45, 19), "N", font=font_bold, fill=(6, 10, 18, 255))

    # Brand Title
    draw.text((80, 20), "neural365", font=font_bold, fill=(240, 244, 248, 255))

    # COMMUNITY Badge
    draw.rounded_rectangle([190, 21, 280, 43], radius=4, fill=(52, 216, 176, 35), outline=(52, 216, 176, 120), width=1)
    draw.text((199, 24), "COMMUNITY", font=font_badge, fill=(52, 216, 176, 255))

    # Right side: Live Executive Walkthrough Tag
    draw.rounded_rectangle([1490, 19, 1884, 45], radius=13, fill=(6, 10, 18, 200), outline=(255, 255, 255, 30), width=1)
    draw.ellipse([1506, 28, 1514, 36], fill=(52, 216, 176, 255))
    draw.text((1526, 24), "FOUNDER KEYNOTE & DEMO", font=font_badge, fill=(52, 216, 176, 255))

    # Dynamic Top-Left Feature Callout Card (Floating below header)
    accent_rgb = act["accent"]
    draw.rounded_rectangle([36, 84, 760, 164], radius=12, fill=(10, 16, 28, 230), outline=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 90), width=1)

    # Act Tag Pill
    draw.rounded_rectangle([52, 96, 260, 116], radius=4, fill=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 30))
    draw.text((60, 98), act["tag"], font=font_badge, fill=accent_rgb)

    # Act Title & Sub
    draw.text((52, 122), act["title"], font=font_callout_title, fill=(240, 244, 248, 255))
    draw.text((52, 142), act["sub"], font=font_callout_sub, fill=(142, 155, 174, 255))

    # Bottom glowing border line
    for y in range(1076, 1080):
        draw.line([(0, y), (1920, y)], fill=(accent_rgb[0], accent_rgb[1], accent_rgb[2], 180))

    out_png = os.path.join(ASSETS_DIR, f"overlay_{act['id']}.png")
    img.save(out_png, 'PNG')

# Generate PiP Border Frame (480x270 + 4px border)
pip_frame = Image.new('RGBA', (488, 278), (0, 0, 0, 0))
pip_draw = ImageDraw.Draw(pip_frame)
pip_draw.rounded_rectangle([0, 0, 487, 277], radius=14, outline=(52, 216, 176, 220), width=3)
pip_frame.save(os.path.join(ASSETS_DIR, "pip_border.png"), 'PNG')

# Generate Centered Presenter Card Frame for Acts 1 & 5 (1288x728 + 4px border)
center_frame = Image.new('RGBA', (1290, 730), (0, 0, 0, 0))
center_draw = ImageDraw.Draw(center_frame)
center_draw.rounded_rectangle([0, 0, 1289, 729], radius=16, outline=(47, 134, 255, 200), width=3)
center_frame.save(os.path.join(ASSETS_DIR, "center_border.png"), 'PNG')

print("All overlays and frame borders created in keynote_assets.")

print("[2/4] Building FFmpeg filter complex for Layout A (Dynamic PiP)...")
# Timeline specification:
# Act 1: 0.0s -> 58.0s (Hero Landing screenshot bg, Presenter centered 1280x720)
# Act 2: 58.0s -> 120.0s (Pulse Radar screenshot bg, Presenter PiP 480x270 at x=1390, y=755)
# Act 3: 120.0s -> 180.0s (120-150s Copilot Pillar, 150-180s D365 Pillar, Presenter PiP)
# Act 4: 180.0s -> 240.0s (Blog Guides & Multimedia, Presenter PiP)
# Act 5: 240.0s -> 297.6s (Hero CTA bg, Presenter centered 1280x720)

SC_HERO = os.path.join(os.getcwd(), 'public', 'screenshots', '01-hero-landing.png')
SC_PULSE = os.path.join(os.getcwd(), 'public', 'screenshots', '02-pulse-radar.png')
SC_COPILOT = os.path.join(os.getcwd(), 'public', 'screenshots', '03-copilot-agents-pillar.png')
SC_D365 = os.path.join(os.getcwd(), 'public', 'screenshots', '04-d365-fo-pillar.png')
SC_BLOG = os.path.join(os.getcwd(), 'public', 'screenshots', '05-blog-guides.png')

OV_ACT1 = os.path.join(ASSETS_DIR, 'overlay_act1.png')
OV_ACT2 = os.path.join(ASSETS_DIR, 'overlay_act2.png')
OV_ACT3 = os.path.join(ASSETS_DIR, 'overlay_act3.png')
OV_ACT4 = os.path.join(ASSETS_DIR, 'overlay_act4.png')
OV_ACT5 = os.path.join(ASSETS_DIR, 'overlay_act5.png')
PIP_BORDER = os.path.join(ASSETS_DIR, 'pip_border.png')
CENTER_BORDER = os.path.join(ASSETS_DIR, 'center_border.png')

# Filter complex logic:
# Inputs:
# 0:v - RAW_VIDEO (abhi_video_01.mp4)
# 1:v - SC_HERO
# 2:v - SC_PULSE
# 3:v - SC_COPILOT
# 4:v - SC_D365
# 5:v - SC_BLOG
# 6:v - OV_ACT1
# 7:v - OV_ACT2
# 8:v - OV_ACT3
# 9:v - OV_ACT4
# 10:v - OV_ACT5
# 11:v - PIP_BORDER
# 12:v - CENTER_BORDER

fc = """
color=c=0x060A12:s=1920x1080:d=297.61:r=30[base];

[1:v]scale=1920:1080,format=rgba[bg_hero];
[2:v]scale=1920:1080,format=rgba[bg_pulse];
[3:v]scale=1920:1080,format=rgba[bg_copilot];
[4:v]scale=1920:1080,format=rgba[bg_d365];
[5:v]scale=1920:1080,format=rgba[bg_blog];

[base][bg_hero]overlay=0:0:enable='between(t,0,58)+between(t,240,298)'[s1];
[s1][bg_pulse]overlay=0:0:enable='between(t,58,120)'[s2];
[s2][bg_copilot]overlay=0:0:enable='between(t,120,150)'[s3];
[s3][bg_d365]overlay=0:0:enable='between(t,150,180)'[s4];
[s4][bg_blog]overlay=0:0:enable='between(t,180,240)'[bg_full];

[0:v]scale=1280:720,format=rgba[pres_center];
[0:v]scale=480:270,format=rgba[pres_pip];

[bg_full][pres_center]overlay=320:180:enable='between(t,0,58)+between(t,240,298)'[l1];
[l1][12:v]overlay=315:175:enable='between(t,0,58)+between(t,240,298)'[l2];

[l2][pres_pip]overlay=1390:755:enable='between(t,58,240)'[l3];
[l3][11:v]overlay=1386:751:enable='between(t,58,240)'[l4];

[l4][6:v]overlay=0:0:enable='between(t,0,58)'[o1];
[o1][7:v]overlay=0:0:enable='between(t,58,120)'[o2];
[o2][8:v]overlay=0:0:enable='between(t,120,180)'[o3];
[o3][9:v]overlay=0:0:enable='between(t,180,240)'[o4];
[o4][10:v]overlay=0:0:enable='between(t,240,298)'[vout]
"""

audio_filter = "[0:a]highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11[aout]"

print("[3/4] Launching FFmpeg render for 1080p Executive Keynote...")
cmd = [
    FFMPEG, '-y',
    '-i', RAW_VIDEO,
    '-loop', '1', '-t', '297.61', '-i', SC_HERO,
    '-loop', '1', '-t', '297.61', '-i', SC_PULSE,
    '-loop', '1', '-t', '297.61', '-i', SC_COPILOT,
    '-loop', '1', '-t', '297.61', '-i', SC_D365,
    '-loop', '1', '-t', '297.61', '-i', SC_BLOG,
    '-loop', '1', '-t', '297.61', '-i', OV_ACT1,
    '-loop', '1', '-t', '297.61', '-i', OV_ACT2,
    '-loop', '1', '-t', '297.61', '-i', OV_ACT3,
    '-loop', '1', '-t', '297.61', '-i', OV_ACT4,
    '-loop', '1', '-t', '297.61', '-i', OV_ACT5,
    '-loop', '1', '-t', '297.61', '-i', PIP_BORDER,
    '-loop', '1', '-t', '297.61', '-i', CENTER_BORDER,
    '-filter_complex', fc + ";" + audio_filter,
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '19',
    '-c:a', 'aac', '-b:a', '192k',
    '-t', '297.61',
    FINAL_VIDEO
]

res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode != 0:
    print("Render error! Tail of stderr:")
    print(res.stderr[-1000:])
else:
    print(f"[4/4] Successfully rendered 5-minute executive keynote: {FINAL_VIDEO}")
    print(f"File size: {os.path.getsize(FINAL_VIDEO) / (1024*1024):.2f} MB")
