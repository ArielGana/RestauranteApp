const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();
const postgres = require("postgres");

// Middleware para manejar JSON y CORS
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const connectionString = process.env.DATABASE_URL;

// Conectar a la base de datos
const sql = postgres(connectionString, {
  ssl: "require", // Obligamos a usar SSL
});

// Probar la conexión
sql`SELECT 1`
  .then(() => {
    console.log("Conexión exitosa");
  })
  .catch((err) => {
    console.error("Error conectando a la base de datos:", err);
  });

app.post("/create", async (req, res) => {
  const { rut, nombre, apellido } = req.body;

  try {
    await sql`
      INSERT INTO usuario (rut, Nombre, Apellido) 
      VALUES (${rut}, ${nombre}, ${apellido})
    `;
    res.send("Usuario Registrado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al registrar el usuario");
  }
});

app.post("/createComanda/:id/:rut_usuario", async (req, res) => {
  const fechaActual = new Date();
  const mesaId = req.params.id;
  const rutUsuario = req.params.rut_usuario;

  try {
    await sql`
      INSERT INTO comanda (fecha, mesa_id, camarero_rut, usuario_rut, estado) 
      VALUES (${fechaActual}, ${mesaId}, '000000', ${rutUsuario}, 'En Espera')
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.get("/mesa", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM mesa`;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las mesas");
  }
});

app.get("/Comandas", async (req, res) => {
  try {
    const results = await sql`
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
        comanda.estado = 'En Espera'
    `;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.get("/pedidosTomados", async (req, res) => {
  try {
    const results = await sql`
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
        comanda.Estado = 'Tomada'
    `;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.get("/pedidodetail/:mesa", async (req, res) => {
  const mesa_id = req.params.mesa;

  try {
    const results = await sql`
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
        p.mesa_id = ${mesa_id}
        AND p.estado = 'Tomada'
    `;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.get("/pedidoDetailTomados/:comanda", async (req, res) => {
  const comanda = req.params.comanda;

  try {
    const results = await sql`
      SELECT
        p1.comanda_id,
        GROUP_CONCAT(DISTINCT CONCAT(pl.nombre, ':', pp.cantidad) SEPARATOR ', ') AS pedidoplato,
        GROUP_CONCAT(DISTINCT CONCAT(rf.nombre, ':', pr.cantidad) SEPARATOR ', ') AS pedidorefresco,
        GROUP_CONCAT(DISTINCT CONCAT(pt.nombre, ':', po.cantidad) SEPARATOR ', ') AS pedidopostre
      FROM
        (SELECT comanda_id, platopedido FROM pedido WHERE comanda_id = ${comanda} AND Estado = 'cocinando' AND platopedido IS NOT NULL) p1
      LEFT JOIN
        (SELECT comanda_id, refrescopedido FROM pedido WHERE comanda_id = ${comanda} AND Estado = 'cocinando' AND refrescopedido IS NOT NULL) p2 ON p1.comanda_id = p2.comanda_id
      LEFT JOIN
        (SELECT comanda_id, postrepedido FROM pedido WHERE comanda_id = ${comanda} AND Estado = 'cocinando' AND postrepedido IS NOT NULL) p3 ON p1.comanda_id = p3.comanda_id
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
        p1.comanda_id
    `;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.get("/Camareros", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM camarero`;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de los camareros");
  }
});

app.post("/createPedido/:comanda", async (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { plato_id } = req.body;

  try {
    await sql`
      INSERT INTO pedido (fecha, platopedido, estado, comanda_id) 
      VALUES (${fechaActual}, ${plato_id}, 'Cocinando', ${comanda})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.post("/createPedidoRefresco/:comanda", async (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { refresco_id } = req.body;

  try {
    await sql`
      INSERT INTO pedido (fecha, refrescopedido, estado, comanda_id) 
      VALUES (${fechaActual}, ${refresco_id}, 'Cocinando', ${comanda})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.post("/createPedidoPostre/:comanda", async (req, res) => {
  const fechaActual = new Date();
  const comanda = req.params.comanda;
  const { postre_id } = req.body;

  try {
    await sql`
      INSERT INTO pedido (fecha, postrepedido, estado, comanda_id) 
      VALUES (${fechaActual}, ${postre_id}, 'Cocinando', ${comanda})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.post("/createPedidoPlato", async (req, res) => {
  const { id, plato_id, cantidad, nota } = req.body;
  const fechaHoraAgregado = new Date();

  try {
    await sql`
      INSERT INTO pedidoplato (pedido_id, plato_id, cantidad, estado, notas, fecha) 
      VALUES (${id}, ${plato_id}, ${cantidad}, 'Cocinando...', ${nota}, ${fechaHoraAgregado})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.post("/createPedidoRefresco", async (req, res) => {
  const { id, refresco_id, cantidad, nota } = req.body;
  const fechaHoraAgregado = new Date();

  try {
    await sql`
      INSERT INTO pedidorefresco (pedido_id, refresco_id, cantidad, estado, notas, fecha) 
      VALUES (${id}, ${refresco_id}, ${cantidad}, 'Cocinando...', ${nota}, ${fechaHoraAgregado})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.post("/createPedido_postre", async (req, res) => {
  const { id, postre_id, cantidad, nota } = req.body;
  const fechaHoraAgregado = new Date();

  try {
    await sql`
      INSERT INTO pedido_postre (pedido_id, postre_id, cantidad, estado, notas, fecha) 
      VALUES (${id}, ${postre_id}, ${cantidad}, 'Cocinando...', ${nota}, ${fechaHoraAgregado})
    `;
    res.send("Datos agregados a la comanda correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al agregar datos a la comanda");
  }
});

app.get("/Platos/:pedidoid", async (req, res) => {
  const pedidoId = req.params.pedidoid;

  try {
    const results = await sql`
      SELECT * FROM pedidoplato WHERE pedido_id = ${pedidoId}
    `;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los datos de las comandas:", err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.get("/Platos", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM platos`;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los datos de los platos:", err);
    res.status(500).send("Error al obtener los datos de los platos");
  }
});

app.get("/platosCocinando", async (req, res) => {
  try {
    const results = await sql`
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
      WHERE pp.estado = 'Cocinando...'
    `;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los pedidos: ", err);
    res.status(500).send("Error al obtener los pedidos");
  }
});

app.get("/selectUser/:rut", async (req, res) => {
  const id = req.params.rut;

  try {
    const results = await sql`
      SELECT * FROM usuario WHERE rut = ${id}
    `;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los datos del usuario:", err);
    res.status(500).send("Error al obtener los datos del usuario");
  }
});

app.get("/Postres", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM postre`;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los datos de los postres:", err);
    res.status(500).send("Error al obtener los datos de los postres");
  }
});

app.post(
  "/platoTerminado/:comanda/:mesa/:rut/:motivo/:estado",
  async (req, res) => {
    const motivo = req.params.motivo;
    const mesa = req.params.mesa;
    const estado = req.params.estado;
    const rut = req.params.rut;
    const comanda = req.params.comanda;

    try {
      // Iniciar transacción
      await sql.begin(async (sql) => {
        // Actualizar comanda
        await sql`
        UPDATE comanda
        SET Estado = 'Terminada',
            motivoTermino = ${motivo}
        WHERE mesa_id = ${mesa} AND estado = ${estado} AND usuario_rut = ${rut} AND id = ${comanda}
      `;

        // Actualizar pedido
        await sql`
        UPDATE pedido
        SET Estado = 'Finalizado'
        WHERE comanda_id = ${comanda}
      `;

        // Actualizar mesa
        await sql`
        UPDATE mesa
        SET Estado = 'Vacia'
        WHERE id = ${mesa}
      `;
      });

      res.json({
        mensaje: "Las tablas comanda, pedido y mesa han sido actualizadas",
      });
    } catch (err) {
      console.error("Error al actualizar las tablas:", err);
      res.status(500).send("Error al actualizar las tablas");
    }
  }
);

app.get("/Refrescos", async (req, res) => {
  try {
    const results = await sql`SELECT * FROM refrescos`;
    res.json(results);
  } catch (err) {
    console.error("Error al obtener los datos de los refrescos:", err);
    res.status(500).send("Error al obtener los datos de los refrescos");
  }
});

app.post("/updateCamarero/:pedidoId/:rutcamar", async (req, res) => {
  const pedidoId = req.params.pedidoId;
  const camareroRut = req.params.rutcamar;

  try {
    await sql`
      UPDATE comanda
      SET estado = 'Tomada',
          camarero_rut = ${camareroRut}
      WHERE id = ${pedidoId}
    `;
    res.send("camarero_rut actualizado correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el camarero_rut");
  }
});

app.get("/comandas/:mesa", async (req, res) => {
  const mesaId = req.params.mesa;

  try {
    const results = await sql`
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
        mesa_id = ${mesaId}
    `;
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los datos de las comandas");
  }
});

app.post("/mesastatus/:id/:rut_usuario", async (req, res) => {
  const mesaId = req.params.id;
  const rutUsuario = req.params.rut_usuario;

  try {
    await sql`
      UPDATE mesa 
      SET Estado = CASE WHEN estado = 'Vacia' THEN 'Ocupada' ELSE 'Vacia' END, 
          rut_usuario = ${rutUsuario} 
      WHERE id = ${mesaId}
    `;
    res
      .status(200)
      .send("Estado de la mesa y rut_usuario cambiados correctamente");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al cambiar el estado de la mesa");
  }
});

app.post("/marcarItemPreparado", async (req, res) => {
  const { tipo, pedido_id, comida_id, nombre_comida, cantidad } = req.body;

  try {
    switch (tipo) {
      case "Plato":
        await sql`
          UPDATE pedidoplato pp
          JOIN platos p ON pp.plato_id = p.id
          SET pp.estado = 'Preparado'
          WHERE pp.estado = 'Cocinando...'
            AND pp.pedido_id = ${pedido_id}
            AND pp.plato_id = ${comida_id}
            AND p.nombre = ${nombre_comida}
            AND pp.cantidad = ${cantidad}
        `;
        break;
      case "Postre":
        await sql`
          UPDATE pedido_postre pp
          JOIN postre po ON pp.postre_id = po.id
          SET pp.estado = 'Preparado'
          WHERE pp.estado = 'Cocinando...'
            AND pp.pedido_id = ${pedido_id}
            AND pp.postre_id = ${comida_id}
            AND po.nombre = ${nombre_comida}
            AND pp.cantidad = ${cantidad}
        `;
        break;
      case "Refresco":
        await sql`
          UPDATE pedidorefresco pp
          JOIN refrescos re ON pp.refresco_id = re.id
          SET pp.estado = 'Preparado'
          WHERE pp.estado = 'Cocinando...'
            AND pp.pedido_id = ${pedido_id}
            AND pp.refresco_id = ${comida_id}
            AND re.nombre = ${nombre_comida}
            AND pp.cantidad = ${cantidad}
        `;
        break;
      default:
        return res.status(400).send("Tipo de ítem no válido");
    }
    res.send("Ítem marcado como preparado correctamente");
  } catch (err) {
    console.error("Error al marcar el ítem como preparado: ", err);
    res.status(500).send("Error al marcar el ítem como preparado");
  }
});

app.listen(3001, () => {
  console.log("Servidor corriendo en el puerto 3001");
});
