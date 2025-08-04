import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  logoIncludesText?: boolean
}

export function Logo({ className = "", showText = true, size = "md", logoIncludesText = false }: LogoProps) {
    const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-16 w-16"
  }

  const sizeStyles = {
    sm: { width: '24px', height: '24px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '80px', height: '80px' },
    xl: { width: '160px', height: '160px' }
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl"
  }

  // If logo includes text, don't show additional text
  const shouldShowText = showText && !logoIncludesText

  return (
    <Link href="/" className={`flex items-center space-x-2 bg-transparent ${className}`}>
      <img
        src="/Logotransparent.png"
        alt="Jobsy Logo"
        style={{ 
          ...sizeStyles[size], 
          objectFit: 'contain', 
          maxHeight: '100%', 
          backgroundColor: 'transparent',
          maxWidth: '100%'
        }}
      />
      {shouldShowText && (
        <span className={`font-bold ${textSizes[size]} text-teal-700`}>
          Jobsy
        </span>
      )}
    </Link>
  )
} 