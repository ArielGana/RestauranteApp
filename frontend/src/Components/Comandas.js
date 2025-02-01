import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CamarerosList from "./CamarerosList";
import Axios from "axios";
import "../styles/comandas.css";

const Comandas = ({
  idpedido,
  mesa,
  fecha,
  camarero,
  estado,
  usuariorut,
  usuarioname,
  camareroname,
  camareroapellido,
}) => {
  const navigate = useNavigate();
  const camareroDisplay =
    camarero === "000000"
      ? "Sin asignar"
      : camareroname + " " + camareroapellido;
  const [showCamarerosList, setShowCamarerosList] = useState(false);
  const [parpadeoNaranja, setParpadeoNaranja] = useState(false);
  const [parpadeoRojo, setParpadeoRojo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutosActuales = ahora.getMinutes();
      const horaYMinutos = horaActual * 60 + minutosActuales;

      const fechaPartes = fecha.split(" ");
      const horaPedido = fechaPartes[1];
      const horaPedidoPartes = horaPedido.split(":");
      const horaPedidoEnMinutos =
        parseInt(horaPedidoPartes[0]) * 60 + parseInt(horaPedidoPartes[1]);

      const diferenciaMinutos = horaYMinutos - horaPedidoEnMinutos;

      if (camarero === "000000") {
        if (diferenciaMinutos > 10) {
          setParpadeoRojo(true);
          setParpadeoNaranja(false);
        } else if (diferenciaMinutos > 5) {
          setParpadeoNaranja(true);
          setParpadeoRojo(false);
        } else {
          setParpadeoNaranja(false);
          setParpadeoRojo(false);
        }
      } else {
        setParpadeoNaranja(false);
        setParpadeoRojo(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [camarero, fecha]);

  const handleButtonClickTomar = () => {
    setShowCamarerosList((prevState) => !prevState);
  };

  const handleCamareroSelect = (camareroRut) => {
    setShowCamarerosList(false);

    if (camareroRut != "000000") {
      Axios.post(
        `http://127.0.0.1:3001/updateCamarero/${idpedido}/${camareroRut}`
      )
        .then((response) => {
          console.log(response.data);
          navigate(`/details/${mesa}/${idpedido}`);
        })
        .catch((error) => {
          console.error("Error al actualizar el camarero_rut:", error);
        });
    } else {
      setShowCamarerosList(false);
    }
  };

  const handleButtonClickFin = () => {
    navigate(`/finalizar/${mesa}`);
  };
  const handleButtonClickTomadas = () => {
    navigate(`/Tomadas`);
  };
  const handleFloatFinish = () => {
    document.getElementById("modal-confirm").style.display = "block";
  };
  const handleChange = (e) => {
    setMensaje(e.target.value);
  };
  function confirmFinish() {
    Axios.post(
      `http://127.0.0.1:3001/platoTerminado/${idpedido}/${mesa}/${usuariorut}/${mensaje}/${"En Espera"}`
    )
      .then((response) => {
        window.location.reload();
      })
      .catch((error) => {
        console.log(mesa);
        console.error("Error al Terminar La Comanda:", error);
      });
    document.getElementById("modal-confirm").style.display = "none";
  }

  function cancelFinish() {
    document.getElementById("modal-confirm").style.display = "none";
  }
  return (
    <div
      className={`comanda ${parpadeoNaranja ? "parpadeo-naranja" : ""} ${
        parpadeoRojo ? "parpadeo-rojo" : ""
      }`}
    >
      <div className="comanda-header">
        <div className="comanda-mesa">Mesa {mesa}</div>
        <div className="comanda-fecha">Fecha: {fecha}</div>
      </div>
      <div className="comanda-info">
        <div>Usuario: {usuarioname}</div>
        <div>Comanda: {estado}</div>
      </div>

      <div className="comanda-action">
        <div id="modal-confirm" class="modal-Comanda">
          <div class="modal-content">
            <p>¿Cual es el motivo de la cancelacion?</p>
            <input
              className="inputcancel"
              type="text"
              value={mensaje}
              onChange={handleChange}
            ></input>
            <div className="buttons">
              <button className="btnCon" onClick={confirmFinish}>
                Confirmar
              </button>
              <button onClick={cancelFinish}>Cancelar</button>
            </div>
          </div>
        </div>
        <div>Camarero: {camareroDisplay}</div>
        <button onClick={handleFloatFinish} class="comanda-button-finish">
          Finalizar Pedido
        </button>
        {camarero === "000000" ? (
          <button className="comanda-button" onClick={handleButtonClickTomar}>
            Tomar
          </button>
        ) : (
          <button
            className="comanda-button-fin"
            onClick={handleButtonClickFin}
          ></button>
        )}
      </div>
      {showCamarerosList && <CamarerosList onSelect={handleCamareroSelect} />}
      {/* Botón flotante */}
    </div>
  );
};
export default Comandas;
