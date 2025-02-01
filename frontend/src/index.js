import React from "react";
import ReactDOM from "react-dom";
import App from "./App"; // Importa el componente App
import { ComandaProvider } from "./Components/ComandaContext";

ReactDOM.render(
  <ComandaProvider>
    <App />
  </ComandaProvider>,
  document.getElementById("root")
);
