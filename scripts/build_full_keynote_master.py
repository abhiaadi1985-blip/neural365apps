import os
import sys
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

project_root = Path(__file__).resolve().parent.parent
raw_video = project_root / "assets" / "raw" / "abhi_video_01.mp4"
broll_dir = project_root / "assets" / "broll"
screenshots_dir = project_root / "public" / "screenshots"
output_dir = project_root / "output"
output_dir.mkdir(parents=True, exist_ok=True)
final_mp4 = output_dir / "neural365_keynote_master_edited.mp4"

ffmpeg_bin = project_root / "node_modules" / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe"
if not ffmpeg_bin.exists():
    ffmpeg_bin = "ffmpeg"
else:
    ffmpeg_bin = str(ffmpeg_bin)

print("[1/3] Generating lower-third titles and glowing frames...")
assets_dir = output_dir / "master_assets"
assets_dir.mkdir(parents=True, exist_ok=True)

# Generate glowing PiP border (488 x 278)
pip_border = Image.new("RGBA", (488, 278), (0, 0, 0, 0))
d = ImageDraw.Draw(pip_border)
d.rounded_rectangle([(0, 0), (487, 277)], radius=12, outline=(56, 189, 248, 240), width=4)
pip_border.save(assets_dir / "pip_border_cyan.png")

# Generate Center Border (1290 x 730)
center_border = Image.new("RGBA", (1290, 730), (0, 0, 0, 0))
d2 = ImageDraw.Draw(center_border)
d2.rounded_rectangle([(0, 0), (1289, 729)], radius=16, outline=(47, 134, 255, 230), width=5)
center_border.save(assets_dir / "center_border_blue.png")

# Lower third card generator
try:
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 13)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 14)
except Exception:
    font_bold = font_badge = font_sub = ImageFont.load_default()

cards_meta = [
    {
        "id": "lt_overwhelm",
        "badge": "THE LEARNING BREAKTHROUGH",
        "title": "10x Faster Comprehension: Rich Visuals & Audio",
        "sub": "Why reading release waves fails — and why multi-modal sandboxes win",
        "accent": (56, 189, 248)
    },
    {
        "id": "lt_hermes",
        "badge": "PROVEN IN SANDBOX · ZERO HALLUCINATIONS",
        "title": "Hermes Ingestion Pipeline with Human-in-the-Loop",
        "sub": "Continuous monitoring of MS Learn & roadmaps — verified hands-on before publishing",
        "accent": (129, 140, 248)
    },
    {
        "id": "lt_pillars",
        "badge": "ARCHITECTURAL LABS",
        "title": "4 Core Pillars: D365 F&O, Dataverse, Copilot & Industry",
        "sub": "Autonomous reconciliation, virtual table groundings & Spoke Demo Labs",
        "accent": (52, 211, 153)
    },
    {
        "id": "lt_formats",
        "badge": "MULTIMODAL DELIVERY",
        "title": "The Pulse Weekly Radar • 60s Shots • 3-Min Podcasts",
        "sub": "Distilled into high-impact formats that respect enterprise engineers' time",
        "accent": (245, 158, 11)
    },
    {
        "id": "lt_community",
        "badge": "OPEN COMMUNITY INVITATION",
        "title": "Build, Stress-Test & Evolve With Me",
        "sub": "neural365 COMMUNITY — Every feedback counts. Share what workflows you want built.",
        "accent": (56, 189, 248)
    }
]

for c in cards_meta:
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    x, y, w, h = 100, 910, 880, 105
    draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=12, fill=(9, 13, 22, 235), outline=(255, 255, 255, 28), width=1)
    draw.rounded_rectangle([(x, y), (x + 5, y + h)], radius=2, fill=c["accent"])
    draw.rounded_rectangle([(x + 24, y + 16), (x + 24 + len(c["badge"])*8 + 16, y + 36)], radius=4, fill=(*c["accent"][:3], 32), outline=(*c["accent"][:3], 90), width=1)
    draw.text((x + 32, y + 19), c["badge"], font=font_badge, fill=c["accent"])
    draw.text((x + 24, y + 44), c["title"], font=font_bold, fill=(249, 250, 251, 255))
    draw.text((x + 24, y + 74), c["sub"], font=font_sub, fill=(156, 163, 175, 255))
    img.save(assets_dir / f"{c['id']}.png")

print("[2/3] Assembling high-production multi-layered video timeline...")

# Inputs index reference:
# 0:v - Raw Video (abhi_video_01.mp4)
# 1:v - Hero Landing screenshot (01-hero-landing.png)
# 2:v - Intro Title B-roll (intro_title.mp4)
# 3:v - Hermes Flowchart B-roll (hermes_flowchart.mp4)
# 4:v - Four Pillars Grid B-roll (four_pillars_grid.mp4)
# 5:v - Zoom D365 ERP B-roll (zoom_d365_erp.mp4)
# 6:v - Zoom Copilot Studio B-roll (zoom_copilot_studio.mp4)
# 7:v - Zoom Pulse Radar B-roll (zoom_pulse_radar.mp4)
# 8:v - Zoom Multimodal Guides B-roll (zoom_multimodal_guides.mp4)
# 9:v - Center Border Blue
# 10:v - PiP Border Cyan
# 11:v - LT Overwhelm
# 12:v - LT Hermes
# 13:v - LT Pillars
# 14:v - LT Formats
# 15:v - LT Community

fc_lines = [
    "color=c=0x090D16:s=1920x1080:d=297.61:r=30[base]",
    "[1:v]scale=1920:1080,format=rgba,split=2[bg_hero1][bg_hero2]",
    "[2:v]scale=1920:1080,format=rgba[bg_intro]",
    "[3:v]scale=1920:1080,format=rgba[bg_hermes]",
    "[4:v]scale=1920:1080,format=rgba[bg_pillars]",
    "[5:v]scale=1920:1080,format=rgba[bg_d365]",
    "[6:v]scale=1920:1080,format=rgba[bg_copilot]",
    "[7:v]scale=1920:1080,format=rgba[bg_pulse]",
    "[8:v]scale=1920:1080,format=rgba[bg_guides]",
    "[base][bg_hero1]overlay=0:0:enable='between(t,0,38.78)+between(t,244,297.61)'[b1]",
    "[b1][bg_intro]overlay=0:0:enable='between(t,38.78,52)'[b2]",
    "[b2][bg_hero2]overlay=0:0:enable='between(t,52,64)'[b3]",
    "[b3][bg_hermes]overlay=0:0:enable='between(t,64,125.08)'[b4]",
    "[b4][bg_pillars]overlay=0:0:enable='between(t,125.08,137)'[b5]",
    "[b5][bg_d365]overlay=0:0:enable='between(t,137,147)'[b6]",
    "[b6][bg_copilot]overlay=0:0:enable='between(t,147,162)'[b7]",
    "[b7][bg_pulse]overlay=0:0:enable='between(t,162,198)'[b8]",
    "[b8][bg_guides]overlay=0:0:enable='between(t,198,244)'[bg_master]",
    "[0:v]scale=1280:720,format=rgba[pres_wide]",
    "[0:v]crop=1066:600:107:60,scale=1280:720,format=rgba,split=2[pres_punchin1][pres_punchin2]",
    "[0:v]scale=480:270,format=rgba[pres_pip_normal]",
    "[0:v]crop=1066:600:107:60,scale=480:270,format=rgba[pres_pip_punchin]",
    "[9:v]split=2[c_border1][c_border2]",
    "[bg_master][pres_wide]overlay=320:180:enable='between(t,0,16.64)'[p1]",
    "[p1][pres_punchin1]overlay=320:180:enable='between(t,16.64,38.78)'[p2]",
    "[p2][c_border1]overlay=315:175:enable='between(t,0,38.78)'[p3]",
    "[p3][pres_pip_normal]overlay=1390:755:enable='between(t,38.78,64)+between(t,104,125.08)+between(t,125.08,244)'[p4]",
    "[p4][pres_pip_punchin]overlay=1390:755:enable='between(t,64,104)'[p5]",
    "[p5][10:v]overlay=1386:751:enable='between(t,38.78,244)'[p6]",
    "[p6][pres_punchin2]overlay=320:180:enable='between(t,244,297.61)'[p7]",
    "[p7][c_border2]overlay=315:175:enable='between(t,244,297.61)'[p8]",
    "[p8][11:v]overlay=0:0:enable='between(t,16.64,38)'[o1]",
    "[o1][12:v]overlay=0:0:enable='between(t,64,120)'[o2]",
    "[o2][13:v]overlay=0:0:enable='between(t,125,160)'[o3]",
    "[o3][14:v]overlay=0:0:enable='between(t,165,240)'[o4]",
    "[o4][15:v]overlay=0:0:enable='between(t,244,296)'[vout]",
    "[0:a]highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.8,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
]

full_fc = ";\n".join(fc_lines)

cmd = [
    str(ffmpeg_bin), "-y",
    "-i", str(raw_video),
    "-loop", "1", "-t", "297.61", "-i", str(screenshots_dir / "01-hero-landing.png"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "intro_title.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "hermes_flowchart.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "four_pillars_grid.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "zoom_d365_erp.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "zoom_copilot_studio.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "zoom_pulse_radar.mp4"),
    "-stream_loop", "-1", "-t", "297.61", "-i", str(broll_dir / "zoom_multimodal_guides.mp4"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "center_border_blue.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "pip_border_cyan.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "lt_overwhelm.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "lt_hermes.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "lt_pillars.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "lt_formats.png"),
    "-loop", "1", "-t", "297.61", "-i", str(assets_dir / "lt_community.png"),
    "-filter_complex", full_fc,
    "-map", "[vout]",
    "-map", "[aout]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    "-t", "297.61",
    str(final_mp4)
]

print("[3/3] Executing FFmpeg master render (1080p 30fps with dynamic camera punch-ins & audio mastering)...")
res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode != 0:
    print("[!] Render Error! Stderr tail:")
    print(res.stderr[-1000:])
    sys.exit(1)

print(f"[+] Successfully rendered master keynote: {final_mp4}")
print(f"[+] Size: {final_mp4.stat().st_size / (1024*1024):.2f} MB")
