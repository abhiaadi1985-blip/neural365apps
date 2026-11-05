import os
import sys
import argparse
import re
from pathlib import Path
import urllib.request

KOKORO_MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/kokoro-v0_19.onnx"
VOICES_BIN_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/voices.json"

def ensure_model_files(models_dir: Path):
    models_dir.mkdir(parents=True, exist_ok=True)
    model_path = models_dir / "kokoro-v0_19.onnx"
    voices_path = models_dir / "voices.json"

    if not model_path.exists():
        print(f"[*] Downloading Kokoro ONNX model to {model_path} (~80MB)...")
        urllib.request.urlretrieve(KOKORO_MODEL_URL, model_path)
        print("[+] Model downloaded.")

    if not voices_path.exists():
        print(f"[*] Downloading Kokoro voices map to {voices_path}...")
        urllib.request.urlretrieve(VOICES_BIN_URL, voices_path)
        print("[+] Voices map downloaded.")

    return model_path, voices_path

def clean_markdown_text(md_content: str) -> str:
    # Remove code blocks, markdown headings, links, bullets
    text = re.sub(r"```[\s\S]*?```", "", md_content)
    text = re.sub(r"`[^`]*`", "", text)
    text = re.sub(r"#+\s*", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    text = re.sub(r"[\*\_\~\>]", "", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()

def main():
    parser = argparse.ArgumentParser(description="Generate 24kHz TTS audio via local Kokoro ONNX model.")
    parser.add_argument("--input", "-i", type=str, default=None, help="Markdown or text file path")
    parser.add_argument("--text", "-t", type=str, default=None, help="Direct text string to synthesize")
    parser.add_argument("--voice", "-v", type=str, default="af_heart", help="Voice style (e.g. af_heart, am_adam, af_bella, am_michael)")
    parser.add_argument("--speed", "-s", type=float, default=1.0, help="Speech speed multiplier")
    parser.add_argument("--output", "-o", type=str, default="voiceover.wav", help="Output WAV filename in assets/audio/")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    audio_dir = project_root / "assets" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    models_dir = project_root / ".models" / "kokoro"

    raw_text = ""
    if args.text:
        raw_text = args.text
    elif args.input:
        in_path = Path(args.input)
        if not in_path.exists():
            print(f"[!] Input file not found: {in_path}")
            sys.exit(1)
        raw_text = clean_markdown_text(in_path.read_text(encoding="utf-8"))
    else:
        # Check docs/scripts or default sample text
        sample_path = project_root / "docs" / "scripts" / "keynote_5min_builder_script.md"
        if sample_path.exists():
            print(f"[*] No input specified, using sample script from: {sample_path}")
            raw_text = clean_markdown_text(sample_path.read_text(encoding="utf-8"))
        else:
            raw_text = "Welcome to neural365 COMMUNITY, the open-source platform bridging enterprise AI and hands-on automation."

    output_path = audio_dir / args.output
    print(f"[*] Preparing TTS synthesis for {len(raw_text.split())} words using voice '{args.voice}'...")

    try:
        from kokoro_onnx import Kokoro
        import soundfile as sf
        
        model_path, voices_path = ensure_model_files(models_dir)
        kokoro = Kokoro(str(model_path), str(voices_path))

        samples, sample_rate = kokoro.create(
            raw_text,
            voice=args.voice,
            speed=args.speed,
            lang="en-us"
        )

        sf.write(str(output_path), samples, sample_rate)
        print(f"[+] TTS audio generated at 24kHz: {output_path}")
        print(f"[+] Sample count: {len(samples)} ({len(samples)/sample_rate:.2f} seconds)")

    except ImportError as e:
        print(f"[!] Missing library: {e}. Please ensure kokoro-onnx and soundfile are installed in your .venv.")
        sys.exit(1)
    except Exception as e:
        print(f"[!] TTS generation error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
