// React Imports
import type { ComponentProps } from 'react'
import Image from 'next/image'

// Definimos un tipo que incluya las propiedades que queremos permitir
type LogoProps = {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

const Logo = (props: LogoProps) => {
  // Extraer width y height de props con valores predeterminados
  const { width = '150em', height = '140em', className, style, ...restProps } = props

  // Convertir dimensiones a números para el componente Image
  const widthNum = typeof width === 'number' ? width : parseInt(width) || 40
  const heightNum = typeof height === 'number' ? height : parseInt(height) || 32

  return (
    <Image
      src='/images/LogoSwitch-removebg-preview.png'
      alt='Switch Logo'
      width={widthNum}
      height={heightNum}
      className={className}
      style={{ objectFit: 'contain', ...style }}
      {...restProps}
    />
  )
}

export default Logo
