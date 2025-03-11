// src/components/tracking/PatientTimeline.tsx
// Este archivo debe ubicarse en src/components/tracking/PatientTimeline.tsx

import React, { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'
import usePatientStore from '../../../../store/usePatientStore'

interface Timeline {
  preAnestesia: {
    ingreso: Date | null
    salida: Date | null
    duracion: number | null
    isActive: boolean
  }
  pabellon: {
    ingreso: Date | null
    salida: Date | null
    duracion: number | null
    isActive: boolean
  }
  recuperacion: {
    ingreso: Date | null
    salida: Date | null
    duracion: number | null
    isActive: boolean
  }
}

interface PatientTimelineProps {
  rut: string
  date: Date
}

// Función para manejar fechas sin ajustar innecesariamente la zona horaria
const toLocalTime = (date: Date | string): Date => {
  if (!date) return new Date()
  return new Date(date)
}

const formatTime = (date: Date | string | null): string => {
  if (!date) return '-'
  try {
    const localDate = toLocalTime(date)
    return localDate.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return '-'
  }
}

const formatDuration = (minutes: number | null): string => {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const TimelineStatus: React.FC<{
  event: { ingreso: Date | null; salida: Date | null; isActive: boolean }
}> = ({ event }) => {
  if (!event.ingreso) {
    return <XCircle className='w-5 h-5 text-gray-400' />
  }
  if (event.isActive) {
    return <Clock className='w-5 h-5 text-yellow-500 animate-pulse' />
  }
  if (!event.salida) {
    return <AlertTriangle className='w-5 h-5 text-orange-500' />
  }
  return <CheckCircle className='w-5 h-5 text-green-500' />
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ rut, date }) => {
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { simulatedTime } = usePatientStore()

  const checkIfActive = useCallback(
    (ingreso: Date | null, salida: Date | null): boolean => {
      if (!ingreso) return false

      const currentTime = simulatedTime || new Date()

      // Convertir todas las fechas a timestamps para comparación
      const ingresoTime = ingreso.getTime()
      const salidaTime = salida ? salida.getTime() : Number.MAX_SAFE_INTEGER
      const currentTimeMs = currentTime.getTime()

      return currentTimeMs >= ingresoTime && currentTimeMs <= salidaTime
    },
    [simulatedTime]
  )

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true)
        const queryDate = toLocalTime(date)

        // Construir URL con fecha en ISO
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/patients/${rut}/timeline?date=${queryDate.toISOString()}`
        )

        if (!response.ok) {
          throw new Error('Error al cargar la línea de tiempo')
        }

        const data = await response.json()

        // Procesar datos y verificar si alguna zona está activa en el tiempo actual
        const processedData: Timeline = {
          preAnestesia: {
            ingreso: data.preAnestesia.ingreso ? toLocalTime(data.preAnestesia.ingreso) : null,
            salida: data.preAnestesia.salida ? toLocalTime(data.preAnestesia.salida) : null,
            duracion: data.preAnestesia.duracion,
            isActive: false // Se actualizará abajo
          },
          pabellon: {
            ingreso: data.pabellon.ingreso ? toLocalTime(data.pabellon.ingreso) : null,
            salida: data.pabellon.salida ? toLocalTime(data.pabellon.salida) : null,
            duracion: data.pabellon.duracion,
            isActive: false // Se actualizará abajo
          },
          recuperacion: {
            ingreso: data.recuperacion.ingreso ? toLocalTime(data.recuperacion.ingreso) : null,
            salida: data.recuperacion.salida ? toLocalTime(data.recuperacion.salida) : null,
            duracion: data.recuperacion.duracion,
            isActive: false // Se actualizará abajo
          }
        }

        // Actualizar estado isActive basado en el tiempo actual
        processedData.preAnestesia.isActive = checkIfActive(
          processedData.preAnestesia.ingreso,
          processedData.preAnestesia.salida
        )

        processedData.pabellon.isActive = checkIfActive(processedData.pabellon.ingreso, processedData.pabellon.salida)

        processedData.recuperacion.isActive = checkIfActive(
          processedData.recuperacion.ingreso,
          processedData.recuperacion.salida
        )

        setTimeline(processedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (rut) {
      fetchTimeline()
    }
  }, [rut, date, simulatedTime, checkIfActive])

  if (loading) {
    return (
      <div className='flex justify-center items-center p-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 text-red-500'>
        <XCircle className='w-5 h-5 inline-block mr-2' />
        {error}
      </div>
    )
  }

  if (!timeline) {
    return <div className='p-4 text-gray-500'>No hay datos disponibles</div>
  }

  const areas = [
    {
      id: 'preAnestesia',
      name: 'Pre-anestesia',
      data: timeline.preAnestesia,
      colorClass: 'yellow'
    },
    {
      id: 'pabellon',
      name: 'Pabellón',
      data: timeline.pabellon,
      colorClass: 'red'
    },
    {
      id: 'recuperacion',
      name: 'Recuperación',
      data: timeline.recuperacion,
      colorClass: 'green'
    }
  ]

  // Determinar zona activa actual
  const activeZone = areas.find(zone => zone.data.isActive)

  return (
    <div className='p-4 space-y-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold'>Línea de Tiempo</h3>
        <div className='text-sm text-gray-500'>{toLocalTime(date).toLocaleDateString('es-CL')}</div>
      </div>

      {/* Mostrar zona activa en la parte superior */}
      {activeZone && (
        <div
          className={`bg-${activeZone.colorClass}-100 border-l-4 border-${activeZone.colorClass}-500 p-3 rounded-md mb-3`}
        >
          <div className='flex items-center'>
            <Clock className={`w-5 h-5 text-${activeZone.colorClass}-600 mr-2 animate-pulse`} />
            <div>
              <p className='font-medium'>Zona actual: {activeZone.name}</p>
              <p className='text-sm'>
                Ingreso: {formatTime(activeZone.data.ingreso)}
                {activeZone.data.ingreso && (
                  <span className='ml-2 text-gray-500'>
                    (
                    {formatDuration(
                      Math.round(
                        ((simulatedTime || new Date()).getTime() - (activeZone.data.ingreso?.getTime() || 0)) / 60000
                      )
                    )}{' '}
                    en esta zona)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-4'>
        {areas.map(({ id, name, data, colorClass }) => (
          <div
            key={id}
            className={`bg-${colorClass}-50 rounded-lg p-4 shadow-sm border ${
              data.isActive ? `border-${colorClass}-500 ring-2 ring-${colorClass}-200` : `border-${colorClass}-200`
            }`}
          >
            <div className='flex items-center justify-between mb-2'>
              <h4 className={`font-medium text-${colorClass}-700 flex items-center gap-2`}>
                <TimelineStatus event={data} />
                {name}
                {data.isActive && (
                  <span className='text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 animate-pulse'>
                    Actual
                  </span>
                )}
              </h4>
              {data.duracion && (
                <span className={`text-${colorClass}-600 text-sm font-medium`}>{formatDuration(data.duracion)}</span>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-gray-500'>Ingreso</p>
                <p className='font-medium'>{formatTime(data.ingreso)}</p>
              </div>
              <div>
                <p className='text-gray-500'>Salida</p>
                <p className='font-medium'>{formatTime(data.salida)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4 text-xs text-gray-400 flex items-center justify-between'>
        <div>Última actualización: {toLocalTime(simulatedTime || new Date()).toLocaleTimeString('es-CL')}</div>
        <div className='flex gap-4'>
          <span className='flex items-center gap-1'>
            <XCircle className='w-4 h-4' /> Pendiente
          </span>
          <span className='flex items-center gap-1'>
            <Clock className='w-4 h-4' /> En proceso
          </span>
          <span className='flex items-center gap-1'>
            <CheckCircle className='w-4 h-4' /> Completado
          </span>
        </div>
      </div>
    </div>
  )
}

export default PatientTimeline
