import { apiGet, apiPost, apiPut } from "./api.js";

let menu = [];
let carrito = [];

document.addEventListener("DOMContentLoaded", async () =>
{
    menu = await apiGet("menu");

    cargarSelectProductos();
    cargarPedidos();

    document.getElementById("btnAgregarProducto").addEventListener("click", agregarProductoCarrito);
    document.getElementById("formPedido").addEventListener("submit", guardarPedido);
});

function crearProductoEditable(producto = null)
{
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex gap-2 mb-2 align-items-center";

    const select = document.createElement("select");
    select.className = "form-select";
    select.style.flex = "1";

    menu.forEach(m =>
    {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.nombre} - $${m.precio}`;
        select.appendChild(opt);
    });

    if (producto)
    {
        const menuItem = menu.find(p => p.nombre === producto.nombre);
        if (menuItem) select.value = menuItem.id;
    }

    const cantidadInput = document.createElement("input");
    cantidadInput.type = "number";
    cantidadInput.min = 1;
    cantidadInput.value = producto ? producto.cantidad : 1;
    cantidadInput.className = "form-control";
    cantidadInput.style.width = "80px";

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn btn-danger";
    btnEliminar.innerHTML = "✕";
    btnEliminar.onclick = () => wrapper.remove();

    wrapper.appendChild(select);
    wrapper.appendChild(cantidadInput);
    wrapper.appendChild(btnEliminar);

    return wrapper;
}

function cargarSelectProductos()
{
    const select = document.getElementById("producto");
    select.innerHTML = "";

    menu.forEach(item =>
    {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.nombre} - $${item.precio}`;
        select.appendChild(option);
    });
}

function agregarProductoCarrito()
{
    const id = Number(document.getElementById("producto").value);
    const cantidad = Number(document.getElementById("cantidad").value);

    const producto = menu.find(p => p.id === id);

    const item =
    {
        id_producto: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio_unitario: producto.precio,
        subtotal: producto.precio * cantidad
    };

    carrito.push(item);
    renderCarrito();
}

function renderCarrito()
{
    const lista = document.getElementById("listaProductos");
    lista.innerHTML = "";

    carrito.forEach((p, i) =>
    {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerHTML =
        `
            ${p.cantidad} × ${p.nombre} — $${p.subtotal}
            <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${i})">
                <i class="bi bi-trash-fill"></i>
            </button>
        `;
        lista.appendChild(li);
    });
}

window.eliminarProducto = function (index)
{
    carrito.splice(index, 1);
    renderCarrito();
};

function generarFechaActual()
{
    const f = new Date();

    const fecha =
        f.getFullYear() + "-" +
        String(f.getMonth() + 1).padStart(2, "0") + "-" +
        String(f.getDate()).padStart(2, "0") + " " +
        String(f.getHours()).padStart(2, "0") + ":" +
        String(f.getMinutes()).padStart(2, "0");

    return fecha;
}

async function guardarPedido(e)
{
    e.preventDefault();

    if (carrito.length === 0)
    {
        return alert("Agrega al menos un producto");
    }

    const pedido =
    {
        cliente: document.getElementById("cliente").value,
        fecha: generarFechaActual(),
        productos: carrito,
        total: carrito.reduce((sum, p) => sum + p.subtotal, 0),
        estado: "pendiente"
    };

    await apiPost("pedidos", pedido);

    alert("Pedido guardado correctamente");

    carrito = [];
    document.getElementById("formPedido").reset();
    renderCarrito();
    cargarPedidos();
}

async function cargarPedidos()
{
    const tabla = document.getElementById("tablaPedidos");
    const pedidos = await apiGet("pedidos");

    pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tabla.innerHTML = "";

    pedidos.forEach(p =>
    {
        const tr = document.createElement("tr");

        // Construir lista de productos como texto
        const productosTexto = p.productos.map(prod => `${prod.cantidad}× ${prod.nombre}`).join("<br>");

        const estados = ["pendiente", "preparando", "preparado", "entregado", "cancelado"];

        const selectEstado =
        `
            <select class="form-select estado-select" data-id="${p.id}">
                ${estados.map(est => `<option value="${est}" ${est === p.estado ? "selected" : ""}>${est}</option>`).join("")}
            </select>
        `;

        tr.innerHTML =
        `
            <td>
                <button class="btn btn-sm btn-warning btn-editar" data-id="${p.id}">
                    <i class="bi bi-pencil-square"></i>
                </button>
            </td>
            <td>${selectEstado}</td>
            <td>${productosTexto}</td>
            <td>$${p.total}</td>
            <td>${p.cliente}</td>
            <td>${p.fecha}</td>
            <td>${p.id}</td>
        `;

        tabla.appendChild(tr);
    });

    // Detectar cambios de estado
    document.querySelectorAll(".estado-select").forEach(select =>
    {
        select.addEventListener("change", async e =>
        {
            const id = e.target.dataset.id;
            const nuevoEstado = e.target.value;

            await apiPut(`pedidos/${id}`, { estado: nuevoEstado });

            console.log(`Pedido ${id} actualizado a: ${nuevoEstado}`);
        });
    });

    document.querySelectorAll(".btn-editar").forEach(btn =>
    {
        btn.addEventListener("click", async () =>
        {
            const pedidosAll = await apiGet("pedidos");
            const pedido = pedidosAll.find(x => x.id == btn.dataset.id);

            document.getElementById("edit-id").value = pedido.id;
            document.getElementById("edit-cliente").value = pedido.cliente;
            document.getElementById("edit-estado").value = pedido.estado;

            const contenedor = document.getElementById("edit-lista-productos");
            contenedor.innerHTML = "";

            pedido.productos.forEach(p =>
            {
                contenedor.appendChild(crearProductoEditable(p));
            });

            document.getElementById("btnEditarAgregarProducto").onclick = () =>
            {
                contenedor.appendChild(crearProductoEditable());
            };

            new bootstrap.Modal(document.getElementById("modalEditarPedido")).show();
        });
    });
}

document.getElementById("btnGuardarCambios").addEventListener("click", async () =>
{
    const id = document.getElementById("edit-id").value;

    const cliente = document.getElementById("edit-cliente").value;
    const estado = document.getElementById("edit-estado").value;

    const contenedor = document.getElementById("edit-lista-productos");
    const items = [...contenedor.children];

    const productos = items.map(div =>
    {
        const select = div.children[0];
        const cantidadInput = div.children[1];

        const menuItem = menu.find(p => p.id == select.value);

        return {id_producto: menuItem.id,
                nombre: menuItem.nombre,
                cantidad: Number(cantidadInput.value),
                precio_unitario: menuItem.precio,
                subtotal: menuItem.precio * Number(cantidadInput.value)};
    });

    const total = productos.reduce((a, b) => a + b.subtotal, 0);

    await apiPut(`pedidos/${id}`,
    {
        cliente,
        estado,
        productos,
        total
    });

    alert("Pedido actualizado");
    cargarPedidos();

    bootstrap.Modal.getInstance(document.getElementById("modalEditarPedido")).hide();
});