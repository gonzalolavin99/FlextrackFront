// src/types/interfaces.ts
export interface BeaconReading {
    id: number;
    RSSI: string | null;
    beaconMacAddress: string | null;
    comAddress: string | null;
    created_at: Date;
    echobeaconId: string | null;
    echopackletType: string | null;
    eddestoneBatteryVoltage: string | null;
    eddystoneTemperature: string | null;
    id_datalisten: number | null;
    id_lectura: number | null;
    iddIdfield: string | null;
    rssiX: string | null;
    status: number | null;
    id_hospital: number | null;
    dis_mts_log_fabrica: number | null;
  }
  
  export interface ProcessedBeaconData {
    rut: string;
    ubicacion_actual: string;
    ultima_actualizacion: Date;
    beacon_mac: string;
    rssi: number;
    distancia: number;
    x: number;
    y: number;
    ing_preanestesia: Date | null;
    sal_preanestesia: Date | null;
    ingreso_pabellon: Date | null;
    salida_pabellon: Date | null;
    ingreso_recu: Date | null;
    salida_recu: Date | null;
  }
  
  export interface TimelineZone {
    ingreso: Date | null;
    salida: Date | null;
    duracion: number | null;
    isActive: boolean;
  }
  
  export interface Timeline {
    preAnestesia: TimelineZone;
    pabellon: TimelineZone;
    recuperacion: TimelineZone;
  }
  
  export interface PatientInfo {
    rut: string;
    tag: string;
    fecha: Date;
    ing_preanestesia: Date | null;
    sal_preanestesia: Date | null;
    ingreso_pabellon: Date | null;
    salida_pabellon: Date | null;
    ingreso_recu: Date | null;
    salida_recu: Date | null;
  }