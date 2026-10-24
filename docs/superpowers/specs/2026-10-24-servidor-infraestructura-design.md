# Documento de Diseño: Monitor de Servidor e Infraestructura en DeliSync Admin Panel

## 1. Intención y Propósito
El administrador de DeliSync necesita supervisar desde `delifast-adminPanel` el estado de salud, consumo de recursos y capacidad del Droplet de DigitalOcean donde corre la API y la base de datos (Ubuntu Server con Apache y PHP), abstrayendo comandos como `df -h` y `free -m`. Además, requiere monitorear el tráfico real de usuarios (pedidos, escaneos QR y nuevos registros) con gráficas interactivas y recibir alertas inteligentes que le indiquen cuándo es momento de aumentar almacenamiento o memoria RAM antes de que ocurra una saturación.

---

## 2. Objetivos, No-Objetivos y Anti-Objetivos

### Objetivos
- Visualizar el uso de disco del Droplet (`/dev/vda1`: total, usado, libre y porcentaje) tal como lo reporta `df -h`.
- Visualizar el uso real de memoria RAM y Swap desde `/proc/meminfo` (total, disponible, en uso y buffers/cache).
- Visualizar carga de CPU (`load average` a 1, 5 y 15 min) y tamaño de la base de datos MySQL en disco.
- Monitorear el tráfico y actividad de usuarios con gráficas interactivas responsivas (tendencias de pedidos, visitas/escaneos QR y nuevos registros por día).
- Proveer un motor de alertas y recomendaciones proactivas de escalado para DigitalOcean (evaluación de umbrales: Óptimo, Advertencia, Crítico).
- Proveer una nueva sección dedicada en el menú lateral (`/servidor`).

### No-Objetivos
- No se busca ejecutar comandos de administración remota destructivos (como reiniciar Apache o formatear discos) desde la web por motivos estrictos de seguridad.
- No se requiere instalar daemons externos de monitoreo que consuman la memoria limitada del Droplet de 1GB.

### Anti-Objetivos
- Evitar sobrecargar el Droplet con procesos pesados de telemetría en segundo plano.
- Evitar dependencias gigantescas en el frontend que perjudiquen el rendimiento o tiempo de carga móvil.

---

## 3. Restricciones Técnicas
- **Servidor:** Ubuntu Server en DigitalOcean con Apache y PHP 8 (`delifast-api`).
- **Seguridad:** Endpoint protegido por JWT; únicamente accesible para administradores (`idRol = 3`).
- **Base de Datos:** MySQL con soporte para borrado lógico (`bIsActive`).
- **Frontend:** React 19, Tailwind CSS v4, FontAwesome y React Router v7 (`delifast-adminPanel`).
- **Diseño:** 100% Mobile-first, ergonómico y estético en consonancia con el diseño existente de DeliSync.

---

## 4. Enfoques Considerados y Selección

- **Enfoque 1 (Seleccionado): Telemetría Nativa y Motor de Alertas Integrado.**
  - Lee directamente `/proc/meminfo`, `disk_free_space('/')`, `disk_total_space('/')`, `sys_getloadavg()` y métricas de MySQL en un endpoint PHP unificado.
  - Ofrece gráficas interactivas de tráfico SVG nativas/reactivas ligeras y recomendaciones automáticas de escalabilidad.
- **Enfoque 2 (Descartado): Integración con API de DigitalOcean y `do-agent`.**
  - Descartado porque requiere instalar agentes adicionales que consumen RAM del servidor, requiere tokens de API externos y no correlaciona la actividad interna de la app.

---

## 5. Arquitectura del Backend (`delifast-api/obtenerEstadoServidor.php`)

### Recolección de Datos:
1. **Almacenamiento en Disco:**
   - `disk_total_space('/')` y `disk_free_space('/')` para la partición raíz `/dev/vda1`.
   - Cálculo de GB totales, usados, disponibles y porcentaje de uso.
2. **Memoria RAM & Swap:**
   - Lectura de `/proc/meminfo`: `MemTotal`, `MemAvailable`, `MemFree`, `Buffers`, `Cached`, `SwapTotal`, `SwapFree`.
   - Cálculo de memoria real consumida por procesos (`MemTotal - MemAvailable`).
3. **Carga y Entorno:**
   - Carga de CPU con `sys_getloadavg()`.
   - Uptime de `/proc/uptime`.
   - Conteo de núcleos de `/proc/cpuinfo`.
   - Versión de PHP, Apache y tamaño en MB de la base de datos vía `information_schema.tables`.
4. **Tráfico de Usuarios (Últimos 14 días):**
   - Pedidos por día desde `tblPedidos` (`COUNT(*)` y volumen en `$`).
   - Escaneos y visitas QR desde `tblEscaneosQR`.
   - Registros de nuevos clientes desde `tblUsuarios`.
5. **Motor de Alertas y Diagnóstico:**
   - **Disco:**
     - `< 70%`: Óptimo (ej. 30% actual con 17GB libres: suficiente para meses de operación normal).
     - `70% - 85%`: Advertencia (sugerir limpieza de logs o agregar volumen de almacenamiento en DigitalOcean).
     - `> 85%`: Crítico (acción inmediata de redimensionar disco).
   - **RAM:**
     - `< 75%`: Estable.
     - `75% - 88%`: Atención (sugerir habilitar swap o verificar procesos Apache/MySQL).
     - `> 88%`: Crítico (riesgo de OOM killer; sugerir upgrade del Droplet de 1GB a 2GB).

---

## 6. Arquitectura del Frontend (`delifast-adminPanel`)

1. **Ruta y Navegación:**
   - Registrar la ruta `/servidor` en `App.jsx`.
   - Agregar el elemento "Servidor e Infraestructura" con icono de servidor (`faServer`) en `Sidebar.jsx`.
2. **Componente `ServidorInfraestructuraPage.jsx`:**
   - **Cabecera:** Estado global del servidor (badge "Operacional / Óptimo"), botón de actualización y tiempo de actividad (*uptime*).
   - **Métricas de Hardware:** Tarjetas con medidores porcentuales de Disco, RAM y Carga de CPU con barra de progreso estilizada y desglose de capacidades (GB usados vs disponibles).
   - **Motor de Alertas y Recomendaciones:** Caja de diagnóstico inteligente que analiza el estado actual y genera recomendaciones específicas para DigitalOcean.
   - **Gráficas de Tráfico:** Gráficas visuales interactivas de actividad diaria (pedidos, visitas/escaneos, usuarios), con pestañas para alternar métricas y tooltips al pasar el cursor.
   - **Especificaciones del Droplet:** Resumen técnico con versión de PHP, base de datos, tamaño de BD y detalles del sistema operativo.
