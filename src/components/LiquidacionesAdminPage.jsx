import React, { useState, useEffect, useCallback } from 'react';
import URL_BASE from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMoneyBillWave,
  faCheckCircle,
  faClock,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faReceipt,
  faRotateRight,
  faCreditCard,
  faStore,
  faFilter,
  faTimes,
  faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';

export default function LiquidacionesAdminPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'paid'
  const [ordenes, setOrdenes] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [idRestauranteFiltro, setIdRestauranteFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const limit = 15;

  const [paginacion, setPaginacion] = useState({
    totalRegistros: 0,
    totalPaginas: 1,
    montoTotal: 0
  });

  const [resumen, setResumen] = useState({
    conteoPendientes: 0,
    montoPendientes: 0,
    conteoPagados: 0,
    montoPagados: 0
  });

  const COMISION_DELISYNC = 5.00;

  // Desglose de comisiones
  const calcularDesgloseComisiones = (totalPedido) => {
    const total = Number(totalPedido) || 0;
    const stripeBaseFee = (total * 0.036) + 3.00;
    const stripeIva = stripeBaseFee * 0.16;
    const comisionStripeTotal = stripeBaseFee + stripeIva;
    const totalDescuentos = comisionStripeTotal + COMISION_DELISYNC;
    const neto = Math.max(0, total - totalDescuentos);
    return {
      stripeBaseFee,
      stripeIva,
      comisionStripeTotal,
      comisionDeliSync: COMISION_DELISYNC,
      totalDescuentos,
      neto
    };
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad || 0);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return fechaStr;
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cargar lista de restaurantes para el selector de filtro
  useEffect(() => {
    const cargarRestaurantes = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('userAP'));
        const token = storedUser?.vToken;
        const res = await fetch(`${URL_BASE}/obtenerMetricasAdmin`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.status === 200 && data.data?.pedidosPorRestaurante) {
          setRestaurantes(data.data.pedidosPorRestaurante);
        }
      } catch (err) {
        console.error('Error al cargar lista de restaurantes', err);
      }
    };
    cargarRestaurantes();
  }, []);

  // Consultar liquidaciones con soporte global y filtro por restaurante
  const fetchLiquidaciones = useCallback(async (targetPage = page, targetTab = activeTab, targetRest = idRestauranteFiltro) => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('userAP'));
      const token = storedUser?.vToken;
      let url = `${URL_BASE}/obtenerLiquidaciones?payout_status=${targetTab}&page=${targetPage}&limit=${limit}`;
      if (targetRest) {
        url += `&idRestaurante=${targetRest}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.status === 200) {
        setOrdenes(result.data.ordenes || []);
        setPaginacion(result.data.paginacion || { totalRegistros: 0, totalPaginas: 1, montoTotal: 0 });
        if (result.data.resumen) {
          setResumen(result.data.resumen);
        }
      } else {
        setOrdenes([]);
      }
    } catch (error) {
      console.error('Error de conexión al cargar liquidaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [limit, page, activeTab, idRestauranteFiltro]);

  useEffect(() => {
    fetchLiquidaciones(page, activeTab, idRestauranteFiltro);
  }, [page, activeTab, idRestauranteFiltro, fetchLiquidaciones]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    setPage(1);
  };

  const handleRestauranteChange = (e) => {
    setIdRestauranteFiltro(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Liquidaciones a Restaurantes
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Control global de dispersiones pendientes y transferencias completadas de todos los restaurantes
          </p>
        </div>

        <button
          onClick={() => fetchLiquidaciones(page, activeTab, idRestauranteFiltro)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotateRight} className={loading ? 'animate-spin text-slate-400' : 'text-slate-600'} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-xs flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block truncate">
              Neto por Dispersar (Entregadas)
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatearMoneda(resumen.montoPendientes)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {resumen.conteoPendientes} {resumen.conteoPendientes === 1 ? 'orden entregada' : 'órdenes entregadas'} por pagar
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <FontAwesomeIcon icon={faClock} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200/70 shadow-xs flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block truncate">
              Neto Total Transferido
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatearMoneda(resumen.montoPagados)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {resumen.conteoPagados} {resumen.conteoPagados === 1 ? 'orden liquidada' : 'órdenes liquidadas'} a restaurantes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Selector de Restaurante */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Pestañas de Estatus */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => handleTabChange('pending')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FontAwesomeIcon icon={faClock} className={activeTab === 'pending' ? 'text-amber-500' : 'text-slate-400'} />
            <span>Por Depositar</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
              {resumen.conteoPendientes}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('paid')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'paid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className={activeTab === 'paid' ? 'text-emerald-500' : 'text-slate-400'} />
            <span>Depositados</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {resumen.conteoPagados}
            </span>
          </button>
        </div>

        {/* Filtro por Restaurante */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={idRestauranteFiltro}
              onChange={handleRestauranteChange}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF5252]/20 focus:border-[#FF5252] outline-none text-slate-700 font-medium cursor-pointer transition-all"
            >
              <option value="">Todos los restaurantes</option>
              {restaurantes.map((rest) => (
                <option key={rest.idRestaurante} value={rest.idRestaurante}>
                  {rest.vNombreRestaurante} {rest.liquidacionesPendientes > 0 ? `(${rest.liquidacionesPendientes} pend.)` : ''}
                </option>
              ))}
            </select>
          </div>
          {idRestauranteFiltro && (
            <button
              onClick={() => { setIdRestauranteFiltro(''); setPage(1); }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Quitar filtro"
            >
              <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor de Órdenes */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#FF5252] mb-3" />
            <p className="text-xs sm:text-sm font-medium">Cargando liquidaciones del sistema...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FontAwesomeIcon icon={faReceipt} className="text-4xl text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">Sin órdenes en este estatus</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'pending'
                ? 'No hay órdenes entregadas pendientes de liquidación para el criterio seleccionado.'
                : 'Aún no se han registrado transferencias de fondos para el criterio seleccionado.'}
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (< md): Tarjetas ergonómicas */}
            <div className="block md:hidden divide-y divide-slate-100">
              {ordenes.map((orden) => {
                const desglose = calcularDesgloseComisiones(orden.dTotal);
                const netoFinal = orden.dMontoNeto !== undefined ? Number(orden.dMontoNeto) : desglose.neto;
                const totalDescuentos = orden.dTotalComisiones !== undefined ? Number(orden.dTotalComisiones) : desglose.totalDescuentos;

                return (
                  <div
                    key={orden.idPedido}
                    onClick={() => setOrdenSeleccionada(orden)}
                    className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          #{orden.idPedido}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {orden.vNombreRestaurante || 'Restaurante'}
                          </p>
                          <p className="text-[11px] text-slate-400">{formatearFecha(orden.dFechaHora)}</p>
                        </div>
                      </div>

                      {orden.payout_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Depositado
                        </span>
                      ) : orden.payout_status === 'in_transit' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          En Tránsito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Por Depositar
                        </span>
                      )}
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                          Neto Restaurante
                        </span>
                        <div className="text-lg font-black text-emerald-700">
                          {formatearMoneda(netoFinal)}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Cobro total: {formatearMoneda(orden.dTotal)}</span>
                        <span className="text-xs text-rose-500 font-medium block">Deducciones: -{formatearMoneda(totalDescuentos)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISTA ESCRITORIO (>= md): Tabla completa */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Restaurante</th>
                    <th className="py-3 px-4">Fecha Pedido</th>
                    <th className="py-3 px-4 text-right">Total Pedido</th>
                    <th className="py-3 px-4 text-right">Comisión Stripe</th>
                    <th className="py-3 px-4 text-right">DeliSync Fee</th>
                    <th className="py-3 px-4 text-right">Neto Restaurante</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {ordenes.map((orden) => {
                    const desglose = calcularDesgloseComisiones(orden.dTotal);
                    const netoFinal = orden.dMontoNeto !== undefined ? Number(orden.dMontoNeto) : desglose.neto;
                    const stripeFee = orden.dComisionStripe !== undefined ? Number(orden.dComisionStripe) : desglose.comisionStripeTotal;
                    const delisyncFee = orden.dComisionDeliSync !== undefined ? Number(orden.dComisionDeliSync) : desglose.comisionDeliSync;

                    return (
                      <tr key={orden.idPedido} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          #{orden.idPedido}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faStore} className="text-slate-400 text-xs" />
                            <span className="truncate max-w-[150px]">{orden.vNombreRestaurante || `Restaurante #${orden.idRestaurante}`}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatearFecha(orden.dFechaHora)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {formatearMoneda(orden.dTotal)}
                        </td>
                        <td className="py-3 px-4 text-right text-rose-500 font-medium">
                          -{formatearMoneda(stripeFee)}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-medium">
                          -{formatearMoneda(delisyncFee)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 bg-emerald-50/30">
                          {formatearMoneda(netoFinal)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {orden.payout_status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Depositado
                            </span>
                          ) : orden.payout_status === 'in_transit' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              En Tránsito
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Por Depositar
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setOrdenSeleccionada(orden)}
                            className="text-xs font-semibold text-[#FF5252] hover:text-[#E04040] hover:underline cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Página <strong>{paginacion.paginaActual}</strong> de <strong>{paginacion.totalPaginas}</strong> ({paginacion.totalRegistros} pedidos)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-1" /> Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(paginacion.totalPaginas, p + 1))}
                    disabled={page >= paginacion.totalPaginas}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                  >
                    Siguiente <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detalle de Liquidación de Pedido */}
      {ordenSeleccionada && (() => {
        const total = Number(ordenSeleccionada.dTotal) || 0;
        const subtotal = Number(ordenSeleccionada.dSubtotal) || total;
        const costoEnvio = Number(ordenSeleccionada.dCostoEnvio) || 0;
        const desglose = calcularDesgloseComisiones(total);
        const neto = ordenSeleccionada.dMontoNeto !== undefined ? Number(ordenSeleccionada.dMontoNeto) : desglose.neto;
        const stripeBase = desglose.stripeBaseFee;
        const stripeIva = desglose.stripeIva;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center font-bold text-sm">
                    #{ordenSeleccionada.idPedido}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      Detalle de Liquidación
                    </h3>
                    <p className="text-xs text-slate-400">
                      {ordenSeleccionada.vNombreRestaurante} • {formatearFecha(ordenSeleccionada.dFechaHora)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Cuadro destacado neto */}
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center">
                  <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                    Ganancia Neta para el Restaurante
                  </span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    {formatearMoneda(neto)}
                  </div>
                  <p className="text-[11px] text-emerald-700/80 mt-1">
                    Monto transferido por Stripe Connect tras deducciones de procesamiento y servicio DeliSync
                  </p>
                </div>

                {/* Desglose matemático */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Desglose del Pedido
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs">
                    {subtotal !== total && (
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal alimentos:</span>
                        <span className="font-medium">{formatearMoneda(subtotal)}</span>
                      </div>
                    )}
                    {costoEnvio > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Costo de envío:</span>
                        <span className="font-medium">{formatearMoneda(costoEnvio)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                      <span>Total cobrado al cliente:</span>
                      <span>{formatearMoneda(total)}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-1">
                    Deducciones y Comisiones
                  </h4>
                  <div className="space-y-2 text-xs bg-rose-50/50 border border-rose-100 rounded-xl p-3">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCreditCard} className="text-slate-400" />
                        Comisión base Stripe (3.6% + $3.00 MXN):
                      </span>
                      <span className="font-semibold text-rose-600">-{formatearMoneda(stripeBase)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>IVA sobre comisión Stripe (16%):</span>
                      <span className="font-semibold text-rose-600">-{formatearMoneda(stripeIva)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Tarifa fija DeliSync Platform:</span>
                      <span className="font-semibold text-rose-600">-{formatearMoneda(COMISION_DELISYNC)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t border-rose-200 text-xs">
                      <span>Total descuentos aplicados:</span>
                      <span className="text-rose-600 text-sm">-{formatearMoneda(desglose.totalDescuentos)}</span>
                    </div>
                  </div>
                </div>

                {/* Datos técnicos Stripe */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado de dispersión:</span>
                    <span className="font-semibold text-slate-800">
                      {ordenSeleccionada.payout_status === 'paid' ? 'Depositado' : 'Pendiente de dispersión'}
                    </span>
                  </div>
                  {ordenSeleccionada.payout_date && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha de depósito:</span>
                      <span className="font-semibold text-slate-800">{formatearFecha(ordenSeleccionada.payout_date)}</span>
                    </div>
                  )}
                  {ordenSeleccionada.stripe_payout_id && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-slate-400">ID Payout Stripe:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] truncate max-w-[200px]">
                        {ordenSeleccionada.stripe_payout_id}
                      </span>
                    </div>
                  )}
                  {ordenSeleccionada.vPaymentIntentId && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Payment Intent:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] truncate max-w-[200px]">
                        {ordenSeleccionada.vPaymentIntentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="px-5 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
