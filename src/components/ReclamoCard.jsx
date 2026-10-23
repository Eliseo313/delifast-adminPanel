import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faMobileScreenButton,
  faCircleCheck,
  faClock,
  faImage,
  faPaperPlane,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

export default function ReclamoCard({ reclamo }) {
  const [respuesta, setRespuesta] = useState('');
  const [modalImagenAbierto, setModalImagenAbierto] = useState(false);

  const imageUrl = reclamo.vImagen
    ? `https://delifast-imagenes.s3.us-east-2.amazonaws.com/reclamos/${reclamo.vImagen}`
    : null;

  const isResuelto = reclamo.idEstadoReclamo === 2;

  const fechaFormateada = reclamo.dFechaHora
    ? new Date(reclamo.dFechaHora).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Fecha no disponible';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300/80 transition-all duration-200 p-5 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header de la tarjeta */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                  #{reclamo.idReclamo}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarDay} className="w-3 h-3 text-slate-300" />
                  {fechaFormateada}
                </span>
              </div>
            </div>

            {/* Badge de estado */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isResuelto
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
            >
              <FontAwesomeIcon
                icon={isResuelto ? faCircleCheck : faClock}
                className="w-3 h-3"
              />
              {isResuelto ? 'Resuelto' : 'Pendiente'}
            </span>
          </div>

          {/* Motivo o Descripción */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Descripción del problema
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
              {reclamo.vDescripcion || 'Sin descripción detallada.'}
            </p>
          </div>

          {/* Evidencia fotográfica */}
          {imageUrl && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faImage} className="w-3 h-3" />
                Evidencia fotográfica
              </h4>
              <div
                onClick={() => setModalImagenAbierto(true)}
                className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 aspect-video max-h-48 flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt={`Evidencia #${reclamo.idReclamo}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  Clic para ampliar
                </div>
              </div>
            </div>
          )}

          {/* Información Técnica del Dispositivo */}
          {(reclamo.vDispositivo || reclamo.vSistemaOperativo) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faMobileScreenButton} className="w-3 h-3" />
                Dispositivo:
              </span>
              {reclamo.vDispositivo && (
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  {reclamo.vDispositivo}
                </span>
              )}
              {reclamo.vSistemaOperativo && (
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  {reclamo.vSistemaOperativo}
                </span>
              )}
            </div>
          )}

          {/* Observaciones internas */}
          {reclamo.vObservaciones && (
            <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl">
              <p className="text-xs font-bold text-sky-800 uppercase tracking-wide flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMessage} className="w-3 h-3" />
                Observaciones
              </p>
              <p className="text-xs text-sky-900 mt-1">{reclamo.vObservaciones}</p>
            </div>
          )}
        </div>

        {/* Sección de respuesta */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <textarea
            rows="2"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Escribir notas o respuesta para el usuario..."
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/15 resize-none"
          />
          <button
            type="button"
            className="mt-2.5 w-full py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-[#FF5252] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3" />
            <span>Enviar respuesta</span>
          </button>
        </div>
      </div>

      {/* Modal Zoom de Imagen */}
      {modalImagenAbierto && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalImagenAbierto(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img
              src={imageUrl}
              alt="Evidencia ampliada"
              className="max-h-[80vh] w-auto object-contain rounded-xl mx-auto"
            />
            <div className="p-2 text-center">
              <button
                onClick={() => setModalImagenAbierto(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
