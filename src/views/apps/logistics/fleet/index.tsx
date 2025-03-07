// src/views/apps/logistics/fleet/index.tsx
'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Backdrop from '@mui/material/Backdrop'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classNames from 'classnames'

//Components Imports
import CustomIconButton from '@core/components/mui/IconButton'
import PatientSidebar from './PatientSidebar'
import CustomHospitalMap from './CustomHospitalMap'
import TimeControls from './TimeControls'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import usePatientStore from '@/store/usePatientStore'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

export type viewStateType = {
  x: number
  y: number
  zoom: number
}

// Datos iniciales para el componente (serán reemplazados con datos reales del servidor)
const initialPatientData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      rut: '12.345.678-9',
      nombre: 'Carlos Gutiérrez',
      zona: 'preAnestesia',
      geometry: {
        type: 'Point',
        x: 6.65,
        y: 1.53
      }
    },
    {
      type: 'Feature',
      rut: '23.456.789-0',
      nombre: 'María López',
      zona: 'pabellon',
      geometry: {
        type: 'Point',
        x: 3.2,
        y: 4.275
      }
    },
    {
      type: 'Feature',
      rut: '34.567.890-1',
      nombre: 'Juan Pérez',
      zona: 'recuperacion',
      geometry: {
        type: 'Point',
        x: 5.7,
        y: 4.6
      }
    }
  ]
}

const HospitalTracking = () => {
  // States
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | false>(0)

  const [viewState, setViewState] = useState<viewStateType>({
    x: 5.5,
    y: 3.5,
    zoom: 1
  })

  // Hooks
  const { settings } = useSettings()
  const isBelowLgScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { initializeSocket, disconnectSocket, setSimulatedTime } = usePatientStore()

  useEffect(() => {
    // Iniciar la conexión de socket cuando el componente se monta
    initializeSocket()

    // Limpieza al desmontar
    return () => {
      disconnectSocket()
    }
  }, [initializeSocket, disconnectSocket])

  useEffect(() => {
    if (!isBelowMdScreen && backdropOpen && sidebarOpen) {
      setBackdropOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowMdScreen])

  useEffect(() => {
    if (!isBelowSmScreen && sidebarOpen) {
      setBackdropOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBelowSmScreen])

  return (
    <div
      className={classNames(
        commonLayoutClasses.contentHeightFixed,
        'flex is-full overflow-hidden rounded-xl relative',
        {
          border: settings.skin === 'bordered',
          'shadow-md': settings.skin !== 'bordered'
        }
      )}
    >
      {/* Menú de hamburguesa móvil */}
      {isBelowMdScreen ? (
        <CustomIconButton
          variant='contained'
          color='primary'
          className='absolute top-4 left-4 z-20 bg-backgroundPaper text-textPrimary hover:bg-backgroundPaper focus:bg-backgroundPaper active:bg-backgroundPaper'
          onClick={() => {
            setSidebarOpen(true)
            setBackdropOpen(true)
          }}
        >
          <i className='ri-menu-line text-2xl' />
        </CustomIconButton>
      ) : null}

      {/* Layout principal con flexbox para separar la sidebar y el mapa */}
      <div className='flex w-full h-full'>
        {/* Contenedor de la sidebar */}
        <div className={`h-full z-10 ${!isBelowMdScreen ? 'w-[360px] flex-shrink-0' : ''}`}>
          <PatientSidebar
            backdropOpen={backdropOpen}
            setBackdropOpen={setBackdropOpen}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isBelowLgScreen={isBelowLgScreen}
            isBelowMdScreen={isBelowMdScreen}
            isBelowSmScreen={isBelowSmScreen}
            expanded={expanded}
            setExpanded={setExpanded}
            setViewState={setViewState}
            patientData={initialPatientData}
          />
        </div>

        {/* Contenedor del mapa */}
        <div className='flex-grow h-full relative'>
          {/* CAMBIO: Pasamos setViewState como prop para que el mapa pueda manejar controles de zoom */}
          <CustomHospitalMap
            patientIndex={expanded}
            viewState={viewState}
            patientData={initialPatientData}
            setViewState={setViewState}
          />
        </div>
      </div>

      {/* Controles de tiempo */}
      <TimeControls onTimeChange={setSimulatedTime} />

      {/* Backdrop para dispositivos móviles */}
      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} className='absolute z-10' />
    </div>
  )
}

export default HospitalTracking
