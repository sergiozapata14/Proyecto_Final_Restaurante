const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const reservacionesPath = path.join(__dirname, '../data/reservaciones.json');

// Obtener todas las reservaciones
router.get('/', (req, res) =>
{
    fs.readFile(reservacionesPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer reservaciones' });
        res.json(JSON.parse(data));
    });
});

// Agregar una reservación nueva
router.post('/', (req, res) =>
{
    const nuevaReservacion = req.body;

    fs.readFile(reservacionesPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer reservaciones' });

        const reservaciones = JSON.parse(data);
        nuevaReservacion.id = Date.now();
        reservaciones.push(nuevaReservacion);

        fs.writeFile(reservacionesPath, JSON.stringify(reservaciones, null, 2), err =>
        {
            if (err) return res.status(500).json({ error: 'Error al guardar reservación' });
            res.json({ message: 'Reservación guardada', reservacion: nuevaReservacion });
        });
    });
});

// Editar reservación
router.put('/:id', (req, res) =>
{
    const rawId = req.params.id;
    const id = Number(rawId);

    //console.log(`[PUT] petición para id (raw): "${rawId}", convertido:`, id);

    fs.readFile(reservacionesPath, 'utf8', (err, data) =>
    {
        if (err)
        {
            console.error('[PUT] Error leyendo archivo:', err);
            return res.status(500).json({ error: 'Error al leer reservaciones' });
        }

        let reservaciones;
        try
        {
            reservaciones = JSON.parse(data);
        }
        catch (parseErr)
        {
            console.error('[PUT] Error parseando JSON:', parseErr);
            return res.status(500).json({ error: 'Archivo de reservaciones corrupto' });
        }

        const idsEnArchivo = reservaciones.map(r => r.id);
        //console.log('[PUT] IDs en archivo:', idsEnArchivo);

        let index;
        if (!Number.isNaN(id))
        {
            index = reservaciones.findIndex(r => Number(r.id) === id);
        }
        else
        {
            index = reservaciones.findIndex(r => String(r.id) === rawId);
        }

        if (index === -1)
        {
            console.warn(`[PUT] Reservación con id ${rawId} no encontrada.`);
            return res.status(404).json({ error: 'Reservación no encontrada', ids_en_archivo: idsEnArchivo });
        }

        const datosActualizados = req.body || {};
        reservaciones[index] =
        {
            ...reservaciones[index],
            ...datosActualizados,
            id: reservaciones[index].id
        };

        fs.writeFile(reservacionesPath, JSON.stringify(reservaciones, null, 2), err =>
        {
            if (err)
            {
                console.error('[PUT] Error al guardar cambios:', err);
                return res.status(500).json({ error: 'Error al guardar cambios' });
            }

            //console.log(`[PUT] Reservación actualizada: id=${reservaciones[index].id}`);
            res.json({ message: 'Reservación actualizada', reservacion: reservaciones[index] });
        });
    });
});

// Eliminar reservación
router.delete('/:id', (req, res) =>
{
    const id = parseInt(req.params.id);

    fs.readFile(reservacionesPath, 'utf8', (err, data) =>
    {
        if (err) return res.status(500).json({ error: 'Error al leer reservaciones' });

        let reservaciones = JSON.parse(data);
        const index = reservaciones.findIndex(r => r.id === id);

        if (index === -1)
        {
            return res.status(404).json({ error: 'Reservación no encontrada' });
        }

        const reservacionEliminada = reservaciones[index];
        reservaciones.splice(index, 1);

        fs.writeFile(reservacionesPath, JSON.stringify(reservaciones, null, 2), err =>
        {
            if (err) return res.status(500).json({ error: 'Error al eliminar reservación' });

            res.json({ message: 'Reservación eliminada', reservacion: reservacionEliminada });
        });
    });
});

module.exports = router;