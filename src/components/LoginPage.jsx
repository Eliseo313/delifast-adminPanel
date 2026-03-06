import { useState,useEffect } from "react";
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
    e.stopPropagation();
    
    if (enviando) return; // Previene múltiples clics
    setEnviando(true);

    try {
      const data = await login(correo, password); // Llama a la función `login` y espera los datos.
      console.log('data(LoginPage): ', data);

      if(data.status == 200){
        // Si todo es exitoso, navega a la página principal.
        setEnviando(false);
        setMensajeInformativo(data.message);
        setTimeout(() => {
          navigate('/adminPanel/home');
        },2000);
        
      }else{
        setEnviando(false);
        setMensajeError(data.message);
      }

      
    } catch (err) {
      // Maneja errores específicos.
      setMensajeError(err.message);
      console.error('Error en inicio de sesión:', err);
      setEnviando(false);
    }
  };

  return (
    <>
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='bg-white shadow-lg rounded-lg p-6 w-full max-w-md'>
          <h1 className='text-2xl font-bold text-center '>Admin Panel</h1>
          <h1 className='text-2xl font-bold text-center mb-6'>
            Inicio de
            <span className='text-red-500'> sesión</span>
          </h1>
          <input
            type='email'
            className='w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Usuario'
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <input
            type='password'
            className='w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={`w-full py-3 rounded-md transition text-white ${
              enviando ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
            //onClick={handleSubmit}
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); // evita que otros listeners globales lo capturen 
              handleSubmit(e); 
              }}
            disabled={enviando}
          >
            {enviando ? 'Procesando...' : 'Entrar'}
          </button>
          {/*<div className='g-signin2' data-onsuccess='onSignIn'></div>{' '} */}
          {/* Botón de acceso con Google */}
        </div>
      </div>
      <ToastContainer />
      <MensajeError mensajeError={mensajeError} setMensajeError={setMensajeError} />
      <MensajeInformativo mensajeInformativo={mensajeInformativo} setMensajeInformativo={setMensajeInformativo}/>
    </>
  );
}
