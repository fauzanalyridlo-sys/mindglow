type LogoProps = {
  light?: boolean
}

export default function Logo({ light = false }: LogoProps) {
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
      />
    </a>
  )
}