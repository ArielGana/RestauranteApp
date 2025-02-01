import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../styles/comandadetail.css";
import Axios from "axios";

const ComandaDetail = ({
  pedidoid,
  idcomanda,
  camarero,
  mesa,
  fecha,
  usuariorut,
  usuarioname,
  apellidousuario,
  nombrecamarero,
  apellidocamarero,
}) => {
  const navigate = useNavigate();
  const [platos, setPlatos] = useState([]);
  const [postres, setPostres] = useState([]);
  const [refrescos, setRefrescos] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState("");
  const [currentPlatoId, setCurrentPlatoId] = useState(null);
  const [notes, setNotes] = useState({});
  const [indice, setIndice] = useState([]);
  const [cantidades, setCantidades] = useState({});
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [seleccionados, setSeleccionados] = useState({
    platos: [],
    postres: [],
    refrescos: [],
  });

  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const response = await Axios.get("http://127.0.0.1:3001/Platos");
        setPlatos(response.data);
      } catch (error) {
        console.error("Error fetching platos:", error);
      }
    };

    const fetchPostres = async () => {
      try {
        const response = await Axios.get("http://127.0.0.1:3001/Postres");
        setPostres(response.data);
      } catch (error) {
        console.error("Error fetching postres:", error);
      }
    };

    const fetchRefrescos = async () => {
      try {
        const response = await Axios.get("http://127.0.0.1:3001/Refrescos");
        setRefrescos(response.data);
      } catch (error) {
        console.error("Error fetching refrescos:", error);
      }
    };

    fetchPlatos();
    fetchPostres();
    fetchRefrescos();
  }, []);

  const handleModificarClickPlatos = () => {
    setMenuVisible(true);
    setIndice(platos);
    setTipoSeleccionado("platos");
  };

  const handleModificarClickPostres = () => {
    setMenuVisible(true);
    setIndice(postres);
    setTipoSeleccionado("postres");
  };

  const handleModificarClickRefrescos = () => {
    setMenuVisible(true);
    setIndice(refrescos);
    setTipoSeleccionado("refrescos");
  };

  const handleCantidadChange = (id, event) => {
    const nuevaCantidad = event.target.value;
    setCantidades((prevCantidades) => ({
      ...prevCantidades,
      [id]: nuevaCantidad,
    }));
  };

  const handleCerrarClick = () => {
    setMenuVisible(false);
    const nuevosSeleccionados = indice
      .filter((item) => cantidades[item.id] && cantidades[item.id] > 0)
      .map((item) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: cantidades[item.id],
      }));

    setSeleccionados((prevSeleccionados) => ({
      ...prevSeleccionados,
      [tipoSeleccionado]: nuevosSeleccionados,
    }));
    setCantidades(0);
  };

  // Ejemplo de uso
  function getRandomInt(min, max) {
    min = Math.ceil(min); // Redondea hacia arriba para asegurar que el mínimo sea inclusivo
    max = Math.floor(max); // Redondea hacia abajo para asegurar que el máximo sea exclusivo
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Ejemplo de uso: Generar un número aleatorio entre 1 y 100
  // Output puede ser un número aleatorio entre 1 y 100
  function mostrarMensaje(texto, id) {
    var mensajeElement = document.getElementById("mensaje");
    var mensajeErroneo = document.getElementById("mensajeError");

    if (id === 200) {
      mensajeElement.textContent = texto;
      mensajeElement.classList.add("mostrado"); // Agregar la clase 'mostrado' para mostrar el mensaje

      setTimeout(function () {
        mensajeElement.classList.remove("mostrado"); // Quitar la clase 'mostrado' después de 4 segundos
      }, 4000);
    }
    if (id === 500) {
      mensajeErroneo.textContent = texto;
      mensajeErroneo.classList.add("mostrado"); // Agregar la clase 'mostrado' para mostrar el mensaje

      setTimeout(function () {
        mensajeErroneo.classList.remove("mostrado"); // Quitar la clase 'mostrado' después de 4 segundos
      }, 4000);
    }
  }
  const handleReservarplatosClick = () => {
    // Generar un único ID para todos los pedidos
    const id = getRandomInt(1, 10000);

    seleccionados.platos.forEach((plato) => {
      if (plato.id && plato.cantidad) {
        const urlCreatePedidoPlato = `http://127.0.0.1:3001/createPedidoPlato`;
        const urlCreatePedido = `http://127.0.0.1:3001/createPedido/${idcomanda}`;

        const dataPlato = {
          id: id,
          plato_id: plato.id,
          cantidad: plato.cantidad,
          nota: notes[plato.id] || "",
        };

        Axios.post(urlCreatePedidoPlato, dataPlato)
          .then((response) => {
            const dataPedido = {
              plato_id: id,
            };

            return Axios.post(urlCreatePedido, dataPedido);
          })
          .then((response) => {
            if (response && response.status === 200) {
              mostrarMensaje("Pedidos de Plato recibido correctamente.", 200);
              setSeleccionados({ ...seleccionados, platos: [] });
              setCantidades(0); // Esto establecerá cantidades en 0
            }
            if (response && response.status === 500) {
              mostrarMensaje("Pedidos de Plato No Ingresados.", 500);
            }
          })
          .catch((error) => {});
      }
    });
  };

  const handleReservarrefrescosClick = () => {
    // Generar un único ID para todos los pedidos
    const id = getRandomInt(1, 10000);
    seleccionados.refrescos.forEach((refresco) => {
      if (refresco.id && refresco.cantidad) {
        const urlCreatePedidoRefresco = `http://127.0.0.1:3001/createPedidoRefresco`;
        const urlCreatePedido = `http://127.0.0.1:3001/createPedidoRefresco/${idcomanda}`;

        const dataRefresco = {
          id: id, // Utiliza el mismo idPedido para todos los refrescos
          refresco_id: refresco.id,
          cantidad: refresco.cantidad,
          nota: notes[refresco.id] || "",
        };

        Axios.post(urlCreatePedidoRefresco, dataRefresco)
          .then((response) => {
            const dataPedido = {
              refresco_id: id,
            };

            return Axios.post(urlCreatePedido, dataPedido);
          })
          .then((response) => {
            if (response && response.status === 200) {
              mostrarMensaje(
                "Pedidos de Refrescos recibido correctamente.",
                200
              );
              setSeleccionados({ ...seleccionados, refrescos: [] });
              setCantidades(0); // Esto establecerá cantidades en 0
            }
            if (response && response.status === 500) {
              mostrarMensaje("Pedidos de Plato No Ingresados.", 500);
            }
          })
          .catch((error) => {
            console.error("Error al crear pedido y refresco:", error);
          });
      }
    });
  };

  const handleReservarpostresClick = () => {
    // Generar un único ID para todos los pedidos
    const id = getRandomInt(1, 10000);

    seleccionados.postres.forEach((postre) => {
      if (postre.id && postre.cantidad) {
        const urlCreatePedidoPostre = `http://127.0.0.1:3001/createPedido_Postre`;
        const urlCreatePedido = `http://127.0.0.1:3001/createPedidoPostre/${idcomanda}`;
        const dataPostre = {
          id: id, // Utiliza el mismo idPedido para todos los postres
          postre_id: postre.id,
          cantidad: postre.cantidad,
          nota: notes[postre.id] || "",
        };

        Axios.post(urlCreatePedidoPostre, dataPostre)
          .then((response) => {
            const dataPedido = {
              postre_id: id,
            };

            return Axios.post(urlCreatePedido, dataPedido);
          })
          .then((response) => {
            if (response && response.status === 200) {
              mostrarMensaje("Pedidos de Postres recibido correctamente.", 200);
              setSeleccionados({ ...seleccionados, postres: [] });
              setCantidades(0); // Esto establecerá cantidades en 0
            }
            if (response && response.status === 500) {
              mostrarMensaje("Pedidos de Plato No Ingresados.", 500);
            }
          })
          .catch((error) => {
            console.error("Error al crear pedido y postre:", error);
          });
      }
    });
  };

  const separarFechaHora = (fechaHora) => {
    const [fecha, hora] = fechaHora.split(" ");
    const [año, mes, dia] = fecha.split("-");
    const fechaFormateada = `${dia}-${mes}-${año}`;
    return {
      fechasplit: fechaFormateada,
      horasplit: hora,
    };
  };

  const handleNotes = (platoId) => {
    setCurrentPlatoId(platoId);
    setNote(notes[platoId] || "");
    setShowModal(true);
  };

  const handleSaveNote = () => {
    setNotes({
      ...notes,
      [currentPlatoId]: note,
    });
    setNote("");
    setCurrentPlatoId(null);
    setShowModal(false);
  };
  const handleDelete = (tipo, itemId) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar este ${tipo}?`
    );
    if (confirmacion) {
      // Filtrar los elementos seleccionados y eliminar el que tenga el itemId
      const nuevosItems = seleccionados[tipo].filter(
        (item) => item.id !== itemId
      );

      // Actualizar el estado con los elementos filtrados
      setSeleccionados({
        ...seleccionados,
        [tipo]: nuevosItems,
      });
    }
  };

  const handleFinalizar = () => {
    const confirmacion = window.confirm(
      `¿Te Aseguraste de Reservar Todos los Pedidos?`
    );
    if (confirmacion) {
      navigate(`/Tomadas`);
    }
  };
  const { fechasplit, horasplit } = separarFechaHora(fecha);

  return (
    <div className="comanda-new-container">
      <div className="comanda-new-header">
        <div className="comanda-new-mesa">Mesa {mesa}</div>
        <div className="comanda-new-usuario">
          Usuario: {usuarioname} {apellidousuario}
        </div>

        <div className="comanda-new-fecha">
          Fecha: {fechasplit} Hora: {horasplit}
        </div>
        <div className="comanda-new-camarero">
          Camarero: {nombrecamarero + " " + apellidocamarero}
        </div>
      </div>
      <div className="comanda-new-info">
        <div className="comanda-new-item">
          <span className="name">Platos</span>
          {seleccionados.platos.length > 0 ? (
            seleccionados.platos.map((plato, index) => (
              <div key={index} className="comanda">
                <span>{plato.nombre} |</span>
                <span>X {plato.cantidad}</span>
                <div className="icons">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    className="bi bi-file-earmark-plus-fill"
                    viewBox="0 0 16 16"
                    onClick={() => handleNotes(plato.id)}
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                    onClick={() => handleDelete("platos", plato.id)}
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Plato</span>
            </div>
          )}
          <div className="comanda-new-buttons">
            <button
              id="modificar"
              className="comanda-new-button"
              onClick={handleModificarClickPlatos}
            >
              Modificar
            </button>
            <button
              id="reservar"
              className="comanda-new-button"
              onClick={() => handleReservarplatosClick(pedidoid)}
            >
              Reservar
            </button>
          </div>
        </div>

        <div className="comanda-new-item">
          <span className="name">Postres</span>
          {seleccionados.postres.length > 0 ? (
            seleccionados.postres.map((postre, index) => (
              <div key={index} className="comanda">
                <span>{postre.nombre} |</span>
                <span>X {postre.cantidad}</span>
                <div className="icons">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    className="bi bi-file-earmark-plus-fill"
                    viewBox="0 0 16 16"
                    onClick={() => handleNotes(postre.id)}
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                    onClick={() => handleDelete("postres", postre.id)}
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Postre</span>
            </div>
          )}
          <div className="comanda-new-buttons">
            <button
              id="modificar"
              className="comanda-new-button"
              onClick={handleModificarClickPostres}
            >
              Modificar
            </button>
            <button
              id="reservar"
              className="comanda-new-button"
              onClick={() => handleReservarpostresClick(pedidoid)}
            >
              Reservar
            </button>
          </div>
        </div>

        <div className="comanda-new-item">
          <span className="name">Refrescos</span>
          {seleccionados.refrescos.length > 0 ? (
            seleccionados.refrescos.map((refresco, index) => (
              <div key={index} className="comanda">
                <span>{refresco.nombre} |</span>
                <span>X {refresco.cantidad}</span>
                <div className="icons">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    className="bi bi-file-earmark-plus-fill"
                    viewBox="0 0 16 16"
                    onClick={() => handleNotes(refresco.id)}
                  >
                    <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="30"
                    fill="currentColor"
                    class="bi bi-trash"
                    viewBox="0 0 16 16"
                    onClick={() => handleDelete("refrescos", refresco.id)}
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="notcomanda">
              <span>Sin Refresco</span>
            </div>
          )}
          <div className="comanda-new-buttons">
            <button
              id="modificar"
              className="comanda-new-button"
              onClick={handleModificarClickRefrescos}
            >
              Modificar
            </button>
            <button
              id="reservar"
              className="comanda-new-button"
              onClick={() => handleReservarrefrescosClick(pedidoid)}
            >
              Reservar
            </button>
          </div>
        </div>
      </div>
      <div className="comanda-new-action">
        <button onClick={handleFinalizar} className="comanda-new-button">
          <Link>Finalizar</Link>
        </button>
      </div>
      <div id="mensaje" className="mensaje"></div>
      <div id="mensajeError" className="mensajeError"></div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Añadir Nota</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe tu nota aquí..."
            />
            <div className="modal-buttons">
              <button
                className="cerrarNote"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button className="guardarNote" onClick={handleSaveNote}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {menuVisible && (
        <div className="menu-overlay">
          <div className="menu">
            <h2>
              {tipoSeleccionado === "postres"
                ? "Postres"
                : tipoSeleccionado === "refrescos"
                ? "Refrescos"
                : "Platos"}
            </h2>
            <ul>
              {indice.map((item) => (
                <li key={item.id}>
                  {item.nombre}
                  <input
                    className="inputcanti"
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    value={cantidades[item.id] || ""}
                    onChange={(event) => handleCantidadChange(item.id, event)}
                  />
                </li>
              ))}
            </ul>
            <button className="cerrar-platos" onClick={handleCerrarClick}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComandaDetail;
