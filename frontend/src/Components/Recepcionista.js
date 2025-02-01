// Recepcionista.js
import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Mesa from "./Mesa";
import "../styles/recepcionista.css";

const Recepcionista = () => {
  const [cliente, setCliente] = useState({
    rut: "",
    nombre: "",
    apellido: "",
  });

  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos de las mesas del servidor
    Axios.get("http://127.0.0.1:3001/mesa")
      .then((response) => {
        const mesasData = response.data.map((mesa) => ({
          id: mesa.id,
          capacidad: mesa.capacidad,
          estado: mesa.estado === "Ocupada" ? "rojo" : "verde",
        }));
        setMesas(mesasData);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos de las mesas", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente({
      ...cliente,
      [name]: value,
    });
  };

  const handleReserveClick = () => {
    Axios.get(`http://127.0.0.1:3001/selectUser/${cliente.rut}`)
      .then((response) => {
        if (response.data.length > 0) {
          handleReservation();
        } else {
          console.log(cliente);
          // Usuario no existe, crear nuevo usuario
          Axios.post("http://127.0.0.1:3001/create", cliente)
            .then((response) => {
              console.log("Usuario creado exitosamente", response);
              handleReservation();
            })
            .catch((error) => {
              console.error("Hubo un error al crear el usuario", error);
            });
        }
      })
      .catch((error) => {
        console.error("Hubo un error al verificar el usuario", error);
      });
  };

  const handleReservation = () => {
    if (mesaSeleccionada) {
      Axios.post(
        `http://127.0.0.1:3001/createComanda/${mesaSeleccionada}/${cliente.rut}`,
        {}
      ).then((response) => {
        console.log("Pedido Ingresado Correctamente", response);
      });

      Axios.post(
        `http://127.0.0.1:3001/mesastatus/${mesaSeleccionada}/${cliente.rut}`,
        {}
      )
        .then((response) => {
          console.log(
            "Estado de mesa y rut_usuario actualizados exitosamente",
            response
          );
          // Actualizar el estado de la mesa en el cliente
          setMesas((prevMesas) =>
            prevMesas.map((mesa) =>
              mesa.id === mesaSeleccionada ? { ...mesa, estado: "rojo" } : mesa
            )
          );
          navigate("/comandas");
        })
        .catch((error) => {
          console.error(
            "Hubo un error al actualizar el estado de la mesa y rut_usuario",
            error
          );
        });
    } else {
      console.log("No se ha seleccionado ninguna mesa");
    }
  };

  const handleMesaSeleccionada = (numeroMesa) => {
    setMesaSeleccionada(numeroMesa);
  };

  return (
    <div className="container">
      <h1>Restaurant</h1>
      <h2>Ingrese El Rut Del Cliente</h2>
      <div className="form-group">
        <form>
          <input
            type="text"
            name="rut"
            className="form-control"
            placeholder="RUT Cliente"
            value={cliente.rut}
            onChange={handleChange}
          />
          <h2>Ingrese El Nombre Cliente</h2>
          <input
            type="text"
            name="nombre"
            className="form-control"
            placeholder="Nombre Cliente"
            value={cliente.nombre}
            onChange={handleChange}
          />
          <h2>Ingrese El Apellido Cliente</h2>
          <input
            type="text"
            name="apellido"
            className="form-control"
            placeholder="Apellido Cliente"
            value={cliente.apellido}
            onChange={handleChange}
          />
        </form>
      </div>
      <div className="table">
        {mesas.map((mesa) => (
          <Mesa
            key={mesa.id}
            numero={mesa.id}
            capacidad={mesa.capacidad}
            estado={mesa.estado}
            onReserveClick={handleMesaSeleccionada}
          />
        ))}
      </div>
      <button className="button" id="btnterraza" onClick={handleReserveClick}>
        Reservar
      </button>
    </div>
  );
};

export default Recepcionista;
