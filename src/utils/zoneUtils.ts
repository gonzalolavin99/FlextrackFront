// src/utils/zoneUtils.ts
/**
 * Normaliza el ID de una zona para asegurar consistencia
 * independientemente de mayúsculas, minúsculas o variantes de escritura
 */
export const normalizeZoneId = (zoneId: string): string => {
  if (!zoneId) return 'unknown'

  // Convertir a minúsculas para normalizar
  const lowercaseId = zoneId.toLowerCase()

  // Manejar todas las posibles variantes
  if (lowercaseId.includes('pre') || lowercaseId.includes('anest')) {
    return 'preanestesia'
  } else if (lowercaseId.includes('pabell') || lowercaseId.includes('quirof')) {
    return 'pabellon'
  } else if (lowercaseId.includes('recup') || lowercaseId.includes('recu')) {
    return 'recuperacion'
  }

  return 'unknown'
}

/**
 * Obtiene el nombre legible de una zona basado en su ID normalizado
 */
export const getZoneName = (zoneId: string): string => {
  const normalizedId = normalizeZoneId(zoneId)

  switch (normalizedId) {
    case 'preanestesia':
      return 'Pre-anestesia'
    case 'pabellon':
      return 'Pabellón'
    case 'recuperacion':
      return 'Recuperación'
    default:
      return 'Desconocida'
  }
}

/**
 * Obtiene el color para una zona basado en su ID normalizado
 */
export const getZoneColor = (zoneId: string): string => {
  const normalizedId = normalizeZoneId(zoneId)

  switch (normalizedId) {
    case 'preanestesia':
      return '#FFD700' // Amarillo
    case 'pabellon':
      return '#FF6B6B' // Rojo
    case 'recuperacion':
      return '#4CAF50' // Verde
    default:
      return '#808080' // Gris
  }
}
