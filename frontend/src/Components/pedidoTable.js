import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams } from "react-router-dom";
import ComandaDetail from "./ComandaDetail";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const { mesa, idpedido } = useParams();

  useEffect(() => {
    Axios.get(`https://restaurante-app-murex.vercel.app/pedidodetail/${mesa}`)
      .then((response) => {
        const pedidosData = response.data.map((pedido) => ({
          id: pedido.id,
          comanda: idpedido,
          fecha: pedido.fecha,
          mesa: pedido.mesa_id,
          camarero: pedido.camarero_rut,
          namecamarero: pedido.nombre_camarero,
          apellidocamar: pedido.apellido_camarero,
          usuariorut: pedido.Usuario_rut,
          estado: pedido.estado,
          plato_id: pedido.plato_id,
          nameplato: pedido.plato_nombre,
          amount: pedido.cantidad,
          refresco_id: pedido.refresco_id,
          postre_id: pedido.postre_id,
          usuarioname: pedido.nombre_usuario,
          lastnameuser: pedido.apellido_usuario,
        }));
        setPedidos(pedidosData);
      })
      .catch((error) => {
        console.error(
          "Hubo un error al obtener los datos de los pedidos",
          error
        );
      });
  }, [mesa]);

  return (
    <div>
      {pedidos.map((pedido) => (
        <ComandaDetail
          key={pedido.id}
          pedidoid={pedido.id}
          fecha={pedido.fecha}
          idcomanda={pedido.comanda}
          mesa={pedido.mesa}
          camarero={pedido.camarero}
          usuariorut={pedido.usuario}
          estado={pedido.estado}
          platoid={pedido.plato_id}
          nombreplato={pedido.nameplato}
          cantidad={pedido.amount}
          refrescoid={pedido.refresco_id}
          postreid={pedido.postre_id}
          nombrecamarero={pedido.namecamarero}
          apellidocamarero={pedido.apellidocamar}
          usuarioname={pedido.usuarioname}
          apellidousuario={pedido.lastnameuser}
        />
      ))}
    </div>
  );
};

export default Pedidos;
