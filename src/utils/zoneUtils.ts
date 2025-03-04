// src/utils/zoneUtils.ts
export const normalizeZoneId = (zoneId: string): string => {
    if (!zoneId) return "unknown";
  
    // Convertir a minúsculas para comparaciones no sensibles a mayúsculas/minúsculas
    const lowerZoneId = zoneId.toLowerCase();
  
    if (lowerZoneId === "preanestesia") return "preAnestesia";
    if (lowerZoneId === "pabellon") return "pabellon";
    if (lowerZoneId === "recuperacion") return "recuperacion";
  
    // Si ya está correctamente formateado, devolverlo como está
    if (
      zoneId === "preAnestesia" ||
      zoneId === "pabellon" ||
      zoneId === "recuperacion"
    ) {
      return zoneId;
    }
  
    return "unknown";
  };
  
  export const getZoneName = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId);
  
    switch (normalizedId) {
      case "preAnestesia":
        return "Preanestesia";
      case "pabellon":
        return "Pabellón";
      case "recuperacion":
        return "Recuperación";
      default:
        return "Fuera de zona";
    }
  };
  
  export const getZoneColor = (zoneId: string): string => {
    const normalizedId = normalizeZoneId(zoneId);
  
    switch (normalizedId) {
      case "preAnestesia":
        return "warning";
      case "pabellon":
        return "error";
      case "recuperacion":
        return "success";
      default:
        return "info";
    }
  };