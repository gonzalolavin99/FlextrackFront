// src/views/apps/logistics/fleet/HospitalMap.tsx
'use client'

// React Imports
import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'

// MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// Type Imports
import type { viewStateType } from './index'

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
  zIndex: active ? 2 : 1,
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

const HospitalMap = (props: Props) => {
  // Vars
  const { patientIndex, viewState, patientData } = props
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // Función para transformar coordenadas del sistema local al sistema de pixeles del mapa
  const transformCoordinates = (x: number, y: number) => {
    // Estos valores deberán ser ajustados según el tamaño real de tu plano
    const mapWidth = 11.4 // ancho del plano en unidades originales (como se ve en la imagen)
    const mapHeight = 7.5 // alto del plano en unidades originales

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

      {/* Marcadores de pacientes */}
      {patientData.features.map((patient, index) => {
        const { pixelX, pixelY } = transformCoordinates(patient.geometry.x, patient.geometry.y)

        return (
          <PatientMarker
            key={index}
            active={index === patientIndex}
            sx={{
              left: `${pixelX}px`,
              top: `${pixelY}px`
            }}
          >
            {index === patientIndex && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  backgroundColor: 'background.paper',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  boxShadow: 2,
                  zIndex: 3,
                  whiteSpace: 'nowrap'
                }}
              >
                {patient.rut || `Paciente ${index + 1}`}
              </Box>
            )}
          </PatientMarker>
        )
      })}
    </MapContainer>
  )
}

export default HospitalMap
