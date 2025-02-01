import React, { useState, useEffect } from "react";
import Axios from "axios";
import { format, differenceInMinutes } from "date-fns";
import "../styles/Cocina.css";

const PlatoItem = ({
  tipo,
  idpedido,
  comidaid,
  nombre,
  cantidad,
  notas,
  fecha,
}) => {
  const [terminado, setTerminado] = useState(false);
  const [parpadeando, setParpadeando] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTerminado = () => {
    setLoading(true); // Iniciar pantalla de carga
    const item = {
      tipo: tipo,
      pedido_id: idpedido,
      comida_id: comidaid,
      nombre_comida: nombre,
      cantidad: cantidad,
    };

    Axios.post(
      "https://restaurante-app-murex.vercel.app/marcarItemPreparado",
      item
    )
      .then((response) => {
        console.log(response.data);
        setTerminado(true);
        setLoading(false); // Detener pantalla de carga
      })
      .catch((error) => {
        console.error("Error al marcar el ítem como preparado:", error);
        setLoading(false); // Detener pantalla de carga en caso de error
      });
  };

  const formatearFecha = (fechaISO) => {
    const fechaObj = new Date(fechaISO);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaObj.getFullYear();
    const horas = fechaObj.getHours().toString().padStart(2, "0");
    const minutos = fechaObj.getMinutes().toString().padStart(2, "0");
    const segundos = fechaObj.getSeconds().toString().padStart(2, "0");
    return `${dia}-${mes}-${anio} ${horas}:${minutos}:${segundos}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const tiempoTranscurrido = calcularTiempoTranscurrido(fecha);
      if (tiempoTranscurrido >= 10 && tiempoTranscurrido < 20) {
        setParpadeando(true);
      } else if (tiempoTranscurrido >= 20) {
        setParpadeando(false);
        clearInterval(interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fecha]);

  const calcularTiempoTranscurrido = (fechaISO) => {
    const fechaItem = new Date(fechaISO);
    const ahora = new Date();
    return differenceInMinutes(ahora, fechaItem);
  };

  const fechaFormateada = formatearFecha(fecha);

  if (terminado) {
    return null;
  }

  return (
    <div>
      {loading && <div className="loading">Cargando...</div>}
      <div
        id={`plato-item-${idpedido}`}
        className={`plato-item ${
          parpadeando
            ? "naranjo"
            : calcularTiempoTranscurrido(fecha) >= 20
            ? "rojo"
            : ""
        }`}
      >
        <div>
          <h2>{nombre}</h2>
          <h2>Cantidad: {cantidad}</h2>
        </div>
        <p className="notas">{notas}</p>
        <div>{fechaFormateada}</div>
        <button onClick={handleTerminado} className="finish">
          Terminado
        </button>
      </div>
    </div>
  );
};

export default PlatoItem;
