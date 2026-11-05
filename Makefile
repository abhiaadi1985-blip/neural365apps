# Local-First Programmatic Video Editing Studio (Tier 1 Zero-Dollar Stack)

PYTHON := .venv/Scripts/python.exe
NPX := npx

.PHONY: help clean-audio tts preview-broll render-broll build-video verify

help:
	@echo "Available commands:"
	@echo "  make clean-audio   - Run auto-editor and faster-whisper to clean A-roll and generate word timestamps"
	@echo "  make tts           - Generate clean 24kHz local voiceover via Kokoro ONNX"
	@echo "  make preview-broll - Open live HyperFrames studio preview of HTML scenes"
	@echo "  make render-broll  - Render HTML scene to assets/broll/template-showcase.mp4"
	@echo "  make build-video   - Assemble A-roll + B-roll cuts with audio mastering to output/final_render.mp4"
	@echo "  make verify        - Run verification check on all installed video editing tools"

clean-audio:
	$(PYTHON) scripts/1_clean_aroll.py

tts:
	$(PYTHON) scripts/2_local_tts.py

preview-broll:
	$(NPX) hyperframes preview scenes

render-broll:
	$(NPX) hyperframes render scenes -o assets/broll/template-showcase.mp4

build-video:
	$(PYTHON) scripts/3_assemble_video.py

verify:
	$(PYTHON) scripts/verify_studio.py
