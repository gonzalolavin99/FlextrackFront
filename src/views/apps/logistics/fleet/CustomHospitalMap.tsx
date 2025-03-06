// src/views/apps/logistics/fleet/CustomHospitalMap.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import usePatientStore from '../../../../store/usePatientStore'
import { ANTENNA_POSITIONS } from '../../../../services/LocationServiceFront'
import { HOSPITAL_ZONES } from '../../../../types/areas'
import { normalizeZoneId, getZoneName } from '../../../../utils/zoneUtils'
import type { viewStateType } from './index'

interface CustomHospitalMapProps {
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

const CustomHospitalMap: React.FC<CustomHospitalMapProps> = ({ patientIndex, viewState, patientData }) => {
  const { patients, selectedPatient, selectPatient, simulatedTime } = usePatientStore()
  const [isClient, setIsClient] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Definir los límites del mapa en coordenadas reales
  const MAP_BOUNDS = {
    minX: 1.5,
    maxX: 14.35,
    minY: 0,
    maxY: 10.2
  }

  // Calcular el ancho y alto del viewBox
  const viewBoxWidth = MAP_BOUNDS.maxX - MAP_BOUNDS.minX
  const viewBoxHeight = MAP_BOUNDS.maxY - MAP_BOUNDS.minY

  // Generar el viewBox basado en viewState
  const calculateViewBox = () => {
    if (viewState && viewState.zoom > 1) {
      const zoomedWidth = viewBoxWidth / viewState.zoom
      const zoomedHeight = viewBoxHeight / viewState.zoom

      // Centrar en las coordenadas especificadas
      const centerX = viewState.x
      const centerY = viewState.y

      // Calcular las nuevas coordenadas del viewBox
      const newMinX = Math.max(MAP_BOUNDS.minX, centerX - zoomedWidth / 2)
      const newMinY = Math.max(MAP_BOUNDS.minY, centerY - zoomedHeight / 2)

      return `${newMinX} ${newMinY} ${zoomedWidth} ${zoomedHeight}`
    }

    // ViewBox predeterminado (sin zoom)
    return `${MAP_BOUNDS.minX} ${MAP_BOUNDS.minY} ${viewBoxWidth} ${viewBoxHeight}`
  }

  // Formatear fechas y horas
  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      return d.toLocaleString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      return '-'
    }
  }

  // Manejar clic en paciente
  const handlePatientClick = (rut: string) => {
    selectPatient(rut === selectedPatient?.rut ? null : rut)
  }

  // Efecto para seleccionar paciente basado en patientIndex
  useEffect(() => {
    if (patientIndex !== false && patientData.features[patientIndex]?.rut) {
      selectPatient(patientData.features[patientIndex].rut || null)
    }
  }, [patientIndex, patientData, selectPatient])

  // Funciones para colores
  const getZoneColor = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId)
    switch (normalizedId) {
      case 'preAnestesia':
        return 'rgba(255, 250, 160, 0.3)'
      case 'pabellon':
        return 'rgba(255, 200, 200, 0.3)'
      case 'recuperacion':
        return 'rgba(200, 255, 200, 0.3)'
      default:
        return 'rgba(200, 200, 200, 0.3)'
    }
  }

  const getZoneBorder = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId)
    switch (normalizedId) {
      case 'preAnestesia':
        return 'rgba(255, 200, 0, 0.8)'
      case 'pabellon':
        return 'rgba(255, 50, 50, 0.8)'
      case 'recuperacion':
        return 'rgba(50, 200, 50, 0.8)'
      default:
        return 'rgba(100, 100, 100, 0.8)'
    }
  }

  // Renderizar las zonas del hospital
  const renderZones = () => {
    return HOSPITAL_ZONES.map(zone =>
      zone.points.map((polygon, polyIndex) => {
        // Convertir puntos a formato SVG
        const pointsString = polygon.map(point => `${point.x},${point.y}`).join(' ')

        // Calcular centro para la etiqueta (promedio de todos los puntos)
        const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length
        const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length

        return (
          <g key={`${zone.id}-${polyIndex}`}>
            <polygon
              points={pointsString}
              fill={getZoneColor(zone.id)}
              stroke={getZoneBorder(zone.id)}
              strokeWidth='0.05'
            />

            {/* Etiqueta solo en el primer polígono de cada zona */}
            {polyIndex === 0 && (
              <text
                x={centerX}
                y={centerY}
                textAnchor='middle'
                dominantBaseline='middle'
                fill='#000'
                style={{ fontSize: '0.2px', fontWeight: 'bold' }}
              >
                {zone.name}
              </text>
            )}
          </g>
        )
      })
    )
  }

  // Usar un spinner de carga mientras el componente se inicializa
  if (!isClient) {
    return (
      <div className='absolute inset-0 flex items-center justify-center bg-white'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='absolute inset-0 bg-white'>
      <svg ref={svgRef} viewBox={calculateViewBox()} preserveAspectRatio='xMidYMid meet' className='w-full h-full'>
        {/* Imagen de fondo */}
        <image
          href='/images/apps/logistics/plano-hospital.png'
          x={MAP_BOUNDS.minX}
          y={MAP_BOUNDS.minY}
          width={viewBoxWidth}
          height={viewBoxHeight}
          preserveAspectRatio='xMidYMid meet'
        />

        {/* Zonas del hospital */}
        {renderZones()}

        {/* Antenas */}
        {Object.entries(ANTENNA_POSITIONS).map(([id, pos]) => (
          <g key={`antenna-${id}`}>
            <circle cx={pos.x} cy={pos.y} r='0.15' fill='red' stroke='white' strokeWidth='0.03' />
            <circle cx={pos.x} cy={pos.y} r='0.07' fill='white' />
          </g>
        ))}

        {/* Pacientes */}
        {patients.map(patient => {
          if (!patient.x || !patient.y) return null

          const isSelected = selectedPatient?.rut === patient.rut
          const normalizedZone = normalizeZoneId(patient.ubicacion_actual)

          // Obtener color según la zona
          let fillColor
          switch (normalizedZone) {
            case 'preAnestesia':
              fillColor = '#FFD700'
              break
            case 'pabellon':
              fillColor = '#FF6B6B'
              break
            case 'recuperacion':
              fillColor = '#4CAF50'
              break
            default:
              fillColor = '#808080'
          }

          return (
            <g key={patient.rut} onClick={() => handlePatientClick(patient.rut)} style={{ cursor: 'pointer' }}>
              <circle
                cx={patient.x}
                cy={patient.y}
                r='0.15'
                fill={fillColor}
                stroke='white'
                strokeWidth='0.03'
                opacity={isSelected ? 1 : 0.7}
              />
              <circle cx={patient.x} cy={patient.y} r='0.07' fill='white' />

              {/* Información del paciente si está seleccionado */}
              {isSelected && (
                <g>
                  <rect
                    x={patient.x - 1}
                    y={patient.y + 0.3}
                    width='2'
                    height='0.5'
                    rx='0.1'
                    fill='white'
                    stroke='#888'
                    strokeWidth='0.02'
                  />
                  <text
                    x={patient.x}
                    y={patient.y + 0.5}
                    textAnchor='middle'
                    fill='#333'
                    style={{ fontSize: '0.25px' }}
                  >
                    {`${patient.rut} - ${getZoneName(normalizedZone)}`}
                  </text>
                  <text x={patient.x} y={patient.y + 0.7} textAnchor='middle' fill='#666' style={{ fontSize: '0.2px' }}>
                    {`Actualizado: ${formatDateTime(patient.ultima_actualizacion)}`}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Leyenda */}
       
      </svg>
    </div>
  )
}

export default CustomHospitalMap
