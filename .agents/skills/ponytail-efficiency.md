# Ponytail Efficiency & Reusability Rules

## Core Principles
1. **Reuse Over Re-authoring**: Before creating new files, check if an existing template in `scenes/` (e.g. `template-showcase.html`) can be parameterized via JSON props (`scenes/scene-data.json`).
2. **Zero Boilerplate**: Never write bloated wrapper libraries or redundant abstractions. Write single-file, self-contained HTML/CSS/GSAP scenes for HyperFrames that render deterministically.
3. **Data-Driven Dynamic Props**: Keep animation logic decoupled from content text, icons, and metrics so new scenes can be rendered simply by editing or injecting JSON objects.
4. **Token & Quota Preservation**: Keep scenes lean, minimal, and fast to parse by coding agents, preventing context bloat and conserving AI quota on future runs.
