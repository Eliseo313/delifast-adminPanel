import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MensajeError from "./MensajeError";
import MensajeInformativo from "./MensajeInformativo";
import URL_BASE from '../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeInformativo, setMensajeInformativo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('userAP')) || JSON.parse(localStorage.getItem('user'));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (enviando) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMensajeError('Por favor completa todos los campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMensajeError('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setMensajeError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setEnviando(true);
      const datos = {
        idRol: 3,
        vCorreo: user?.correo,
        vContraseniaAnterior: currentPassword,
        vContraseniaNueva: newPassword,
      };

      const token = user?.vToken || user?.token;

      const response = await fetch(`${URL_BASE}/cambiarContrasenia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const result = await response.json();

      if (result.status === 200) {
        setMensajeInformativo('Contraseña actualizada correctamente.');
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setMensajeError(result.message || 'Error al cambiar la contraseña.');
      }
    } catch (err) {
      setMensajeError(err.message || 'Error de conexión al actualizar contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-4 sm:pt-8">
      {/* Botón regresar */}
      <button
        onClick={() => navigate('/home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
        Regresar al panel
      </button>

      {/* Tarjeta de Formulario */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#FF5252]/10 text-[#FF5252] flex items-center justify-center">
            <FontAwesomeIcon icon={faKey} className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              Cambiar Contraseña
            </h1>
            <p className="text-xs text-slate-400">
              Actualiza la clave de acceso de tu cuenta de administrador
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Contraseña actual
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="password"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Nueva contraseña
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="password"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="password"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={enviando}
              className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                enviando
                  ? 'bg-[#FF5252]/70 cursor-not-allowed'
                  : 'bg-[#FF5252] hover:bg-[#E03E3E] active:scale-[0.99] shadow-[#FF5252]/20 shadow-md cursor-pointer'
              }`}
            >
              {enviando ? 'Guardando cambios...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <MensajeError mensajeError={mensajeError} setMensajeError={setMensajeError} />
      <MensajeInformativo mensajeInformativo={mensajeInformativo} setMensajeInformativo={setMensajeInformativo} autoClose={2000} />
    </div>
  );
}

export default ChangePasswordPage;
