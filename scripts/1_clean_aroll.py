import os
import sys
import argparse
import json
import subprocess
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Clean A-roll dead air and generate word-level transcript.")
    parser.add_argument("--input", "-i", type=str, default=None, help="Input video or audio file path")
    parser.add_argument("--margin", type=str, default="0.15sec", help="Auto-editor padding margin around speech")
    parser.add_argument("--model", type=str, default="base", help="Faster-Whisper model size (tiny, base, small, medium)")
    parser.add_argument("--device", type=str, default="auto", help="Compute device (cpu, cuda, auto)")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    raw_dir = project_root / "assets" / "raw"
    audio_dir = project_root / "assets" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    input_path = None
    if args.input:
        input_path = Path(args.input)
    else:
        # Search for first video or audio file in assets/raw
        valid_exts = {".mp4", ".mov", ".mkv", ".wav", ".mp3", ".m4a"}
        raw_files = [f for f in raw_dir.iterdir() if f.is_file() and f.suffix.lower() in valid_exts]
        if not raw_files:
            print(f"[!] No raw files found in {raw_dir}. Please place an A-roll file in assets/raw/ or specify --input.")
            sys.exit(1)
        input_path = raw_files[0]

    print(f"[*] Processing A-roll: {input_path}")
    cleaned_output = raw_dir / f"{input_path.stem}_cleaned{input_path.suffix}"

    # Step 1: Strip silences via auto-editor
    print(f"[*] Running auto-editor with margin {args.margin}...")
    try:
        # auto-editor CLI
        cmd_auto = [
            sys.executable, "-m", "auto_editor",
            str(input_path),
            "--margin", args.margin,
            "--output", str(cleaned_output),
            "--no-open"
        ]
        res = subprocess.run(cmd_auto, capture_output=True, text=True)
        if res.returncode == 0 and cleaned_output.exists():
            print(f"[+] Cleaned video created: {cleaned_output}")
            target_for_whisper = cleaned_output
        else:
            print(f"[!] auto-editor note: {res.stderr.strip() or res.stdout.strip()}")
            print("[*] Falling back to direct input file for transcription.")
            target_for_whisper = input_path
    except Exception as e:
        print(f"[!] Auto-editor exception ({e}), proceeding with original file.")
        target_for_whisper = input_path

    # Step 2: Extract word-level timestamps using faster-whisper
    print(f"[*] Loading faster-whisper model '{args.model}'...")
    try:
        from faster_whisper import WhisperModel
        
        device = "cuda" if args.device == "cuda" else ("cpu" if args.device == "cpu" else "auto")
        compute_type = "int8" if device == "cpu" else "float16"
        
        model = WhisperModel(args.model, device=device, compute_type=compute_type)
        print(f"[*] Transcribing audio with word-level timestamps...")
        segments, info = model.transcribe(str(target_for_whisper), word_timestamps=True)

        transcript_data = {
            "source_file": str(target_for_whisper.relative_to(project_root)),
            "detected_language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
            "segments": [],
            "all_words": []
        }

        for seg in segments:
            seg_dict = {
                "id": seg.id,
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
                "words": []
            }
            if seg.words:
                for w in seg.words:
                    word_item = {
                        "word": w.word.strip(),
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "probability": round(w.probability, 3)
                    }
                    seg_dict["words"].append(word_item)
                    transcript_data["all_words"].append(word_item)
            transcript_data["segments"].append(seg_dict)

        out_json = audio_dir / "transcript.json"
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(transcript_data, f, indent=2, ensure_ascii=False)

        print(f"[+] Word-level transcript saved successfully to {out_json}")
        print(f"[+] Processed {len(transcript_data['all_words'])} words across {len(transcript_data['segments'])} segments.")

    except ImportError:
        print("[!] faster-whisper is not installed. Please run pip install faster-whisper.")
        sys.exit(1)
    except Exception as e:
        print(f"[!] Transcription error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
