let containerCarteraComparendos = null;
let comparendosPago = [];
let pagosComparendos = [];


async function consultarDTPagosComparendos(htmlBoton) {
    console.log("Consultando DT Pagos Comparendos");
  const contenedor = htmlBoton.closest(".view");
  containerCarteraComparendos = contenedor;

  const cedula = contenedor.querySelector("#param1").value.replaceAll(".", "");
  await consultarPorCedulaComparendos(cedula);
}

async function consultarPorCedulaComparendos(userId) {
    console.log("Consultando por cédula:", userId);
  try {
    const response = await fetch(
      "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/pagosCarteraCf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID_USUARIO: userId }),
      }
    );

    const result = await response.json();
    console.log("Resultado de la consulta:", result);

    const parsedBody = JSON.parse(result.body);
    console.log("Parsed body:", parsedBody);
    comparendosPago = parsedBody.cartera || [];
    pagosComparendos = parsedBody.pagos || [];
    comparendosPago = comparendosPago.map((m) => {
      // Elimina .0 al final de los campos ANNO y DOCUMENTO
      return {
        ...m,
        ANNO: String(m.ANNO).replaceAll(".0", ""),
        DOCUMENTO: String(m.DOCUMENTO).replaceAll(".0", ""),
      };
    });
    console.log("Comparendos obtenidos:", comparendosPago);
    console.log("Pagos obtenidos:", pagosComparendos);
    llenarSelectPeriodosComparendos();
    aplicarFiltrosComparendos();
  } catch (error) {
    console.error("Error al consultar comparendos:", error);
  }
}


function obtenerPeriodosDesdeMultas(multas) {
  const annos = new Set();
  multas.forEach((m) => {
    if (m.ANNO) {
      const limpio = String(m.ANNO).replaceAll(".0", ""); // elimina .0 al final
      annos.add(limpio);
    }
  });
  return Array.from(annos).sort();
}

function llenarSelectPeriodosComparendos() {
  const select = containerCarteraComparendos.querySelector("#time");
  select.innerHTML = `<option value="">año</option>`;

  const periodos = obtenerPeriodosDesdeMultas(comparendosPago);
  periodos.forEach((anio) => {
    const option = document.createElement("option");
    option.value = anio;
    option.textContent = anio;
    select.appendChild(option);
  });
}

function aplicarFiltrosComparendos() {
  const periodo = containerCarteraComparendos.querySelector("#time").value;

  if (periodo === "") {
    // Si no hay año seleccionado, limpia la tabla y no muestra nada
    mostrarTablaComparendos( []);
    return;
  }

  const filtradas = comparendosPago.filter(
    (m) => String(m.ANNO) === String(periodo)
  );

  mostrarTablaComparendos(filtradas);
}


function mostrarTablaComparendos(multas) {
  const contenedor = containerCarteraComparendos.querySelector(".table-responsive1");
  
  const tabla = contenedor.querySelector("table");
  const tbody = tabla.querySelector("tbody");

  tbody.innerHTML = "";
  if (multas.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="10" class="text-center">No hay registros para este año.</td>`;
    tbody.appendChild(fila);
  }else{
  const multasOrdenadas = [...multas].sort((a, b) => {
    const tipoA = (a.TIPO_ACTO || "").toUpperCase();
    const tipoB = (b.TIPO_ACTO || "").toUpperCase();
    return tipoA.localeCompare(tipoB);
  });
  console.log("Multas ordenadas:", multasOrdenadas);
  // Luego iteramos sobre el array ordenado
  multasOrdenadas.forEach((data) => {
    const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
    const fila = document.createElement("tr");

    fila.innerHTML = `
    <td>${(data.DESC_ESTADO || "").toUpperCase()}</td>
    <td>${(data.ID_USUARIO || "").toUpperCase()}</td>
    <td>${data.NOMBRE_APELLIDO || nombre}</td>
    <td>${data.DIRECCION || ""}</td>
    <td>${data.NOMBRE_CIUDAD || ""}</td>
    <td>${data.EMAIL || ""}</td>
    <td>${data.ID_REGISTRO || ""}</td>
    <td>${data.DESC_DOCUMENTO || ""}</td>
    <td>${data.NRO_COMPARENDO_MOROSO || ""}</td>
    <td>${data.ANNO?.replaceAll?.(".0", "") || ""}</td>
  `;

    tbody.appendChild(fila);
  });
  }

  // Primero ordenamos el array por TIPO_ACTO alfabéticamente

  console.log("Tabla de comparendos mostrada correctamente", pagosComparendos);
  const contenedorPagos = containerCarteraComparendos.querySelector(".table-responsive2");
  console.log("Contenedor de pagos:", contenedorPagos);
    const tablaPagos = contenedorPagos.querySelector("table");
    const tbodyPagos = tablaPagos.querySelector("tbody");
    // Agregar los pagos si existen
        const filaPagos = document.createElement("tr");
        tbodyPagos.appendChild(filaPagos);

        if (pagosComparendos.length === 0) {
            filaPagos.innerHTML = `<td colspan="8" class="text-center">No hay pagos registrados</td>`;
        }
        else{
            pagosComparendos.forEach((pago) => {
                const nombre = `${pago.NOMBRES || ""} ${pago.APELLIDOS || ""}`;
            const filaPago = document.createElement("tr");
            filaPago.innerHTML = `
                <td>${pago.DESC_TRAMITE || ""}</td>
                <td>${pago.DESC_DOCUMENTO || ""}</td>
                <td>${pago.ID_USUARIO || ""}</td>
                <td>${nombre || ""}</td>
                <td>${pago.ID_PAGA_FACTURA || ""}</td>
                <td>${pago.ID_REGISTRO || ""}</td>
                <td>${pago.NRO_RECIBO || ""}</td>
                <td>${pago.VALOR_TARIFA || ""}</td>
            `;
            tbodyPagos.appendChild(filaPago);
        });
        }
    
}

function sanearURL(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

window.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches("#time")) {
      aplicarFiltrosComparendos();
    }
  });
});
