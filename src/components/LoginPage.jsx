import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import MensajeError from './MensajeError';
import MensajeInformativo from './MensajeInformativo';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeInformativo, setMensajeInformativo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    try {
      const data = await login(correo, password);

      if (data && data.status === 200) {
        setEnviando(false);
        setMensajeInformativo(data.message || 'Bienvenido al panel');
        setTimeout(() => {
          navigate('/home');
        }, 1200);
      } else {
        setEnviando(false);
        setMensajeError(data?.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setMensajeError(err.message || 'Error en inicio de sesión');
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Tarjeta de Login */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8">
            {/* Cabecera / Identidad */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5252]/10 to-[#FF5252]/20 flex items-center justify-center p-2 mb-4 border border-[#FF5252]/10">
                <img
                  src="/appIcon.svg"
                  alt="DeliSync Logo"
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Deli<span className="text-[#FF5252]">Sync</span>
              </h1>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                Panel de Administración
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
                  placeholder="admin@delisync.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                    enviando
                      ? 'bg-[#FF5252]/70 cursor-not-allowed'
                      : 'bg-[#FF5252] hover:bg-[#E03E3E] active:scale-[0.99] shadow-[#FF5252]/20 shadow-md'
                  }`}
                >
                  {enviando ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    'Ingresar al panel'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} DeliSync. Todos los derechos reservados.
          </p>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <MensajeError mensajeError={mensajeError} setMensajeError={setMensajeError} />
      <MensajeInformativo mensajeInformativo={mensajeInformativo} setMensajeInformativo={setMensajeInformativo} />
    </>
  );
}
