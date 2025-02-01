import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CamarerosList from "./CamarerosList";
import Axios from "axios";
import "../styles/comandas.css";
import { useComanda } from "./ComandaContext";

const Comandas = ({
  idpedido,
  comanda,
  mesa,
  fecha,
  camarero,
  estado,
  usuariorut,
  usuarioname,
  apellidouser,
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

  const { setComandaDetails } = useComanda();

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
    setShowCamarerosList(true);
  };

  const handleCamareroSelect = (camareroRut) => {
    setShowCamarerosList(false);
    Axios.post(
      `https://restaurante-app-murex.vercel.app/updateCamarero/${idpedido}/${camareroRut}`
    )
      .then((response) => {
        console.log(response.data);
        navigate(`/details/${mesa}`);
      })
      .catch((error) => {
        console.error("Error al actualizar el camarero_rut:", error);
      });
    navigate(`/details/${mesa}`);
  };

  const handleButtonClickFin = () => {
    navigate(`/finalizar/${mesa}`);
  };
  const handleButtonClickTomadas = () => {
    navigate(`/comandas`);
  };

  const handleComanda = () => {
    const comandaData = {
      comandaid: comanda,
      fecha: fecha,
      camareroNombre: camareroname,
      pedidoid: idpedido,
      camareroApellido: camareroapellido,
      rutuser: usuariorut,
      usuarioNombre: usuarioname,
      apellidousuario: apellidouser,
      mesa: mesa,
    };
    setComandaDetails(comandaData);
    navigate(`/detailTomada/${comandaData.comandaid}`);
  };
  return (
    <div
      onClick={handleComanda}
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
        <div>Camarero: {camareroDisplay}</div>
      </div>
    </div>
  );
};
export default Comandas;
