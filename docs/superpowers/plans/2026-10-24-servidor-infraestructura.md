# Plan de Implementación: Monitor de Servidor e Infraestructura en DeliSync Admin Panel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar en `delifast-adminPanel` y `delifast-api` una sección completa y dedicada de "Servidor e Infraestructura" que abstraiga la telemetría del Droplet de DigitalOcean (almacenamiento en disco `/dev/vda1`, memoria RAM `/proc/meminfo`, carga de CPU, tamaño de la BD), visualice gráficas interactivas de tráfico de usuarios (pedidos, escaneos QR y nuevos registros) y ofrezca un motor de diagnóstico inteligente con alertas y sugerencias de escalado para DigitalOcean.

**Architecture:** Un endpoint seguro en PHP (`obtenerEstadoServidor.php`) recopila las métricas del sistema operativo Ubuntu y de MySQL, agregando el tráfico histórico y evaluando umbrales de diagnóstico. En el frontend, una vista React 19 (`ServidorInfraestructuraPage.jsx`) renderiza medidores de hardware, diagnósticos accionables y gráficas SVG responsivas integradas en el menú lateral de navegación.

**Tech Stack:** PHP 8, MySQL (PDO), Ubuntu Linux Server, React 19, Tailwind CSS v4, FontAwesome, React Router v7, Vite.

**Spec:** [docs/superpowers/specs/2026-10-24-servidor-infraestructura-design.md](file:///Users/eliseo/Desktop/Delisync/delifast-adminPanel/docs/superpowers/specs/2026-10-24-servidor-infraestructura-design.md)

## Global Constraints
- Idioma estricto en español para interfaces, comentarios y respuestas.
- Seguridad estricta: Endpoint protegido por JWT con rol exclusivo de administrador (`idRol = 3`).
- Mobile-first: Diseño 100% responsivo y fluido en smartphones y computadoras de escritorio.
- Cero sobrecarga: Sin daemons externos ni bibliotecas gigantescas; gráficas SVG nativas y ligeras.

## Review Focus
- Servidores sin `/proc/meminfo` o permisos restringidos: Proporcionar valores de respaldo seguros sin romper la respuesta.
- Cálculos de almacenamiento: Mostrar exactamente GB totales, GB usados y porcentaje alineados con `df -h`.
- Tráfico vacío o días sin pedidos: Asegurar que los últimos 14 días muestren ceros continuos en la serie temporal sin huecos ni errores matemáticos.
- Errores de red o token expirado: Mensajes amigables con botón de reintento.
- Alertas de escalado: Validar que un 30% de uso de disco se califique como "Óptimo" y que los umbrales de atención solo se activen cuando amerite.

---

### Task 1: Endpoint Backend `obtenerEstadoServidor.php`

**Files:**
- Create: `delifast-api/obtenerEstadoServidor.php`

**Steps:**
- [x] 1. Crear el archivo `delifast-api/obtenerEstadoServidor.php` con validación de método `GET` e inclusión de `bootstrap.php` y `authMiddleware.php`.
- [x] 2. Validar privilegios de administrador consultando `tblCredenciales` para asegurar `idRol = 3`.
- [x] 3. Implementar recolección de métricas de disco (`disk_total_space` y `disk_free_space` para `/`).
- [x] 4. Implementar analizador de `/proc/meminfo` para extraer `MemTotal`, `MemAvailable`, `MemFree`, `Buffers`, `Cached`, `SwapTotal` y `SwapFree`, calculando memoria en uso real y porcentaje.
- [x] 5. Implementar métricas de CPU (`sys_getloadavg`), uptime del sistema y conteo de núcleos.
- [x] 6. Consultar tamaño físico de la base de datos MySQL en megabytes mediante `information_schema.tables`.
- [x] 7. Consultar series de tráfico de los últimos 14 días (pedidos diarios y facturación desde `tblPedidos`, escaneos QR desde `tblEscaneosQR`, y nuevos clientes desde `tblUsuarios`), rellenando los días sin actividad con 0.
- [x] 8. Implementar motor de heurísticas y alertas con recomendaciones contextuales para el Droplet de DigitalOcean.
- [x] 9. Ejecutar `php -l obtenerEstadoServidor.php` para validar sintaxis limpia sin errores.

---

### Task 2: Componente Frontend `ServidorInfraestructuraPage.jsx`

**Files:**
- Create: `delifast-adminPanel/src/components/ServidorInfraestructuraPage.jsx`

**Steps:**
- [x] 1. Crear el componente `ServidorInfraestructuraPage.jsx` con consumo del endpoint `/obtenerEstadoServidor`.
- [x] 2. Diseñar la cabecera con estado general de salud del servidor (badge dinámico verde/ámbar/rojo), botón para refrescar datos y tiempo de actividad (*uptime* formateado).
- [x] 3. Diseñar las tarjetas de telemetría de hardware (Almacenamiento en disco `/dev/vda1`, Memoria RAM, Carga de CPU y Tamaño de Base de Datos) con barras de progreso y código de colores contextual.
- [x] 4. Diseñar la sección del Motor de Diagnóstico y Sugerencias de Escalado con tarjetas de recomendaciones específicas para DigitalOcean.
- [x] 5. Diseñar la sección de Gráficas de Tráfico y Actividad de Usuarios (SVG reactivo interactivo con pestañas: Pedidos, Escaneos QR y Usuarios Nuevos, con tooltips y puntos de datos).
- [x] 6. Diseñar la sección de Especificaciones Técnicas del Droplet (SO, versiones de PHP, Apache, MySQL y estado de conexión).
- [x] 7. Manejar estados de carga con *skeleton/spinner* y estados de error con reintento.

---

### Task 3: Enrutamiento y Navegación en `delifast-adminPanel`

**Files:**
- Modify: `delifast-adminPanel/src/components/Sidebar.jsx`
- Modify: `delifast-adminPanel/src/App.jsx`

**Steps:**
- [x] 1. En `Sidebar.jsx`, agregar el ítem de navegación `{ to: '/servidor', label: 'Servidor e Infraestructura', icon: faServer }`.
- [x] 2. En `App.jsx`, importar `ServidorInfraestructuraPage` y registrar la ruta protegida `<Route path="servidor" element={<ServidorInfraestructuraPage />} />`.

---

### Task 4: Verificación y Validación de Compilación

**Steps:**
- [x] 1. Ejecutar `npm run build` en `delifast-adminPanel` para comprobar que no existan errores de compilación, sintaxis o tipado en Vite y Tailwind.
- [x] 2. Verificar que el endpoint en `delifast-api` responda correctamente al estructurar la petición.
