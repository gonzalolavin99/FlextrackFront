// src/views/apps/logistics/dashboard/PatientTable.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Store y Tipos
import usePatientStore from '@/store/usePatientStore'
import { ThemeColor } from '@core/types'

// Estilo de tabla
import tableStyles from '@core/styles/table.module.css'

// Tipo para datos de procedimiento (simulados)
interface ProcedureInfo {
  name: string
  physician: string
  room: string
}

// Datos de ejemplo para procedimientos
const DEMO_PROCEDURES: Record<string, ProcedureInfo> = {
  '8953590': {
    name: 'Artroplastia de rodilla',
    physician: 'Dr. Alejandro Rodríguez',
    room: 'Pabellón 2'
  },
  '25318261K': {
    name: 'Hernia inguinal',
    physician: 'Dra. María González',
    room: 'Pabellón 4'
  },
  '8948083': {
    name: 'Extracción de apéndice',
    physician: 'Dr. Carlos Méndez',
    room: 'Pabellón 1'
  },
  // Procedimientos genéricos para otros pacientes
  default1: {
    name: 'Colecistectomía',
    physician: 'Dr. Juan Pérez',
    room: 'Pabellón 3'
  },
  default2: {
    name: 'Apendicectomía',
    physician: 'Dra. Ana Soto',
    room: 'Pabellón 2'
  },
  default3: {
    name: 'Cirugía de cataratas',
    physician: 'Dr. Roberto Vega',
    room: 'Pabellón 5'
  },
  default4: {
    name: 'Artroscopia',
    physician: 'Dr. Pedro Riquelme',
    room: 'Pabellón 1'
  }
}

// Función para obtener información de procedimiento (simulada)
const getProcedureInfo = (rut: string): ProcedureInfo => {
  // Intentar encontrar el procedimiento específico
  if (DEMO_PROCEDURES[rut]) {
    return DEMO_PROCEDURES[rut]
  }

  // Si no existe, asignar un procedimiento genérico basado en un hash simple del RUT
  const hash = rut.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 4, 0)
  return DEMO_PROCEDURES[`default${hash + 1}`]
}

// Funciones para formatear horas
const formatTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    return '-'
  }
}

// Función para calcular duración entre dos timestamps
const calculateDuration = (start: Date | string | null | undefined, end: Date | string | null | undefined): string => {
  if (!start) return '-'

  try {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()

    const diffMs = endDate.getTime() - startDate.getTime()
    const minutes = Math.floor(diffMs / 60000)

    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  } catch (error) {
    return '-'
  }
}

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

const getZoneName = (zoneId: string): string => {
  const normalizedId = normalizeZoneId(zoneId)

  switch (normalizedId) {
    case 'preanestesia':
      return 'Pre-anestesia'
    case 'pabellon':
      return 'Pabellón'
    case 'recuperacion':
      return 'Recuperación'
    default:
      return 'Desconocida'
  }
}

// Tipo para los datos de la tabla
interface PatientTableRow {
  rut: string
  ubicacion_actual: string
  tiempoEnZona: string
  ing_preanestesia: Date | null
  sal_preanestesia: Date | null
  ingreso_pabellon: Date | null
  salida_pabellon: Date | null
  ingreso_recu: Date | null
  salida_recu: Date | null
  procedimiento: string
  medico: string
  sala: string
  signalStatus?: 'active' | 'inactive'
}

// Mapeo de colores para los chips
type ChipColorType = {
  color: ThemeColor
}

const chipColors: Record<string, ChipColorType> = {
  preanestesia: { color: 'warning' },
  pabellon: { color: 'error' },
  recuperacion: { color: 'success' },
  unknown: { color: 'primary' }
}

const PatientTable = ({ vehicleData }: any) => {
  // Estados
  const [rowSelection, setRowSelection] = useState({})
  const [tableData, setTableData] = useState<PatientTableRow[]>([])

  // Obtener datos del store
  const { patients, simulatedTime } = usePatientStore()

  // Preparar datos para la tabla cada vez que cambie patients o simulatedTime
  useEffect(() => {
    if (!patients.length) {
      // Si no hay pacientes reales, crear datos simulados basados en vehicleData
      if (vehicleData && vehicleData.length > 0) {
        const simulatedPatients = vehicleData.slice(0, 8).map((vehicle: any, index: number) => {
          const rut = `${1000000 + index * 87234}-${index % 10}`
          const zoneTypes = ['preanestesia', 'pabellon', 'recuperacion']
          const zoneIndex = index % 3
          const zone = zoneTypes[zoneIndex]

          // Crear tiempos simulados basados en el progreso del vehículo
          const baseTime = simulatedTime || new Date()
          const ingPreAnestesia = zoneIndex >= 0 ? new Date(baseTime.getTime() - 120 * 60000) : null
          const salPreAnestesia = zoneIndex >= 1 ? new Date(baseTime.getTime() - 70 * 60000) : null
          const ingPabellon = zoneIndex >= 1 ? new Date(baseTime.getTime() - 65 * 60000) : null
          const salPabellon = zoneIndex >= 2 ? new Date(baseTime.getTime() - 20 * 60000) : null
          const ingRecu = zoneIndex >= 2 ? new Date(baseTime.getTime() - 15 * 60000) : null
          const salRecu = null // Aún en recuperación

          // Calcular tiempo en zona actual
          let tiempoEnZona = '-'
          if (zone === 'preanestesia' && ingPreAnestesia) {
            tiempoEnZona = calculateDuration(ingPreAnestesia, salPreAnestesia || baseTime)
          } else if (zone === 'pabellon' && ingPabellon) {
            tiempoEnZona = calculateDuration(ingPabellon, salPabellon || baseTime)
          } else if (zone === 'recuperacion' && ingRecu) {
            tiempoEnZona = calculateDuration(ingRecu, salRecu || baseTime)
          }

          // Obtener información de procedimiento simulado
          const procedureInfo = getProcedureInfo(`default${(index % 4) + 1}`)

          return {
            rut,
            ubicacion_actual: zone,
            tiempoEnZona,
            ing_preanestesia: ingPreAnestesia,
            sal_preanestesia: salPreAnestesia,
            ingreso_pabellon: ingPabellon,
            salida_pabellon: salPabellon,
            ingreso_recu: ingRecu,
            salida_recu: salRecu,
            procedimiento: procedureInfo.name,
            medico: procedureInfo.physician,
            sala: procedureInfo.room,
            signalStatus: vehicle.warnings === 'No Warnings' ? 'active' : 'inactive'
          }
        })

        setTableData(simulatedPatients)
      } else {
        setTableData([])
      }
      return
    }

    const currentTime = simulatedTime || new Date()

    const mappedData = patients.map(patient => {
      // Determinar zona actual y tiempo en ella
      const normalizedZone = normalizeZoneId(patient.ubicacion_actual)
      let tiempoEnZona = '-'

      if (normalizedZone === 'preanestesia' && patient.ing_preanestesia) {
        tiempoEnZona = calculateDuration(patient.ing_preanestesia, patient.sal_preanestesia || currentTime)
      } else if (normalizedZone === 'pabellon' && patient.ingreso_pabellon) {
        tiempoEnZona = calculateDuration(patient.ingreso_pabellon, patient.salida_pabellon || currentTime)
      } else if (normalizedZone === 'recuperacion' && patient.ingreso_recu) {
        tiempoEnZona = calculateDuration(patient.ingreso_recu, patient.salida_recu || currentTime)
      }

      // Obtener información de procedimiento simulado
      const procedureInfo = getProcedureInfo(patient.rut)

      return {
        rut: patient.rut,
        ubicacion_actual: patient.ubicacion_actual,
        tiempoEnZona,
        ing_preanestesia: patient.ing_preanestesia || null,
        sal_preanestesia: patient.sal_preanestesia || null,
        ingreso_pabellon: patient.ingreso_pabellon || null,
        salida_pabellon: patient.salida_pabellon || null,
        ingreso_recu: patient.ingreso_recu || null,
        salida_recu: patient.salida_recu || null,
        procedimiento: procedureInfo.name,
        medico: procedureInfo.physician,
        sala: procedureInfo.room,
        signalStatus: patient.signalStatus || 'active'
      }
    })

    setTableData(mappedData)
  }, [patients, simulatedTime, vehicleData])

  // Definición de columnas
  const columnHelper = createColumnHelper<PatientTableRow>()

  const columns = useMemo<ColumnDef<PatientTableRow, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('rut', {
        header: 'RUT',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar skin='light' color={row.original.signalStatus === 'active' ? 'success' : 'warning'}>
              <i className='ri-user-line' />
            </CustomAvatar>
            <Typography color='text.primary'>{row.original.rut}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('ubicacion_actual', {
        header: 'Ubicación Actual',
        cell: ({ row }) => {
          const zone = normalizeZoneId(row.original.ubicacion_actual)
          const color = chipColors[zone]?.color || 'primary'

          return <Chip label={getZoneName(row.original.ubicacion_actual)} color={color} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('tiempoEnZona', {
        header: 'Tiempo en zona',
        cell: ({ row }) => <Typography>{row.original.tiempoEnZona}</Typography>
      }),
      columnHelper.accessor('procedimiento', {
        header: 'Procedimiento',
        cell: ({ row }) => <Typography>{row.original.procedimiento}</Typography>
      }),
      columnHelper.accessor('medico', {
        header: 'Médico',
        cell: ({ row }) => <Typography>{row.original.medico}</Typography>
      }),
      columnHelper.accessor('sala', {
        header: 'Sala',
        cell: ({ row }) => <Typography>{row.original.sala}</Typography>
      })
    ],
    [columnHelper]
  )

  // Configuración de la tabla
  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: 5
      }
    },
    filterFns: {
      fuzzy: () => true // Función de filtro simple para satisfacer el tipo
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title={`Pacientes Activos (${tableData.length})`}
        subheader={simulatedTime ? `Tiempo simulado: ${simulatedTime.toLocaleString('es-CL')}` : 'Tiempo real'}
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Update', 'Share']} />}
      />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='ri-arrow-up-s-line text-xl' />,
                          desc: <i className='ri-arrow-down-s-line text-xl' />
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {tableData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className='text-center py-4'>
                  No hay pacientes activos en este momento
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        className='border-bs'
        count={tableData.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default PatientTable
