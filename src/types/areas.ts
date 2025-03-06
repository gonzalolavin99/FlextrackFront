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
        { x: 12, y: 3.3 },
        { x: 12, y: 1.48 },
        { x: 6, y: 1.48 },
        { x: 6, y: 3.3 } // Cerrar el polígono
      ]
    ]
  },
  {
    id: 'pabellon',
    name: 'Pabellón',
    points: [
      [
        { x: 3.5, y: 4.2 },
        { x: 3.5, y: 8.08 },
        { x: 6.8, y: 8.08 },
        { x: 6.8, y: 4.2 } // Cerrar el polígono
      ],
      // Mini cuadrado adicional [
      [
        { x: 3.5, y: 4.2 },
        { x: 3.5, y: 1.48 },
        { x: 5.95, y: 1.48 },
        { x: 5.95, y: 4.2 }
      ]
    ]
  },
  {
    id: 'recuperacion',
    name: 'Recuperación',
    points: [
      // Polígono principal
      [
        { x: 6.9, y: 4.2 },
        { x: 6.9, y: 8.08 },
        { x: 9.0, y: 8.08 },
        { x: 9.0, y: 4.2 },
      ],
      // Mini cuadrado adicional
      [
        { x: 11.06, y: 5.85 },
        { x: 11.06, y: 8.08 },
        { x: 9.0, y: 8.08 },
        { x: 9.0, y: 5.85 }
      ]
    ]
  }
]
