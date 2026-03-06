import { toast } from "react-toastify";
import { useEffect } from "react";
import PropTypes from 'prop-types';

export default function MensajeError({ mensajeError, setMensajeError, autoClose = 5000}) {
  useEffect(() => {
    if (mensajeError) {
      toast.error(mensajeError, {
        position: 'top-right',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Reiniciar el mensaje para evitar mostrarlo varias veces
      setMensajeError("");
    }
  }, [mensajeError, setMensajeError]);

  return null; // No renderiza nada visualmente, solo activa el toast
}

MensajeError.propTypes = {
  mensajeError: PropTypes.string,
  setMensajeError: PropTypes.func
}