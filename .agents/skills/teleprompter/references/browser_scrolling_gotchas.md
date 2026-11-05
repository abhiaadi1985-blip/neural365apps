# Browser Teleprompter Scrolling: Technical Gotchas & Solutions

When building a browser-based teleprompter that auto-scrolls text smoothly over a fixed duration, standard web scrolling techniques often fail due to subtle browser engine behaviors. This document explains the exact pitfalls and verified solutions.

---

## 1. The Floating-Point Integer Truncation Trap

### The Problem
In standard browser implementations (Chromium, WebKit, Gecko):
- `element.scrollTop` and `window.scrollY` are DOM interface properties that represent the vertical scroll offset in **integer pixels**.
- When computing a continuous animation frame delta:
  ```javascript
  const pixelsPerSecond = maxScroll / targetDurationSeconds; // e.g. 800px / 105s = 7.62 px/s
  const deltaSeconds = 0.016; // at 60 FPS
  const frameMovement = pixelsPerSecond * deltaSeconds; // 7.62 * 0.016 = 0.122 pixels per frame
  ```
- If you write:
  ```javascript
  // FATAL BUG:
  element.scrollTop += frameMovement; // element.scrollTop += 0.122
  ```
  The browser engine casts the assignment to an integer or truncates decimals:
  `0 + 0.122 = 0.122` which rounds back to `0`.
  On the next animation frame 16ms later, `element.scrollTop` is still `0`.
  **Result:** The prompter remains completely frozen at the top of the page, even though the timer and requestAnimationFrame loop are running.

### The Solution
Maintain an independent high-precision floating-point accumulator variable in JavaScript memory:
```javascript
let currentScrollPos = element.scrollTop; // float

function step(timestamp) {
  // ... compute deltaSeconds ...
  currentScrollPos += pixelsPerSecond * deltaSeconds; // accumulates 0.122, 0.244, 0.366, ...
  element.scrollTop = Math.round(currentScrollPos); // DOM updates on whole numbers: 0, 0, 0, 1, 1, ...
  requestAnimationFrame(step);
}
```

---

## 2. Dynamic Scroll Height & Padding

### The Problem
A teleprompter needs significant top and bottom padding so the first words start aligned with the user's eyeline (approx. 35% down the screen) and the last words can scroll all the way through without getting cut off at the bottom.
However, hardcoding scroll distances causes velocity mismatches:
- On a 1080p display, `maxScroll` might be 1,400px.
- On a 4K display, `maxScroll` might be 2,200px.

### The Solution
Always compute `maxScroll` dynamically inside the animation frame or on window resize:
```javascript
const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
const basePixelsPerSec = maxScroll / TARGET_DURATION_SECONDS;
```

---

## 3. Human Eyeline Alignment (The 35% Rule)

### The Problem
If a speaker reads text at the vertical center (50%) or bottom (70%) of the screen, webcam footage will look like the speaker is staring down at their desk or keyboard rather than looking at the audience.

### The Solution
1. Place a fixed reading guide marker line at **30% to 35% from the top of the viewport**.
2. Add top padding to the scroll container (`padding-top: 280px` to `320px`) so Act 1 starts directly aligned with this line.
3. Advise the speaker to dock the browser window directly beneath their webcam lens. Looking at the 35% marker creates the optical illusion of direct, confident eye contact with the camera.

---

## 4. Manual Override & User Sync

Speakers frequently pause, speed up, or manually scroll back to re-read a phrase. If `currentScrollPos` is not synced with user input:
```javascript
// Sync float accumulator whenever user manually drags or wheels
scroller.addEventListener('scroll', () => {
  if (!isPlaying) {
    currentScrollPos = scroller.scrollTop;
  }
});
```
This ensures that when the speaker presses <kbd>SPACE</kbd> to resume, the prompter resumes exactly from where they scrolled, without jumping.
