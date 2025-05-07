// Asume que ya se cargó la respuesta y están en "todasLasMultas"
let todasLasMultas = [];
let todosLosDocumentos = [];

// Selectores globales
const placaSelect = document.getElementById("placas");
const periodoSelect = document.getElementById("time");

// Consulta de multas por cédula
async function consultarMultasCedula() {
  const user_id = document.getElementById("param1").value;

  try {
    const response = await fetch(
      "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID_USUARIO: user_id }),
      }
    );

    const result = await response.json();
    const primerItem = result[0];
    const segundoItem = result[1];

    const bodyDataMultas =
      typeof primerItem.body === "string"
        ? JSON.parse(primerItem.body)
        : primerItem.body;
    const bodyDataDocumentos =
      typeof segundoItem.body === "string"
        ? JSON.parse(segundoItem.body)
        : segundoItem.body;

    const multas = bodyDataMultas.cartera || [];
    const documentos = bodyDataDocumentos.documentos || [];

    todasLasMultas = multas;
    todosLosDocumentos = documentos;

    // Llenar selector de placas
    placaSelect.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Todas las Placas";
    placaSelect.appendChild(optionDefault);

    const placasUnicas = [
      ...new Set(multas.map((m) => m.NRO_PLACA).filter(Boolean)),
    ];
    placasUnicas.forEach((placa) => {
      const option = document.createElement("option");
      option.value = placa;
      option.textContent = placa;
      placaSelect.appendChild(option);
    });

    document.querySelector(".plate").style.display = "block";
    llenarSelectPeriodos(); // Llenar sin placa seleccionada
    aplicarFiltros();
  } catch (error) {
    console.error("Error al consultar multas:", error);
  }
}
function obtenerPeriodosDesdeDocumentos(documentos, placa = "") {
  let annos = new Set();

  documentos.forEach((doc) => {
    if (!doc.ANNO) return;
    if (placa && doc.NRO_PLACA !== placa) return;
    annos.add(parseInt(doc.ANNO));
  });

  const sorted = Array.from(annos).sort((a, b) => a - b);
  const periodos = [];
  for (let i = 0; i < sorted.length; i += 2) {
    if (i + 1 < sorted.length) {
      periodos.push(`${sorted[i]}-${sorted[i + 1]}`);
    } else {
      periodos.push(`${sorted[i]}`);
    }
  }
  return periodos;
}

function llenarSelectPeriodos(placaSeleccionada = "") {
  const periodos = obtenerPeriodosDesdeDocumentos(
    todosLosDocumentos,
    placaSeleccionada
  );

  const select = document.getElementById("time");
  select.innerHTML = `<option value="">Expediente [año1 - año2]</option>`;
  periodos.forEach((periodo) => {

    const option = document.createElement("option");
    option.value = periodo;
    option.textContent = periodo;
    select.appendChild(option);
  });
}

function mostrarTablasPorPeriodo(multas, documentos = []) {
  const contenedor = document.querySelector(".table-responsive");
  contenedor.innerHTML = "";

  const placa = placaSelect.value;
  const periodoSeleccionado = periodoSelect.value;

  if (!periodoSeleccionado) return; // No mostrar nada si no hay periodo seleccionado

  // Agrupar multas por año
  const multasPorPeriodo = {};
  multas.forEach((m) => {
    const anno = parseInt(m.ANNO);
    if (!multasPorPeriodo[anno]) multasPorPeriodo[anno] = [];
    multasPorPeriodo[anno].push(m);
  });

  // Agrupar documentos por año
  const documentosPorPeriodo = {};
  documentos.forEach((d) => {
    const anno = parseInt(d.ANNO);
    if (placa && d.NRO_PLACA !== placa) return;
    if (!documentosPorPeriodo[anno]) documentosPorPeriodo[anno] = [];
    documentosPorPeriodo[anno].push(d);
  });

  const [desde, hasta] = periodoSeleccionado.split("-").map(Number);

  const periodoKey = `tabla-${periodoSeleccionado.replace("-", "")}`;
  const bloque = document.createElement("div");
  bloque.className = "tabla-periodo table-responsive";
  bloque.id = periodoKey;
  contenedor.appendChild(bloque);

  const titulo = document.createElement("h3");
  titulo.textContent = `Cartera por derechos de tránsito ${periodoSeleccionado}`;
  bloque.appendChild(titulo);

  const filas = [];
  for (let a = desde; a <= hasta; a++) {
    if (multasPorPeriodo[a]) filas.push(...multasPorPeriodo[a]);
  }

  if (filas.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "No hay registros para este intervalo de fechas.";
    bloque.appendChild(mensaje);
  } else {
    const tablaMultas = document.createElement("table");
    tablaMultas.className = "table table-striped";
    tablaMultas.innerHTML = `
        <thead>
          <tr>
                  <th>TIPO ACTO</th>
                  <th>NOMBRE COMPLETO</th>
                  <th>TIPO DOCUMENTO</th>
                  <th>AÑO</th>
                  <th>FECHA DOCUMENTO</th>
                  <th>URL DOCUMENTO</th>
                  <th>URL GUIA</th>
            </tr>
        </thead>
        <tbody>
          ${filas
        .map((data) => {
          const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
          return `
              <tr>
                <td>${data.DESC_DOCUMENTO || ""}</td>
                <td>${data.ID_USUARIO || ""}</td>
                <td>${data.NRO_PLACA || ""}</td>
                <td>${data.ANNO || ""}</td>
                <td>${data["NRO_PLACA#ANNO"] || ""}</td>
                <td>${nombre}</td>
                <td>${data.TELEFONO || ""}</td>
                <td>${data.NOMBRE_CIUDAD || ""}</td>
                <td>${data.NOMBRE_DEPARTAMENTO || ""}</td>
                <td>${data.DIRECCION || ""}</td>
                <td>${data.EMAIL || ""}</td>
                <td>${data.COSTAS || ""}</td>
                <td>${data.DERECHOS || ""}</td>
                <td>${data.DESC_ESTADO || ""}</td>
                <td>${data.ESTADO_VIGENCIA || ""}</td>
                <td>${data.INTERESES || ""}</td>
              </tr>`;
        })
        .join("")}
        </tbody>
      `;
    bloque.appendChild(tablaMultas);
  }

  // Documentos debajo
  const docs = [];
  for (let a = desde; a <= hasta; a++) {
    if (documentosPorPeriodo[a]) docs.push(...documentosPorPeriodo[a]);
  }

  if (docs.length > 0) {
    const tituloDocs = document.createElement("h3");
    tituloDocs.textContent = "PQR";
    bloque.appendChild(tituloDocs);

    const tablaDocs = document.createElement("table");
    tablaDocs.className = "table table-bordered";
    tablaDocs.innerHTML = `
      <thead>
        <tr>
          <th>RADICADO</th>
          <th>FECHA</th>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        ${docs
        .map(
          (doc) => `
          <tr>
            <td>${doc.TIPO_DOCUMENTO}</td>
            <td>${doc.FECHA}</td>
            <td><a href="${sanearURL(
            `https://litis.s3.us-east-1.amazonaws.com/pdfs/${doc.RUTA}/${doc.DOCUMENTO}`
          )}" target="_blank">${doc.DOCUMENTO}</a></td>
          </tr>
        `
        )
        .join("")}
      </tbody>`;
    bloque.appendChild(tablaDocs);
  }
}


function sanearURL(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

function aplicarFiltros() {
  const placaSeleccionada = placaSelect.value;
  const periodoSeleccionado = periodoSelect.value;

  let filtradas = [...todasLasMultas];
  if (placaSeleccionada !== "") {
    filtradas = filtradas.filter(
      (m) => (m.NRO_PLACA || "") === placaSeleccionada
    );
  }

  mostrarTablasPorPeriodo(filtradas, todosLosDocumentos);

  const bloques = document.querySelectorAll(".tabla-periodo");
  bloques.forEach((bloque) => {

    if (
      periodoSeleccionado === "" ||
      bloque.id === `tabla-${periodoSeleccionado.replace("-", "")}`
    ) {
      bloque.style.display = "block";
    } else {
      bloque.style.display = "none";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  if (placaSelect) {
    placaSelect.addEventListener("change", () => {
      aplicarFiltros();
      llenarSelectPeriodos(placaSelect.value); // Filtrar años por placa
    });
  }

  if (periodoSelect) {
    periodoSelect.addEventListener("change", aplicarFiltros);
  }
});

