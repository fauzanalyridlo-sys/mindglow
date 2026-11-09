type LogoProps = {
  light?: boolean
  priority?: boolean
}

export default function Logo({
  light = false,
  priority = false,
}: LogoProps) {
  return (
    <a
      className={`logo ${light ? 'logo--light' : ''}`}
      href="#top"
      aria-label="MindGlow"
    >
      <img
        src="/images/Group-20.png"
        alt="MindGlow"
        className="logo-image"
        width={150}
        height={80}
        fetchPriority={priority ? "high" : "auto"}
      />
    </a>
  )
}
