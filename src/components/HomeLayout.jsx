import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function HomeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Cerrar sidebar cuando se hace click fuera de ella
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen relative">
      {/* Overlay oscuro en móvil cuando sidebar está abierta - semi-transparente para ver contenido */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div ref={sidebarRef}>
        <Sidebar isOpen={sidebarOpen} />
      </div>

      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="p-4 overflow-y-auto">
          <Outlet /> {/* Aquí se renderiza ReclamosPage, Settings, ChangePassword */}
        </main>
      </div>
    </div>
  );
}
