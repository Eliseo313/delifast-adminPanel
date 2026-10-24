import React, { useState, useEffect, useMemo } from 'react';
import URL_BASE from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faServer,
  faHardDrive,
  faMemory,
  faMicrochip,
  faDatabase,
  faRotateRight,
  faSpinner,
  faCheckCircle,
  faTriangleExclamation,
  faCircleExclamation,
  faChartLine,
  faQrcode,
  faBagShopping,
  faUsers,
  faClock,
  faCloud,
  faLightbulb,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons';

export default function ServidorInfraestructuraPage() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [metricaActiva, setMetricaActiva] = useState('pedidos'); // 'pedidos' | 'escaneos' | 'usuarios'
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);

  const consultarEstado = async () => {
    try {
      setCargando(true);
      setError('');

      const storedUser = JSON.parse(localStorage.getItem('userAP'));
      const token = storedUser?.vToken;

      const response = await fetch(`${URL_BASE}/obtenerEstadoServidor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await response.json();

      if (res.status === 200 && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Error al obtener telemetría del servidor');
      }
    } catch (err) {
      setError('Error de conexión con el servidor: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarEstado();
  }, []);

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad || 0);
  };

  // Color de badge y barra según porcentaje
  const obtenerColorPorcentaje = (pct) => {
    if (pct >= 85) return { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' };
    if (pct >= 70) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  // Datos para la gráfica según la pestaña activa
  const { puntosGrafica, maxValor, valorTotalPeriodo } = useMemo(() => {
    if (!data?.trafico14d?.serie) {
      return { puntosGrafica: [], maxValor: 1, valorTotalPeriodo: 0 };
    }

    const serie = data.trafico14d.serie;
    let valores = [];
    let total = 0;

    if (metricaActiva === 'pedidos') {
      valores = serie.map((d) => ({
        fecha: d.fecha,
        label: d.diaLabel,
        valor: d.totalPedidos,
        subvalor: d.montoVendido
      }));
      total = data.trafico14d.resumen.totalPedidos;
    } else if (metricaActiva === 'escaneos') {
      valores = serie.map((d) => ({
        fecha: d.fecha,
        label: d.diaLabel,
        valor: d.totalEscaneosQR
      }));
      total = data.trafico14d.resumen.totalEscaneosQR;
    } else {
      valores = serie.map((d) => ({
        fecha: d.fecha,
        label: d.diaLabel,
        valor: d.nuevosUsuarios
      }));
      total = data.trafico14d.resumen.totalNuevosUsuarios;
    }

    const max = Math.max(...valores.map((v) => v.valor), 5);
    return { puntosGrafica: valores, maxValor: max, valorTotalPeriodo: total };
  }, [data, metricaActiva]);

  if (cargando && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#FF5252] mb-3" />
        <p className="text-xs sm:text-sm font-medium">Consultando telemetría del servidor Ubuntu...</p>
      </div>
    );
  }

  const { hardware = {}, entorno = {}, alertas = [], estadoGeneral = 'optimo' } = data || {};
  const { disco = {}, memoria = {}, cpu = {}, baseDatos = {} } = hardware;

  const colorDisco = obtenerColorPorcentaje(disco.porcentaje || 0);
  const colorRam = obtenerColorPorcentaje(memoria.porcentaje || 0);

  // SVG Dimensiones y Coordenadas para la gráfica
  const widthSVG = 700;
  const heightSVG = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphWidth = widthSVG - paddingX * 2;
  const graphHeight = heightSVG - paddingY * 2;

  const puntosCoordenadas = puntosGrafica.map((p, idx) => {
    const x = paddingX + (idx / Math.max(1, puntosGrafica.length - 1)) * graphWidth;
    const y = heightSVG - paddingY - (p.valor / maxValor) * graphHeight;
    return { ...p, x, y };
  });

  const pathD = puntosCoordenadas.length > 0
    ? puntosCoordenadas.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '')
    : '';

  const areaD = puntosCoordenadas.length > 0
    ? `${pathD} L ${puntosCoordenadas[puntosCoordenadas.length - 1].x} ${heightSVG - paddingY} L ${puntosCoordenadas[0].x} ${heightSVG - paddingY} Z`
    : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Encabezado principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center text-sm font-bold">
              <FontAwesomeIcon icon={faServer} />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Servidor e Infraestructura
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Telemetría en tiempo real del Droplet de DigitalOcean, uso de recursos y métricas de tráfico
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge de Estado del Droplet */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              estadoGeneral === 'critico'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : estadoGeneral === 'advertencia'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                estadoGeneral === 'critico'
                  ? 'bg-rose-500'
                  : estadoGeneral === 'advertencia'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span>
              {estadoGeneral === 'critico'
                ? 'Atención Inmediata'
                : estadoGeneral === 'advertencia'
                ? 'Recursos en Observación'
                : 'Droplet Operacional (Saludable)'}
            </span>
          </div>

          <button
            onClick={consultarEstado}
            disabled={cargando}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 active:scale-95 transition shadow-xs cursor-pointer"
          >
            <FontAwesomeIcon icon={faRotateRight} className={cargando ? 'animate-spin text-slate-400' : 'text-slate-600'} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-3">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-base shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Tarjetas de Telemetría de Hardware */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Almacenamiento en Disco (df -h) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Almacenamiento (Disco)
              </span>
              <span className={`w-8 h-8 rounded-xl ${colorDisco.light} ${colorDisco.text} flex items-center justify-center text-xs`}>
                <FontAwesomeIcon icon={faHardDrive} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {disco.porcentaje}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {disco.libreGB} GB libres
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${colorDisco.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, disco.porcentaje || 0)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Usado: <strong className="text-slate-700">{disco.usadoGB} GB</strong></span>
            <span>Total: <strong className="text-slate-700">{disco.totalGB} GB</strong></span>
          </div>
        </div>

        {/* Memoria RAM */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Memoria RAM
              </span>
              <span className={`w-8 h-8 rounded-xl ${colorRam.light} ${colorRam.text} flex items-center justify-center text-xs`}>
                <FontAwesomeIcon icon={faMemory} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {memoria.porcentaje}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {memoria.disponibleMB} MB libres
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${colorRam.bg} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, memoria.porcentaje || 0)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>En uso: <strong className="text-slate-700">{memoria.usadoMB} MB</strong></span>
            <span>Total: <strong className="text-slate-700">{memoria.totalMB} MB</strong></span>
          </div>
        </div>

        {/* Carga del Procesador (CPU Load) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Carga de CPU (Load)
              </span>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faMicrochip} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {cpu.load1m}
              </span>
              <span className="text-xs text-slate-400 ml-2">promedio 1 min</span>
            </div>

            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-slate-400 text-[10px]" />
              <span>Tiempo activo: <strong className="text-slate-700">{cpu.uptimeTexto || 'Reciente'}</strong></span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>5m: <strong className="text-slate-700">{cpu.load5m}</strong></span>
            <span>15m: <strong className="text-slate-700">{cpu.load15m}</strong></span>
            <span>Núcleos: <strong className="text-slate-700">{cpu.cores} vCPU</strong></span>
          </div>
        </div>

        {/* Base de Datos MySQL */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Base de Datos MySQL
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faDatabase} />
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {baseDatos.tamanoMB || 0} MB
              </span>
              <span className="text-xs text-slate-400 ml-2">en disco</span>
            </div>

            <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-[10px]" />
              <span>Esquema: <strong className="text-slate-700 font-mono text-[11px]">{baseDatos.nombre || 'delifast'}</strong></span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Tablas del sistema:</span>
            <strong className="text-slate-700">{baseDatos.totalTablas || 0} tablas</strong>
          </div>
        </div>
      </div>

      {/* 3. Motor de Diagnóstico y Sugerencias de Escalabilidad */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faLightbulb} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Diagnóstico y Sugerencias de Capacidad (DigitalOcean)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluación automática de límites para anticipar cuándo escalar recursos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertas.map((alerta, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                alerta.tipo === 'critico'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : alerta.tipo === 'advertencia'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <FontAwesomeIcon
                    icon={
                      alerta.tipo === 'critico'
                        ? faCircleExclamation
                        : alerta.tipo === 'advertencia'
                        ? faTriangleExclamation
                        : faCheckCircle
                    }
                    className={`text-xs ${
                      alerta.tipo === 'critico'
                        ? 'text-rose-600'
                        : alerta.tipo === 'advertencia'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {alerta.recurso}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900">
                  {alerta.titulo}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {alerta.mensaje}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 text-[11px] font-medium text-slate-700">
                <span className="font-bold text-slate-900">Sugerencia:</span> {alerta.accion}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Gráficas de Tráfico y Actividad de Usuarios (Últimos 14 días) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Tráfico y Actividad del Ecosistema (Últimos 14 días)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Correlación del uso de recursos del servidor con el volumen de actividad de clientes
            </p>
          </div>

          {/* Selector de Pestañas de Métricas */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setMetricaActiva('pedidos'); setPuntoSeleccionado(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                metricaActiva === 'pedidos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FontAwesomeIcon icon={faBagShopping} className={metricaActiva === 'pedidos' ? 'text-[#FF5252]' : 'text-slate-400'} />
              <span>Pedidos ({data?.trafico14d?.resumen?.totalPedidos || 0})</span>
            </button>

            <button
              onClick={() => { setMetricaActiva('escaneos'); setPuntoSeleccionado(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                metricaActiva === 'escaneos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FontAwesomeIcon icon={faQrcode} className={metricaActiva === 'escaneos' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>Escaneos QR ({data?.trafico14d?.resumen?.totalEscaneosQR || 0})</span>
            </button>

            <button
              onClick={() => { setMetricaActiva('usuarios'); setPuntoSeleccionado(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                metricaActiva === 'usuarios'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className={metricaActiva === 'usuarios' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>Nuevos ({data?.trafico14d?.resumen?.totalNuevosUsuarios || 0})</span>
            </button>
          </div>
        </div>

        {/* Resumen numérico rápido del período */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pedidos 14d</span>
            <span className="text-lg font-extrabold text-slate-800">
              {data?.trafico14d?.resumen?.totalPedidos || 0}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ventas 14d</span>
            <span className="text-lg font-extrabold text-slate-800">
              {formatearMoneda(data?.trafico14d?.resumen?.totalMontoVendido)}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Escaneos QR 14d</span>
            <span className="text-lg font-extrabold text-indigo-700">
              {data?.trafico14d?.resumen?.totalEscaneosQR || 0}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Nuevos Usuarios 14d</span>
            <span className="text-lg font-extrabold text-emerald-700">
              {data?.trafico14d?.resumen?.totalNuevosUsuarios || 0}
            </span>
          </div>
        </div>

        {/* Renderizado de la Gráfica SVG */}
        <div className="relative pt-2">
          {puntoSeleccionado && (
            <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg z-10 animate-in fade-in duration-100">
              <span className="font-bold">{puntoSeleccionado.label}:</span>{' '}
              {puntoSeleccionado.valor}{' '}
              {metricaActiva === 'pedidos' ? 'pedidos' : metricaActiva === 'escaneos' ? 'escaneos' : 'usuarios'}
              {puntoSeleccionado.subvalor !== undefined && (
                <span className="text-emerald-300 block text-[10px]">
                  {formatearMoneda(puntoSeleccionado.subvalor)}
                </span>
              )}
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${widthSVG} ${heightSVG}`}
              className="w-full h-56 select-none overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={metricaActiva === 'pedidos' ? '#FF5252' : metricaActiva === 'escaneos' ? '#4F46E5' : '#10B981'}
                    stopOpacity="0.25"
                  />
                  <stop
                    offset="100%"
                    stopColor={metricaActiva === 'pedidos' ? '#FF5252' : metricaActiva === 'escaneos' ? '#4F46E5' : '#10B981'}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>

              {/* Líneas horizontales de fondo */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = heightSVG - paddingY - pct * graphHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={widthSVG - paddingX}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                    >
                      {Math.round(pct * maxValor)}
                    </text>
                  </g>
                );
              })}

              {/* Área y Línea */}
              {puntosCoordenadas.length > 0 && (
                <>
                  <path d={areaD} fill="url(#areaGradient)" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={metricaActiva === 'pedidos' ? '#FF5252' : metricaActiva === 'escaneos' ? '#4F46E5' : '#10B981'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Puntos de datos interactivos */}
              {puntosCoordenadas.map((p, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setPuntoSeleccionado(p)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={puntoSeleccionado?.fecha === p.fecha ? '5' : '3.5'}
                    fill={puntoSeleccionado?.fecha === p.fecha ? '#1E293B' : '#FFFFFF'}
                    stroke={metricaActiva === 'pedidos' ? '#FF5252' : metricaActiva === 'escaneos' ? '#4F46E5' : '#10B981'}
                    strokeWidth="2"
                    className="transition-all"
                  />
                  {/* Etiquetas de fecha eje X */}
                  <text
                    x={p.x}
                    y={heightSVG - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748B"
                  >
                    {idx % 2 === 0 ? p.label : ''}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Ficha Técnica del Droplet & Entorno de Ejecución */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faCloud} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Especificaciones de Infraestructura DigitalOcean
            </h3>
            <p className="text-xs text-slate-400">
              Configuración del droplet y servicios de backend
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Servidor Web</span>
            <span className="font-semibold text-slate-700">{entorno.servidorWeb || 'Apache/2.4'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Motor PHP</span>
            <span className="font-semibold text-slate-700">PHP {entorno.phpVersion || '8.x'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sistema Operativo</span>
            <span className="font-semibold text-slate-700 truncate block" title={entorno.sistemaOperativo}>
              {entorno.sistemaOperativo || 'Ubuntu Server Linux'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Alojamiento</span>
            <span className="font-semibold text-slate-700">{entorno.digitalOceanRegion || 'DigitalOcean Droplet'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
