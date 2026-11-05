import os
import subprocess
import re
import sys

FFMPEG = os.path.join(os.getcwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe')
RAW_VIDEO = os.path.join(os.getcwd(), 'assets', 'raw_recordings', 'neural365 COMMUNITY - 2026-10-16 10_16 PM.mp4')
OUT_TIGHTENED = os.path.join(os.getcwd(), 'output', 'user_tightened_raw.mp4')
OUT_FINAL = os.path.join(os.getcwd(), 'output', 'user_walkthrough_jumpcut_1080p.mp4')

os.makedirs(os.path.join(os.getcwd(), 'output'), exist_ok=True)

print("[1/4] Detecting silences and pauses in raw recording...")
# Detect silence: sound below -28dB for longer than 0.35s
cmd = [FFMPEG, '-i', RAW_VIDEO, '-af', 'silencedetect=noise=-28dB:d=0.35', '-f', 'null', '-']
res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)

silences = []
current_start = None
for line in res.stderr.split('\n'):
    if 'silence_start:' in line:
        m = re.search(r'silence_start:\s*([0-9.]+)', line)
        if m:
            current_start = float(m.group(1))
    elif 'silence_end:' in line:
        m_end = re.search(r'silence_end:\s*([0-9.]+)', line)
        m_dur = re.search(r'silence_duration:\s*([0-9.]+)', line)
        if m_end and current_start is not None:
            end_val = float(m_end.group(1))
            dur_val = float(m_dur.group(1)) if m_dur else (end_val - current_start)
            silences.append((current_start, end_val, dur_val))
            current_start = None

# Get video total duration
probe_cmd = [FFMPEG, '-i', RAW_VIDEO]
probe_res = subprocess.run(probe_cmd, stderr=subprocess.PIPE, text=True)
total_dur = 192.79
for line in probe_res.stderr.split('\n'):
    if 'Duration:' in line:
        dm = re.search(r'Duration:\s*(\d+):(\d+):([0-9.]+)', line)
        if dm:
            total_dur = int(dm.group(1))*3600 + int(dm.group(2))*60 + float(dm.group(3))
            break

print(f"Total raw duration: {total_dur:.2f}s | Silences detected: {len(silences)}")

# Invert silences into speech intervals
speech_segments = []
last_end = 0.0
for s_start, s_end, s_dur in silences:
    seg_start = last_end
    seg_end = s_start
    if seg_end > seg_start + 0.12:
        speech_segments.append((seg_start, seg_end))
    last_end = s_end

if last_end < total_dur - 0.2:
    speech_segments.append((last_end, total_dur))

# Add 120ms safety pad so word onsets and tails are never clipped
pad = 0.12
expanded = []
for start, end in speech_segments:
    e_start = max(0.0, start - pad)
    e_end = min(total_dur, end + pad)
    expanded.append([e_start, e_end])

# Merge close speech clips (if gap < 0.22s, keep natural rhythm)
merged = []
for start, end in expanded:
    if not merged:
        merged.append([start, end])
    else:
        prev_start, prev_end = merged[-1]
        if start <= prev_end + 0.22:
            merged[-1][1] = max(prev_end, end)
        else:
            merged.append([start, end])

tight_dur = sum(e - s for s, e in merged)
print(f"[2/4] Compiled {len(merged)} speech segments. Tightened duration: {tight_dur:.2f}s (removed {total_dur - tight_dur:.2f}s of silence)")

# Build FFmpeg filter_complex to splice clips together with audio enhancement
filter_parts = []
concat_inputs = ''
for i, (s, e) in enumerate(merged):
    filter_parts.append(f"[0:v]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS[v{i}]")
    filter_parts.append(f"[0:a]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS[a{i}]")
    concat_inputs += f"[v{i}][a{i}]"

n = len(merged)
audio_fx = "highpass=f=80,afftdn=nf=-24,equalizer=f=3000:t=q:w=1:g=2.5,acompressor=threshold=-18dB:ratio=3:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11"
scale_fx = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x060A12,format=yuv420p"

filter_complex = f"{';'.join(filter_parts)};{concat_inputs}concat=n={n}:v=1:a=1[vcat][acat_raw];[vcat]{scale_fx}[vout];[acat_raw]{audio_fx}[aout]"

print("[3/4] Rendering jump-cut conformed video with 1080p canvas and mastered vocal audio...")
cmd_render = [
    FFMPEG, '-y',
    '-i', RAW_VIDEO,
    '-filter_complex', filter_complex,
    '-map', '[vout]',
    '-map', '[aout]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
    '-c:a', 'aac', '-b:a', '192k',
    OUT_FINAL
]

res_render = subprocess.run(cmd_render, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res_render.returncode != 0:
    print("Render failed! Error tail:")
    print(res_render.stderr[-1000:])
    sys.exit(1)

print(f"[4/4] Successfully rendered polished video: {OUT_FINAL}")
print(f"File size: {os.path.getsize(OUT_FINAL) / (1024*1024):.2f} MB")
