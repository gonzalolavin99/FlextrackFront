// src/services/LocationServiceFront.ts
import { HOSPITAL_ZONES, Point } from '../types/areas'

export interface BeaconReading {
  echobeaconId: string
  RSSI_resultado: number
  beaconMacAddress: string
  created_at: string
}

export interface AntennaPosition {
  x: number
  y: number
}

export const ANTENNA_POSITIONS: Record<string, AntennaPosition> = {
  '0001': { x: 5.58, y: 4.95 },
  '0002': { x: 3.60, y: 4.73 },
  '0003': { x: 6.16, y: 3.02 }
}

export class LocationService {
  private static TX_POWER = -51
  private static PROPAGATION_FACTOR = 3.5
  private static BOUNDS = {
    minX: 1.74, // Límites basados en el plano del hospital
    maxX: 9.35,
    minY: 0.75,
    maxY: 6.2
  }

  static calculateDistance(rssi: number): number {
    return Math.pow(10, (rssi - this.TX_POWER) / (-10 * this.PROPAGATION_FACTOR))
  }

  static getLatestReadings(readings: BeaconReading[], macAddress: string): BeaconReading[] {
    // Aquí está la declaración correcta del Map
    const antennaReadings = new Map<string, { totalRSSI: number; count: number }>()
    const fiveSecondsAgo = new Date(Date.now() - 5000)

    readings
      .filter(r => r.beaconMacAddress === macAddress && new Date(r.created_at) > fiveSecondsAgo)
      .forEach(reading => {
        if (!antennaReadings.has(reading.echobeaconId)) {
          antennaReadings.set(reading.echobeaconId, { totalRSSI: 0, count: 0 })
        }
        const data = antennaReadings.get(reading.echobeaconId)!
        data.totalRSSI += reading.RSSI_resultado
        data.count++
      })

    return Array.from(antennaReadings.entries()).map(([echobeaconId, data]) => ({
      echobeaconId,
      RSSI_resultado: data.totalRSSI / data.count,
      beaconMacAddress: macAddress,
      created_at: new Date().toISOString()
    }))
  }

  static determineZone(x: number, y: number): string {
    if (!this.isPointInBounds({ x, y })) {
      return 'unknown'
    }

    for (const zone of HOSPITAL_ZONES) {
      for (const polygon of zone.points) {
        if (this.isPointInPolygon({ x, y }, polygon)) {
          return zone.id
        }
      }
    }
    return 'unknown'
  }

  private static isPointInBounds(point: Point): boolean {
    return (
      point.x >= this.BOUNDS.minX &&
      point.x <= this.BOUNDS.maxX &&
      point.y >= this.BOUNDS.minY &&
      point.y <= this.BOUNDS.maxY
    )
  }

  private static isPointInPolygon(point: Point, polygon: Point[]): boolean {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y
      const xj = polygon[j].x,
        yj = polygon[j].y

      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  }

  static trilaterate(readings: BeaconReading[]): { x: number; y: number } | null {
    if (readings.length < 2) return null

    const circles = readings.map(reading => ({
      center: ANTENNA_POSITIONS[reading.echobeaconId],
      radius: this.calculateDistance(reading.RSSI_resultado)
    }))

    const intersections: Point[] = []
    const weights: number[] = []

    for (let i = 0; i < circles.length - 1; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const intersection = this.findIntersection(
          circles[i].center,
          circles[i].radius,
          circles[j].center,
          circles[j].radius
        )
        if (intersection && this.isPointInBounds(intersection)) {
          // Peso basado en la calidad de la señal
          const weight = 1 / (circles[i].radius * circles[j].radius)
          intersections.push(intersection)
          weights.push(weight)
        }
      }
    }

    if (intersections.length === 0) return null

    // Calcular punto medio ponderado
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    const position = {
      x: intersections.reduce((sum, p, i) => sum + p.x * weights[i], 0) / totalWeight,
      y: intersections.reduce((sum, p, i) => sum + p.y * weights[i], 0) / totalWeight
    }

    return this.constrainToBounds(position)
  }

  private static constrainToBounds(point: Point): Point {
    return {
      x: Math.max(this.BOUNDS.minX, Math.min(this.BOUNDS.maxX, point.x)),
      y: Math.max(this.BOUNDS.minY, Math.min(this.BOUNDS.maxY, point.y))
    }
  }

  private static findIntersection(
    c1: AntennaPosition,
    r1: number,
    c2: AntennaPosition,
    r2: number
  ): { x: number; y: number } | null {
    const dx = c2.x - c1.x
    const dy = c2.y - c1.y
    const d = Math.sqrt(dx * dx + dy * dy)

    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return null

    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d)
    const h = Math.sqrt(r1 * r1 - a * a)

    const x2 = c1.x + (a * dx) / d
    const y2 = c1.y + (a * dy) / d

    return {
      x: x2 + (h * dy) / d,
      y: y2 - (h * dx) / d
    }
  }
}
