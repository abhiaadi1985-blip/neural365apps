import Link from 'next/link'

const pillars = [
  { label: 'D365 F&O',                  href: '/d365-fo' },
  { label: 'Dataverse & Power Platform', href: '/dataverse-power-platform' },
  { label: 'Copilot & AI Agents',        href: '/copilot-ai-agents' },
  { label: 'Industry Solutions',         href: '/industry-solutions' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="legal">
          © 2026 neural365.apps. Independent community hub — not an official Microsoft product.
          Pulse feed content is aggregated and summarised from public sources for educational purposes;
          always confirm against official Microsoft documentation before making implementation decisions.
        </div>
        <nav className="pillars-footer" aria-label="Footer navigation">
          {pillars.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
          <Link href="/pulse">Pulse</Link>
          <Link href="/sign-in">Sign In</Link>
        </nav>
      </div>
    </footer>
  )
}
