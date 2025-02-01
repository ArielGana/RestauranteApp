import React, { useState, useEffect } from "react";
import Axios from "axios";
import PlatoItem from "./Cocina"; // Asumiendo que el nombre del archivo es PlatoItem.js

const PlatosCocina = () => {
  const [platos, setPlatos] = useState([]);

  // Función para cargar y ordenar los platos desde el servidor
  const cargarPlatos = () => {
    Axios.get(`http://127.0.0.1:3001/platosCocinando`)
      .then((response) => {
        const platosData = response.data;

        // Ordenar platos por fecha (la más antigua primero)
        platosData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setPlatos(platosData); // Actualizar el estado con los platos ordenados por fecha
      })
      .catch((error) => {
        console.error(
          "Hubo un error al obtener los datos de los pedidos",
          error
        );
      });
  };

  // Efecto para cargar los platos inicialmente y configurar el intervalo para actualizar
  useEffect(() => {
    const interval = setInterval(() => {
      cargarPlatos(); // Consultar regularmente nuevos platos cada cierto intervalo
    }, 5000); // Consultar cada 5 segundos (ajusta el intervalo según tus necesidades)

    // Limpia el intervalo cuando el componente se desmonta para evitar fugas de memoria
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Platos en Cocina</h1>
      {platos.map((plato, index) => (
        <PlatoItem
          key={`${plato.pedido_id}-${index}`} // Combinando pedido_id con el índice para garantizar unicidad
          tipo={plato.tipo}
          idpedido={plato.pedido_id}
          comidaid={plato.comida_id}
          nombre={plato.nombre_comida}
          cantidad={plato.cantidad}
          notas={plato.notas}
          fecha={plato.fecha}
        />
      ))}
    </div>
  );
};

export default PlatosCocina;
