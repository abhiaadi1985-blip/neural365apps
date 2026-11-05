import os
import sys
import json
import subprocess
from pathlib import Path

def find_ffmpeg(project_root: Path) -> str:
    # Check node_modules @ffmpeg-installer first
    npm_ffmpeg = project_root / "node_modules" / "@ffmpeg-installer" / "win32-x64" / "ffmpeg.exe"
    if npm_ffmpeg.exists():
        return str(npm_ffmpeg)
    # Check PATH
    import shutil
    sys_ffmpeg = shutil.which("ffmpeg")
    if sys_ffmpeg:
        return sys_ffmpeg
    return "ffmpeg"

def generate_sample_manifest(manifest_path: Path, raw_file: Path, broll_files: list):
    sample = {
        "aroll": str(raw_file.as_posix()),
        "resolution": [1920, 1080],
        "fps": 30,
        "audio_mastering": True,
        "cuts": []
    }
    # If broll files exist, create sample cut entries
    if broll_files:
        start_t = 5.0
        for bfile in broll_files[:3]:
            sample["cuts"].append({
                "clip": str(bfile.as_posix()),
                "start": start_t,
                "end": start_t + 10.0,
                "transition": "fade",
                "mode": "fullscreen"  # fullscreen or pip
            })
            start_t += 25.0
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(sample, f, indent=2)
    print(f"[*] Created starter manifest template at {manifest_path}")

def main():
    project_root = Path(__file__).resolve().parent.parent
    raw_dir = project_root / "assets" / "raw"
    broll_dir = project_root / "assets" / "broll"
    output_dir = project_root / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = project_root / "manifest.json"

    # Find a-roll file
    cleaned_aroll = list(raw_dir.glob("*_cleaned.*"))
    if cleaned_aroll:
        aroll_path = cleaned_aroll[0]
    else:
        all_aroll = [f for f in raw_dir.iterdir() if f.is_file() and f.suffix.lower() in {".mp4", ".mov", ".mkv"}]
        aroll_path = all_aroll[0] if all_aroll else None

    if not aroll_path:
        print("[!] No A-roll video found in assets/raw/. Please add an A-roll video first.")
        sys.exit(1)

    # Ensure manifest exists
    broll_files = list(broll_dir.glob("*.mp4"))
    if not manifest_path.exists():
        generate_sample_manifest(manifest_path, aroll_path.relative_to(project_root), [b.relative_to(project_root) for b in broll_files])

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    ffmpeg_bin = find_ffmpeg(project_root)
    output_file = output_dir / "final_render.mp4"

    cuts = manifest.get("cuts", [])
    print(f"[*] Assembling video from '{aroll_path.name}' with {len(cuts)} B-roll overlay cut(s)...")

    # Construct FFmpeg command
    cmd = [ffmpeg_bin, "-y", "-i", str(project_root / manifest.get("aroll", aroll_path))]

    # Add each B-roll input
    valid_cuts = []
    for cut in cuts:
        c_path = project_root / cut["clip"]
        if c_path.exists():
            cmd.extend(["-i", str(c_path)])
            valid_cuts.append(cut)
        else:
            print(f"[!] Warning: B-roll clip not found, skipping: {c_path}")

    # Build filter complex
    filter_chains = []
    current_v = "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=rgba"
    filter_chains.append(f"{current_v}[base]")
    last_node = "[base]"

    for idx, cut in enumerate(valid_cuts, start=1):
        start_t = cut.get("start", 0.0)
        end_t = cut.get("end", start_t + 5.0)
        mode = cut.get("mode", "fullscreen")
        
        # Scale B-roll to 1920x1080 (or pip)
        if mode == "pip":
            filter_chains.append(f"[{idx}:v]scale=560:315,format=rgba[broll_{idx}]")
            overlay_x, overlay_y = "1320", "720"
        else:
            filter_chains.append(f"[{idx}:v]scale=1920:1080,format=rgba[broll_{idx}]")
            overlay_x, overlay_y = "0", "0"

        next_node = f"[v_mix_{idx}]"
        filter_chains.append(
            f"{last_node}[broll_{idx}]overlay={overlay_x}:{overlay_y}:enable='between(t,{start_t},{end_t})'{next_node}"
        )
        last_node = next_node

    filter_chains.append(f"{last_node}format=yuv420p[vout]")
    
    # Audio chain with broadcast mastering
    if manifest.get("audio_mastering", True):
        filter_chains.append(
            "[0:a]highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11[aout]"
        )
        map_audio = "[aout]"
    else:
        map_audio = "0:a"

    fc_str = ";\n".join(filter_chains)

    cmd.extend([
        "-filter_complex", fc_str,
        "-map", "[vout]",
        "-map", map_audio,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        str(output_file)
    ])

    print("[*] Executing FFmpeg render pipeline...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[!] Render failed! Error tail:")
        print(res.stderr[-1000:])
        sys.exit(1)

    print(f"[+] Final assembled video successfully created: {output_file}")
    print(f"[+] Size: {output_file.stat().st_size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    main()
