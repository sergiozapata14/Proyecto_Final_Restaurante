import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

document.addEventListener("DOMContentLoaded", () =>
{
    cargarMenu();
});

async function cargarMenu()
{
    const contenedor = document.getElementById("lista-platillos");
    contenedor.innerHTML = "";

    const menu = await apiGet("menu");

    menu.forEach(item =>
    {
        const div = document.createElement("div");
        div.classList.add("col-12", "col-md-6", "col-lg-4");

        div.innerHTML =
        `
            <div class="card shadow-sm p-3">
                <h5 class="card-title">${item.nombre}</h5>
                <p class="card-text fs-4 fw-bold">$${item.precio}</p>
                <div class="d-flex justify-content-between mt-3">
                    <button class="btn btn-sm btn-warning btn-editar" data-id="${item.id}">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${item.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>
        `;
        contenedor.appendChild(div);
    });

    // eventos
    document.querySelectorAll(".btn-editar").forEach(btn => btn.addEventListener("click", abrirModalEditar));
    document.querySelectorAll(".btn-eliminar").forEach(btn => btn.addEventListener("click", eliminarPlatillo));
}

document.getElementById("form-agregar").addEventListener("submit", guardarPlatillo);

async function guardarPlatillo(e)
{
    e.preventDefault();

    const nuevo =
    {
        nombre: document.getElementById("nombre").value,
        precio: parseFloat(document.getElementById("precio").value)
    };

    await apiPost("menu", nuevo);

    document.getElementById("form-agregar").reset();
    
    cargarMenu();
}

function abrirModalEditar(e)
{
    const id = e.target.dataset.id;

    const modalEl = document.getElementById("modalEditar");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    document.getElementById("id-editar").value = id;
}

document.getElementById("form-editar").addEventListener("submit", editarPlatillo);

async function editarPlatillo(e)
{
    e.preventDefault();

    const id = document.getElementById("id-editar").value;

    const cambios =
    {
        nombre: document.getElementById("nombre-editar").value,
        precio: parseFloat(document.getElementById("precio-editar").value)
    };

    await apiPut(`menu/${id}`, cambios);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
    modal.hide();

    cargarMenu();
}

async function eliminarPlatillo(e)
{
    const id = e.target.dataset.id;

    if (!confirm("¿Seguro que deseas eliminar este platillo?")) return;

    await apiDelete(`menu/${id}`);

    cargarMenu();
}