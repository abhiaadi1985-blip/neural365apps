import os
import re

SCRIPT_FILE = os.path.join(os.getcwd(), 'docs', 'scripts', 'keynote_5min_builder_script.md')
TEMPLATE_FILE = r'C:\Users\USER\.gemini\config\skills\teleprompter\resources\teleprompter_template.html'
OUT_FILE = os.path.join(os.getcwd(), 'public', 'teleprompter-5min.html')

with open(SCRIPT_FILE, 'r', encoding='utf-8') as f:
    raw_md = f.read()

with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
    template = f.read()

# Split by horizontal rule '---'
sections = re.split(r'\n---\n', raw_md)

act_cards = []
for sec in sections:
    sec = sec.strip()
    if not sec or sec.startswith('# neural365'):
        continue
    
    lines = sec.splitlines()
    tag = ""
    cue = ""
    speech_lines = []
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        if stripped.startswith('## '):
            tag = stripped.replace('## ', '').strip()
        elif stripped.startswith('👉 **ON SCREEN:**') or stripped.startswith('👉 ON SCREEN:'):
            cue = re.sub(r'^👉\s*(\*\*ON SCREEN:\*\*|ON SCREEN:)\s*', '', stripped).strip()
        else:
            formatted = stripped
            formatted = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', formatted)
            formatted = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', formatted)
            speech_lines.append(formatted)

    cue_html = ""
    if cue:
        cue_html = f'''      <div class="action-cue">
        👉 <strong>ON SCREEN:</strong> {cue}
      </div>\n'''

    speech_html = "<br><br>\n        ".join(speech_lines)
    card_html = f'''    <div class="act-card">
      <span class="act-tag">{tag}</span>
{cue_html}      <p class="script-text">
        {speech_html}
      </p>
    </div>'''
    act_cards.append(card_html)

all_acts_html = "\n\n".join(act_cards)

# Header link to switch back to 1:45 prompter if needed
header_addon = '''      <!-- Prompter Switcher -->
      <div style="display: flex; gap: 8px; align-items: center; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);">
        <a href="teleprompter.html" style="color: #8E9BAE; font-size: 11px; text-decoration: none; font-weight: 600;">1:45 Quick Version</a>
        <span style="color: rgba(255,255,255,0.2);">|</span>
        <span style="color: #34D8B0; font-size: 11px; font-weight: 700;">5:00 Builder Deep-Dive</span>
      </div>'''

rendered = template.replace('{{PROJECT_NAME}}', 'neural365 COMMUNITY (5-Min Keynote)')
rendered = rendered.replace('{{TARGET_DURATION_SECONDS}}', '300')
rendered = rendered.replace('{{FORMATTED_DURATION}}', '05:00')
rendered = rendered.replace('{{SCRIPT_CONTENT}}', all_acts_html)

# Insert the switcher link next to the badge in header
rendered = rendered.replace('<div class="badge">PROMPTER</div>', f'<div class="badge">5-MIN BUILDER</div>\n{header_addon}')

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write(rendered)

print(f"Successfully compiled 5-minute teleprompter to: {OUT_FILE}")
print(f"Total Acts: {len(act_cards)}")
