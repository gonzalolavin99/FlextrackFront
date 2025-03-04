// src/views/apps/logistics/fleet/HospitalMap.tsx
'use client'

// React Imports
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

// MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Type Imports
import type { viewStateType } from './index'
import { HOSPITAL_ZONES, Point } from '@/types/areas'
import { ANTENNA_POSITIONS } from '@/services/LocationServiceFront'

const MapContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper
}))

const PatientMarker = styled(Box)<{ active?: boolean }>(({ theme, active }) => ({
  position: 'absolute',
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.secondary.main,
  transform: 'translate(-50%, -50%)',
  boxShadow: active ? `0 0 10px ${theme.palette.primary.main}` : 'none',
  zIndex: active ? 5 : 4,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.common.white
  }
}))

const AntennaMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: theme.palette.error.main,
  transform: 'translate(-50%, -50%)',
  zIndex: 3,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: `0 0 5px ${theme.palette.error.main}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: theme.palette.common.white
  }
}))

// Componente para dibujar un polígono de zona
const ZonePolygon = styled(Box)<{ zoneColor: string }>(({ theme, zoneColor }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 2,
  pointerEvents: 'none'
}))

type Props = {
  patientIndex: number | false
  viewState: viewStateType
  patientData: {
    type: string
    features: {
      type: string
      rut?: string
      nombre?: string
      geometry: {
        type: string
        x: number
        y: number
      }
      zona?: string
    }[]
  }
}

// Función para obtener color según la zona
const getZoneColor = (zoneId: string): string => {
  switch (zoneId) {
    case 'preAnestesia':
      return 'rgba(255, 250, 160, 0.3)' // Amarillo para preanestesia
    case 'pabellon':
      return 'rgba(255, 200, 200, 0.3)' // Rojo para pabellón
    case 'recuperacion':
      return 'rgba(200, 255, 200, 0.3)' // Verde para recuperación
    default:
      return 'rgba(200, 200, 200, 0.3)' // Gris para desconocido
  }
}

// Función para obtener borde según la zona
const getZoneBorder = (zoneId: string): string => {
  switch (zoneId) {
    case 'preAnestesia':
      return 'rgba(255, 200, 0, 0.8)' // Amarillo para preanestesia
    case 'pabellon':
      return 'rgba(255, 50, 50, 0.8)' // Rojo para pabellón
    case 'recuperacion':
      return 'rgba(50, 200, 50, 0.8)' // Verde para recuperación
    default:
      return 'rgba(100, 100, 100, 0.8)' // Gris para desconocido
  }
}

const HospitalMap = (props: Props) => {
  // Vars
  const { patientIndex, viewState, patientData } = props
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Función para transformar coordenadas del sistema local al sistema de píxeles del mapa
  const transformCoordinates = (x: number, y: number) => {
    // Estos valores deberán ser ajustados según el tamaño real de tu plano
    const mapWidth = 10.3 // ancho del plano en unidades originales
    const mapHeight = 7.2 // alto del plano en unidades originales

    // Transforma las coordenadas al sistema de pixeles del contenedor
    const pixelX = (x / mapWidth) * mapDimensions.width
    const pixelY = ((mapHeight - y) / mapHeight) * mapDimensions.height

    return { pixelX, pixelY }
  }

  // Actualiza las dimensiones del contenedor cuando cambia el tamaño
  useEffect(() => {
    const updateDimensions = () => {
      if (mapContainerRef.current) {
        setMapDimensions({
          width: mapContainerRef.current.offsetWidth,
          height: mapContainerRef.current.offsetHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Renderizar polígonos SVG para cada zona
  const renderZonePolygons = () => {
    if (mapDimensions.width === 0 || mapDimensions.height === 0) return null

    return (
      <svg
        ref={svgRef}
        width='100%'
        height='100%'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {HOSPITAL_ZONES.map(zone =>
          zone.points.map((polygon, polyIndex) => {
            const points = polygon
              .map(point => {
                const { pixelX, pixelY } = transformCoordinates(point.x, point.y)
                return `${pixelX},${pixelY}`
              })
              .join(' ')

            return (
              <polygon
                key={`${zone.id}-${polyIndex}`}
                points={points}
                fill={getZoneColor(zone.id)}
                stroke={getZoneBorder(zone.id)}
                strokeWidth='2'
              />
            )
          })
        )}
      </svg>
    )
  }

  // Renderizar etiquetas de zonas
  const renderZoneLabels = () => {
    return HOSPITAL_ZONES.map(zone => {
      // Calcular el centro aproximado de la zona
      const firstPolygon = zone.points[0]
      if (!firstPolygon || firstPolygon.length === 0) return null

      // Calcular posición central
      const sumX = firstPolygon.reduce((sum, p) => sum + p.x, 0)
      const sumY = firstPolygon.reduce((sum, p) => sum + p.y, 0)
      const centerX = sumX / firstPolygon.length
      const centerY = sumY / firstPolygon.length

      const { pixelX, pixelY } = transformCoordinates(centerX, centerY)

      return (
        <Typography
          key={`label-${zone.id}`}
          variant='body2'
          sx={{
            position: 'absolute',
            top: `${pixelY}px`,
            left: `${pixelX}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {zone.name}
        </Typography>
      )
    })
  }

  return (
    <MapContainer ref={mapContainerRef}>
      {/* Plano del hospital como imagen de fondo */}
      <Image
        src='/images/apps/logistics/plano-hospital.png'
        alt='Plano del Hospital'
        fill
        style={{ objectFit: 'contain' }}
        priority
      />

      {/* Zonas coloreadas como polígonos SVG */}
      {renderZonePolygons()}

      {/* Etiquetas de zonas */}
      {renderZoneLabels()}

      {/* Marcadores de antenas */}
      {Object.entries(ANTENNA_POSITIONS).map(([id, pos]) => {
        const { pixelX, pixelY } = transformCoordinates(pos.x, pos.y)

        return (
          <Tooltip key={`antenna-${id}`} title={`Antena ${id}`} placement='top'>
            <AntennaMarker
              sx={{
                left: `${pixelX}px`,
                top: `${pixelY}px`
              }}
            />
          </Tooltip>
        )
      })}

      {/* Marcadores de pacientes */}
      {patientData.features.map((patient, index) => {
        const { pixelX, pixelY } = transformCoordinates(patient.geometry.x, patient.geometry.y)

        return (
          <Tooltip
            key={`patient-${index}`}
            title={patient.rut || `Paciente ${index + 1}`}
            placement='top'
            open={index === patientIndex}
          >
            <PatientMarker
              active={index === patientIndex}
              sx={{
                left: `${pixelX}px`,
                top: `${pixelY}px`
              }}
            />
          </Tooltip>
        )
      })}
    </MapContainer>
  )
}

export default HospitalMap
