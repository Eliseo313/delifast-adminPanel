import React, { useState, useEffect, useMemo } from 'react';
import URL_BASE from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faBagShopping,
  faStore,
  faBuildingColumns,
  faArrowTrendUp,
  faMoneyBillWave,
  faRotateRight,
  faSpinner,
  faCheckCircle,
  faClock,
  faCircleExclamation,
  faReceipt,
  faSearch,
  faChevronRight,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function MetricasAdminPage() {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busquedaRestaurante, setBusquedaRestaurante] = useState('');

  const obtenerMetricas = async () => {
    try {
      setCargando(true);
      setError('');

      const storedUser = JSON.parse(localStorage.getItem('userAP'));
      const token = storedUser?.vToken;

      const response = await fetch(`${URL_BASE}/obtenerMetricasAdmin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await response.json();

      if (res.status === 200 && res.data) {
        setMetricas(res.data);
      } else {
        setError(res.message || 'Error al obtener las métricas del sistema');
      }
    } catch (err) {
      setError('Error de conexión al cargar métricas: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerMetricas();
  }, []);

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad || 0);
  };

  const restaurantesFiltrados = useMemo(() => {
    if (!metricas?.pedidosPorRestaurante) return [];
    if (!busquedaRestaurante.trim()) return metricas.pedidosPorRestaurante;

    const q = busquedaRestaurante.toLowerCase();
    return metricas.pedidosPorRestaurante.filter((r) =>
      r.vNombreRestaurante.toLowerCase().includes(q)
    );
  }, [metricas, busquedaRestaurante]);

  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#FF5252] mb-3" />
        <p className="text-xs sm:text-sm font-medium">Cargando métricas del ecosistema DeliSync...</p>
      </div>
    );
  }

  const {
    totalesGlobales = {},
    pedidosPorRestaurante = [],
    resumenLiquidaciones = {},
    gananciasStripePlataforma = {}
  } = metricas || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center text-sm font-bold">
              <FontAwesomeIcon icon={faChartPie} />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Panel Administrativo de Métricas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resumen global de pedidos procesados, saldo en Stripe y balance de liquidaciones
          </p>
        </div>

        <button
          onClick={obtenerMetricas}
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faRotateRight} className={cargando ? 'animate-spin text-slate-400' : 'text-slate-600'} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-3">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-base shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* BLOQUE 1: Métricas Globales Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pedidos Hechos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total de Pedidos
            </span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faBagShopping} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalesGlobales.totalPedidos?.toLocaleString('es-MX') || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalesGlobales.pedidosEntregados || 0} entregados • {totalesGlobales.pedidosCancelados || 0} cancelados
            </p>
          </div>
        </div>

        {/* Facturación Total Acumulada */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Facturado
            </span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faArrowTrendUp} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatearMoneda(totalesGlobales.montoTotalPedidos)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ticket promedio: {formatearMoneda(totalesGlobales.ticketPromedio)}
            </p>
          </div>
        </div>

        {/* Próximo Depósito Stripe a Mi Cuenta */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
              Próximo Depósito Stripe
            </span>
            <span className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center text-sm backdrop-blur-xs">
              <FontAwesomeIcon icon={faBuildingColumns} />
            </span>
          </div>
          <div className="mt-3 relative z-10">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {formatearMoneda(gananciasStripePlataforma.proximoDepositoEstimado)}
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              {gananciasStripePlataforma.pendiente > 0 
                ? `Disp: ${formatearMoneda(gananciasStripePlataforma.disponible)} + Pend: ${formatearMoneda(gananciasStripePlataforma.pendiente)}`
                : 'Fondos disponibles listos para dispersión bancaria'}
            </p>
          </div>
          {/* Círculo decorativo */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-sm pointer-events-none" />
        </div>

        {/* Liquidaciones Pendientes a Restaurantes */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Por Liquidar a Restaurantes
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {formatearMoneda(resumenLiquidaciones.montoNetoPendiente)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{resumenLiquidaciones.conteoPendientes || 0} órdenes entregadas</span>
              <Link
                to="/liquidaciones"
                className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
              >
                Ver todas <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: Desglose de Liquidaciones Globales */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Estado Global de Liquidaciones
            </h3>
            <p className="text-xs text-slate-400">
              Resumen financiero de dispersiones de Stripe Connect hacia los restaurantes afiliados
            </p>
          </div>
          <Link
            to="/liquidaciones"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition"
          >
            <span>Ir al Gestor de Liquidaciones</span>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[11px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide block">
                Pendientes de dispersión bancaria
              </span>
              <div className="text-2xl font-black text-amber-800 mt-1">
                {formatearMoneda(resumenLiquidaciones.montoNetoPendiente)}
              </div>
              <p className="text-xs text-amber-600/90 mt-0.5">
                {resumenLiquidaciones.conteoPendientes} pedidos entregados (Monto bruto: {formatearMoneda(resumenLiquidaciones.montoBrutoPendiente)})
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">
                Total efectivamente liquidado
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                {formatearMoneda(resumenLiquidaciones.montoNetoPagado)}
              </div>
              <p className="text-xs text-emerald-600/90 mt-0.5">
                {resumenLiquidaciones.conteoPagados} pedidos conciliados (Monto bruto: {formatearMoneda(resumenLiquidaciones.montoBrutoPagado)})
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: Tabla de Pedidos y Ventas por Restaurante */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Total de Pedidos por Restaurante
            </h3>
            <p className="text-xs text-slate-400">
              Desglose detallado del volumen de ventas y liquidaciones por establecimiento
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <FontAwesomeIcon
              icon={faSearch}
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar restaurante..."
              value={busquedaRestaurante}
              onChange={(e) => setBusquedaRestaurante(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF5252]/20 focus:border-[#FF5252] outline-none transition text-slate-700"
            />
          </div>
        </div>

        {restaurantesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FontAwesomeIcon icon={faStore} className="text-3xl text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No se encontraron restaurantes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3 px-4">Restaurante</th>
                  <th className="py-3 px-4 text-center">Total Pedidos</th>
                  <th className="py-3 px-4 text-center">Entregados</th>
                  <th className="py-3 px-4 text-right">Monto Bruto Vendido</th>
                  <th className="py-3 px-4 text-center">Por Liquidar</th>
                  <th className="py-3 px-4 text-right">Neto Pendiente</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {restaurantesFiltrados.map((rest) => (
                  <tr key={rest.idRestaurante} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {rest.vImagen ? (
                            <img
                              src={rest.vImagen}
                              alt={rest.vNombreRestaurante}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            rest.vNombreRestaurante.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">
                            {rest.vNombreRestaurante}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            ID: #{rest.idRestaurante}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {rest.totalPedidos}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-emerald-600">
                      {rest.pedidosEntregados}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatearMoneda(rest.montoTotalVendido)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {rest.liquidacionesPendientes > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          {rest.liquidacionesPendientes} pend.
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">
                      {formatearMoneda(rest.montoNetoPendienteLiquidar)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/liquidaciones`}
                        className="text-xs font-semibold text-[#FF5252] hover:text-[#E04040] hover:underline"
                      >
                        Ver órdenes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
