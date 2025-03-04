// src/types/areas.ts
export interface Point {
  x: number
  y: number
}

export interface ZoneDefinition {
  id: string
  name: string
  points: Point[][] // Array de arrays de puntos para múltiples polígonos por zona
}

// Coordenadas ajustadas para coincidir con la imagen del plano
export const HOSPITAL_ZONES: ZoneDefinition[] = [
  {
    id: 'preanestesia',
    name: 'Pre-anestesia',
    points: [
      [
        { x: 8.35, y: 6.2 },
        { x: 8.35, y: 4.88 },
        { x: 3.63, y: 4.88 },
        { x: 3.63, y: 6.2 } // Cerrar el polígono
      ]
    ]
  },
  {
    id: 'pabellon',
    name: 'Pabellón',
    points: [
      [
        { x: 4.25, y: 1.48 },
        { x: 4.25, y: 4.85 },
        { x: 1.56, y: 4.85 },
        { x: 1.56, y: 1.48 } // Cerrar el polígono
      ],
      // Mini cuadrado adicional [
      [
        { x: 1.6, y: 4.85 },
        { x: 1.6, y: 6.2 },
        { x: 3.55, y: 6.2 },
        { x: 3.55, y: 4.85 }
      ]
    ]
  },
  {
    id: 'recuperacion',
    name: 'Recuperación',
    points: [
      // Polígono principal
      [
        { x: 6.0, y: 1.48 },
        { x: 6.0, y: 4.2 },
        { x: 4.29, y: 4.2 },
        { x: 4.29, y: 1.48 },
      ],
      // Mini cuadrado adicional
      [
        { x: 7.65, y: 1.48 },
        { x: 7.65, y: 3.05 },
        { x: 6.0, y: 3.05 },
        { x: 6.0, y: 1.48 }
      ]
    ]
  }
]
