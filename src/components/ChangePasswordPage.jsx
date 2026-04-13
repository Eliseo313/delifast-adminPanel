import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MensajeError from "./MensajeError";
import MensajeInformativo from "./MensajeInformativo";
import URL_BASE from '../config/config';


function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeInformativo, setMensajeInformativo] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleChangePassword = async () => {
    if (newPassword == confirmPassword) {
      try {
        const datos = {
          idRol: 3,
          vCorreo: user?.correo,
          vContraseniaAnterior: currentPassword,
          vContraseniaNueva: newPassword,
        };
        const datosJSON = JSON.stringify(datos);
        console.log(datosJSON);

        //`${BASE_URL}obtenerDetallesRestaurante`
        const response = await fetch(
          `${URL_BASE}/cambiarContrasenia`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`,
            },
            body: datosJSON,
          }
        );

        const result = await response.json();
        console.log('result: ', result);

        if (result.status === 200) {
          console.log('Contraseña cambiada exitosamente');
          setMensajeInformativo('Contraseña cambiada exitosamente');

          setTimeout(() => {
            navigate(`/`);
          }, 2000);

        } else {
          console.log('Error(else): ', result.message);
          setMensajeError(` ${result.message} ` || 'Error al cambiar la contraseña. Por favor, inténtalo nuevamente.');
          throw new Error(result.message || 'Error al cambiar la contraseña. Por favor, inténtalo nuevamente.');
        }
      } catch (err) {
        console.log('Error(catch): ', err.message);
        setMensajeError(`${err.message} ` || 'Error al cambiar la contraseña. Por favor, inténtalo nuevamente.');

      }
    } else {
      console.log('Las contraseñas no coinciden. Por favor, asegúrate de que los campos sean iguales.');
      setMensajeError('Las contraseñas no coinciden. Por favor, asegúrate de que los campos sean iguales');
    }
  };

  return (
    <>
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='bg-white shadow-lg rounded-lg p-6 w-full max-w-md'>
          <h1 className='text-2xl font-bold text-center mb-6'>
            Cambiar Contraseña
          </h1>
          <input
            type='password'
            className='w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Contraseña actual'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type='password'
            className='w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Nueva contraseña'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type='password'
            className='w-full p-3 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Confirmar nueva contraseña'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className='w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition'
            onClick={handleChangePassword}
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>
      <ToastContainer />
      <MensajeError mensajeError={mensajeError} setMensajeError={setMensajeError} />
      <MensajeInformativo mensajeInformativo={mensajeInformativo} setMensajeInformativo={setMensajeInformativo} autoClose={2000} />

    </>
  );
}

export default ChangePasswordPage;
