// src/views/apps/logistics/dashboard/TimeControlsWrapper.tsx
'use client'

import { useEffect } from 'react'
import TimeControls from '@/views/apps/logistics/patients/TimeControls'
import usePatientStore from '@/store/usePatientStore'

const TimeControlsWrapper = () => {
  const { setSimulatedTime } = usePatientStore()

  const handleTimeChange = (newTime: Date | null) => {
    setSimulatedTime(newTime)
  }

  // Inicializar el socket al montar el componente
  useEffect(() => {
    const { initializeSocket, disconnectSocket } = usePatientStore.getState()

    initializeSocket()

    return () => {
      disconnectSocket()
    }
  }, [])

  return <TimeControls onTimeChange={handleTimeChange} />
}

export default TimeControlsWrapper
