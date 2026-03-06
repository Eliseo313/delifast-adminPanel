import { useState, useEffect } from 'react'
import ReclamoCard from './ReclamoCard'
import MensajeError from './MensajeError'
import URL_BASE from '../config/config'

export default function ReclamosPage() {
  const [reclamos, setReclamos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const obtenerReclamos = async () => {
      try {
        setCargando(true)
        setError('')
        
        //console.log('Token almacenado: ', JSON.parse(localStorage.getItem('userAP')).vToken);
        const response = await fetch(`${URL_BASE}/obtenerReclamos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userAP')).vToken}` // Asegúrate de que el token esté correctamente almacenado y accesible
          }
        })

        const res = await response.json()

        if (res.status === true) {
          setReclamos(res.data || [])
          console.log('Reclamos obtenidos: ', res.data);
        } else {
          setError(res.message || 'Error al obtener las reclamos')
        }
      } catch (err) {
        setError('Error de conexión: ' + err.message)
      } finally {
        setCargando(false)
      }
    }

    obtenerReclamos()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reclamos de usuarios</h2>

      {error && <MensajeError mensaje={error} />}

      {cargando && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando reclamos...</p>
        </div>
      )}

      {!cargando && reclamos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">Sin reclamos</p>
        </div>
      )}

      {!cargando && reclamos.length > 0 && (
        <div className="flex flex-col gap-6">
          {reclamos.map(reclamo => (
            <ReclamoCard key={reclamo.idReclamo} reclamo={reclamo} />
          ))}
        </div>
      )}
    </div>
  )
}
