# Editorial Diagrams & Visual Explanations

## Core Standards
1. **Never Draw Ugly Diagrams**: Never use plain gray rectangles, default box-shadows, or sharp static black arrows.
2. **Glassmorphic Nodes**:
   - Every diagram block must have rounded corners (`border-radius: 12px` to `16px`).
   - Use background `rgba(255, 255, 255, 0.03)` with `border: 1px solid rgba(255, 255, 255, 0.1)`.
   - Incorporate inline badge icons or glowing indicator dots.
3. **Animated Data Flow (SVG Paths)**:
   - Connect nodes using clean cubic Bezier SVG paths (`d="M ... C ..."`).
   - Animate data flows using `stroke-dasharray` and `stroke-dashoffset` pulses or glowing gradient trails moving in the direction of information flow.
4. **Split-Screen "Before vs. After" Layouts**:
   - Clearly delineate comparative states:
     - Left side: "Skill Off / Manual" (muted, subtle red/gray accent).
     - Right side: "Skill On / Polished Automation" (electric indigo/cyan accent with glowing active border).
5. **Readable Hierarchy**:
   - Step numbers / sequence tags prominently displayed in monospace pills (`01`, `02`, `03`).
   - Concise 3-6 word descriptions under bold titles.
