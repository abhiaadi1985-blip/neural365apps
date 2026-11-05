import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TIMELINE_FILE = ROOT / "assets" / "audio" / "ns03" / "timeline.json"
WORDS_FILE = ROOT / "assets" / "audio" / "ns03" / "words.json"
INDEX_HTML = ROOT / "scenes" / "ns03" / "index.html"

def make_caption_cues(words):
    cues = []
    chunk = []
    chunk_start = 0.0
    
    for i, w in enumerate(words):
        if not chunk:
            chunk_start = w["start"]
        chunk.append(w["word"])
        
        # Split on punctuation or 3-4 words max
        is_punct = w["word"].endswith(('.', ',', ':', '?', '!'))
        if len(chunk) >= 4 or is_punct or i == len(words) - 1:
            chunk_text = " ".join(chunk)
            cues.append({
                "start": chunk_start,
                "end": w["end"],
                "text": chunk_text
            })
            chunk = []
            
    return cues

def main():
    timeline = json.load(open(TIMELINE_FILE, encoding="utf-8"))
    words = json.load(open(WORDS_FILE, encoding="utf-8"))
    cues = make_caption_cues(words)
    
    beats = {b["beat_id"]: b for b in timeline["beats"]}
    
    cues_json = json.dumps(cues, indent=2)

    js_template = """
    // HyperFrames Standard Contract Timeline
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    window.__timelines["ns03"] = tl;

    // Subtitle Pill Cues
    const captionEl = document.getElementById('caption-pill');
    const CUES = __CUES_PLACEHOLDER__;

    CUES.forEach(cue => {
      tl.call(() => {
        captionEl.innerText = cue.text;
        gsap.to(captionEl, { autoAlpha: 1, duration: 0.1 });
      }, null, cue.start);

      tl.call(() => {
        gsap.to(captionEl, { autoAlpha: 0, duration: 0.1 });
      }, null, cue.end);
    });

    // =========================================================================
    // BEAT 1: Kinetic Headline & PO Delay (t = __B1_START__s -> __B1_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-1",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B1_START__
    );
    tl.fromTo("#b1-email-card",
      { autoAlpha: 0, scale: 0.92, y: 20 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.2)", immediateRender: false },
      __B1_START_P08__
    );
    tl.to("#stage-beat-1",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B1_END_M02__
    );

    // =========================================================================
    // BEAT 2: Lane Stack Marking & Pegging (t = __B2_START__s -> __B2_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-2",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B2_START__
    );
    tl.fromTo(".lane-item",
      { autoAlpha: 0, x: -30 },
      { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.35, ease: "power2.out", immediateRender: false },
      __B2_START_P04__
    );
    tl.to("#lane-4",
      { borderColor: "#38BDF8", boxShadow: "0 0 35px rgba(56, 189, 248, 0.4)", duration: 0.6 },
      __B2_START_P95__
    );
    tl.to("#stage-beat-2",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B2_END_M02__
    );

    // =========================================================================
    // BEAT 3: Inventory Trajectory Graph & Breach (t = __B3_START__s -> __B3_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-3",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B3_START__
    );
    tl.fromTo("#delayed-curve",
      { strokeDasharray: 1000, strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", immediateRender: false },
      __B3_START_P05__
    );
    tl.fromTo("#b3-breach-callout",
      { autoAlpha: 0, scale: 0.9 },
      { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)", immediateRender: false },
      __B3_START_P50__
    );
    tl.to("#stage-beat-3",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B3_END_M02__
    );

    // =========================================================================
    // BEAT 4: D365 Action Pane & Simulation Form (t = __B4_START__s -> __B4_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-4",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B4_START__
    );
    tl.fromTo("#b4-cursor",
      { autoAlpha: 0, scale: 1.5, x: 80, y: 60 },
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B4_START_P25__
    );
    tl.to("#sim-btn",
      { scale: 0.96, backgroundColor: "#0369A1", duration: 0.15, yoyo: true, repeat: 1 },
      __B4_START_P35__
    );
    tl.to("#stage-beat-4",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B4_END_M02__
    );

    // =========================================================================
    // BEAT 5: VISUAL PAYOFF - Has Impact Verdict & Order Tree (t = __B5_START__s -> __B5_END__s)
    // Visuals lead voice by ~1.0s:
    // Voice lands on 'has impact' at 50.3s -> Verdict card reveals at 49.3s
    // Voice lands on 'production job' at 53.6s -> Production node reveals at 52.6s
    // Voice lands on 'sales order' at 55.3s -> Sales order node reveals at 54.3s
    // =========================================================================
    tl.fromTo("#stage-beat-5",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B5_START__
    );
    tl.fromTo("#b5-verdict",
      { autoAlpha: 0, scale: 0.88 },
      { autoAlpha: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)", immediateRender: false },
      49.30
    );
    tl.fromTo("#tree-node-prd",
      { autoAlpha: 0, y: 15 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
      52.60
    );
    tl.fromTo("#tree-node-so",
      { autoAlpha: 0, y: 15 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
      54.30
    );
    tl.to("#stage-beat-5",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B5_END_M02__
    );

    // =========================================================================
    // BEAT 6: Copilot Studio Capacity Architecture (t = __B6_START__s -> __B6_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-6",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B6_START__
    );
    tl.fromTo("#cost-card-1",
      { autoAlpha: 0, x: -30 },
      { autoAlpha: 1, x: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
      __B6_START_P08__
    );
    tl.fromTo("#cost-card-2",
      { autoAlpha: 0, x: 30 },
      { autoAlpha: 1, x: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
      __B6_START_P25__
    );
    tl.to("#stage-beat-6",
      { autoAlpha: 0, scale: 0.95, y: -20, duration: 0.45, ease: "power2.in" },
      __B6_END_M02__
    );

    // =========================================================================
    // BEAT 7: Large Stacked Recap Pills & Final Logo Card (t = __B7_START__s -> __B7_END__s)
    // =========================================================================
    tl.fromTo("#stage-beat-7",
      { autoAlpha: 0, scale: 0.95, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B7_START__
    );
    tl.fromTo(".recap-chip",
      { autoAlpha: 0, scale: 0.9, y: 20 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.25, ease: "back.out(1.2)", immediateRender: false },
      __B7_START_P04__
    );
    // Clean transition: fade recap before solo logo card enters
    tl.to("#stage-beat-7",
      { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
      __B7_END_M25__
    );
    // Solo Neural365 Logo Card enters alone on final line
    tl.fromTo("#final-logo-stage",
      { autoAlpha: 0, scale: 0.85 },
      { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power3.out", immediateRender: false },
      __B7_END_M20__
    );
"""

    replacements = {
        "__CUES_PLACEHOLDER__": cues_json,
        "__B1_START__": f"{beats['beat_1']['start']:.2f}",
        "__B1_START_P08__": f"{beats['beat_1']['start'] + 0.8:.2f}",
        "__B1_END_M02__": f"{beats['beat_1']['end'] - 0.2:.2f}",
        "__B1_END__": f"{beats['beat_1']['end']:.2f}",

        "__B2_START__": f"{beats['beat_2']['start']:.2f}",
        "__B2_START_P04__": f"{beats['beat_2']['start'] + 0.4:.2f}",
        "__B2_START_P95__": f"{beats['beat_2']['start'] + 9.5:.2f}",
        "__B2_END_M02__": f"{beats['beat_2']['end'] - 0.2:.2f}",
        "__B2_END__": f"{beats['beat_2']['end']:.2f}",

        "__B3_START__": f"{beats['beat_3']['start']:.2f}",
        "__B3_START_P05__": f"{beats['beat_3']['start'] + 0.5:.2f}",
        "__B3_START_P50__": f"{beats['beat_3']['start'] + 5.0:.2f}",
        "__B3_END_M02__": f"{beats['beat_3']['end'] - 0.2:.2f}",
        "__B3_END__": f"{beats['beat_3']['end']:.2f}",

        "__B4_START__": f"{beats['beat_4']['start']:.2f}",
        "__B4_START_P25__": f"{beats['beat_4']['start'] + 2.5:.2f}",
        "__B4_START_P35__": f"{beats['beat_4']['start'] + 3.5:.2f}",
        "__B4_END_M02__": f"{beats['beat_4']['end'] - 0.2:.2f}",
        "__B4_END__": f"{beats['beat_4']['end']:.2f}",

        "__B5_START__": f"{beats['beat_5']['start']:.2f}",
        "__B5_END_M02__": f"{beats['beat_5']['end'] - 0.2:.2f}",
        "__B5_END__": f"{beats['beat_5']['end']:.2f}",

        "__B6_START__": f"{beats['beat_6']['start']:.2f}",
        "__B6_START_P08__": f"{beats['beat_6']['start'] + 0.8:.2f}",
        "__B6_START_P25__": f"{beats['beat_6']['start'] + 2.5:.2f}",
        "__B6_END_M02__": f"{beats['beat_6']['end'] - 0.2:.2f}",
        "__B6_END__": f"{beats['beat_6']['end']:.2f}",

        "__B7_START__": f"{beats['beat_7']['start']:.2f}",
        "__B7_START_P04__": f"{beats['beat_7']['start'] + 0.4:.2f}",
        "__B7_END_M25__": f"{beats['beat_7']['end'] - 2.5:.2f}",
        "__B7_END_M20__": f"{beats['beat_7']['end'] - 2.0:.2f}",
        "__B7_END__": f"{beats['beat_7']['end']:.2f}",
    }

    js_code = js_template
    for k, v in replacements.items():
        js_code = js_code.replace(k, v)

    html = INDEX_HTML.read_text(encoding="utf-8")
    # Replace between <script> and </script> at bottom
    start_tag = "<script>"
    end_tag = "</script>"
    idx1 = html.rfind(start_tag)
    idx2 = html.rfind(end_tag)
    if idx1 != -1 and idx2 != -1 and idx2 > idx1:
        new_html = html[:idx1 + len(start_tag)] + "\n" + js_code + "\n  " + html[idx2:]
        INDEX_HTML.write_text(new_html, encoding="utf-8")
        print(f"[+] Updated {INDEX_HTML} with exact calibrated timeline ({len(cues)} subtitle cues).")
    else:
        print("[!] Could not locate <script> tag in HTML")

if __name__ == "__main__":
    main()
