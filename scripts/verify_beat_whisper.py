import sys
import json
from pathlib import Path
from faster_whisper import WhisperModel
import soundfile as sf
import numpy as np

def verify_audio(wav_path: Path, expected_text: str):
    print(f"[*] Analyzing {wav_path} with faster-whisper tiny.en...")
    model = WhisperModel("tiny.en", device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(wav_path), word_timestamps=True)
    
    full_transcript = []
    words_data = []
    
    for segment in segments:
        full_transcript.append(segment.text.strip())
        for w in segment.words:
            words_data.append({
                "word": w.word.strip(),
                "start": round(w.start, 3),
                "end": round(w.end, 3),
                "probability": round(w.probability, 3)
            })
            
    transcript_text = " ".join(full_transcript)
    print(f"[+] Transcribed: {transcript_text}")
    print(f"[+] Expected:    {expected_text}")
    
    # Soundfile duration & silence check
    data, sr = sf.read(str(wav_path))
    dur = len(data) / sr
    print(f"[+] Audio Duration: {dur:.2f}s, Sample Rate: {sr}Hz")
    
    # Silence detection (first sound > -35dBFS)
    rms = np.abs(data)
    threshold = 10 ** (-35 / 20)
    voiced_indices = np.where(rms > threshold)[0]
    lead_silence = voiced_indices[0] / sr if len(voiced_indices) > 0 else 0
    print(f"[+] Lead silence: {lead_silence:.2f}s")
    
    return {
        "duration": dur,
        "lead_silence": lead_silence,
        "transcript": transcript_text,
        "words": words_data
    }

if __name__ == "__main__":
    wav = Path("assets/audio/ns03/raw/beat_1.wav")
    expected = "When a supplier emails a five-day delay on purchase order zero zero eight four two, the purchaser usually spends hours chasing spreadsheets."
    if wav.exists():
        res = verify_audio(wav, expected)
        out_json = Path("assets/audio/ns03/beat_1_aligned.json")
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(res, f, indent=2)
        print(f"[+] Results saved to {out_json}")
    else:
        print("[!] Wav file not found yet.")
