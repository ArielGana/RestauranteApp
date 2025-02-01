// Mesa.js
import React, { useState } from "react";

const Mesa = ({ numero, capacidad, estado, onReserveClick }) => {
  const [color, setColor] = useState(
    estado === "verde" ? "lightgreen" : "lightcoral"
  );
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (estado === "verde") {
      setColor(clicked ? "lightgreen" : "rgb(250, 109, 22)");
      setClicked(!clicked);
      // Llama a la función onReserveClick con el número de la mesa como argumento
      onReserveClick(numero);
    }
  };

  return (
    <div
      className="table-item"
      style={{
        backgroundColor: color,
        cursor: estado === "rojo" ? "default" : "pointer",
      }}
      onClick={handleClick}
    >
      Mesa {numero}
      <br />
      {capacidad} Personas
    </div>
  );
};

export default Mesa;
