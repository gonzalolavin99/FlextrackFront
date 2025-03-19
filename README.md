# Sistema de Seguimiento de Pacientes en Tiempo Real - Frontend

Este proyecto proporciona una interfaz de usuario para el Sistema de Seguimiento de Pacientes en Tiempo Real, permitiendo visualizar la ubicación y el movimiento de pacientes dentro de instalaciones médicas utilizando tecnología de beacons.

## Características

- 🗺️ Visualización en tiempo real de la ubicación de pacientes en un mapa del hospital
- 📊 Estadísticas de ocupación por zonas (pre-anestesia, pabellón, recuperación)
- ⏱️ Línea de tiempo detallada para cada paciente
- 🕰️ Control de tiempo para simulación histórica y visualización en tiempo real
- 📱 Diseño responsive para diferentes dispositivos

## Tecnologías

- React 18 con TypeScript
- Vite como bundler
- Zustand para gestión de estado
- TailwindCSS para estilos
- Socket.IO para comunicación en tiempo real
- React Leaflet para mapeo
- Recharts para visualizaciones y gráficos

## Requisitos previos

- Node.js >= 18.0.0
- npm o yarn

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/hospital-tracking.git
cd hospital-tracking/frontend
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

3. Crea un archivo `.env` basado en el ejemplo:

```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`:

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
# o 
yarn dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173`.

### Compilar para producción

```bash
npm run build
# o
yarn build
```

### Vista previa de producción

```bash
npm run preview
# o
yarn preview
```

## Estructura del proyecto

```
/frontend
├── /public             # Archivos estáticos
├── /src
│   ├── /components     # Componentes reutilizables
│   ├── /hooks          # Custom hooks
│   ├── /pages          # Páginas principales
│   ├── /services       # Servicios para API y lógica
│   ├── /store          # Gestión de estado (Zustand)
│   ├── /styles         # Estilos globales
│   ├── /types          # Definiciones de TypeScript
│   ├── /utils          # Utilidades
│   ├── /views          # Vistas y layouts
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Punto de entrada
└── /...                # Archivos de configuración
```

## Módulos principales

### `usePatientStore`

Este store gestiona los datos de pacientes y la conexión Socket.IO con el backend:

- Almacena la lista de pacientes activos
- Mantiene el estado de la conexión con el socket
- Proporciona métodos para seleccionar pacientes específicos
- Controla la simulación de tiempo para visualización histórica

### `LocationService`

Servicio para el cálculo y determinación de posiciones:

- Trilateration para posicionar pacientes basado en señales de beacons
- Asignación de pacientes a zonas específicas
- Cálculo de distancias y señales RSSI

### `TimelineService`

Servicio para la gestión de líneas de tiempo:

- Determina la zona actual de cada paciente basado en timestamps
- Calcula duraciones entre diferentes estados
- Sincroniza el tiempo de visualización con el backend

## Flujo de datos

1. El componente principal inicializa la conexión Socket.IO al montarse
2. El `usePatientStore` recibe actualizaciones en tiempo real del backend
3. Los componentes de visualización se suscriben al store para mostrar datos actualizados
4. El control de tiempo permite cambiar entre modo histórico y tiempo real

## Gestión de tiempo simulado

El sistema permite visualizar datos históricos mediante un control de tiempo que:

1. Permite seleccionar una fecha y hora específica
2. Simula la progresión del tiempo con diferentes velocidades
3. Envía la hora simulada al backend para recibir datos correspondientes a ese momento

## Funcionamiento con beacons

El sistema utiliza la tecnología de beacons para rastrear la ubicación de los pacientes:

1. Cada paciente lleva un beacon con un identificador único (MAC address)
2. Antenas (receptores) en diferentes ubicaciones del hospital detectan la señal
3. La intensidad de la señal (RSSI) se utiliza para calcular la distancia aproximada
4. Mediante trilateration, se determina la posición del paciente en el mapa
5. Basado en la posición y los tiempos registrados, se determina la zona actual

## Limitaciones conocidas

- El sistema requiere una adecuada configuración de beacons y antenas para la precisión del posicionamiento
- La simulación histórica depende de la disponibilidad de datos en la base de datos para la fecha seleccionada

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request