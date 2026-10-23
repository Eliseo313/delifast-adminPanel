import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faUsers, faShieldHalved, faServer } from '@fortawesome/free-solid-svg-icons';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('userAP')) || JSON.parse(localStorage.getItem('user'));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Configuración del Sistema
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Parámetros generales de administración y accesos al panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta Cuenta actual */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sesión Administrativa</h3>
              <p className="text-xs text-slate-400">Rol asignado: Administrador</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Nombre:</span>
              <span className="font-semibold text-slate-700">{user?.nombre || 'Administrador'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Correo:</span>
              <span className="font-semibold text-slate-700">{user?.correo || 'No especificado'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Ecosistema:</span>
              <span className="font-semibold text-slate-700">DeliSync Platform</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Entorno & Infraestructura */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FontAwesomeIcon icon={faServer} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Infraestructura</h3>
              <p className="text-xs text-slate-400">DigitalOcean & AWS S3</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Servicios API:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Operacional
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Multimedia:</span>
              <span className="font-semibold text-slate-700">AWS S3 (Imágenes)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Despliegue:</span>
              <span className="font-semibold text-slate-700">Vercel Edge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
