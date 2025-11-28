const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const pedidosPath = path.join(__dirname, '../data/pedidos.json');

// Obtener todos los pedidos
router.get('/', (req, res) =>
{
    fs.readFile(pedidosPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer pedidos' });
        res.json(JSON.parse(data));
    });
});

// Agregar un pedido nuevo
router.post('/', (req, res) =>
{
    const nuevoPedido = req.body;

    fs.readFile(pedidosPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer pedidos' });

        const pedidos = JSON.parse(data);
        nuevoPedido.id = Date.now();
        pedidos.push(nuevoPedido);

        fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), err =>
        {
            if (err) return res.status(500).json({ error: 'Error al guardar pedido' });
            res.json({ message: 'Pedido guardado', pedido: nuevoPedido });
        });
    });
});

// Editar un pedido existente
router.put('/:id', (req, res) =>
{
    //console.log("PUT recibido en backend para ID:", req.params.id);
    const idPedido = req.params.id;
    const datosActualizados = req.body;

    fs.readFile(pedidosPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer pedidos' });

        const pedidos = JSON.parse(data);

        const index = pedidos.findIndex(p => String(p.id) === String(idPedido));

        if (index === -1)
        {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        pedidos[index] =
        {
            ...pedidos[index],
            ...datosActualizados,
            id: pedidos[index].id
        };

        fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), err =>
        {
            if (err) return res.status(500).json({ error: 'Error al guardar cambios' });
            res.json({ message: 'Pedido actualizado', pedido: pedidos[index] });
        });
    });
});

module.exports = router;