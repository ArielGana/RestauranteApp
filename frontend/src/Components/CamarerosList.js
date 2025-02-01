import React, { useEffect, useState } from "react";
import Axios from "axios";

const CamarerosList = ({ onSelect }) => {
  const [camareros, setCamareros] = useState([]);

  useEffect(() => {
    Axios.get("http://127.0.0.1:3001/Camareros")
      .then((response) => {
        setCamareros(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener los camareros", error);
      });
  }, []);

  return (
    <div className="camareros-list">
      {camareros.map((camarero) => (
        <div
          key={camarero.rut}
          className="camarero-item"
          onClick={() => onSelect(camarero.rut)} // Pasar camarero.rut en lugar de camarero
        >
          {camarero.nombre} {camarero.apellido}
        </div>
      ))}
    </div>
  );
};

export default CamarerosList;
