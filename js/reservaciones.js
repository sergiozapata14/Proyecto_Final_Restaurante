import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

document.addEventListener("DOMContentLoaded", () =>
{
    cargarReservaciones();

    // Guardar nueva reservación
    document.getElementById("formReservacion").addEventListener("submit", async (e) =>
    {
        e.preventDefault();

        const datos =
        {
            nombre_cliente: document.getElementById("nombre_cliente").value,
            personas: Number(document.getElementById("personas").value),
            telefono: document.getElementById("telefono").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            notas: document.getElementById("notas").value,
            estado: "activa"
        };

        try
        {
            await apiPost("reservaciones", datos);
            alert("Reservación registrada correctamente");
            document.getElementById("formReservacion").reset();
            cargarReservaciones();
        }
        catch (err)
        {
            console.error("Error guardando reservación:", err);
        }
    });
});

async function cargarReservaciones()
{
    const tabla = document.getElementById("tablaReservaciones");

    tabla.innerHTML = "";

    try
    {
        const reservaciones = await apiGet("reservaciones");

        reservaciones.sort((a, b) =>
        {
            const fechaA = new Date(`${a.fecha} ${a.hora}`);
            const fechaB = new Date(`${b.fecha} ${b.hora}`);
            return fechaB - fechaA;
        });

        reservaciones.forEach(res =>
        {
            const fila = document.createElement("tr");

            fila.innerHTML =
            `
                <td>
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${res.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${res.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
                <td>
                    <select class="form-select form-select-sm estado-select" data-id="${res.id}">
                        <option value="activa" ${res.estado === "activa" ? "selected" : ""}>Activa</option>
                        <option value="cumplida" ${res.estado === "cumplida" ? "selected" : ""}>Cumplida</option>
                        <option value="cancelada" ${res.estado === "cancelada" ? "selected" : ""}>Cancelada</option>
                    </select>
                </td>
                <td>${res.personas}</td>
                <td>${res.hora}</td>
                <td>${res.fecha}</td>
                <td>${res.nombre_cliente}</td>
                <td>${res.telefono}</td>
                <td>${res.notas || ""}</td>
                <td>${res.id}</td>
            `;
            tabla.appendChild(fila);
        });
        activarBotones();
    }
    catch (err)
    {
        console.error("Error cargando reservaciones:", err);
    }
}

function activarBotones()
{

    document.querySelectorAll(".btn-editar").forEach(btn =>
    {
        btn.addEventListener("click", async () =>
        {
            const id = btn.dataset.id;
            cargarDatosEnModal(id);
        });
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn =>
    {
        btn.addEventListener("click", async () =>
        {
            const id = btn.dataset.id;

            if (!confirm("¿Seguro que deseas eliminar esta reservación?")) return;

            try
            {
                await apiDelete(`reservaciones/${id}`);
                cargarReservaciones();
            }
            catch (err)
            {
                console.error("Error eliminando:", err);
            }
        });
    });

    document.querySelectorAll(".estado-select").forEach(select =>
    {
        select.addEventListener("change", async () =>
        {
            const id = select.dataset.id;
            const nuevoEstado = select.value;

            try
            {
                await apiPut(`reservaciones/${id}`, { estado: nuevoEstado });
            }
            catch (err)
            {
                console.error("Error actualizando estado:", err);
            }
        });
    });
}

async function cargarDatosEnModal(id)
{
    const reservaciones = await apiGet("reservaciones");
    const res = reservaciones.find(r => r.id == id);

    document.getElementById("edit_id").value = res.id;
    document.getElementById("edit_nombre").value = res.nombre_cliente;
    document.getElementById("edit_personas").value = res.personas;
    document.getElementById("edit_fecha").value = res.fecha;
    document.getElementById("edit_hora").value = res.hora;
    document.getElementById("edit_telefono").value = res.telefono;
    document.getElementById("edit_notas").value = res.notas;
    document.getElementById("edit_estado").value = res.estado;

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
    modal.show();

    document.getElementById("btnGuardarCambios").onclick = async () =>
    {
        const idReal = Number(document.getElementById("edit_id").value);

        const datos =
        {
            nombre_cliente: document.getElementById("edit_nombre").value,
            personas: Number(document.getElementById("edit_personas").value),
            fecha: document.getElementById("edit_fecha").value,
            hora: document.getElementById("edit_hora").value,
            telefono: document.getElementById("edit_telefono").value,
            notas: document.getElementById("edit_notas").value,
            estado: document.getElementById("edit_estado").value
        };

        try
        {
            await apiPut(`reservaciones/${idReal}`, datos);
            alert("Reservación actualizada correctamente");
            modal.hide();
            cargarReservaciones();
        }
        catch (err)
        {
            console.error("Error actualizando:", err);
        }
    };
}