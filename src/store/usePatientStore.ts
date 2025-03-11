// src/store/usePatientStore.ts
import { create } from 'zustand'
import io, { Socket } from 'socket.io-client'

export interface PatientLocation {
  rut: string
  ubicacion_actual: string
  ultima_actualizacion: Date
  beacon_mac: string
  tag?: string // Para compatibilidad
  rssi: number
  distancia: number
  x: number
  y: number
  ing_preanestesia?: Date | null
  sal_preanestesia?: Date | null
  ingreso_pabellon?: Date | null
  salida_pabellon?: Date | null
  ingreso_recu?: Date | null
  salida_recu?: Date | null
  signalStatus?: 'active' | 'inactive'
  lastBeaconDetection?: Date | null
}

interface UpdateData {
  tiempo: string
  pacientes: number
  ubicaciones: PatientLocation[]
}

interface PatientStore {
  patients: PatientLocation[]
  selectedPatient: PatientLocation | null
  socket: Socket | null
  isLoading: boolean
  error: string | null
  connected: boolean
  simulatedTime: Date | null
  initializeSocket: () => void
  disconnectSocket: () => void
  setPatients: (patients: PatientLocation[]) => void
  updatePatientLocation: (rut: string, location: Partial<PatientLocation>) => void
  selectPatient: (rut: string | null) => void
  setSimulatedTime: (time: Date | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// URL del socket (ajusta según tu entorno)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
const TIME_WINDOW = 5 * 60 * 1000 // 5 minutos en milisegundos

let socketInstance: Socket | null = null

// Datos simulados para cuando no hay conexión a la API
const SIMULATED_PATIENTS: PatientLocation[] = [
  {
    rut: '12.345.678-9',
    ubicacion_actual: 'preanestesia',
    ultima_actualizacion: new Date(),
    beacon_mac: 'F378BFAE121A',
    tag: 'F378BFAE121A',
    rssi: -80,
    distancia: 2.5,
    x: 7.2,
    y: 1.8,
    ing_preanestesia: new Date(new Date().getTime() - 30 * 60000),
    sal_preanestesia: null,
    ingreso_pabellon: null,
    salida_pabellon: null,
    ingreso_recu: null,
    salida_recu: null,
    signalStatus: 'active'
  },
  {
    rut: '23.456.789-0',
    ubicacion_actual: 'pabellon',
    ultima_actualizacion: new Date(),
    beacon_mac: 'A187CE4D9B03',
    tag: 'A187CE4D9B03',
    rssi: -75,
    distancia: 1.8,
    x: 3.5,
    y: 4.0,
    ing_preanestesia: new Date(new Date().getTime() - 120 * 60000),
    sal_preanestesia: new Date(new Date().getTime() - 70 * 60000),
    ingreso_pabellon: new Date(new Date().getTime() - 65 * 60000),
    salida_pabellon: null,
    ingreso_recu: null,
    salida_recu: null,
    signalStatus: 'active'
  },
  {
    rut: '34.567.890-1',
    ubicacion_actual: 'recuperacion',
    ultima_actualizacion: new Date(),
    beacon_mac: 'D945FB1E7C82',
    tag: 'D945FB1E7C82',
    rssi: -90,
    distancia: 3.2,
    x: 7.5,
    y: 5.2,
    ing_preanestesia: new Date(new Date().getTime() - 180 * 60000),
    sal_preanestesia: new Date(new Date().getTime() - 140 * 60000),
    ingreso_pabellon: new Date(new Date().getTime() - 135 * 60000),
    salida_pabellon: new Date(new Date().getTime() - 35 * 60000),
    ingreso_recu: new Date(new Date().getTime() - 30 * 60000),
    salida_recu: null,
    signalStatus: 'inactive'
  }
]

const usePatientStore = create<PatientStore>((set, get) => ({
  patients: SIMULATED_PATIENTS, // Inicializar con datos simulados
  selectedPatient: null,
  socket: null,
  isLoading: false,
  error: null,
  connected: false,
  simulatedTime: null,

  setSimulatedTime: (time: Date | null) => {
    const { socket } = get()
    if (socket) {
      try {
        if (time === null) {
          socket.emit('set:simulatedTime', null)
          set({ simulatedTime: null })
          return
        }

        socket.emit('set:simulatedTime', time.toISOString())
        set({ simulatedTime: time })
      } catch (error) {
        console.error('Error al procesar la fecha')
      }
    } else {
      // Si no hay socket, simplemente actualizar la hora simulada
      set({ simulatedTime: time })
    }
  },

  initializeSocket: () => {
    if (socketInstance) {
      set({ socket: socketInstance })
      return
    }

    console.log('🔌 Intentando conectar...')

    // Intentar iniciar la conexión al socket
    try {
      socketInstance = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket'],
        autoConnect: true
      })

      socketInstance.on('connect', () => {
        console.log('✓ Conectado')
        set({ error: null, connected: true })
      })

      socketInstance.on('disconnect', () => {
        console.log('✗ Desconectado')
        set({ connected: false })
      })

      socketInstance.on('connect_error', error => {
        console.log('❌ Error de conexión:', error)
        set({
          error: 'Error de conexión al servidor',
          connected: false,
          patients: SIMULATED_PATIENTS // Usar datos simulados en caso de error
        })
      })

      socketInstance.on('locations:update', (data: UpdateData) => {
        if (!data?.ubicaciones || !Array.isArray(data.ubicaciones)) return

        const locations = data.ubicaciones.map(loc => ({
          ...loc,
          ultima_actualizacion: new Date(loc.ultima_actualizacion)
        }))

        const currentTime = get().simulatedTime?.getTime() || Date.now()
        const filteredLocations = locations.filter(location => {
          const locationTime = location.ultima_actualizacion.getTime()
          return Math.abs(currentTime - locationTime) <= TIME_WINDOW
        })

        console.log(`📍 ${data.tiempo} | ${filteredLocations.length} pacientes`)
        set({ patients: filteredLocations.length > 0 ? filteredLocations : SIMULATED_PATIENTS })
      })

      socketInstance.on('location:update', (location: PatientLocation) => {
        if (!location) return

        const updatedLocation = {
          ...location,
          ultima_actualizacion: new Date(location.ultima_actualizacion)
        }

        set((state: PatientStore) => ({
          patients: state.patients.map(patient => (patient.rut === location.rut ? updatedLocation : patient))
        }))
      })

      set({ socket: socketInstance })
    } catch (error) {
      console.error('Error al inicializar el socket:', error)
      set({
        error: 'Error al inicializar la conexión',
        patients: SIMULATED_PATIENTS // Usar datos simulados en caso de error
      })
    }
  },

  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }
    set({ socket: null, connected: false })
  },

  setPatients: (patients: PatientLocation[]) => set({ patients }),

  updatePatientLocation: (rut: string, location: Partial<PatientLocation>) =>
    set((state: PatientStore) => ({
      patients: state.patients.map(patient => (patient.rut === rut ? { ...patient, ...location } : patient))
    })),

  selectPatient: (rut: string | null) => {
    const { socket, selectedPatient } = get()

    if (selectedPatient?.rut && socket) {
      socket.emit('unsubscribe:patient', selectedPatient.rut)
    }

    if (rut && socket) {
      socket.emit('subscribe:patient', rut)
    }

    set((state: PatientStore) => ({
      selectedPatient: rut ? state.patients.find(p => p.rut === rut) ?? null : null
    }))
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error })
}))

export default usePatientStore
