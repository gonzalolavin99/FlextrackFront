// src/views/apps/logistics/fleet/PatientSidebar.tsx
'use client'

// React Imports
import { useEffect } from 'react'
import type { ReactNode, SyntheticEvent } from 'react'

// Mui Imports
import MuiAccordion from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary from '@mui/material/AccordionSummary'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTimeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import Chip from '@mui/material/Chip'
import type { AccordionProps } from '@mui/material/Accordion'
import type { AccordionSummaryProps } from '@mui/material/AccordionSummary'
import type { AccordionDetailsProps } from '@mui/material/AccordionDetails'
import type { TimelineProps } from '@mui/lab/Timeline'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Types Imports
import type { viewStateType } from './index'
import usePatientStore from '@/store/usePatientStore'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import DirectionalIcon from '@components/DirectionalIcon'
import { normalizeZoneId, getZoneName, getZoneColor } from '@/utils/zoneUtils'

type Props = {
  backdropOpen: boolean
  setBackdropOpen: (value: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (value: boolean) => void
  isBelowLgScreen: boolean
  isBelowMdScreen: boolean
  isBelowSmScreen: boolean
  expanded: number | false
  setExpanded: (value: number | false) => void
  setViewState: (value: viewStateType) => void
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

// Styled component for Accordion component
const Accordion = styled(MuiAccordion)<AccordionProps>({
  boxShadow: 'none !important',
  border: 'none',
  '&:before': {
    content: 'none'
  }
})

// Styled component for AccordionSummary component
const AccordionSummary = styled(MuiAccordionSummary)<AccordionSummaryProps>(({ theme }) => ({
  paddingBlock: theme.spacing(0, 4),
  paddingInline: theme.spacing(0),
  '& .MuiAccordionSummary-expandIconWrapper i': {
    color: 'var(--mui-palette-action-active) !important'
  },
  '&.Mui-expanded': {
    '& .MuiAccordionSummary-expandIconWrapper': {
      transform: theme.direction === 'ltr' ? 'rotate(90deg)' : 'rotate(-90deg)',
      '& i, & svg': {
        color: 'var(--mui-palette-text-primary) !important'
      }
    }
  }
}))

// Styled component for AccordionDetails component
const AccordionDetails = styled(MuiAccordionDetails)<AccordionDetailsProps>({
  padding: 0
})

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  },
  '& .MuiTimelineDot-root': {
    border: 0,
    padding: 0
  }
})

const ScrollWrapper = ({ children, isBelowLgScreen }: { children: ReactNode; isBelowLgScreen: boolean }) => {
  if (isBelowLgScreen) {
    return <div className='bs-full overflow-y-auto overflow-x-hidden pbe-5 pli-5'>{children}</div>
  } else {
    return (
      <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }} className='pbe-5 pli-5'>
        {children}
      </PerfectScrollbar>
    )
  }
}

// Función para formatear fecha y hora
const formatDateTime = (dateTimeStr: string | Date | null) => {
  if (!dateTimeStr) return '---'
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para calcular la duración en minutos entre dos timestamps
const calculateDuration = (startTime: string | Date | null, endTime: string | Date | null): number | null => {
  if (!startTime || !endTime) return null

  try {
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Calcular diferencia en milisegundos y convertir a minutos
    const diffMs = end.getTime() - start.getTime()
    return Math.floor(diffMs / (1000 * 60))
  } catch (error) {
    console.error('Error calculando duración:', error)
    return null
  }
}

// Función para formatear la duración en formato legible
const formatDuration = (minutes: number | null): string => {
  if (minutes === null) return ''

  // Si es menos de una hora, mostrar solo minutos
  if (minutes < 60) {
    return `(${minutes} min)`
  }

  // Si es una hora o más, mostrar horas y minutos
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `(${hours} h)`
  } else {
    return `(${hours} h ${remainingMinutes} min)`
  }
}

const PatientTracking = ({
  patient,
  index,
  expanded,
  handleChange
}: {
  patient: any
  index: number
  expanded: number | false
  handleChange: (panel: number) => (event: SyntheticEvent, isExpanded: boolean) => void
}) => {
  const normalizedZone = normalizeZoneId(patient.ubicacion_actual)

  // Mapear nuestros colores a los colores de MUI
  const getMuiColor = (zone: string) => {
    switch (zone) {
      case 'preanestesia':
        return 'warning'
      case 'pabellon':
        return 'error'
      case 'recuperacion':
        return 'success'
      default:
        return 'primary'
    }
  }

  const zoneColorType = getMuiColor(normalizedZone)
  const zoneName = getZoneName(normalizedZone)

  // Calcular progreso basado en la ubicación actual
  let progress = 0
  if (normalizedZone === 'preanestesia') progress = 33
  else if (normalizedZone === 'pabellon') progress = 66
  else if (normalizedZone === 'recuperacion') progress = 90

  // Calcular duraciones
  const preanestesiaDuration = calculateDuration(patient.ing_preanestesia, patient.sal_preanestesia)
  const pabellonDuration = calculateDuration(patient.ingreso_pabellon, patient.salida_pabellon)
  const recuperacionDuration = calculateDuration(patient.ingreso_recu, patient.salida_recu)

  return (
    <Accordion expanded={expanded === index} onChange={handleChange(index)}>
      <AccordionSummary
        expandIcon={
          <DirectionalIcon
            ltrIconClass='ri-arrow-right-s-line'
            rtlIconClass='ri-arrow-left-s-line'
            className='text-textPrimary'
          />
        }
      >
        <div className='flex gap-4 items-center'>
          <CustomAvatar skin='light' color={zoneColorType}>
            <i className='ri-user-line' />
          </CustomAvatar>
          <div className='flex flex-col gap-1'>
            <Typography className='font-normal'>{patient.rut}</Typography>
            <Typography className='!text-textSecondary font-normal'>{zoneName}</Typography>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className='flex flex-col gap-1 plb-4'>
          <div className='flex items-center justify-between'>
            <Typography className='!text-textPrimary'>Progreso del Paciente</Typography>
            <Typography>{progress}%</Typography>
          </div>
          <LinearProgress variant='determinate' value={progress} color={zoneColorType} />
          <div className='flex justify-between items-center mt-2'>
            <Typography variant='body2'>Última actualización:</Typography>
            <Typography variant='body2'>{formatDateTime(patient.ultima_actualizacion)}</Typography>
          </div>
        </div>
        <Timeline className='pbs-4'>
          {patient.ing_preanestesia && (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot variant='outlined' color='warning' className='mlb-0'>
                  <i className='ri-timer-line text-xl' />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent className='flex flex-col gap-0.5 pbs-0 pis-4 pbe-5'>
                <Typography variant='caption' className='uppercase' color='warning.main'>
                  Pre-anestesia{' '}
                  {preanestesiaDuration && <span className='text-xs'>{formatDuration(preanestesiaDuration)}</span>}
                </Typography>
                <Typography className='font-medium !text-textPrimary'>
                  Ingreso: {formatDateTime(patient.ing_preanestesia)}
                </Typography>
                <Typography variant='body2'>Salida: {formatDateTime(patient.sal_preanestesia)}</Typography>
              </TimelineContent>
            </TimelineItem>
          )}

          {patient.ingreso_pabellon && (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot variant='outlined' color='error' className='mlb-0'>
                  <i className='ri-hospital-line text-xl' />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent className='flex flex-col gap-0.5 pbs-0 pis-4 pbe-5'>
                <Typography variant='caption' className='uppercase' color='error.main'>
                  Pabellón {pabellonDuration && <span className='text-xs'>{formatDuration(pabellonDuration)}</span>}
                </Typography>
                <Typography className='font-medium !text-textPrimary'>
                  Ingreso: {formatDateTime(patient.ingreso_pabellon)}
                </Typography>
                <Typography variant='body2'>Salida: {formatDateTime(patient.salida_pabellon)}</Typography>
              </TimelineContent>
            </TimelineItem>
          )}

          {patient.ingreso_recu && (
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot variant='outlined' color='success' className='mlb-0'>
                  <i className='ri-heart-pulse-line text-xl' />
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent className='flex flex-col gap-0.5 pbs-0 pis-4 pbe-5'>
                <Typography variant='caption' className='uppercase' color='success.main'>
                  Recuperación{' '}
                  {recuperacionDuration && <span className='text-xs'>{formatDuration(recuperacionDuration)}</span>}
                </Typography>
                <Typography className='font-medium !text-textPrimary'>
                  Ingreso: {formatDateTime(patient.ingreso_recu)}
                </Typography>
                <Typography variant='body2'>Salida: {formatDateTime(patient.salida_recu)}</Typography>
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </AccordionDetails>
    </Accordion>
  )
}

const PatientSidebar = (props: Props) => {
  // Props
  const {
    backdropOpen,
    setBackdropOpen,
    sidebarOpen,
    setSidebarOpen,
    isBelowLgScreen,
    isBelowMdScreen,
    isBelowSmScreen,
    expanded,
    setExpanded,
    setViewState,
    patientData
  } = props

  // Store
  const { patients, selectedPatient, selectPatient } = usePatientStore()

  const handleChange = (panel: number) => (event: SyntheticEvent, isExpanded: boolean) => {
    if (isExpanded && patients[panel]) {
      // Seleccionamos el paciente y centramos el mapa en él pero sin hacer zoom
      selectPatient(patients[panel].rut)

      // Opcionalmente, podemos centrar el mapa en el paciente sin cambiar el zoom
      if (patients[panel].x && patients[panel].y) {
        // Corregido: pasamos un objeto directamente en lugar de una función
        setViewState({
          x: patients[panel].x,
          y: patients[panel].y,
          zoom: 1 // Mantener zoom en 1 para evitar acercamiento
        })
      }
    } else {
      selectPatient(null)
    }

    setExpanded(isExpanded ? panel : false)
  }

  useEffect(() => {
    if (!backdropOpen && sidebarOpen) {
      setSidebarOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  return (
    <Drawer
      className='bs-full'
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      variant={!isBelowMdScreen ? 'permanent' : 'persistent'}
      ModalProps={{
        disablePortal: true,
        keepMounted: true // Better open performance on mobile.
      }}
      sx={{
        zIndex: isBelowMdScreen && sidebarOpen ? 11 : 10,
        position: !isBelowMdScreen ? 'static' : 'absolute',
        ...(isBelowSmScreen && sidebarOpen && { width: '100%' }),
        '& .MuiDrawer-paper': {
          borderRight: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
          width: isBelowSmScreen ? '100%' : '360px',
          position: !isBelowMdScreen ? 'static' : 'absolute'
        }
      }}
    >
      <div className='flex justify-between p-5'>
        <Typography variant='h5'>Pacientes Activos ({patients.length})</Typography>

        {isBelowMdScreen ? (
          <IconButton
            onClick={() => {
              setSidebarOpen(false)
              setBackdropOpen(false)
            }}
          >
            <i className='ri-close-line' />
          </IconButton>
        ) : null}
      </div>
      <ScrollWrapper isBelowLgScreen={isBelowLgScreen}>
        {patients.length > 0 ? (
          patients.map((patient, index) => (
            <PatientTracking
              patient={patient}
              index={index}
              expanded={expanded}
              handleChange={handleChange}
              key={patient.rut}
            />
          ))
        ) : (
          <div className='flex justify-center items-center p-8 text-gray-500'>
            <Typography>No hay pacientes activos en este momento</Typography>
          </div>
        )}
      </ScrollWrapper>
    </Drawer>
  )
}

export default PatientSidebar
