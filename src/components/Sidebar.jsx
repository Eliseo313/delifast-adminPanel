import { Link } from 'react-router-dom'

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`fixed lg:relative w-64 bg-gray-900 text-gray-100 p-6 flex flex-col h-screen transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/adminPanel/home" className="hover:text-blue-400">📋 Reclamos</Link>
        <Link to="/adminPanel/settings" className="hover:text-blue-400">⚙️ Configuración</Link>
      </nav>
    </aside>
  )
}
