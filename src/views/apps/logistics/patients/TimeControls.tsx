// src/views/apps/logistics/fleet/TimeControls.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  left: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  zIndex: 1200, // Aumentar el z-index para que esté por encima de la sidebar
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  maxWidth: 480
}))

interface TimeControlsProps {
  onTimeChange: (newTime: Date | null) => void
}

const TimeControls = ({ onTimeChange }: TimeControlsProps) => {
  // Constantes y estados
  const MIN_DATE = '2025-01-17'
  const [maxDate, setMaxDate] = useState<string>('')
  const [maxTime, setMaxTime] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('2025-01-17')
  const [selectedTime, setSelectedTime] = useState<string>('10:00:00')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [displayTime, setDisplayTime] = useState<string>('')
  const [isRealTime, setIsRealTime] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Efecto para calcular la fecha máxima permitida
  useEffect(() => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    setMaxDate(oneHourAgo.toISOString().split('T')[0])
    setMaxTime(oneHourAgo.toLocaleTimeString('es-CL', { hour12: false }))
  }, [])

  // Funciones auxiliares para formateo de fechas
  const formatDisplayDateTime = (date: Date): string => {
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Función para crear una fecha desde strings de fecha y hora
  const createValidDate = (dateStr: string, timeStr: string): Date | null => {
    try {
      // Asegurar formato correcto de hora
      const [hours, minutes, seconds = '00'] = timeStr.split(':').map(num => num.padStart(2, '0'))
      const fullTimeStr = `${hours}:${minutes}:${seconds}`

      // Crear fecha en formato ISO
      const dateTime = `${dateStr}T${fullTimeStr}`
      const newDate = new Date(dateTime)

      // Verificar que es una fecha válida
      if (isNaN(newDate.getTime())) {
        throw new Error('Fecha inválida')
      }

      return newDate
    } catch (error) {
      console.error('Error al crear fecha:', error)
      return null
    }
  }

  // Validación de fechas seleccionadas
  const validateDateTime = (date: string, time: string): boolean => {
    try {
      const selectedDateTime = new Date(`${date}T${time}`)
      const maxDateTime = new Date(`${maxDate}T${maxTime}`)
      return selectedDateTime <= maxDateTime
    } catch (error) {
      console.error('Error validando fecha:', error)
      return false
    }
  }

  // Manejador de actualización de tiempo
  const handleTimeUpdate = useCallback(
    (newTime: Date | null) => {
      if (newTime && !isNaN(newTime.getTime())) {
        setDisplayTime(formatDisplayDateTime(newTime))
        setCurrentTime(newTime)
        onTimeChange(newTime)
      } else if (newTime === null) {
        const now = new Date()
        setDisplayTime(formatDisplayDateTime(now))
        setCurrentTime(now)
        onTimeChange(null)
      }
    },
    [onTimeChange]
  )

  // Efecto para la reproducción del tiempo
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && !isRealTime) {
      interval = setInterval(() => {
        if (currentTime) {
          // Calcular nueva fecha basada en velocidad
          const newTime = new Date(currentTime.getTime() + playbackSpeed * 1000)

          // Validar que no exceda el tiempo máximo
          if (newTime <= new Date(`${maxDate}T${maxTime}`)) {
            // Actualizar todos los estados relevantes
            setCurrentTime(newTime)

            // Actualizar inputs de fecha/hora
            setSelectedTime(newTime.toLocaleTimeString('es-CL', { hour12: false }))
            setSelectedDate(newTime.toISOString().split('T')[0])

            // Actualizar el tiempo en el store
            handleTimeUpdate(newTime)
          } else {
            // Si excede el tiempo máximo, detener reproducción
            setIsPlaying(false)
          }
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, playbackSpeed, isRealTime, currentTime, handleTimeUpdate, maxDate, maxTime])

  // Manejadores de eventos
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value
    const isValid = validateDateTime(newDate, selectedTime)

    if (isValid) {
      setSelectedDate(newDate)
      const date = createValidDate(newDate, selectedTime)
      if (date) {
        setCurrentTime(date)
        handleTimeUpdate(date)
      }
    } else {
      // Si la fecha no es válida, usar la fecha máxima permitida
      setSelectedDate(maxDate)
      setSelectedTime(maxTime)
      const date = createValidDate(maxDate, maxTime)
      if (date) {
        setCurrentTime(date)
        handleTimeUpdate(date)
      }
    }
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newTime = event.target.value

    // Asegurar que la hora tiene formato correcto
    const timeParts = newTime.split(':')
    if (timeParts.length === 2) {
      // Si solo tenemos HH:mm, añadir segundos
      const [hours, minutes] = timeParts
      newTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`
    } else if (timeParts.length === 3) {
      // Si tenemos HH:mm:ss, asegurar formato correcto
      const [hours, minutes, seconds] = timeParts
      newTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
    }

    // Validar formato 24 horas
    if (/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(newTime)) {
      const isValid = validateDateTime(selectedDate, newTime)

      if (isValid) {
        setSelectedTime(newTime)
        const date = createValidDate(selectedDate, newTime)
        if (date) {
          setCurrentTime(date)
          handleTimeUpdate(date)
        }
      } else {
        // Si la hora no es válida, usar la hora máxima permitida
        setSelectedTime(maxTime)
        const date = createValidDate(selectedDate, maxTime)
        if (date) {
          setCurrentTime(date)
          handleTimeUpdate(date)
        }
      }
    }
  }

  const handlePlayPause = () => {
    if (!currentTime) {
      // Si no hay tiempo seleccionado, usar la fecha/hora seleccionada
      const initialDate = createValidDate(selectedDate, selectedTime)
      if (initialDate) {
        setCurrentTime(initialDate)
        handleTimeUpdate(initialDate)
      }
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    // Reiniciar a la fecha/hora seleccionada
    const date = createValidDate(selectedDate, selectedTime)
    if (date) {
      setCurrentTime(date)
      handleTimeUpdate(date)
    }
    setIsPlaying(false)
  }

  const handleSpeedChange = () => {
    // Ciclar entre velocidades de reproducción
    const speeds = [1, 2, 5, 10, 30]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextIndex])
  }

  const toggleTimeMode = () => {
    if (!isRealTime) {
      // Cambiar a tiempo real
      const now = new Date()
      setSelectedDate(now.toISOString().split('T')[0])
      setSelectedTime(
        now.toLocaleTimeString('es-CL', {
          hour12: false
        })
      )
      handleTimeUpdate(null)
    }
    // Detener reproducción y cambiar modo
    setIsPlaying(false)
    setIsRealTime(!isRealTime)
  }

  const formatDisplaySpeed = (speed: number): string => {
    if (speed < 60) return `${speed}x`
    return `${speed / 60}m`
  }

  return (
    <ControlsContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6'>Control de Tiempo</Typography>
        <Button
          variant={isRealTime ? 'contained' : 'outlined'}
          color={isRealTime ? 'success' : 'primary'}
          onClick={toggleTimeMode}
          startIcon={<i className={isRealTime ? 'ri-time-line' : 'ri-history-line'} />}
        >
          {isRealTime ? 'Tiempo Real' : 'Histórico'}
        </Button>
      </Box>

      {!isRealTime && (
        <>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <TextField
              label='Fecha'
              type='date'
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: MIN_DATE,
                max: maxDate
              }}
            />
            <TextField
              label='Hora'
              type='time'
              value={selectedTime.split(':').slice(0, 2).join(':')}
              onChange={handleTimeChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                step: 1
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={handlePlayPause}
              startIcon={<i className={isPlaying ? 'ri-pause-line' : 'ri-play-line'} />}
            >
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>

            <Button variant='outlined' onClick={handleReset} startIcon={<i className='ri-refresh-line' />}>
              Reiniciar
            </Button>

            <Button
              variant='outlined'
              color='success'
              onClick={handleSpeedChange}
              startIcon={<i className='ri-speed-line' />}
            >
              {formatDisplaySpeed(playbackSpeed)}
            </Button>
          </Box>

          <Typography variant='h6'>{displayTime}</Typography>
        </>
      )}
    </ControlsContainer>
  )
}

export default TimeControls
