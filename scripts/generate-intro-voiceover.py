import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"  # Professional, confident tech voice
RATE = "-2%"  # Slightly measured pace for clarity

SCENES = [
    {
        "id": "scene1",
        "text": "Microsoft AI is moving at lightning speed. Copilot Studio, autonomous agents, and release waves arrive faster than anyone can keep up. But who has time to read 200-page release notes? Welcome to neural365 COMMUNITY — the independent research hub built for architects, engineers, and enterprise leaders."
    },
    {
        "id": "scene2",
        "text": "We organize the ecosystem into four focused pillars. First, Dynamics 365 Finance & Operations — tracking variance narratives and autonomous reconciliation. Second, Dataverse and Power Platform — unlocking generative answers and virtual table architectures. Third, Copilot & AI Agents — multi-agent orchestration and cross-app handoffs. And fourth, Industry Solutions — pre-built vertical AI templates across various industries."
    },
    {
        "id": "scene3",
        "text": "We deliver insights the way modern practitioners actually learn. The Pulse: an automated weekly radar showing what's new, what's coming, and what's shifting underneath. Deep-dive architectural guides with real sandbox scenarios. Neural Shorts for 60-second hands-on configs. And micro-podcasts for strategic breakdowns on your morning commute."
    },
    {
        "id": "scene4",
        "text": "neural365 is community-driven and independent. Our automated Hermes pipeline tracks official Microsoft Learn and roadmap changes, verified and curated by experienced practitioners who write code and configure systems daily."
    },
    {
        "id": "scene5",
        "text": "Skip the dry docs. Subscribe to your favorite pillars, explore the weekly updates on The Pulse, and help shape the next generation of enterprise AI. Join us at neural365 COMMUNITY."
    }
]

async def generate():
    out_dir = os.path.join("public", "media", "voiceover")
    os.makedirs(out_dir, exist_ok=True)
    
    print(f"Generating voiceover using {VOICE}...")
    full_text = " ... ".join([s["text"] for s in SCENES])
    full_path = os.path.join(out_dir, "intro_full.mp3")
    communicate = edge_tts.Communicate(full_text, VOICE, rate=RATE)
    await communicate.save(full_path)
    print(f"Saved full voiceover to {full_path}")

    for s in SCENES:
        p = os.path.join(out_dir, f"{s['id']}.mp3")
        c = edge_tts.Communicate(s["text"], VOICE, rate=RATE)
        await c.save(p)
        print(f"Saved {s['id']} to {p}")

if __name__ == "__main__":
    asyncio.run(generate())
