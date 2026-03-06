import { createContext, useState, useContext,useEffect } from "react";
import URL_BASE from '../../config/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null significa que el usuario no está autenticado.
  const [mensajeError, setMensajeError] = useState('');

  const login = async(correo, password) => {
    try {
      const datos = {
        loginInput: correo,
        vContrasenia: password
      };
      const datosJSON = JSON.stringify(datos);
      console.log(datosJSON);
      console.log('URL_BASE: ', URL_BASE);
      const response = await fetch(`${URL_BASE}/iniciarSesionAdminPanel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: datosJSON,
      });

      const res = await response.json();

      console.log('response: ', res);
      if (res.status === 200) {
        const data = res.data;
        console.log('Datos del usuarioAP:', data);

        if (data.idRol === 3) {
          // navigate(`/home/${data.idRestaurante}`);
          setUser(data);

          console.log("correo: ",correo);
          localStorage.setItem('userAP', JSON.stringify({ correo: correo,nombre: data.vNombre,vToken:data.vToken })); // Guardar en localStorage
          return res;
        } else {
          console.log('error(else1): ', res.message);
          setMensajeError('Acceso denegado: por favor ingrese con una cuenta de administrador.');
          // throw new Error('Acceso denegado: por favor ingrese con una cuenta de restaurante.');
          return data;
        }
      } else {
        console.log('error(else2): ', res.message);
        setMensajeError('Error al iniciar: ' + res.message);
        // throw new Error(res.message || 'Credenciales inválidas.');
        return res;
      }
    } catch (err) {
      console.log('error(catchAuthContext): ', err.message);
      setMensajeError(err.message || 'Ha ocurrido un error. Por favor, inténtalo nuevamente.');
      return err;
    }
  };

  const logout = () => {
    setUser(null); // Elimina el estado de usuario.
    localStorage.removeItem('userAP'); // Eliminar del almacenamiento local
    // navigate('/'); // Redirigir al login
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('userAP');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser.correo); // Restaurar el usuario
      console.log('usuario localStorage(AuthContext.jsx): ',parsedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
