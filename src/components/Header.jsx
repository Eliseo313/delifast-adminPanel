import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOut,
  faKey,
  faBars,
  faUserShield,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

export default function Header({ onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userAP');
    localStorage.removeItem('adminAuth');
    navigate('/');
  };

  const handleChangePassword = () => {
    setIsMenuOpen(false);
    navigate('/change-password');
  };

  const handleToggleSidebar = (e) => {
    e.stopPropagation();
    onToggleSidebar();
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userAP')) || JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData(storedUser);
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName = userData?.nombre || 'Administrador';
  const displayEmail = userData?.correo || 'admin@delisync.com';

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all">
      {/* Lado izquierdo: Botón toggle y título */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition lg:hidden"
          title="Menú lateral"
          aria-label="Abrir menú"
        >
          <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
          <span className="text-sm font-semibold text-slate-800 tracking-tight hidden sm:inline">
            Centro de Soporte
          </span>
          <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-full border border-slate-200/60 hidden sm:inline">
            DeliSync
          </span>
        </div>
      </div>

      {/* Menú derecha (Usuario + Dropdown) */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 p-1.5 pl-2 sm:pl-3 pr-2 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {displayName.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-slate-900">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px] leading-tight">
              {displayEmail}
            </p>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-56 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
            {/* Header del dropdown */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserShield} className="w-3.5 h-3.5 text-[#FF5252]" />
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Cuenta Admin
                </p>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-1">
                {displayEmail}
              </p>
            </div>

            {/* Opciones */}
            <div className="p-1 space-y-0.5">
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition text-left"
              >
                <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5 text-slate-400" />
                Cambiar contraseña
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition text-left"
              >
                <FontAwesomeIcon icon={faSignOut} className="w-3.5 h-3.5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
