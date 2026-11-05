import os
import sys
import subprocess
from pathlib import Path

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

TIMESTAMPS_TO_PROBE = [
    ("b1_hook_settled", 3.0),
    ("b2_lanes_settled", 15.0),
    ("b3_breach_settled", 29.0),
    ("b4_sim_click", 37.5),
    ("b5_verdict_payoff", 50.0), # Payoff frame: Has impact + tree visible
    ("b6_cost_cards", 62.0),
    ("b7_recap_chips", 70.0),
    ("b7_final_logo", 75.0)
]

def generate_probe_html(src_html: Path, seek_t: float, out_html: Path):
    content = src_html.read_text(encoding="utf-8")
    # Inject seek command right before </body>
    injection = f"""
    <script>
      (function() {{
        if (window.__timelines && window.__timelines["ns03"]) {{
          window.__timelines["ns03"].seek({seek_t}).pause();
        }}
      }})();
    </script>
    """
    content = content.replace("</body>", f"{injection}\n</body>")
    out_html.write_text(content, encoding="utf-8")

def probe_frame(html_file: Path, out_png: Path):
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1080,1920",
        "--virtual-time-budget=5000",
        f"--screenshot={str(out_png)}",
        html_file.as_uri()
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"[+] Probed frame -> {out_png}")

def main():
    root = Path(__file__).resolve().parent.parent
    src_html = root / "scenes" / "ns03" / "index.html"
    probe_dir = root / "output" / "probes_ns03"
    probe_dir.mkdir(parents=True, exist_ok=True)
    tmp_html_dir = root / "output" / "probe_htmls"
    tmp_html_dir.mkdir(parents=True, exist_ok=True)

    print("[*] Probing key timestamps for size and visual verification...")
    for label, t in TIMESTAMPS_TO_PROBE:
        tmp_html = tmp_html_dir / f"probe_{label}.html"
        generate_probe_html(src_html, t, tmp_html)
        out_png = probe_dir / f"{label}_{t:.1f}s.png"
        probe_frame(tmp_html, out_png)

    print("\n[+] All probe frames captured successfully in output/probes_ns03/")

if __name__ == "__main__":
    main()
