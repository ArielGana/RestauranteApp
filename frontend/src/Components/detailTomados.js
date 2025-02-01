import React, { useState, useEffect } from "react";
import "../styles/comandadetail.css";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import { useComanda } from "./ComandaContext";
const DetailTomados = ({
  pedidoid,
  idcomanda,
  platopedido,
  idpedido,
  refrescopedido,
  postrepedido,
  fecha,
  camareroNombre,
  camareroApellido,
  usuarioNombre,
  usuarioApellido,
  mesa,
}) => {
  const { comandaDetails } = useComanda();
  const [seleccionados, setSeleccionados] = useState({
    platos: [],
    postres: [],
    refrescos: [],
  });
  const navigate = useNavigate();
  useEffect(() => {
    setSeleccionados({
      platos: platopedido || [],
      postres: postrepedido || [],
      refrescos: refrescopedido || [],
    });
  }, [platopedido, refrescopedido, postrepedido]);

  const separarFechaHora = (fechaHora) => {
    const [fecha, hora] = fechaHora.split(" ");
    const [año, mes, dia] = fecha.split("-");
    const fechaFormateada = `${dia}-${mes}-${año}`;
    return {
      fechasplit: fechaFormateada,
      horasplit: hora,
    };
  };

  const { fechasplit, horasplit } = separarFechaHora(fecha);
  const handleFloat = () => {
    navigate(`/details/${mesa}/${idpedido}`);
  };

  function handleFloatFinish(event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Prevenir el comportamiento por defecto del enlace
    document.getElementById("modal-confirm").style.display = "block";
  }

  function confirmFinish() {
    Axios.post(
      `https://restaurante-app-murex.vercel.app/platoTerminado/${
        comandaDetails.comandaid
      }/${comandaDetails.mesa}/${
        comandaDetails.rutuser
      }/${"Correcto"}/${"Tomada"}`
    )
      .then((response) => {
        navigate(`/comandas`);
      })
      .catch((error) => {
        console.log(comandaDetails.mesa);
        console.error("Error al Terminar La Comanda:", error);
      });
    document.getElementById("modal-confirm").style.display = "none";
  }

  function cancelFinish() {
    document.getElementById("modal-confirm").style.display = "none";
  }
  return (
    <div className="comanda-new-container">
      <div className="comanda-new-header">
        <div className="comanda-new-mesa">Mesa {mesa}</div>
        <div className="comanda-new-usuario">
          Usuario: {usuarioNombre} {}
          {usuarioApellido}
        </div>
        <div className="comanda-new-fecha">
          Fecha: {fechasplit} Hora: {horasplit}
        </div>
        <div className="comanda-new-camarero">
          Camarero: {camareroNombre} {camareroApellido}
        </div>
        <div id="modal-confirm" class="modal">
          <div class="modal-content">
            <p>¿Estás seguro de que quieres finalizar el pedido?</p>
            <button onClick={confirmFinish}>Confirmar</button>
            <button onClick={cancelFinish}>Cancelar</button>
          </div>
        </div>
      </div>
      <div className="comanda-new-info">
        <div className="comanda-new-item">
          <span className="name">Platos</span>
          {seleccionados.platos.length > 0 ? (
            seleccionados.platos.map((plato, index) => (
              <div key={index} className="comanda">
                <span>{plato.nombre} |</span>
                <span>X {plato.cantidad}</span>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Plato</span>
            </div>
          )}
        </div>
        <div className="comanda-new-item">
          <span className="name">Postres</span>
          {seleccionados.postres.length > 0 ? (
            seleccionados.postres.map((postre, index) => (
              <div key={index} className="comanda">
                <span>{postre.nombre} |</span>
                <span>X {postre.cantidad}</span>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Postre</span>
            </div>
          )}
        </div>
        <div className="comanda-new-item">
          <span className="name">Refrescos</span>
          {seleccionados.refrescos.length > 0 ? (
            seleccionados.refrescos.map((refresco, index) => (
              <div key={index} className="comanda">
                <span>{refresco.nombre} |</span>
                <span>X {refresco.cantidad}</span>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Refresco</span>
            </div>
          )}
        </div>
      </div>

      <a onClick={handleFloat} class="boton-flotante">
        Añadir Otro Pedido
      </a>

      <a onClick={handleFloatFinish} class="boton-flotante-finalizar">
        Finalizar Pedido
      </a>
    </div>
  );
};

export default DetailTomados;
