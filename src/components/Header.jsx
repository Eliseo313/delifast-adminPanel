import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGear,
  faSignOut,
  faKey,
  faBars,
} from '@fortawesome/free-solid-svg-icons'; // Importa el ícono específico

export default function Header({ onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth'); // Borra el usuario del localStorage
    navigate('/'); // Redirige al login
  };

  const handleChangePassword = () => {
    navigate('/change-password'); // Redirige al componente ChangePassword.jsx
  };

  const handleToggleSidebar = (e) => {
    e.stopPropagation(); // Evita que el click cierre la sidebar inmediatamente
    onToggleSidebar();
  };

  // Cierra el menú si se hace clic fuera de él
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
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

  return (
    <header className="bg-white shadow p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggleSidebar}
          className="text-gray-600 hover:text-gray-800 transition"
          title="Mostrar/ocultar menú"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Soporte Técnico - DeliSync</h1>
      </div>
      {/* Menú derecha (icono + dropdown) */}
      <div className='flex flex-col justify-center sm:flex-row md:flex-row lg:flex-row xl:flex-row space-x-4'>
        <div className='flex justify-center space-x-4'>
          <div className='relative mr-3'>
            <button
              className='flex items-center text-gray-600 hover:text-gray-800'
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <FontAwesomeIcon icon={faGear} size='xl' />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className='absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-48 z-50'
              >
                {/* Encabezado del dropdown con info */}
                <div className='px-4 py-3 border-b'>
                  <p className='text-sm font-medium text-gray-800'>
                    {userData ? userData.nombre : 'Admin'}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {userData ? userData.correo : ''}
                  </p>
                </div>
                <ul className='py-1'>
                  <li>
                    <button
                      onClick={handleChangePassword}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    >
                      <FontAwesomeIcon icon={faKey} className='mr-2' />
                      Cambiar contraseña
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    >
                      <FontAwesomeIcon icon={faSignOut} className='mr-2' />
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
