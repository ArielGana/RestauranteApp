import React, { useState, useEffect } from "react";
import Axios from "axios";
import Comandas from "./PedidosTomados";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    Axios.get("https://restaurante-app-murex.vercel.app/pedidosTomados")
      .then((response) => {
        const pedidosData = response.data.map((pedido) => ({
          id: pedido.id,
          comanda: pedido.id,
          fecha: pedido.fecha,
          mesa: pedido.mesa_id,
          usuariorut: pedido.usuario_rut,
          usuarioname: pedido.nombre_usuario,
          apellusuario: pedido.apellido_usuario,
          camareroname: pedido.nombre_camarero,
          camareroapellido: pedido.apellido_camarero,
          camarero: pedido.camarero_rut,
          estado: pedido.estado,
        }));
        setPedidos(pedidosData);
      })
      .catch((error) => {
        console.error(
          "Hubo un error al obtener los datos de los pedidos",
          error
        );
      });
  }, []);

  return (
    <div>
      {pedidos.map((pedido) => (
        <Comandas
          key={pedido.id}
          idpedido={pedido.id}
          comanda={pedido.id}
          fecha={pedido.fecha}
          mesa={pedido.mesa}
          usuariorut={pedido.usuariorut}
          usuarioname={pedido.usuarioname}
          apellidouser={pedido.apellusuario}
          camareroname={pedido.camareroname}
          camareroapellido={pedido.camareroapellido}
          camarero={pedido.camarero}
          estado={pedido.estado}
        />
      ))}
    </div>
  );
};

export default Pedidos;
