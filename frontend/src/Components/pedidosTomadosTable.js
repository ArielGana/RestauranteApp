import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams } from "react-router-dom";
import DetailTomados from "./detailTomados";
import { useComanda } from "./ComandaContext";

const Detail = () => {
  const [pedidos, setPedidos] = useState([]);
  const { comanda } = useParams();
  const { comandaDetails } = useComanda();

  useEffect(() => {
    Axios.get(
      `http://127.0.0.1:3001/pedidoDetailTomados/${comandaDetails.comandaid}`
    )
      .then((response) => {
        const formattedPedidos = formatPedidos(response.data);
        setPedidos(formattedPedidos);
      })
      .catch((error) => {
        console.error(
          "Hubo un error al obtener los datos de los pedidos",
          error
        );
      });
  }, [comanda]);

  const formatPedidos = (data) => {
    return data.map((detail) => {
      const platos = combineItems(detail.pedidoplato);
      const refrescos = combineItems(detail.pedidorefresco);
      const postres = combineItems(detail.pedido_postre);

      return {
        comanda_id: detail.comanda_id,
        platos,
        refrescos,
        postres,
      };
    });
  };

  const combineItems = (itemsString) => {
    if (!itemsString) {
      return [];
    }

    const itemsArray = itemsString.split(", ").map((item) => {
      const [nombre, cantidad] = item.split(":");
      return { nombre, cantidad: parseInt(cantidad, 10) };
    });

    const combinedItems = itemsArray.reduce((acc, item) => {
      if (acc[item.nombre]) {
        acc[item.nombre].cantidad += item.cantidad;
      } else {
        acc[item.nombre] = { ...item };
      }
      return acc;
    }, {});

    return Object.values(combinedItems);
  };

  console.log(comandaDetails.usuarioNombre, comandaDetails.comandaid);
  console.log(comandaDetails.rutuser);
  return (
    <div>
      {pedidos.map((pedido) => (
        <DetailTomados
          key={pedido.comanda_id}
          idcomanda={comanda}
          platopedido={pedido.platos}
          refrescopedido={pedido.refrescos}
          postrepedido={pedido.postres}
          idpedido={comandaDetails.pedidoid}
          fecha={comandaDetails.fecha}
          camareroNombre={comandaDetails.camareroNombre}
          camareroApellido={comandaDetails.camareroApellido}
          usuarioNombre={comandaDetails.usuarioNombre}
          usuarioApellido={comandaDetails.apellidousuario}
          mesa={comandaDetails.mesa}
        />
      ))}
    </div>
  );
};

export default Detail;
