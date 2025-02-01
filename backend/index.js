const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config();
// Middleware para manejar JSON y CORS
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database.");
});

app.post("/create", (req, res) => {
  const { rut, nombre, apellido } = req.body;

  const query = "INSERT INTO usuario (rut, Nombre, Apellido) VALUES (?, ?, ?)";
  db.query(query, [rut, nombre, apellido], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al registrar el usuario");
    } else {
      res.send("Usuario Registrado");
    }
  });
});
app.post("/createComanda/:id/:rut_usuario", (req, res) => {
  const fechaActual = new Date();
  const mesaId = req.params.id;
  const rutUsuario = req.params.rut_usuario;

  const query =
    "INSERT INTO comanda (fecha, mesa_id, camarero_rut, usuario_rut, estado) VALUES (?, ?, ?, ?, ?)";
  db.query(
    query,
    [fechaActual, mesaId, "000000", rutUsuario, "En Espera"],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});

app.get("/mesa", (req, res) => {
  const query = "SELECT * FROM mesa";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las mesas", err);
    } else {
      res.json(results);
    }
  });
});

app.get("/Comandas", (req, res) => {
  const query = `
  SELECT 
    comanda.*, 
    usuario.nombre AS nombre_usuario,
    camarero.nombre AS nombre_camarero,
    camarero.apellido AS apellido_camarero
  FROM 
    comanda 
  JOIN 
    usuario 
  ON 
    comanda.usuario_rut = usuario.Rut 
  JOIN
    camarero
  ON
    comanda.camarero_rut = camarero.Rut 
  WHERE 
    comanda.estado = 'En Espera';
`;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});
app.get("/pedidosTomados", (req, res) => {
  const query = `
  SELECT 
    comanda.*, 
    usuario.nombre AS nombre_usuario,
    camarero.nombre AS nombre_camarero,
    camarero.apellido AS apellido_camarero
FROM 
    comanda 
JOIN 
    usuario 
ON 
    comanda.usuario_rut = usuario.Rut 
JOIN
    camarero
ON
    comanda.camarero_rut = camarero.Rut 
WHERE 
    comanda.Estado = 'Tomada';

`;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});

app.get("/pedidodetail/:mesa", (req, res) => {
  const mesa_id = req.params.mesa; // Cambiado a mesa_id para que coincida con el nombre de la columna en la tabla
  const query = `
  SELECT 
      p.id,
      p.fecha,
      p.mesa_id,
      p.camarero_rut,
      p.usuario_rut,
      p.estado,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario,
      c.nombre AS nombre_camarero,
      c.apellido AS apellido_camarero
  FROM 
      comanda p
  JOIN 
      usuario u ON p.usuario_rut = u.rut 
  JOIN
      camarero c ON p.camarero_rut = c.rut
  WHERE 
      p.mesa_id = ?
      AND p.estado = 'Tomada'
`;

  db.query(query, [mesa_id], (err, results) => {
    // Pasar mesa_id como parámetro en un array
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});
app.get("/pedidoDetailTomados/:comanda", (req, res) => {
  const comanda = req.params.comanda; // Cambiado a mesa_id para que coincida con el nombre de la columna en la tabla
  const query = `
SELECT
    p1.comanda_id,
    GROUP_CONCAT(DISTINCT CONCAT(pl.nombre, ':', pp.cantidad) SEPARATOR ', ') AS pedidoplato,
    GROUP_CONCAT(DISTINCT CONCAT(rf.nombre, ':', pr.cantidad) SEPARATOR ', ') AS pedidorefresco,
    GROUP_CONCAT(DISTINCT CONCAT(pt.nombre, ':', po.cantidad) SEPARATOR ', ') AS pedidopostre
FROM
    (SELECT comanda_id, platopedido FROM pedido WHERE comanda_id = ? AND Estado = 'cocinando' AND platopedido IS NOT NULL) p1
LEFT JOIN
    (SELECT comanda_id, refrescopedido FROM pedido WHERE comanda_id = ? AND Estado = 'cocinando' AND refrescopedido IS NOT NULL) p2 ON p1.comanda_id = p2.comanda_id
LEFT JOIN
    (SELECT comanda_id, postrepedido FROM pedido WHERE comanda_id = ? AND Estado = 'cocinando' AND postrepedido IS NOT NULL) p3 ON p1.comanda_id = p3.comanda_id
LEFT JOIN
    pedidoplato pp ON p1.platopedido = pp.pedido_id
LEFT JOIN
    platos pl ON pp.plato_id = pl.id
LEFT JOIN
    pedidorefresco pr ON p2.refrescopedido = pr.pedido_id
LEFT JOIN
    refrescos rf ON pr.refresco_id = rf.id
LEFT JOIN
    pedido_postre po ON p3.postrepedido = po.pedido_id
LEFT JOIN
    postre pt ON po.postre_id = pt.id
GROUP BY
    p1.comanda_id;


`;

  db.query(query, [comanda, comanda, comanda], (err, results) => {
    // Pasar mesa_id como parámetro en un array
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});
app.get("/Camareros", (req, res) => {
  const query = `
    SELECT * FROM camarero
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});

app.post("/createPedido/:comanda", (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { plato_id } = req.body;

  const query =
    "INSERT INTO pedido (fecha, platopedido , estado,comanda_id) VALUES (?,?, ?, ?)";
  db.query(
    query,
    [fechaActual, plato_id, "Cocinando", comanda],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});
app.post("/createPedidoRefresco/:comanda", (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { refresco_id } = req.body;

  const query =
    "INSERT INTO pedido (fecha, refrescopedido , estado,comanda_id) VALUES (?,?, ?, ?)";
  db.query(
    query,
    [fechaActual, refresco_id, "Cocinando", comanda],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});
app.post("/createPedidoPostre/:comanda", (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { postre_id } = req.body;

  const query =
    "INSERT INTO pedido (fecha, postrepedido , estado,comanda_id) VALUES (?,?, ?, ?)";
  db.query(
    query,
    [fechaActual, postre_id, "Cocinando", comanda],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});
app.post("/createPedidoPlato", (req, res) => {
  const { id, plato_id, cantidad, nota } = req.body; // Extrayendo plato_id y cantidad correctamente desde req.body
  const fechaHoraAgregado = new Date();
  const query =
    "INSERT INTO pedidoplato (pedido_id,plato_id, cantidad, estado,notas,fecha) VALUES (?, ?, ?,?,?,?)";
  db.query(
    query,
    [id, plato_id, cantidad, "Cocinando...", nota, fechaHoraAgregado],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});
app.post("/createPedidoRefresco", (req, res) => {
  const { id, refresco_id, cantidad, nota } = req.body; // Extrayendo plato_id y cantidad correctamente desde req.body
  const fechaHoraAgregado = new Date();
  const query =
    "INSERT INTO pedidorefresco (pedido_id,refresco_id, cantidad, estado,notas,fecha) VALUES (?, ?, ?,?,?,?)";
  db.query(
    query,
    [id, refresco_id, cantidad, "Cocinando...", nota, fechaHoraAgregado],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});

app.post("/createPedido_postre", (req, res) => {
  const { id, postre_id, cantidad, nota } = req.body; // Extrayendo plato_id y cantidad correctamente desde req.body
  const fechaHoraAgregado = new Date();
  const query =
    "INSERT INTO pedido_postre (pedido_id,postre_id, cantidad, estado,notas,fecha) VALUES (?, ?, ?,?,?,?)";
  db.query(
    query,
    [id, postre_id, cantidad, "Cocinando...", nota, fechaHoraAgregado],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar datos a la comanda");
      } else {
        res.send("Datos agregados a la comanda correctamente");
      }
    }
  );
});

app.get("/Platos/:pedidoid", (req, res) => {
  const pedidoId = req.params.pedidoid;

  const query = `
    SELECT * FROM pedidoplato WHERE pedido_id = ?
  `;

  db.query(query, [pedidoId], (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de las comandas:", err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});
app.get("/Platos", (req, res) => {
  const query = `
    SELECT * FROM platos
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de los refrescos:", err);
      res.status(500).send("Error al obtener los datos de los refrescos");
    } else {
      res.json(results);
    }
  });
});
app.get("/platosCocinando", (req, res) => {
  const query = `
SELECT 'Plato' AS tipo, 
       pp.pedido_id AS pedido_id, 
       pp.plato_id AS comida_id, 
       p.nombre AS nombre_comida, 
       pp.cantidad AS cantidad,
       pp.notas AS notas,
       pp.fecha AS fecha
FROM pedidoplato pp
JOIN platos p ON pp.plato_id = p.id
WHERE pp.estado = 'Cocinando...'

UNION ALL

SELECT 'Postre' AS tipo, 
       pp.pedido_id AS pedido_id, 
       pp.postre_id AS comida_id, 
       po.nombre AS nombre_comida, 
       pp.cantidad AS cantidad,
       pp.notas AS notas,
       pp.fecha AS fecha
FROM pedido_postre pp
JOIN postre po ON pp.postre_id = po.id
WHERE pp.estado = 'Cocinando...'

UNION ALL

SELECT 'Refresco' AS tipo, 
       pp.pedido_id AS pedido_id, 
       pp.refresco_id AS comida_id, 
       re.nombre AS nombre_comida, 
       pp.cantidad AS cantidad,
       pp.notas AS notas,
       pp.fecha AS fecha
FROM pedidorefresco pp
JOIN refrescos re ON pp.refresco_id = re.id
WHERE pp.estado = 'Cocinando...';


  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los pedidos: ", err);
      res.status(500).send("Error al obtener los pedidos");
    } else {
      res.json(results);
    }
  });
});
app.get("/selectUser/:rut", (req, res) => {
  const id = req.params.rut;
  const query = `
    SELECT * FROM usuario WHERE rut= ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de los refrescos:", err);
      res.status(500).send("Error al obtener los datos de los refrescos");
    } else {
      res.json(results);
    }
  });
});

app.get("/Postres", (req, res) => {
  const query = `
    SELECT * FROM postre
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de los refrescos:", err);
      res.status(500).send("Error al obtener los datos de los refrescos");
    } else {
      res.json(results);
    }
  });
});
app.post("/platoTerminado/:comanda/:mesa/:rut/:motivo/:estado", (req, res) => {
  const motivo = req.params.motivo;
  const mesa = req.params.mesa;
  const estado = req.params.estado;
  const rut = req.params.rut;
  const comanda = req.params.comanda;

  const query1 = `
    UPDATE comanda
    SET Estado = 'Terminada',
        motivoTermino = ?
    WHERE mesa_id = ? AND estado = ? AND usuario_rut = ? AND id = ?;
  `;

  const query2 = `
    UPDATE pedido
    SET Estado = 'Finalizado'
    WHERE comanda_id = ?;
  `;

  const query3 = `
    UPDATE mesa
    SET Estado = 'Vacia'
    WHERE id = ?;
  `;

  db.query(query1, [motivo, mesa, estado, rut, comanda], (err, results1) => {
    if (err) {
      console.error("Error al actualizar la tabla comanda:", err);
      res.status(500).send("Error al actualizar la tabla comanda");
    } else {
      db.query(query2, [comanda], (err, results2) => {
        if (err) {
          console.error("Error al actualizar la tabla pedido:", err);
          res.status(500).send("Error al actualizar la tabla pedido");
        } else {
          db.query(query3, [mesa], (err, results3) => {
            if (err) {
              console.error("Error al actualizar la tabla mesa:", err);
              res.status(500).send("Error al actualizar la tabla mesa");
            } else {
              res.json({
                mensaje:
                  "Las tablas comanda, pedido y mesa han sido actualizadas",
                comanda: results1,
                pedido: results2,
                mesa: results3,
              });
            }
          });
        }
      });
    }
  });
});

app.get("/Refrescos", (req, res) => {
  const query = `
    SELECT * FROM refrescos
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de los refrescos:", err);
      res.status(500).send("Error al obtener los datos de los refrescos");
    } else {
      res.json(results);
    }
  });
});

// Nueva ruta para actualizar el camarero_rut de un pedido
app.post("/updateCamarero/:pedidoId/:rutcamar", (req, res) => {
  const pedidoId = req.params.pedidoId; // Obtener el ID del pedido de los parámetros de la URL
  const camareroRut = req.params.rutcamar; // Aquí es donde está el valor del rut del camarero
  // Obtener el nuevo camarero_rut del cuerpo de la solicitud

  const query = `
  UPDATE comanda
  SET estado = 'Tomada',
      camarero_rut = ?
  WHERE id = ?;
`;

  db.query(query, [camareroRut, pedidoId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al actualizar el camarero_rut");
    } else {
      res.send("camarero_rut actualizado correctamente");
    }
  });
});

app.get("/comandas/:mesa", (req, res) => {
  const mesaId = req.params.mesa; // Obtener el ID de la mesa de los parámetros de la URL
  const query = `
  SELECT 
  pedido.*, 
  camarero.nombre AS nombre_camarero,
  camarero.apellido AS apellido_camarero
FROM 
  pedido 
JOIN 
  camarero 
ON 
  pedido.camarero_rut = camarero.rut 
WHERE 
  mesa_id = ?;

  `;
  db.query(query, [mesaId], (err, results) => {
    // Pasar el parámetro a la consulta
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener los datos de las comandas");
    } else {
      res.json(results);
    }
  });
});

app.post("/mesastatus/:id/:rut_usuario", (req, res) => {
  const mesaId = req.params.id;
  const rutUsuario = req.params.rut_usuario;
  const query =
    "UPDATE mesa SET Estado = CASE WHEN estado = 'Vacia' THEN 'Ocupada' ELSE 'Vacia' END, rut_usuario = ? WHERE id = ?";
  db.query(query, [rutUsuario, mesaId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al cambiar el estado de la mesa");
    } else {
      res
        .status(200)
        .send("Estado de la mesa y rut_usuario cambiados correctamente");
    }
  });
});
app.post("/marcarItemPreparado", (req, res) => {
  const { tipo, pedido_id, comida_id, nombre_comida, cantidad } = req.body;

  let query;
  let params;

  switch (tipo) {
    case "Plato":
      query = `
        UPDATE pedidoplato pp
        JOIN platos p ON pp.plato_id = p.id
        SET pp.estado = 'Preparado'
        WHERE pp.estado = 'Cocinando...'
          AND pp.pedido_id = ?
          AND pp.plato_id = ?
          AND p.nombre = ?
          AND pp.cantidad = ?;
      `;
      params = [pedido_id, comida_id, nombre_comida, cantidad];
      break;
    case "Postre":
      query = `
        UPDATE pedido_postre pp
        JOIN postre po ON pp.postre_id = po.id
        SET pp.estado = 'Preparado'
        WHERE pp.estado = 'Cocinando...'
          AND pp.pedido_id = ?
          AND pp.postre_id = ?
          AND po.nombre = ?
          AND pp.cantidad = ?;
      `;
      params = [pedido_id, comida_id, nombre_comida, cantidad];
      break;
    case "Refresco":
      query = `
        UPDATE pedidorefresco pp
        JOIN refrescos re ON pp.refresco_id = re.id
        SET pp.estado = 'Preparado'
        WHERE pp.estado = 'Cocinando...'
          AND pp.pedido_id = ?
          AND pp.refresco_id = ?
          AND re.nombre = ?
          AND pp.cantidad = ?;
      `;
      params = [pedido_id, comida_id, nombre_comida, cantidad];
      break;
    default:
      return res.status(400).send("Tipo de ítem no válido");
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error al marcar el ítem como preparado: ", err);
      res.status(500).send("Error al marcar el ítem como preparado");
    } else {
      res.send("Ítem marcado como preparado correctamente");
    }
  });
});

app.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});
