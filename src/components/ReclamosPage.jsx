import { useState, useEffect, useMemo } from 'react';
import ReclamoCard from './ReclamoCard';
import MensajeError from './MensajeError';
import URL_BASE from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faRotateRight,
  faInbox,
  faCheckCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';

export default function ReclamosPage() {
  const [reclamos, setReclamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'pendientes' | 'resueltos'
  const [busqueda, setBusqueda] = useState('');

  const obtenerReclamos = async () => {
    try {
      setCargando(true);
      setError('');

      const storedUser = JSON.parse(localStorage.getItem('userAP'));
      const token = storedUser?.vToken;

      const response = await fetch(`${URL_BASE}/obtenerReclamos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const res = await response.json();

      if (res.status === 200) {
        setReclamos(res.data || []);
      } else {
        setError(res.message || 'Error al obtener los reclamos');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerReclamos();
  }, []);

  // Métricas rápidas
  const totalPendientes = useMemo(
    () => reclamos.filter((r) => r.idEstadoReclamo !== 2).length,
    [reclamos]
  );
  const totalResueltos = useMemo(
    () => reclamos.filter((r) => r.idEstadoReclamo === 2).length,
    [reclamos]
  );

  // Filtrado reactivo en memoria (rápido y sin lag)
  const reclamosFiltrados = useMemo(() => {
    return reclamos.filter((reclamo) => {
      // Filtro de estado
      if (filtroEstado === 'pendientes' && reclamo.idEstadoReclamo === 2) return false;
      if (filtroEstado === 'resueltos' && reclamo.idEstadoReclamo !== 2) return false;

      // Filtro de texto (búsqueda por ID, descripción o dispositivo)
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase();
        const coincideId = reclamo.idReclamo?.toString().includes(query);
        const coincideDesc = reclamo.vDescripcion?.toLowerCase().includes(query);
        const coincideDisp = reclamo.vDispositivo?.toLowerCase().includes(query);
        return coincideId || coincideDesc || coincideDisp;
      }

      return true;
    });
  }, [reclamos, filtroEstado, busqueda]);

  return (
    <div className="space-y-6">
      {/* Cabecera de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Gestión de Reclamos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitorea, atiende y da seguimiento a los tickets de soporte del ecosistema
          </p>
        </div>

        <button
          onClick={obtenerReclamos}
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition shadow-2xs self-start sm:self-auto disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faRotateRight} className={`w-3.5 h-3.5 ${cargando ? 'animate-spin text-[#FF5252]' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{reclamos.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faInbox} className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pendientes</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalPendientes}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Resueltos</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalResueltos}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Selector de filtros con pill tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filtroEstado === 'todos'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todos ({reclamos.length})
          </button>
          <button
            onClick={() => setFiltroEstado('pendientes')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filtroEstado === 'pendientes'
                ? 'bg-white text-amber-700 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pendientes ({totalPendientes})
          </button>
          <button
            onClick={() => setFiltroEstado('resueltos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filtroEstado === 'resueltos'
                ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Resueltos ({totalResueltos})
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-72">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5"
          />
          <input
            type="text"
            placeholder="Buscar por ID o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
          />
        </div>
      </div>

      {error && <MensajeError mensajeError={error} setMensajeError={setError} />}

      {/* Estado: Cargando (Skeleton) */}
      {cargando && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-slate-100 rounded-full w-20"></div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
              <div className="h-20 bg-slate-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Estado: Sin resultados */}
      {!cargando && reclamosFiltrados.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FontAwesomeIcon icon={faInbox} className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No se encontraron reclamos</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {busqueda || filtroEstado !== 'todos'
              ? 'Prueba cambiando los filtros o el texto de búsqueda.'
              : 'En este momento no hay reportes o tickets pendientes de atención.'}
          </p>
        </div>
      )}

      {/* Lista de Reclamos en Grid Responsivo */}
      {!cargando && reclamosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {reclamosFiltrados.map((reclamo) => (
            <ReclamoCard key={reclamo.idReclamo} reclamo={reclamo} />
          ))}
        </div>
      )}
    </div>
  );
}
