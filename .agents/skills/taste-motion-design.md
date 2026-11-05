# Taste & Motion Design Guidelines

## Color Palette & Visual Aesthetics
- **Deep Obsidian Background**: `#090D16` (infinite depth, zero gray-wash).
- **Subtle Card Surfaces**: `#111827` or glassmorphic `rgba(17, 24, 39, 0.7)` with `backdrop-filter: blur(16px)`.
- **Crisp Borders**: `1px solid rgba(255, 255, 255, 0.08)` for razor-sharp edge contrast.
- **High-Contrast Text**: Primary `#F9FAFB`, secondary `#9CA3AF`, muted `#6B7280`.
- **Electric Accent Highlights**: Primary cyan `#38BDF8`, secondary electric indigo `#818CF8`, glowing success `#34D399`.

## Typography
- **Headings & UI**: Load `Inter` or `Plus Jakarta Sans` via Google Fonts.
- **Letter Spacing**: Apply tight tracking on display headings: `letter-spacing: -0.03em; font-weight: 700;`.
- **Code & Terminals**: Load `JetBrains Mono` with subtle syntax coloring.

## Motion & Choreography
- **No Linear Easing**: Never use linear easing for camera, scale, or opacity.
- **Signature Curves**:
  - CSS: `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo/apple smooth ease).
  - GSAP: `ease: "power4.out"` or spring `ease: "back.out(1.4)"`.
- **Staggering**: Stagger cards, list items, and metric counters by `0.08s`.
- **Lighting & Glows**: Add subtle ambient radial glows behind active focal elements:
  `background: radial-gradient(circle at center, rgba(56, 189, 248, 0.15) 0%, transparent 70%);`
