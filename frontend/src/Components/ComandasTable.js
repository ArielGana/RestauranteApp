import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import Comandas from "./Comandas";
const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const navigate = useNavigate();

  const handleButtonClickTomadas = () => {
    navigate(`/Tomadas`);
  };
  useEffect(() => {
    Axios.get("http://127.0.0.1:3001/Comandas")
      .then((response) => {
        const pedidosData = response.data.map((pedido) => ({
          id: pedido.id,
          fecha: pedido.fecha,
          mesa: pedido.mesa_id,
          usuariorut: pedido.usuario_rut,
          usuarioname: pedido.nombre_usuario,
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
          fecha={pedido.fecha}
          mesa={pedido.mesa}
          usuariorut={pedido.usuariorut}
          usuarioname={pedido.usuarioname}
          camareroname={pedido.camareroname}
          camareroapellido={pedido.camareroapellido}
          camarero={pedido.camarero}
          estado={pedido.estado}
        />
      ))}
      <div className="float-button">
        <button
          className="float-button-button"
          onClick={handleButtonClickTomadas}
        >
          <Link to="/nuevo-pedido"></Link>
        </button>
      </div>
    </div>
  );
};

export default Pedidos;
