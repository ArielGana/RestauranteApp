import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Recepcionista from "./Components/Recepcionista";
import Comanda from "./Components/ComandasTable";
import Detail from "./Components/pedidoTable";
import Tomadas from "./Components/tomadosTable";
import Cocina from "./Components/platosCocina";
import Detailtomados from "./Components/pedidosTomadosTable";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-container">
          <ul className="navbar-menu">
            <li>
              <Link to="/" className="navbar-link">
                Reserva
              </Link>
            </li>
            <li>
              <Link to="/comandas" className="navbar-link">
                Comandas
              </Link>
            </li>
            <li>
              <Link to="/Tomadas" className="navbar-link">
                Comandas Tomadas
              </Link>
            </li>
            <li>
              <Link to="/Cocina" className="navbar-link">
                Cocina
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div id="root" style={{ marginTop: "70px" }}>
        <Routes>
          <Route path="/" element={<Recepcionista />} />
          <Route path="/comandas" element={<Comanda />} />
          <Route path="/details/:mesa/:idpedido" element={<Detail />} />
          <Route path="/Tomadas" element={<Tomadas />} />
          <Route path="/Cocina" element={<Cocina />} />
          <Route path="/detailTomada/:comandaid" element={<Detailtomados />} />
        </Routes>
      </div>
      <style>
        {`
        .navbar {
          background-color: rgb(255, 255, 255);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .navbar-menu {
          list-style: none;
          display: flex;
        }

        .navbar ul {
          margin-left: -80px;
        }

        .navbar-menu li {
          margin-left: 20px;
        }

        .navbar-link {
          color: black;
          text-decoration: none;
          font-size: 18px;
          transition: color 0.3s ease;
        }

        .navbar-link:hover {
          color: #bdbdbd;
        }

        #root {
          margin-top: 70px;
        }
        `}
      </style>
    </Router>
  );
}

export default App;
