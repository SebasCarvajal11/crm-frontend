interface CimaLogoProps {
  className?: string
  size?: number
  showText?: boolean
  textColor?: string
  subtitle?: boolean
}

export function CimaEmblem({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CIMA Isotipo"
    >
      {/* Sombra / Arco Rojo Granate CIMA */}
      <path
        d="M 60 12 C 33.5 12 12 33.5 12 60 C 12 86.5 33.5 108 60 108 C 76.5 108 91 99.6 99.5 86.8 C 96 87.8 92.5 88.3 88.8 88.3 C 68.2 88.3 51.5 71.6 51.5 51 C 51.5 36.8 59.4 24.5 71 18.2 C 67.5 14.3 63.9 12 60 12 Z"
        fill="#86070C"
      />
      {/* Corte C curvado frontal CIMA */}
      <path
        d="M 85 24 C 71.2 24 60 35.2 60 49 C 60 62.8 71.2 74 85 74 C 94.5 74 102.8 68.7 107 60.8 L 94 60.8 C 91.8 63.8 88.6 65.5 85 65.5 C 75.9 65.5 68.5 58.1 68.5 49 C 68.5 39.9 75.9 32.5 85 32.5 C 88.6 32.5 91.8 34.2 94 37.2 L 107 37.2 C 102.8 29.3 94.5 24 85 24 Z"
        fill="#FEFEFE"
      />
      {/* Detalle geométrico de acento */}
      <polygon points="98,82 108,98 88,98" fill="#86070C" />
    </svg>
  )
}

export function CimaLogo({
  className = '',
  size = 32,
  showText = true,
  textColor = 'text-current',
  subtitle = false,
}: CimaLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex shrink-0 items-center justify-center rounded-lg bg-[#86070C]/10 p-1">
        <CimaEmblem size={size} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-wider uppercase text-lg leading-tight ${textColor}`}>
            CIMA<span className="text-[#86070C] font-black">XIS</span>
          </span>
          {subtitle && (
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">
              Centro de Innovación
            </span>
          )}
        </div>
      )}
    </div>
  )
}
