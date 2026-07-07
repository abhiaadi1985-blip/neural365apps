// Phase 1 complete ✓ — now Phase 2 components

// HeroMesh — 3-blob animated gradient background
// Exactly matches reference HTML .mesh implementation
export default function HeroMesh({
  intensity = 'full',
}: {
  intensity?: 'full' | 'reduced'
}) {
  const opacity = intensity === 'full' ? 0.55 : 0.25

  return (
    <div
      className="mesh"
      aria-hidden="true"
      style={{ opacity }}
    >
      <span />
      <span />
      <span />
    </div>
  )
}
