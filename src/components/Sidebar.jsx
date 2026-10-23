import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox, faGear, faShieldHalved, faXmark, faChartPie, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/metricas', label: 'Panel y Métricas', icon: faChartPie },
    { to: '/liquidaciones', label: 'Liquidaciones', icon: faMoneyBillWave },
    { to: '/home', label: 'Reclamos y Tickets', icon: faInbox },
    { to: '/settings', label: 'Configuración', icon: faGear },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-0 h-screen w-64 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div>
        {/* Cabecera del Sidebar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF5252]/10 flex items-center justify-center p-1.5 border border-[#FF5252]/10">
              <img
                src="/appIcon.svg"
                alt="DeliSync Logo"
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight">
                Deli<span className="text-[#FF5252]">Sync</span>
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>
          {/* Botón cerrar para móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Cerrar menú"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Navegación Principal */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Gestión
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#FF5252]/10 text-[#FF5252] font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer del Sidebar con estado del entorno */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">Soporte Activo</p>
            <p className="text-[11px] text-slate-400 truncate">Ecosistema DeliSync</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
