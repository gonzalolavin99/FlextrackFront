// src/views/apps/logistics/dashboard/PatientStatisticsCard.tsx
'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import OptionMenu from '@core/components/option-menu'
import usePatientStore from '@/store/usePatientStore'
import CustomAvatar from '@core/components/mui/Avatar'

// Funciones para normalizar y obtener nombres de zonas
const normalizeZoneId = (zoneId: string = ''): string => {
  if (!zoneId) return 'unknown'

  // Convertir a minúsculas para normalizar
  const lowercaseId = zoneId.toLowerCase()

  // Manejar todas las posibles variantes
  if (lowercaseId.includes('pre') || lowercaseId.includes('anest')) {
    return 'preanestesia'
  } else if (lowercaseId.includes('pabell') || lowercaseId.includes('quirof')) {
    return 'pabellon'
  } else if (lowercaseId.includes('recup') || lowercaseId.includes('recu')) {
    return 'recuperacion'
  }

  return 'unknown'
}

// Datos simulados sobre promedio de tiempos por área
const averageTimeByArea = {
  preanestesia: 45, // 45 minutos promedio en pre-anestesia
  pabellon: 120, // 2 horas promedio en pabellón
  recuperacion: 90 // 1.5 horas promedio en recuperación
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
}

const PatientStatisticsCard = () => {
  // Estado para almacenar las estadísticas calculadas
  const [stats, setStats] = useState({
    totalPatients: 0,
    byZone: {
      preanestesia: 0,
      pabellon: 0,
      recuperacion: 0,
      unknown: 0
    },
    signalStatus: {
      active: 0,
      inactive: 0
    }
  })

  // Obtener datos de pacientes del store
  const { patients, simulatedTime } = usePatientStore()

  // Calcular estadísticas cuando cambian los pacientes o el tiempo
  useEffect(() => {
    if (!patients.length) {
      // Datos simulados si no hay pacientes
      setStats({
        totalPatients: 0,
        byZone: {
          preanestesia: 0,
          pabellon: 0,
          recuperacion: 0,
          unknown: 0
        },
        signalStatus: {
          active: 0,
          inactive: 0
        }
      })
      return
    }

    // Inicializar contadores
    const zoneCounter = {
      preanestesia: 0,
      pabellon: 0,
      recuperacion: 0,
      unknown: 0
    }

    let activeSignals = 0
    let inactiveSignals = 0

    // Contar pacientes por zona y estado de señal
    patients.forEach(patient => {
      const zone = normalizeZoneId(patient.ubicacion_actual)

      // Contar por zona
      if (zone in zoneCounter) {
        zoneCounter[zone as keyof typeof zoneCounter]++
      } else {
        zoneCounter.unknown++
      }

      // Contar por estado de señal
      if (patient.signalStatus === 'active') {
        activeSignals++
      } else {
        inactiveSignals++
      }
    })

    // Actualizar estadísticas
    setStats({
      totalPatients: patients.length,
      byZone: zoneCounter,
      signalStatus: {
        active: activeSignals,
        inactive: inactiveSignals
      }
    })
  }, [patients, simulatedTime])

  const patientStatisticsData = [
    {
      icon: 'ri-user-line',
      heading: 'Total Pacientes',
      count: stats.totalPatients,
      color: 'primary' as 'primary'
    },
    {
      icon: 'ri-medicine-bottle-line',
      heading: 'Pre-anestesia',
      count: stats.byZone.preanestesia,
      time: formatDuration(averageTimeByArea.preanestesia),
      color: 'warning' as 'warning'
    },
    {
      icon: 'ri-surgical-mask-line',
      heading: 'Pabellón',
      count: stats.byZone.pabellon,
      time: formatDuration(averageTimeByArea.pabellon),
      color: 'error' as 'error'
    },
    {
      icon: 'ri-hotel-bed-line',
      heading: 'Recuperación',
      count: stats.byZone.recuperacion,
      time: formatDuration(averageTimeByArea.recuperacion),
      color: 'success' as 'success'
    }
  ]

  return (
    <Card>
      <CardHeader
        title='Estado de Pacientes'
        subheader={simulatedTime ? `Tiempo simulado: ${simulatedTime.toLocaleString('es-CL')}` : 'Tiempo real'}
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Share']} />}
      />
      <CardContent>
        <Grid container spacing={4}>
          {patientStatisticsData.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' color={item.color} variant='rounded' sx={{ mr: 3 }}>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <Box>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {item.heading}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h5'>{item.count}</Typography>
                    {item.time && (
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        Tiempo promedio: {item.time}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Estado de señales */}
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'success.main'
              }}
            ></Box>
            <Typography>Beacons activos: {stats.signalStatus.active}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'warning.main'
              }}
            ></Box>
            <Typography>Beacons inactivos: {stats.signalStatus.inactive}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PatientStatisticsCard
