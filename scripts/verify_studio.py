import sys
import subprocess
from pathlib import Path

def test_tool(name, check_fn):
    try:
        ver = check_fn()
        print(f"  [PASS] {name:<18} -> {ver}")
        return True
    except Exception as e:
        print(f"  [FAIL] {name:<18} -> Error: {e}")
        return False

print("=" * 60)
print(" VERIFYING ZERO-DOLLAR PROGRAMMATIC VIDEO STUDIO STACK")
print("=" * 60)

results = []

# 1. auto-editor
results.append(test_tool("auto-editor", lambda: subprocess.check_output([sys.executable, "-m", "auto_editor", "--version"], text=True).strip()))

# 2. faster-whisper
def check_whisper():
    import faster_whisper
    return f"v{faster_whisper.__version__}"
results.append(test_tool("faster-whisper", check_whisper))

# 3. kokoro-onnx
def check_kokoro():
    import kokoro_onnx
    import soundfile
    return f"kokoro-onnx installed (soundfile v{soundfile.__version__})"
results.append(test_tool("kokoro-onnx", check_kokoro))

# 4. ffmpeg-python
def check_ffmpeg_py():
    import ffmpeg
    return "ffmpeg-python installed"
results.append(test_tool("ffmpeg-python", check_ffmpeg_py))

# 5. FFmpeg binary
def check_ffmpeg_bin():
    ffmpeg_bin = Path("node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe")
    if ffmpeg_bin.exists():
        return f"Binary available at {ffmpeg_bin.name}"
    import shutil
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        return f"System FFmpeg ({sys_ff})"
    raise FileNotFoundError("FFmpeg binary not found")
results.append(test_tool("ffmpeg binary", check_ffmpeg_bin))

# 6. HyperFrames CLI
def check_hyperframes():
    out = subprocess.check_output(["npx.cmd", "hyperframes", "--version"], text=True).strip()
    return f"hyperframes {out}"
results.append(test_tool("hyperframes CLI", check_hyperframes))

# 7. Check workspace assets & folders
def check_dirs():
    required = ["assets/raw", "assets/audio", "assets/broll", "output", "scripts", "scenes", ".antigravity/skills"]
    missing = [d for d in required if not Path(d).exists()]
    if missing:
        raise FileNotFoundError(f"Missing dirs: {missing}")
    return f"All {len(required)} directories verified"
results.append(test_tool("workspace dirs", check_dirs))

# 8. Check custom skills
def check_skills():
    skills = [
        ".antigravity/skills/ponytail-efficiency.md",
        ".antigravity/skills/taste-motion-design.md",
        ".antigravity/skills/editorial-diagrams.md"
    ]
    missing = [s for s in skills if not Path(s).exists()]
    if missing:
        raise FileNotFoundError(f"Missing skills: {missing}")
    return f"All {len(skills)} custom skills present"
results.append(test_tool("custom skills", check_skills))

print("=" * 60)
passed = sum(1 for r in results if r)
total = len(results)
print(f" Summary: {passed}/{total} components verified successfully.")
if passed == total:
    print(" Studio Status: 100% READY FOR AUTOMATION")
else:
    print(" Studio Status: INCOMPLETE (check errors above)")
print("=" * 60)
