const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Rutas
const menuRoutes = require('./endpoints/menu');
const pedidosRoutes = require('./endpoints/pedidos');
const reservacionesRoutes = require('./endpoints/reservaciones');

app.use('/api/menu', menuRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reservaciones', reservacionesRoutes);

// Server
const PORT = 3000;
app.listen(PORT, () =>
{
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});