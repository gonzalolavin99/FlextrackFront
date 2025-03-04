// src/store/usePatientStore.ts
import { create } from 'zustand'
import io, { Socket } from 'socket.io-client'

export interface PatientLocation {
  rut: string
  ubicacion_actual: string
  ultima_actualizacion: Date
  beacon_mac: string
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

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
const TIME_WINDOW = 5 * 60 * 1000 // 5 minutos en milisegundos

let socketInstance: Socket | null = null

const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
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

        // Enviar la hora sin ajustes
        socket.emit('set:simulatedTime', time.toISOString())
        set({ simulatedTime: time })
      } catch (error) {
        console.error('Error al procesar la fecha')
      }
    }
  },

  initializeSocket: () => {
    if (socketInstance) {
      set({ socket: socketInstance })
      return
    }

    console.log('🔌 Conectando...')
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

    socketInstance.on('connect_error', () => {
      set({ error: 'Error de conexión' })
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
      set({ patients: filteredLocations })
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
