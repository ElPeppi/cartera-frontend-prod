let containerCartera = null;
let cartera = [];
let pagos = [];

let periodoSelectCartera = null;

async function consultarCartera(htmlBoton) {
    const contenedor = htmlBoton.closest(".view");
    containerCartera = contenedor;

    const cedula = contenedor.querySelector("#param1").value.replaceAll(".", "");
    await consultarCarteraPago(cedula);
}

async function consultarCarteraPago(userId) {
    try{
        const response = await fetch(
            "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/pagos",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ID_USUARIO: userId }),
            }
        );

        const result = await response.json();
        const primerItem = result[0];
        const segundoItem = result[1];

        const bodyDataCartera = 
            typeof primerItem.body === "string" 
            ? JSON.parse(primerItem.body) 
            : primerItem.body;

        const bodyDataPagos = 
            typeof segundoItem.body === "string" 
            ? JSON.parse(segundoItem.body) 
            : segundoItem.body;

        cartera = bodyDataCartera.cartera || [];
        pagos = bodyDataPagos.pagos || [];

        cartera = cartera.map((m) => {
            // Elimina .0 al final de los campos ANNO y DOCUMENTO
            return {
                ...m,
                ANNO: String(m.ANNO).replaceAll(".0", ""),
                DOCUMENTO: String(m.DOCUMENTO).replaceAll(".0", ""),
            };
        });

        pagos = pagos.map((p) => {
            // Elimina .0 al final de los campos ANNO y DOCUMENTO
            return {
                ...p,
                ANNO: String(p.ANNO).replaceAll(".0", ""),
                DOCUMENTO: String(p.DOCUMENTO).replaceAll(".0", ""),
            };
        });

        llenarSelectPeriodosCartera();
        aplicarFiltrosCartera();
    }
    catch (error) {
        console.error("Error al consultar cartera:", error);
    }
}

function obtenerPeriodosDesdeCartera(cartera) {
    const annos = new Set();
    cartera.forEach((m) => {
        if (m.ANNO) {
            const limpio = String(m.ANNO).replaceAll(".0", ""); // elimina .0 al final
            annos.add(limpio);
        }
    });
    return Array.from(annos).sort();
}

function llenarSelectPeriodosCartera() {
    const select = containerCartera.querySelector("#time");
    select.innerHTML = `<option value="">año</option>`;

    const periodos = obtenerPeriodosDesdeCartera(cartera);
    periodos.forEach((anio) => {
        const option = document.createElement("option");
        option.value = anio;
        option.textContent = anio;
        select.appendChild(option);
    });
}

function aplicarFiltrosCartera() {
    const periodo = containerCartera.querySelector("#time").value;

    if (periodo === "") {
        // Si no hay año seleccionado, limpia la tabla y no muestra nada
        mostrarTablaCartera([]);
        mostrarTablaPagos([]);
        return;
    }

    const filtradas = cartera.filter(
        (m) => String(m.ANNO) === String(periodo)
    );

    mostrarTablaCartera(filtradas);
    const filtradosPagos = pagos.filter(
        (p) => String(p.ANNO) === String(periodo)
    );
    mostrarTablaPagos(filtradosPagos);

}

function mostrarTablaCartera(cartera) {
    const tabla = containerCartera.querySelector("#tablaCartera");
    tabla.innerHTML = ""; // Limpia la tabla

    if (cartera.length === 0) {
        tabla.innerHTML = "<tr><td colspan='5'>No hay datos disponibles</td></tr>";
        return;
    }

    cartera.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.DOCUMENTO}</td>
            <td>${item.ANNO}</td>
            <td>${item.VALOR}</td>
            <td>${item.ESTADO}</td>
            <td>${item.FECHA}</td>
        `;
        tabla.appendChild(row);
    });
}

function mostrarTablaPagos(pagos) {
    const tabla = containerCartera.querySelector("#tablaPagos");
    tabla.innerHTML = ""; // Limpia la tabla

    if (pagos.length === 0) {
        tabla.innerHTML = "<tr><td colspan='5'>No hay datos disponibles</td></tr>";
        return;
    }

    pagos.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.DOCUMENTO}</td>
            <td>${item.ANNO}</td>
            <td>${item.VALOR}</td>
            <td>${item.FECHA}</td>
            <td>${item.METODO}</td>
        `;
        tabla.appendChild(row);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("change", (e) =>{
        if (e.target && e.target.matches("#time")){
            aplicarFiltrosCartera();
        }
    });
});