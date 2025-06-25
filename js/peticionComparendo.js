let containerComparendos = null;
let comparendos = [];

let periodoSelectComparendos = null;

async function consultarDTComparendos(htmlBoton) {
  const contenedor = htmlBoton.closest(".view");
  containerComparendos = contenedor;

  const cedula = contenedor.querySelector("#param1").value.replaceAll(".", "");
  await consultarMultasPorCedulaComparendos(cedula);
}

async function consultarMultasPorCedulaComparendos(userId) {
  try {
    const response = await fetch(
      "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/comparendos",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID_USUARIO: userId }),
      }
    );

    const result = await response.json();
    console.log("Resultado de la consulta:", result);

    const parsedBody = JSON.parse(result.body);
    comparendos = parsedBody.comparendos || [];
    comparendos = comparendos.map((m) => {
      // Elimina .0 al final de los campos ANNO y DOCUMENTO
      return {
        ...m,
        ANNO: String(m.ANNO).replaceAll(".0", ""),
        DOCUMENTO: String(m.DOCUMENTO).replaceAll(".0", ""),
      };
    });
    console.log("Comparendos obtenidos:", comparendos);
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
  const select = containerComparendos.querySelector("#time");
  select.innerHTML = `<option value="">año</option>`;

  const periodos = obtenerPeriodosDesdeMultas(comparendos);
  periodos.forEach((anio) => {
    const option = document.createElement("option");
    option.value = anio;
    option.textContent = anio;
    select.appendChild(option);
  });
}

function aplicarFiltrosComparendos() {
  const periodo = containerComparendos.querySelector("#time").value;

  if (periodo === "") {
    // Si no hay año seleccionado, limpia la tabla y no muestra nada
    mostrarTablaComparendos([]);
    return;
  }

  const filtradas = comparendos.filter(
    (m) => String(m.ANNO) === String(periodo)
  );

  mostrarTablaComparendos(filtradas);
}


function mostrarTablaComparendos(multas) {
  const contenedor = containerComparendos.querySelector(".table-responsive");
  const tabla = contenedor.querySelector("table");
  const tbody = tabla.querySelector("tbody");

  tbody.innerHTML = "";

  if (multas.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="7" class="text-center">No hay registros para este año.</td>`;
    tbody.appendChild(fila);
    return;
  }

  // Primero ordenamos el array por TIPO_ACTO alfabéticamente
  const multasOrdenadas = [...multas].sort((a, b) => {
    const tipoA = (a.TIPO_ACTO || "").toUpperCase();
    const tipoB = (b.TIPO_ACTO || "").toUpperCase();
    return tipoA.localeCompare(tipoB);
  });

  // Luego iteramos sobre el array ordenado
  multasOrdenadas.forEach((data) => {
    const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
    const fila = document.createElement("tr");

    const rutaDocumento = data.RUTA_DOCUMENTO.toLowerCase();
    const isImagen = rutaDocumento.includes("imagenes");

    const rutaBase = isImagen
      ? "https://litis.s3.us-east-1.amazonaws.com/pdfs"
      : "https://litis.s3.us-east-1.amazonaws.com/pdfs_cf";

    fila.innerHTML = `
    <td>${(data.TIPO_ACTO || "").toUpperCase()}</td>
    <td>${(data.DOCFUE || "").toUpperCase()}</td>
    <td>${data.NOMBRE_APELLIDO || nombre}</td>
    <td>${data.DESC_DOCUMENTO || ""}</td>
    <td>${data.ANNO?.replaceAll?.(".0", "") || ""}</td>
    <td>${data.FECHA || ""}</td>
    <td><a href="${sanearURL(`${rutaBase}/${data.RUTA_DOCUMENTO}/${data.DOCUMENTO}`)}" target="_blank">${data.DOCUMENTO}</a></td>
    <td><a href="${sanearURL(`https://litis.s3.us-east-1.amazonaws.com/pdfs/${data.RUTA_GUIA}`)}" target="_blank">${data.GUIA}</a></td>
  `;

    tbody.appendChild(fila);
  });

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
