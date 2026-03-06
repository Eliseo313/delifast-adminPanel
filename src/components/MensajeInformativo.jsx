import { toast } from "react-toastify";
import { useEffect } from "react";
import PropTypes from 'prop-types';

export default function MensajeInformativo({ mensajeInformativo, setMensajeInformativo, autoClose = 5000 }) {
  useEffect(() => {
    if (mensajeInformativo) {
      toast.success(mensajeInformativo, {
        position: 'top-right',
        autoClose: autoClose,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Reiniciar el mensaje para evitar mostrarlo varias veces
      setMensajeInformativo("");
    }
  }, [mensajeInformativo, setMensajeInformativo]);

  return null; // No renderiza nada visualmente, solo activa el toast
}

MensajeInformativo.propTypes = {
  mensajeInformativo: PropTypes.string,
  setMensajeInformativo: PropTypes.func
  }; // eslint-disable-line react/prop-types