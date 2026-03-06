export default function ReclamoCard({ reclamo }) {
  const imageUrl = reclamo.vImagen
    ? `https://delifast-imagenes.s3.us-east-2.amazonaws.com/reclamos/${reclamo.vImagen}`
    : null;

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white">
      {/* Encabezado del reclamo */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500">ID Reclamo: {reclamo.idReclamo}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(reclamo.dFechaHora).toLocaleString()}</p>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            reclamo.idEstadoReclamo === 2 ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
          }`}>
            {reclamo.idEstadoReclamo === 2 ? 'Resuelto' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Descripción del reclamo */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">Descripción</h3>
        <p className="text-gray-600 mt-2 text-sm">{reclamo.vDescripcion}</p>
      </div>

      {/* Imagen del reclamo (opcional) */}
      {imageUrl && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Evidencia</h3>
          <div className="p-2 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imageUrl}
              alt={`Evidencia del reclamo ${reclamo.idReclamo}`}
              className="h-auto object-cover max-h-80 rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      )}

      {/* Información del dispositivo */}
      <div className="mb-4 bg-gray-50 p-3 rounded">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">Información del dispositivo</h3>
        <div className="text-xs text-gray-600 space-y-1">
          {reclamo.vDispositivo && <p><span className="font-semibold">Dispositivo:</span> {reclamo.vDispositivo}</p>}
          {reclamo.vSistemaOperativo && <p><span className="font-semibold">SO:</span> {reclamo.vSistemaOperativo}</p>}
        </div>
      </div>

      {/* Observaciones (opcional) */}
      {reclamo.vObservaciones && (
        <div className="mb-4 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-700">Observaciones:</p>
          <p className="text-gray-600 mt-1 text-sm">{reclamo.vObservaciones}</p>
        </div>
      )}

      {/* Sección de respuesta */}
      <div className="mt-6 pt-4 border-t">
        <textarea
          placeholder="Escribir respuesta al usuario..."
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 text-white px-4 py-2 mt-3 rounded hover:bg-blue-700 w-full">
          Enviar respuesta
        </button>
      </div>
    </div>
  )
}
