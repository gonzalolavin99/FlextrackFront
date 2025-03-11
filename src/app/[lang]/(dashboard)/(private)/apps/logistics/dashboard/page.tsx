// src/app/[lang]/apps/logistics/dashboard/page.tsx
//MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

//Component Imports
import PatientStatisticsCard from '@views/apps/logistics/dashboard/PatientStatisticsCard'
import LogisticsVehicleOverview from '@views/apps/logistics/dashboard/LogisticsVehicleOverview'
import LogisticsShipmentStatistics from '@views/apps/logistics/dashboard/LogisticsShipmentStatistics'
import LogisticsDeliveryPerformance from '@views/apps/logistics/dashboard/LogisticsDeliveryPerformance'
import LogisticsDeliveryExceptions from '@views/apps/logistics/dashboard/LogisticsDeliveryExceptions'
import LogisticsOrdersByCountries from '@/views/apps/logistics/dashboard/LogisticsOrdersByCountries'
import PatientTable from '@/views/apps/logistics/dashboard/PatientTable'
import TimeControlsWrapper from '@/views/apps/logistics/dashboard/TimeControlsWrapper'

//Data Imports
import { getLogisticsData, getStatisticsData } from '@/app/server/actions'

const LogisticsDashboard = async () => {
  // Vars
  const data = await getStatisticsData()
  const vehicleData = await getLogisticsData()

  return (
    <>
      <Grid container spacing={6}>
        {/* Tarjeta de estadísticas de pacientes */}
        <Grid item xs={12}>
          <PatientStatisticsCard />
        </Grid>

        {/* Tabla de pacientes */}
        <Grid item xs={12}>
          <PatientTable vehicleData={vehicleData?.vehicles} />
        </Grid>

        {/* Estadísticas adicionales */}
        <Grid item xs={12} md={6}>
          <LogisticsDeliveryPerformance />
        </Grid>
        <Grid item xs={12} md={6}>
          <LogisticsDeliveryExceptions />
        </Grid>
        <Grid item xs={12} md={6}>
          <LogisticsShipmentStatistics />
        </Grid>
        <Grid item xs={12} md={6}>
          <LogisticsOrdersByCountries />
        </Grid>
      </Grid>

      {/* Control de tiempo (fijo en la parte inferior) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1200, // Z-index alto para asegurar que esté por encima de todo
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 0
        }}
      >
        <TimeControlsWrapper />
      </Box>
    </>
  )
}

export default LogisticsDashboard
