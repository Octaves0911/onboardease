interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  className?: string
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = { sm: 32, md: 44, lg: 56 }
  const iconSize = sizes[size]

  const icon = (
    <svg width={iconSize} height={iconSize} viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D2B48C" />
          <stop offset="50%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#6B3410" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="22" r="13" fill="url(#lg1)" opacity="0.85" />
      <circle cx="40" cy="22" r="13" fill="url(#lg1)" opacity="0.85" />
      <circle cx="30" cy="40" r="13" fill="url(#lg1)" opacity="0.95" />
      <path d="M 24 30 L 36 30" stroke="white" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
      <path d="M 20 38 L 40 38" stroke="white" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
    </svg>
  )

  if (variant === 'icon') return <span className={className}>{icon}</span>

  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }

  return (
    <span className={`flex items-center gap-2 ${className}`}>
      {icon}
      <span className={`font-bold text-brown-900 ${textSizes[size]}`}>
        Onboard<span className="text-brown-500">Ease</span>
      </span>
    </span>
  )
}
