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
    const response = await fetch("https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ID_USUARIO: user_id }),
    });

    const result = await response.json();
    const primerItem = result[0];
    const segundoItem = result[1];

    const bodyDataMultas = typeof primerItem.body === "string" ? JSON.parse(primerItem.body) : primerItem.body;
    const bodyDataDocumentos = typeof segundoItem.body === "string" ? JSON.parse(segundoItem.body) : segundoItem.body;

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

    const placasUnicas = [...new Set(multas.map((m) => m.NRO_PLACA).filter(Boolean))];
    placasUnicas.forEach((placa) => {
      const option = document.createElement("option");
      option.value = placa;
      option.textContent = placa;
      placaSelect.appendChild(option);
    });

    document.querySelector(".plate").style.display = "block";
    aplicarFiltros();
  } catch (error) {
    console.error("Error al consultar multas:", error);
  }
}

function mostrarTablasPorPeriodo(multas, documentos = []) {
    const contenedor = document.querySelector(".table-responsive");
    contenedor.innerHTML = "";
  
    const periodos = {
      "2004-2010": [],
      "2011-2015": [],
      "2016-2017": [],
      "2018-2019": [],
      "2020-2021": [],
      "2022-2023": [],
    };
  
    multas.forEach((multa) => {
      let anno = parseInt(multa.ANNO || multa["NRO_PLACA#ANNO"]?.split("#")[1]);
      for (const periodo in periodos) {
        const [desde, hasta] = periodo.split("-").map(Number);
        if (anno >= desde && anno <= hasta) {
          periodos[periodo].push(multa);
          break;
        }
      }
    });
  
    const documentosPorPeriodo = {};
    documentos.forEach((doc) => {
      let anno = parseInt(doc.ANNO);
      for (const periodo in periodos) {
        const [desde, hasta] = periodo.split("-").map(Number);
        if (anno >= desde && anno <= hasta) {
          if (!documentosPorPeriodo[periodo]) documentosPorPeriodo[periodo] = [];
          documentosPorPeriodo[periodo].push(doc);
          break;
        }
      }
    });
  
    for (const periodo in periodos) {
      const grupo = periodos[periodo];
      const bloque = document.createElement("div");
      bloque.className = "tabla-periodo table-responsive";
      bloque.id = `tabla-${periodo.replace("-", "")}`;
      contenedor.appendChild(bloque);
  
      const titulo = document.createElement("h3");
      titulo.textContent = `Cartera por derechos de tránsito ${periodo}`;
      bloque.appendChild(titulo);
  
      if (grupo.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No hay registros para este intervalo de fechas.";
        bloque.appendChild(mensaje);
      } else {
        const tablaMultas = document.createElement("table");
        tablaMultas.className = "table table-striped";
        tablaMultas.innerHTML = `
          <thead>
            <tr>
              <th>DESC DOCUMENTO</th>
              <th>ID USUARIO</th>
              <th>NOMBRE COMPLETO</th>
              <th>NRO PLACA</th>
              <th>AÑO</th>
            </tr>
          </thead>
          <tbody>
            ${grupo.map(data => {
              const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
              return `
                <tr>
                  <td>${(data.DESC_DOCUMENTO || "")}</td>
                  <td>${(data.ID_USUARIO || "")}</td>
                  <td>${nombre}</td>
                  <td>${(data.NRO_PLACA || "")}</td>
                  <td>${(data.ANNO || "")}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        `;
        bloque.appendChild(tablaMultas);
      }
  
      // Documentos debajo
      const docs = documentosPorPeriodo[periodo] || [];
      if (docs.length > 0) {
        const tituloDocs = document.createElement("h4");
        tituloDocs.textContent = "Documentos disponibles";
        bloque.appendChild(tituloDocs);
  
        const tablaDocs = document.createElement("table");
        tablaDocs.className = "table table-bordered";
        tablaDocs.innerHTML = `
          <thead>
            <tr>
              <th>TIPO_DOCUMENTO</th>
              <th>DOCUMENTO</th>
              <th>FECHA</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(doc => `
              <tr>
                <td>${doc.TIPO_DOCUMENTO}</td>
                <td>${doc.DOCUMENTO}</td>
                <td>${doc.FECHA}</td>
                <td><a href="https://litis.s3.us-east-1.amazonaws.com/pdfs/${doc.RUTA}/${doc.DOCUMENTO}" target="_blank">${doc.DOCUMENTO}</a></td>
              </tr>
            `).join("")}
          </tbody>
        `;
        bloque.appendChild(tablaDocs);
      }
    }
  }
  

function aplicarFiltros() {
  const placaSeleccionada = placaSelect.value;
  const periodoSeleccionado = periodoSelect.value;

  let filtradas = [...todasLasMultas];
  if (placaSeleccionada !== "") {
    filtradas = filtradas.filter((m) => (m.NRO_PLACA || "") === placaSeleccionada);
  }

  mostrarTablasPorPeriodo(filtradas, todosLosDocumentos);

  const bloques = document.querySelectorAll(".tabla-periodo");
  bloques.forEach((bloque) => {
    if (periodoSeleccionado === "" || bloque.id === `tabla-${periodoSeleccionado.replace("-", "")}`) {
      bloque.style.display = "block";
    } else {
      bloque.style.display = "none";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  if (placaSelect) placaSelect.addEventListener("change", aplicarFiltros);
  if (periodoSelect) periodoSelect.addEventListener("change", aplicarFiltros);
});