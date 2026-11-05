import os
import sys
import re
import argparse

def parse_script_to_html(raw_text):
    """
    Parses a markdown or structured text script into teleprompter HTML act cards.
    Handles sections like:
    ### Act 1: ...
    [ACTION: ...] or 👉 ON SCREEN: ...
    "Spoken text..."
    """
    lines = raw_text.splitlines()
    acts = []
    current_act = {"tag": "", "cue": "", "text_lines": []}
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Ignore document metadata lines (e.g. Target Duration, Word Count, Tone)
        if re.search(r'^(\*\*|\*|#\s+neural)(Target|Tone|Word Count|Duration|neural365)', stripped, re.IGNORECASE):
            continue
        if stripped == '---':
            continue

        # Check for Act Header (e.g. ## 0:00 - 1:00, ## Act 1, [0:00 - 0:25] Act 1, ### Scene 1)
        if re.search(r'^(#+\s*|\*+|\b)(\[?\d+:\d+|Act\s*\d+|Scene\s*\d+)', stripped, re.IGNORECASE):
            if current_act["text_lines"] or current_act["cue"]:
                acts.append(current_act)
            clean_tag = re.sub(r'^[#*\[\]]+\s*', '', stripped).strip('*[]')
            current_act = {"tag": clean_tag, "cue": "", "text_lines": []}
            continue
        
        # Check for Visual Action Cue
        if re.search(r'(\[ACTION:|👉\s*(ON SCREEN|ACTION):|\(Action:)', stripped, re.IGNORECASE):
            clean_cue = re.sub(r'^[👉\s*\(]*(\[ACTION:|ON SCREEN:|ACTION:|\(Action:)\s*', '', stripped, flags=re.IGNORECASE).rstrip('])')
            current_act["cue"] = clean_cue
            continue
        
        # Regular spoken text
        clean_line = stripped.strip('"\'')
        # Format emphasis
        clean_line = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', clean_line)
        clean_line = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', clean_line)
        current_act["text_lines"].append(clean_line)

    if current_act["text_lines"] or current_act["cue"]:
        acts.append(current_act)

    # Render HTML
    html_cards = []
    for idx, act in enumerate(acts, 1):
        tag = act["tag"] if act["tag"] else f"ACT {idx}"
        cue_html = ""
        if act["cue"]:
            cue_html = f'''      <div class="action-cue">
        👉 <strong>ON SCREEN:</strong> {act["cue"]}
      </div>\n'''
        
        paragraphs = "<br><br>\n        ".join(act["text_lines"])
        card_html = f'''    <div class="act-card">
      <span class="act-tag">{tag}</span>
{cue_html}      <p class="script-text">
        {paragraphs}
      </p>
    </div>'''
        html_cards.append(card_html)
        
    return "\n\n".join(html_cards)


def generate_teleprompter(input_path, output_path, project_name="Keynote Walkthrough", duration_seconds=105):
    # Locate template
    script_dir = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(script_dir, "..", "resources", "teleprompter_template.html")
    
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at: {template_path}")
        
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()

    # Read input script if provided, else use default demo
    if input_path and os.path.exists(input_path):
        with open(input_path, 'r', encoding='utf-8') as f:
            raw_script = f.read()
    else:
        raw_script = """
## 0:00 - 0:25 ● ACT 1: WELCOME & MISSION
👉 ON SCREEN: Look into the webcam, smile warmly, and begin with natural energy.
Welcome everyone! Today I want to walk you through our new platform and demonstrate how we solve complex workflow automation with simple, verified tools.

## 0:25 - 0:55 ● ACT 2: CORE ARCHITECTURE
👉 ON SCREEN: Scroll smoothly to the main architecture diagram and highlight key components.
Behind the scenes, every piece of data is verified through our automated pipelines. We don't just generate solutions — we test and validate them in live sandbox environments.

## 0:55 - 1:25 ● ACT 3: PRACTICAL DEMONSTRATION
👉 ON SCREEN: Click into a live scenario card and showcase the hands-on features.
Here you can see the real-time telemetry updating live. Whether you are consuming this via video, audio, or our weekly guides, it is built to give you maximum clarity with zero fluff.

## 1:25 - 1:45 ● ACT 4: COMMUNITY & FEEDBACK
👉 ON SCREEN: Scroll down to the community join section. Look directly into camera lens.
This is an initial effort where your feedback truly shapes what we build next. Join the community, let us know what you think, and let's build the future together!
"""

    script_html = parse_script_to_html(raw_script)
    
    mins = str(duration_seconds // 60).zfill(2)
    secs = str(duration_seconds % 60).zfill(2)
    formatted_duration = f"{mins}:{secs}"

    rendered = template.replace("{{PROJECT_NAME}}", project_name)
    rendered = rendered.replace("{{TARGET_DURATION_SECONDS}}", str(duration_seconds))
    rendered = rendered.replace("{{FORMATTED_DURATION}}", formatted_duration)
    rendered = rendered.replace("{{SCRIPT_CONTENT}}", script_html)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(rendered)

    print(f"Successfully generated calibrated teleprompter: {output_path}")
    print(f"Project: {project_name} | Duration: {duration_seconds}s ({formatted_duration})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a calibrated web teleprompter from a script.")
    parser.add_argument("--input", "-i", default="", help="Path to script markdown or text file")
    parser.add_argument("--output", "-o", default="public/teleprompter.html", help="Path to output HTML file")
    parser.add_argument("--title", "-t", default="Executive Walkthrough", help="Project name / title")
    parser.add_argument("--duration", "-d", type=int, default=105, help="Target duration in seconds (default: 105)")

    args = parser.parse_args()
    generate_teleprompter(args.input, args.output, args.title, args.duration)
