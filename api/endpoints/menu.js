const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '../data/menu.json');

// Leer archivo JSON
function leerMenu()
{
    return new Promise((resolve, reject) =>
    {
        fs.readFile(menuPath, 'utf8', (err, data) =>
        {
            if (err) return reject(err);
            resolve(JSON.parse(data));
        });
    });
}

// Guardar archivo JSON
function guardarMenu(data)
{
    return new Promise((resolve, reject) =>
    {
        fs.writeFile(menuPath, JSON.stringify(data, null, 2), 'utf8', err =>
        {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Obtener todos los platillos
router.get('/', async (req, res) =>
{
    try
    {
        const menu = await leerMenu();
        res.json(menu);
    }
    catch (error)
    {
        res.status(500).json({ error: 'Error al leer el menú' });
    }
});

// Agregar un platillo nuevo
router.post('/', async (req, res) =>
{
    try
    {
        const nuevo = req.body;  // { nombre, precio, categoria }
        const menu = await leerMenu();

        // Generar un ID incremental
        nuevo.id = menu.length > 0 ? menu[menu.length - 1].id + 1 : 1;

        menu.push(nuevo);
        await guardarMenu(menu);

        res.json({ mensaje: 'Platillo agregado', platillo: nuevo });

    }
    catch (error)
    {
        res.status(500).json({ error: 'Error al guardar el platillo' });
    }
});

// Editar un platillo existente
router.put('/:id', async (req, res) =>
{
    try
    {
        const id = parseInt(req.params.id);
        const cambios = req.body; // { nombre, precio, categoria }
        const menu = await leerMenu();

        const index = menu.findIndex(p => p.id === id);

        if (index === -1)
        {
            return res.status(404).json({ error: 'Platillo no encontrado' });
        }

        menu[index] = { ...menu[index], ...cambios };

        await guardarMenu(menu);

        res.json({ mensaje: 'Platillo actualizado', platillo: menu[index] });

    }
    catch (error)
    {
        res.status(500).json({ error: 'Error al actualizar el platillo' });
    }
});

// Eliminar un platillo
router.delete('/:id', async (req, res) =>
{
    try
    {
        const id = parseInt(req.params.id);
        const menu = await leerMenu();

        const nuevoMenu = menu.filter(p => p.id !== id);

        if (nuevoMenu.length === menu.length)
        {
            return res.status(404).json({ error: 'Platillo no encontrado' });
        }

        await guardarMenu(nuevoMenu);

        res.json({ mensaje: 'Platillo eliminado' });

    }
    catch (error)
    {
        res.status(500).json({ error: 'Error al eliminar el platillo' });
    }
});

module.exports = router;