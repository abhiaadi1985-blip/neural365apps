---
name: teleprompter
description: >-
  Generate, calibrate, and deploy browser-based teleprompter tools for video presentations, product walkthroughs, keynote recordings, and screencasts across any project. Use whenever the user needs a teleprompter, is recording a video presentation or product demo, asks to practice or pace a presentation script, or requires smooth eyeline-guided script reading with action cues.
---

# Teleprompter Engineering & Deployment Skill

This skill provides the architecture, templates, and procedures for generating web-based teleprompter tools that enable flawless, 1-take video recordings and keynotes.

---

## 1. Core Architecture of a Production Teleprompter

A production web teleprompter must solve three distinct physical and technical challenges:

1. **Camera Eyeline Alignment**: The speaker must look into the camera lens while reading, not down at the bottom of the monitor.
2. **Mathematical Time Calibration**: The scroll rate must match spoken words per minute (WPM), not arbitrary pixels.
3. **Sub-Pixel Accumulator (The Floating-Point Truncation Trap)**: Browsers round `element.scrollTop` to integers; micro-increments per frame must be tracked in a float accumulator or scrolling will freeze.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHYSICAL WEBCAM LENS                            │
└────────────────────────────────────────────────────────────────────────┘
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TOP HUD: Timer [00:15 / 01:45 (14%)] | Play/Pause | Speed [1.0x]      │
├────────────────────────────────────────────────────────────────────────┤
│ ▲▲▲ FIXED READING EYELINE MARKER (Top 35% viewport) ▲▲▲               │
│                                                                        │
│   👉 [ACTION: Scroll smoothly to Feature B on website]                 │
│   "Next-generation autonomous agents orchestrate dataverse workflows..."│
│                                                                        │
│ (Text scrolls upward through the eyeline marker at exact speech pace)  │
├────────────────────────────────────────────────────────────────────────┤
│ FOOTER: Shortcuts (Space: Pause | ▲/▼: Speed | R: Reset | 1/2: Script) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Critical Implementation Rule: The Browser Truncation Trap

> [!CAUTION]
> **NEVER DO THIS**:
> ```javascript
> // BUG: FAILS AT SLOW/NATURAL SPEECH PACING
> scroller.scrollTop += pixelsPerSecond * deltaSeconds;
> ```
> At 60 FPS across a 105-second script, `pixelsPerSecond * deltaSeconds` is only `~0.12px` per animation frame.
> In Chromium and WebKit, assigning a decimal `< 1.0` directly to `element.scrollTop` causes the browser to truncate or round back to the existing integer value. **The viewport stays frozen at `0` forever while the timer runs.**

### The Mandatory Pattern
Always maintain an internal high-precision floating-point accumulator and round only when updating the DOM:

```javascript
let currentScrollPos = scroller.scrollTop; // Internal float accumulator

function step(timestamp) {
  if (!isPlaying) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaSeconds = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  const maxScroll = scroller.scrollHeight - scroller.clientHeight;
  if (maxScroll > 0) {
    // Exact mathematical pace to cover document in target seconds
    const basePixelsPerSec = maxScroll / TARGET_DURATION_SECONDS;
    const pixelsPerSecond = Math.max(8, basePixelsPerSec * speedMultiplier);
    
    // 1. Accumulate decimal precision internally
    currentScrollPos += pixelsPerSecond * deltaSeconds;
    
    if (currentScrollPos >= maxScroll) {
      currentScrollPos = maxScroll;
      scroller.scrollTop = maxScroll;
      pausePrompter();
      return;
    }
    
    // 2. Assign rounded integer to the DOM
    scroller.scrollTop = Math.round(currentScrollPos);
  }

  scrollAnimFrame = requestAnimationFrame(step);
}
```

---

## 3. Pacing & Word Count Guidelines

When generating or editing presentation scripts for the teleprompter:

| Target Duration | Optimal Word Count | Conversational Pace | Use Case |
| :--- | :--- | :--- | :--- |
| **60 Seconds** (Shorts/Reels) | 120 – 135 words | ~130 WPM | Feature highlights, quick tips |
| **90 Seconds** (Product Demo) | 190 – 210 words | ~135 WPM | Executive walkthroughs, release overviews |
| **105 Seconds (1:45)** | 225 – 245 words | ~135 WPM | Comprehensive platform tours, founder keynotes |
| **120 Seconds (2:00)** | 250 – 275 words | ~130 WPM | Technical architectures, multi-scene breakdowns |

### Scene / Act Structure
Always structure the teleprompter script into 4 to 5 distinct **Acts**, each containing:
1. **Act Header & Timestamp Range**: (e.g. `0:00 - 0:25 ● ACT 1: THE MISSION`).
2. **Visual Action Cue**: Highlighted callout box telling the speaker what to do on screen (e.g. `👉 ON SCREEN: Scroll to 'The Pulse' section and hover over weekly signal cards. Look into webcam, smile.`).
3. **Script Body**: Clear, conversational prose with key phrases emphasized in *italics* or **bold**.

---

## 4. How to Deploy a Teleprompter to Any Project

When a user asks for a teleprompter or needs to record a video presentation:

### Option A: Use the Python Generator Script (Fastest)
Run the bundled generation script located in this skill:
```bash
python ~/.gemini/config/skills/teleprompter/scripts/generate_teleprompter.py \
  --input path/to/script.md \
  --output ./public/teleprompter.html \
  --duration 105 \
  --title "Project Name Walkthrough"
```

### Option B: Standalone HTML Deployment
1. Copy the master template from [`resources/teleprompter_template.html`](./resources/teleprompter_template.html) to the project's web root:
   - For Next.js: `public/teleprompter.html`
   - For Vite/React: `public/teleprompter.html`
   - For generic web: `teleprompter.html`
2. Populate the `<div id="scriptA">` and optional `<div id="scriptB">` containers with the project-specific script acts.
3. Open directly in the browser:
   ```powershell
   explorer.exe public\teleprompter.html
   ```

---

## 5. Physical Recording Best Practices

Instruct the user on these physical setup tips for studio-grade results:

1. **Window Placement**: Resize the teleprompter window to a narrow vertical strip (approx. 600px wide) and position it **at the top-center of the screen, immediately below the physical webcam lens**.
2. **Eyeline Line**: The dashed green marker at 35% viewport height keeps the user's gaze focused right on the camera, creating the illusion of direct eye contact.
3. **Audio Shadowing**: If the user has a pre-recorded audio sample or TTS track, provide an optional headphone sync cue so they can speak at a steady cadence.
4. **Post-Recording Audio Polish**: After the user records their take with Cap / OBS / Loom, apply standard audio enhancement (highpass 80Hz, FFT noise suppression, compression, and EBU R128 loudness normalization to -16 LUFS).
