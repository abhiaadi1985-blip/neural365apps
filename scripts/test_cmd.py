import subprocess
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
raw_video = project_root / "assets" / "raw" / "abhi_video_01.mp4"
screenshots_dir = project_root / "public" / "screenshots"
broll_dir = project_root / "assets" / "broll"
output_dir = project_root / "output"
assets_dir = output_dir / "master_assets"
ffmpeg_bin = project_root / "node_modules" / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe"

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
    "-c:v", "libx264", "-preset", "ultrafast",
    "-c:a", "aac", "-b:a", "192k",
    "-t", "2.0",
    "-f", "null", "-"
]

print("Running test probe on full command...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Returncode:", res.returncode)
if res.returncode != 0:
    print("Error tail:")
    print(res.stderr[-1000:])
else:
    print("Probe SUCCESS! Full command graph is 100% valid.")
