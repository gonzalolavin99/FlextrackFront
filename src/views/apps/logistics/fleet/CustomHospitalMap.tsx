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
  setViewState: (state: viewStateType) => void
}

// Definir los centros de zonas para posicionar pacientes
// Ajustados según la visualización actual del mapa
const ZONE_CENTERS = {
  preanestesia: { x: 9, y: 2 }, // Centro de Pre-anestesia (zona amarilla)
  pabellon: { x: 5.2, y: 5.5 }, // Centro de Pabellón (zona rosada)
  recuperacion: { x: 7.8, y: 6 }, // Centro de Recuperación (zona verde)
  unknown: { x: 7, y: 4 } // Punto central por defecto
}

// Definir los límites de cada zona para mejorar la distribución
const ZONE_BOUNDS = {
  preanestesia: { minX: 6.5, maxX: 11.5, minY: 1.2, maxY: 2.8 }, // Límites para pre-anestesia
  pabellon: { minX: 3.0, maxX: 6.3, minY: 3.0, maxY: 7.5 }, // Límites para pabellón
  recuperacion: { minX: 7.0, maxX: 10.5, minY: 4.5, maxY: 7.5 }, // Límites para recuperación
  unknown: { minX: 6.0, maxX: 8.0, minY: 3.0, maxY: 5.0 } // Límites para desconocido
}

// Posiciones precalculadas para evitar superposiciones
const PATIENT_POSITIONS: Record<string, Record<number, { x: number; y: number }>> = {
  preanestesia: {
    0: { x: 7.2, y: 1.8 },
    1: { x: 8.5, y: 2.3 },
    2: { x: 9.8, y: 1.7 },
    3: { x: 10.5, y: 2.2 },
    4: { x: 7.8, y: 2.6 }
  },
  pabellon: {
    0: { x: 3.5, y: 4.0 },
    1: { x: 4.8, y: 5.2 },
    2: { x: 5.9, y: 6.8 },
    3: { x: 4.2, y: 6.5 },
    4: { x: 5.5, y: 3.8 }
  },
  recuperacion: {
    0: { x: 7.5, y: 5.2 },
    1: { x: 8.8, y: 6.5 },
    2: { x: 9.7, y: 5.3 },
    3: { x: 8.2, y: 7.0 },
    4: { x: 9.1, y: 6.1 }
  }
}

// Datos de ejemplo para procedimientos y médicos (simulación)
// En producción, esta información vendría de la API/base de datos
interface ProcedureInfo {
  name: string
  physician: string
  room?: string
  estimatedDuration?: number
}

const DEMO_PROCEDURES: Record<string, ProcedureInfo> = {
  // Los IDs pueden ser RUT de pacientes reales para hacer match
  '8953590': {
    name: 'Artroplastia de rodilla',
    physician: 'Dr. Alejandro Rodríguez',
    room: 'Pabellón 2',
    estimatedDuration: 120
  },
  '25318261K': {
    name: 'Hernia inguinal',
    physician: 'Dra. María González',
    room: 'Pabellón 4',
    estimatedDuration: 90
  },
  '8948083': {
    name: 'Extracción de apéndice',
    physician: 'Dr. Carlos Méndez',
    room: 'Pabellón 1',
    estimatedDuration: 60
  }
  // Podemos agregar más ejemplos según sea necesario
}

const CustomHospitalMap: React.FC<CustomHospitalMapProps> = ({
  patientIndex,
  viewState,
  patientData,
  setViewState
}) => {
  const { patients, selectedPatient, selectPatient, simulatedTime } = usePatientStore()
  const [isClient, setIsClient] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Estado para controlar el arrastre del mapa
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Estado para controlar el tooltip de antenas
  const [hoveredAntenna, setHoveredAntenna] = useState<string | null>(null)

  // Estado para los detalles del paciente seleccionado
  const [showPatientDetails, setShowPatientDetails] = useState(false)

  // Registro de pacientes por zona para control de posicionamiento
  const [patientsByZone, setPatientsByZone] = useState<Record<string, string[]>>({
    preanestesia: [],
    pabellon: [],
    recuperacion: []
  })

  useEffect(() => {
    // Clasificar pacientes por zona para mejor distribución
    const newPatientsByZone: Record<string, string[]> = {
      preanestesia: [],
      pabellon: [],
      recuperacion: []
    }

    patients.forEach(patient => {
      if (patient.ubicacion_actual) {
        const normalizedZone = normalizeZoneId(patient.ubicacion_actual)
        if (normalizedZone in newPatientsByZone) {
          newPatientsByZone[normalizedZone].push(patient.rut)
        }
      }
    })

    setPatientsByZone(newPatientsByZone)
  }, [patients])

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

  // Funciones para manejar el zoom
  const handleZoomIn = () => {
    setViewState({
      ...viewState,
      zoom: Math.min(viewState.zoom + 0.2, 3) // Zoom más sutil, máximo 3x
    })
  }

  const handleZoomOut = () => {
    setViewState({
      ...viewState,
      zoom: Math.max(viewState.zoom - 0.2, 1) // Zoom más sutil, mínimo 1x
    })
  }

  const handleResetView = () => {
    setViewState({
      x: 7,
      y: 5,
      zoom: 1
    })
  }

  // Funciones para manejar el arrastre (pan) del mapa
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (viewState.zoom > 1) {
      // Solo permitir arrastre cuando hay zoom
      setIsDragging(true)

      // Calcular la posición actual en el SVG en vez de usar clientX/Y directamente
      const svgElement = svgRef.current
      if (svgElement) {
        const svgPoint = svgElement.createSVGPoint()
        svgPoint.x = e.clientX
        svgPoint.y = e.clientY
        const transformedPoint = svgPoint.matrixTransform(svgElement.getScreenCTM()?.inverse())

        setDragStart({ x: transformedPoint.x, y: transformedPoint.y })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && viewState.zoom > 1) {
      const svgElement = svgRef.current
      if (svgElement) {
        // Convertir coordenadas del cliente a coordenadas SVG
        const svgPoint = svgElement.createSVGPoint()
        svgPoint.x = e.clientX
        svgPoint.y = e.clientY
        const transformedPoint = svgPoint.matrixTransform(svgElement.getScreenCTM()?.inverse())

        // Calcular el desplazamiento en coordenadas SVG
        const dx = transformedPoint.x - dragStart.x
        const dy = transformedPoint.y - dragStart.y

        // Factor de escala para controlar la sensibilidad del arrastre
        const scaleFactor = 0.5 / viewState.zoom

        // Actualizar el viewState con las nuevas coordenadas
        setViewState({
          ...viewState,
          x: viewState.x - dx * scaleFactor,
          y: viewState.y - dy * scaleFactor
        })

        // Actualizar el punto de inicio para el próximo movimiento
        setDragStart({ x: transformedPoint.x, y: transformedPoint.y })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  // Formatear fechas y horas (corregido para aceptar undefined)
  const formatDateTime = (date: string | Date | null | undefined): string => {
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
    const isCurrentlySelected = selectedPatient?.rut === rut
    selectPatient(isCurrentlySelected ? null : rut)
    setShowPatientDetails(!isCurrentlySelected)
  }

  // Efecto para seleccionar paciente basado en patientIndex
  useEffect(() => {
    if (patientIndex !== false && patientData.features[patientIndex]?.rut) {
      selectPatient(patientData.features[patientIndex].rut || null)
      setShowPatientDetails(true)
    }
  }, [patientIndex, patientData, selectPatient])

  // Funciones para colores de zonas
  const getZoneColor = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId)
    switch (normalizedId) {
      case 'preanestesia':
        return 'rgba(255, 250, 160, 0.3)' // Amarillo claro
      case 'pabellon':
        return 'rgba(255, 200, 200, 0.3)' // Rojo claro
      case 'recuperacion':
        return 'rgba(200, 255, 200, 0.3)' // Verde claro
      default:
        return 'rgba(200, 200, 200, 0.3)' // Gris claro
    }
  }

  const getZoneBorder = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId)
    switch (normalizedId) {
      case 'preanestesia':
        return 'rgba(255, 200, 0, 0.8)' // Amarillo
      case 'pabellon':
        return 'rgba(255, 50, 50, 0.8)' // Rojo
      case 'recuperacion':
        return 'rgba(50, 200, 50, 0.8)' // Verde
      default:
        return 'rgba(100, 100, 100, 0.8)' // Gris
    }
  }

  // Función para obtener información de procedimiento para un paciente
  const getProcedureInfo = (patientId: string): ProcedureInfo | null => {
    // Extraer el RUT base sin el guión si es necesario
    const baseId = patientId.split('-')[0]

    // Buscar en datos de demostración (o futura API)
    return DEMO_PROCEDURES[baseId] || null
  }

  // Función para calcular la duración aproximada en una fase
  const calculatePhaseDuration = (
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
  ): number | null => {
    if (!start) return null

    const startDate = new Date(start)
    const endDate = end ? new Date(end) : simulatedTime || new Date()

    const durationMs = endDate.getTime() - startDate.getTime()
    return Math.round(durationMs / 60000) // Duración en minutos
  }

  // Función para obtener una posición adecuada dentro de una zona específica
  // Ahora usa posiciones precalculadas o más esparcidas para evitar superposiciones
  const getPositionInZone = (zoneId: string, patientId: string): { x: number; y: number } => {
    // Normalizar el ID de zona para asegurar consistencia
    const normalizedZoneId = normalizeZoneId(zoneId) as keyof typeof ZONE_BOUNDS

    // Obtener los límites de la zona
    const bounds = ZONE_BOUNDS[normalizedZoneId] || ZONE_BOUNDS.unknown

    // Verificar si hay posiciones precalculadas para esta zona
    if (normalizedZoneId in PATIENT_POSITIONS) {
      // Buscar el índice del paciente en su zona
      const zonePatients = patientsByZone[normalizedZoneId] || []
      const patientIndex = zonePatients.indexOf(patientId)

      // Si encontramos el paciente y tenemos una posición precalculada, la usamos
      if (patientIndex >= 0 && patientIndex in PATIENT_POSITIONS[normalizedZoneId]) {
        return PATIENT_POSITIONS[normalizedZoneId][patientIndex]
      }
    }

    // Generar un hash único basado en el ID del paciente
    const hash = patientId.split('').reduce((acc, char) => {
      return (acc * 31 + char.charCodeAt(0)) | 0
    }, 0)

    // Calcular posición basada en el hash pero dentro de los límites de la zona
    const xPercent = (hash % 1000) / 1000
    const yPercent = ((hash >> 10) % 1000) / 1000

    const x = bounds.minX + xPercent * (bounds.maxX - bounds.minX)
    const y = bounds.minY + yPercent * (bounds.maxY - bounds.minY)

    return { x, y }
  }

  // Renderizar las zonas del hospital
  const renderZones = () => {
    return HOSPITAL_ZONES.map(zone => {
      // Normalizamos el id de la zona para asegurar consistencia
      const normalizedZoneId = normalizeZoneId(zone.id)

      return zone.points.map((polygon, polyIndex) => {
        // Convertir puntos a formato SVG
        const pointsString = polygon.map(point => `${point.x},${point.y}`).join(' ')

        // Calcular centro para la etiqueta (promedio de todos los puntos)
        const centerX = polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length
        const centerY = polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length

        return (
          <g key={`${zone.id}-${polyIndex}`}>
            <polygon
              points={pointsString}
              fill={getZoneColor(normalizedZoneId)}
              stroke={getZoneBorder(normalizedZoneId)}
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
    })
  }

  // Renderizar un ícono de antena (similar al MDI)
  const renderAntennaIcon = (x: number, y: number, id: string, size: number = 0.35) => {
    const isHovered = hoveredAntenna === id
    const halfSize = size / 2

    return (
      <g
        key={`antenna-${id}`}
        transform={`translate(${x - halfSize}, ${y - halfSize})`}
        onMouseEnter={() => setHoveredAntenna(id)}
        onMouseLeave={() => setHoveredAntenna(null)}
        style={{ cursor: 'pointer' }}
      >
        {/* Círculo base */}
        <circle
          cx={halfSize}
          cy={halfSize}
          r={halfSize}
          fill={isHovered ? 'rgba(255, 0, 0, 0.8)' : 'red'}
          stroke='white'
          strokeWidth='0.03'
        />

        {/* Icono de antena más simple y reconocible */}
        <path
          d={`M${halfSize - 0.15} ${halfSize - 0.05} 
              A0.15,0.15 0 0 1 ${halfSize + 0.15},${halfSize - 0.05}
              A0.15,0.15 0 0 1 ${halfSize - 0.15},${halfSize - 0.05}
              M${halfSize} ${halfSize - 0.05} 
              L${halfSize} ${halfSize + 0.15}`}
          fill='none'
          stroke='white'
          strokeWidth='0.05'
        />
        <circle cx={halfSize} cy={halfSize - 0.05} r='0.05' fill='white' />
        <path
          d={`M${halfSize - 0.2} ${halfSize - 0.15} 
              A0.3,0.3 0 0 1 ${halfSize + 0.2},${halfSize - 0.15}`}
          fill='none'
          stroke='white'
          strokeWidth='0.03'
        />
        <path
          d={`M${halfSize - 0.12} ${halfSize - 0.15} 
              A0.18,0.18 0 0 1 ${halfSize + 0.12},${halfSize - 0.15}`}
          fill='none'
          stroke='white'
          strokeWidth='0.03'
        />

        {/* Tooltip con el ID de la antena */}
        {isHovered && (
          <g>
            <rect x={-1.5} y={-0.8} width={3} height={0.6} rx={0.2} fill='white' stroke='#333' strokeWidth='0.02' />
            <text x={0} y={-0.4} textAnchor='middle' fill='#333' style={{ fontSize: '0.3px' }}>
              {`Antena ${id}`}
            </text>
          </g>
        )}
      </g>
    )
  }

  // Renderizar un ícono de usuario para los pacientes
  const renderPatientIcon = (patient: any, position: { x: number; y: number }) => {
    const isSelected = selectedPatient?.rut === patient.rut
    const normalizedZone = normalizeZoneId(patient.ubicacion_actual)
    // Reducir tamaño de los iconos para evitar superposiciones
    const iconSize = isSelected ? 0.3 : 0.25 // Iconos más pequeños

    // Obtener color según la zona
    let fillColor
    switch (normalizedZone) {
      case 'preanestesia':
        fillColor = '#FFD700' // Amarillo
        break
      case 'pabellon':
        fillColor = '#FF6B6B' // Rojo
        break
      case 'recuperacion':
        fillColor = '#4CAF50' // Verde
        break
      default:
        fillColor = '#808080' // Gris
    }

    // Efecto de pulso si está seleccionado
    const pulseEffect = isSelected ? (
      <circle
        cx={position.x}
        cy={position.y}
        r={iconSize + 0.1}
        fill='none'
        stroke={fillColor}
        strokeWidth='0.03'
        opacity='0.6'
        className='animate-pulse'
      />
    ) : null

    return (
      <g key={patient.rut} onClick={() => handlePatientClick(patient.rut)} style={{ cursor: 'pointer' }}>
        {/* Efecto de pulso si está seleccionado */}
        {pulseEffect}

        {/* Círculo base */}
        <circle
          cx={position.x}
          cy={position.y}
          r={iconSize}
          fill={fillColor}
          stroke='white'
          strokeWidth='0.03'
          opacity={isSelected ? 1 : 0.7}
        />

        {/* Ícono de usuario (un SVG simple similar al sidebar) */}
        <g transform={`translate(${position.x - 0.1}, ${position.y - 0.1}) scale(0.2)`}>
          <path
            d='M0.5,0.5 a0.5,0.5 0 1,0 1,0 a0.5,0.5 0 1,0 -1,0 M0.2,2 h1.6 v-0.5 a0.8,0.8 0 0,0 -1.6,0 z'
            fill='white'
          />
        </g>

        {/* Mini-etiqueta con el RUT abreviado para facilitar identificación */}
        <text
          x={position.x}
          y={position.y - iconSize - 0.1}
          textAnchor='middle'
          fill='#333'
          style={{ fontSize: '0.15px', fontWeight: 'bold' }}
        >
          {patient.rut.split('-')[0]}
        </text>
      </g>
    )
  }

  // Renderizar panel de información detallada del paciente seleccionado
  const renderPatientDetails = () => {
    if (!selectedPatient || !showPatientDetails) return null

    const normalizedZone = normalizeZoneId(selectedPatient.ubicacion_actual)
    let borderColor

    switch (normalizedZone) {
      case 'preanestesia':
        borderColor = '#FFD700' // Amarillo
        break
      case 'pabellon':
        borderColor = '#FF6B6B' // Rojo
        break
      case 'recuperacion':
        borderColor = '#4CAF50' // Verde
        break
      default:
        borderColor = '#808080' // Gris
    }

    const position =
      selectedPatient.x && selectedPatient.y
        ? getPositionInZone(selectedPatient.ubicacion_actual, selectedPatient.rut)
        : { x: 7, y: 3 }

    // Obtener información del procedimiento (si está disponible)
    const procedureInfo = getProcedureInfo(selectedPatient.rut)

    // Calcular duraciones de fases
    const preAnesthesiaDuration = calculatePhaseDuration(
      selectedPatient.ing_preanestesia,
      selectedPatient.sal_preanestesia
    )

    const surgeryDuration = calculatePhaseDuration(selectedPatient.ingreso_pabellon, selectedPatient.salida_pabellon)

    const recoveryDuration = calculatePhaseDuration(selectedPatient.ingreso_recu, selectedPatient.salida_recu)

    // Aumentar el tamaño del panel para acomodar más información
    return (
      <g transform={`translate(${position.x - 2}, ${position.y + 0.5})`}>
        {/* Panel de información */}
        <rect x='0' y='0' width='4.5' height='3.4' rx='0.2' fill='white' stroke={borderColor} strokeWidth='0.08' />
        {/* Título */}
        <rect x='0.02' y='0' width='4.5' height='0.4' rx='0.2' fill={borderColor} />
        <text x='2.25' y='0.3' textAnchor='middle' fill='white' style={{ fontSize: '0.25px', fontWeight: 'bold' }}>
          {`${selectedPatient.rut} - ${getZoneName(normalizedZone)}`}
        </text>
        {/* Información del paciente */}
        <text x='0.5' y='0.65' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
          Última actualización: {formatDateTime(selectedPatient.ultima_actualizacion)}
        </text>
        <line x1='0.2' x2='3.8' y1='0.75' y2='0.75' stroke='#eee' strokeWidth='0.02' />
        {/* Timeline */}
        {selectedPatient.ing_preanestesia && (
          <g>
            <text x='0.2' y='1' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
              Pre-anestesia:
            </text>
            <text x='1.8' y='1' fill='#333' style={{ fontSize: '0.2px' }}>
              {formatDateTime(selectedPatient.ing_preanestesia)} - {formatDateTime(selectedPatient.sal_preanestesia)}
              {preAnesthesiaDuration && <tspan x='3.8' textAnchor='end'>{`(${preAnesthesiaDuration} min)`}</tspan>}
            </text>
          </g>
        )}
        {selectedPatient.ingreso_pabellon && (
          <g>
            <text x='0.2' y='1.3' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
              Pabellón:
            </text>
            <text x='1.8' y='1.3' fill='#333' style={{ fontSize: '0.2px' }}>
              {formatDateTime(selectedPatient.ingreso_pabellon)} - {formatDateTime(selectedPatient.salida_pabellon)}
              {surgeryDuration && <tspan x='3.8' textAnchor='end'>{`(${surgeryDuration} min)`}</tspan>}
            </text>
          </g>
        )}
        {selectedPatient.ingreso_recu && (
          <g>
            <text x='0.2' y='1.6' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
              Recuperación:
            </text>
            <text x='1.8' y='1.6' fill='#333' style={{ fontSize: '0.2px' }}>
              {formatDateTime(selectedPatient.ingreso_recu)} - {formatDateTime(selectedPatient.salida_recu)}
              {recoveryDuration && <tspan x='3.8' textAnchor='end'>{`(${recoveryDuration} min)`}</tspan>}
            </text>
          </g>
        )}
        {/* Línea divisoria */}
        <line x1='0.2' x2='3.8' y1='1.9' y2='1.9' stroke='#eee' strokeWidth='0.02' />
        {/* Información del procedimiento si está disponible */}
        <g>
          <text x='0.2' y='2.1' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
            Procedimiento:
          </text>
          <text x='1.8' y='2.1' fill='#333' style={{ fontSize: '0.2px' }}>
            {procedureInfo?.name || 'Información no disponible'}
          </text>
        </g>
        <g>
          <text x='0.2' y='2.4' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
            Médico:
          </text>
          <text x='1.8' y='2.4' fill='#333' style={{ fontSize: '0.2px' }}>
            {procedureInfo?.physician || 'Información no disponible'}
          </text>
        </g>
        // En el método renderPatientDetails
        <g>
          <text x='0.2' y='2.7' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
            ID de Beacon:
          </text>
          <text x='1.8' y='2.7' fill='#333' style={{ fontSize: '0.2px' }}>
            {selectedPatient.tag || selectedPatient.beacon_mac || 'No asignado'}
          </text>
        </g>
        <g>
          <text x='0.2' y='3.0' fill='#333' style={{ fontSize: '0.2px', fontWeight: 'bold' }}>
            Sala:
          </text>
          <text x='1.8' y='3.0' fill='#333' style={{ fontSize: '0.2px' }}>
            {procedureInfo?.room || 'Información no disponible'}
          </text>
        </g>
        {/* Botón de cerrar */}
        <g transform='translate(4.3, 0.2)' onClick={() => setShowPatientDetails(false)} style={{ cursor: 'pointer' }}>
          <circle cx='0' cy='0' r='0.15' fill='white' stroke='#ccc' strokeWidth='0.01' />
          <line x1='-0.08' y1='-0.08' x2='0.08' y2='0.08' stroke='#999' strokeWidth='0.02' />
          <line x1='-0.08' y1='0.08' x2='0.08' y2='-0.08' stroke='#999' strokeWidth='0.02' />
        </g>
      </g>
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
      <svg
        ref={svgRef}
        viewBox={calculateViewBox()}
        preserveAspectRatio='xMidYMid meet'
        className='w-full h-full'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : viewState.zoom > 1 ? 'grab' : 'default' }}
      >
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

        {/* Antenas con nuevo diseño */}
        {Object.entries(ANTENNA_POSITIONS).map(([id, pos]) => renderAntennaIcon(pos.x, pos.y, id))}

        {/* Pacientes con nuevo diseño */}
        {patients.map(patient => {
          if (!patient.ubicacion_actual) return null

          // Obtener posición dentro de la zona correcta
          const position = getPositionInZone(patient.ubicacion_actual, patient.rut)

          return renderPatientIcon(patient, position)
        })}

        {/* Panel de detalles del paciente seleccionado */}
        {renderPatientDetails()}

        {/* Controles de zoom */}
        <g
          className='zoom-controls'
          transform={`translate(${MAP_BOUNDS.minX + 0.5}, ${MAP_BOUNDS.minY + 0.5})`}
          style={{ cursor: 'pointer' }}
        >
          {/* Botón de Zoom In */}
          <g onClick={handleZoomIn}>
            <circle cx='0.25' cy='0.25' r='0.25' fill='white' stroke='#666' strokeWidth='0.02' />
            <line x1='0.15' y1='0.25' x2='0.35' y2='0.25' stroke='#666' strokeWidth='0.04' />
            <line x1='0.25' y1='0.15' x2='0.25' y2='0.35' stroke='#666' strokeWidth='0.04' />
          </g>

          {/* Botón de Zoom Out */}
          <g onClick={handleZoomOut} transform='translate(0, 0.6)'>
            <circle cx='0.25' cy='0.25' r='0.25' fill='white' stroke='#666' strokeWidth='0.02' />
            <line x1='0.15' y1='0.25' x2='0.35' y2='0.25' stroke='#666' strokeWidth='0.04' />
          </g>

          {/* Botón de Reset Vista */}
          <g onClick={handleResetView} transform='translate(0, 1.2)'>
            <circle cx='0.25' cy='0.25' r='0.25' fill='white' stroke='#666' strokeWidth='0.02' />
            <path d='M0.15,0.15 L0.35,0.35 M0.15,0.35 L0.35,0.15' stroke='#666' strokeWidth='0.03' />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default CustomHospitalMap
