// Asume que ya se cargó la respuesta y están en "todasLasMultas"
let todasLasMultas = [];
let todosLosDocumentos = [];
//quiero obtener la lista de contenerdores con clase continner
const contenedores = document.querySelectorAll('.container');

// Selectores globales
let placaSelect = document.getElementById("placas");
let periodoSelect = document.getElementById("time");

let container;
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
    console.log(result);
    const primerItem = result[0];
    const segundoItem = result[1];
    console.log(primerItem);
    console.log(segundoItem);
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
async function consultarDT(htmlBoton) {
  //saber en que contenedor se hizo la consulta
  const contenedor = htmlBoton.closest('.view');
  container = contenedor;
  if (contenedor) {
    const contenedorId = contenedor.id;
    
      if (contenedorId.includes("plate")){
          const plate = contenedor.querySelector("#param1").value;
          console.log(plate);
          peticion('NRO_PLACA', plate, contenedor);
          console.log("wallet con placa");
      }
      else{
          const plate = contenedor.querySelector("#param1").value;
          peticion('ID_USUARIO', plate, contenedor);
          console.log("sin wallet con placa");
        }
      }
      
    
  
  console.log(contenedor);
  const placa = document.getElementById("param1").value;


}
async function peticion(parametro, tipo, contenedor){
  try {
    let response;
    console.log("Peticion");
    console.log(parametro);
    console.log(tipo);
    if (parametro === "ID_USUARIO") {
      response = await fetch(
        "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ID_USUARIO: tipo }),
        }
      );
    }
    if (parametro === "NRO_PLACA") {
      response = await fetch(
        "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ NRO_PLACA: tipo }),
        }
      );
    }

    const result = await response.json();
    const primerItem = result[0]; 
    const segundoItem = result[1];
console.log(result);
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
    console.log("todas las multas", todasLasMultas);
    if(parametro === "NRO_PLACA"){
      placaSelect = contenedor.querySelector("#identifitacions");
      periodoSelect = contenedor.querySelector("#time");
    } else {
      placaSelect = contenedor.querySelector("#placas");
      periodoSelect = contenedor.querySelector("#time");
    }
    

    placaSelect.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = "Todas las Placas";
    placaSelect.appendChild(optionDefault);

    let placasUnicas ;
    if(parametro === "NRO_PLACA"){
      placasUnicas = [
        ...new Set(multas.map((m) => m.ID_USUARIO).filter(Boolean)),
      ];
    }
    else{
      placasUnicas = [
        ...new Set(documentos.map((m) => m.NRO_PLACA).filter(Boolean)),
      ];
    }
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
function obtenerPeriodosDesdeDocumentos(documentos, placas = []) {
  let annos = new Set();

  documentos.forEach((doc) => {
    if (!doc.ANNO) return;
    if (placas.length > 0 && !placas.includes(doc.NRO_PLACA)) return;
    annos.add(doc.ANNO);
  });

  return Array.from(annos).sort();
}


function llenarSelectPeriodos(placaSeleccionada = "") {
  const containerID = container.id;
  let placasAsociadas = [];

  if (containerID.includes("plate")) {
    if (placaSeleccionada) {
      placasAsociadas = [
        ...new Set(todasLasMultas
          .filter(m => String(m.ID_USUARIO) === String(placaSeleccionada))
          .map(m => m.NRO_PLACA)
          .filter(Boolean))
      ];
    }
  } else {
    placasAsociadas = [placaSeleccionada];
  }

  const periodos = obtenerPeriodosDesdeDocumentos(todosLosDocumentos, placasAsociadas);
  const select = container.querySelector("#time");
  select.innerHTML = `<option value="">Expediente [año1 - año2]</option>`;

  if (periodos.length === 0) return;

  const periodosNumericos = periodos.map(p => parseInt(p)).filter(n => !isNaN(n));
  periodosNumericos.sort((a, b) => a - b);

  const rangos = [];
  for (let i = 0; i < periodosNumericos.length - 1; i++) {
    const inicio = periodosNumericos[i];
    const fin = periodosNumericos[i + 1];

    // Evitar duplicados
    const clave = `${inicio}-${fin}`;
    if (!rangos.includes(clave) && inicio !== fin) {
      rangos.push(clave);
    }
  }

  // Si solo hay un año, puedes decidir si mostrarlo o no. Este ejemplo lo oculta.

  rangos.forEach(rango => {
    const option = document.createElement("option");
    option.value = rango;
    option.textContent = rango;
    select.appendChild(option);
  });
}



function mostrarTablasPorPeriodo(multas, documentos = []) {
  const contenedor = container.querySelector(".table-responsive");
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
    if ((placa && d.NRO_PLACA !== placa) && (placa && d.ID_USUARIO !== placa)) return;
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
  titulo.textContent = `Documentos por derechos de tránsito ${periodoSeleccionado}`;
  bloque.appendChild(titulo);

  const filas = [];
  for (let a = desde; a <= hasta; a++) {
    if (multasPorPeriodo[a]) filas.push(...multasPorPeriodo[a]);
  }
  const docs = [];
  for (let a = desde; a <= hasta; a++) {
    if (documentosPorPeriodo[a]) docs.push(...documentosPorPeriodo[a]);
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
          ${docs
        .map((data) => {
          console.log(data);
          const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
          return `
              <tr>
                <td>${data.TIPO_ACTO || ""}</td>
                <td>${data.NOMBRE_APELLIDO || ""}</td>
                <td>${data.DESC_DOCUMENTO || ""}</td>
                <td>${data.ANNO.replaceAll(".0","") || ""}</td>
                <td>${data.FECHA || ""}</td>
                <td><a href="${sanearURL(
            `https://litis.s3.us-east-1.amazonaws.com/pdfs/${data.RUTA_DOCUMENTO}/${data.DOCUMENTO}`
          )}" target="_blank">${data.DOCUMENTO}</a></td>
                <td><a href="${sanearURL(
            `https://litis.s3.us-east-1.amazonaws.com/pdfs/${data.RUTA_GUIA}/${data.GUIA}`
          )}" target="_blank">${data.GUIA}</a></td>
              </tr>`;
        })
        .join("")}
        </tbody>
      `;
    bloque.appendChild(tablaMultas);
    console.log(bloque)
;  }


/*
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
*/
}


function sanearURL(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

function aplicarFiltros() {
  const containerID = container.id;
  const placaSeleccionada = placaSelect.value;
  console.log("placa seleccionada " +placaSeleccionada);
  const periodoSeleccionado = periodoSelect.value;

  let filtradas = [...todasLasMultas];
  if (containerID.includes("plate")) {
    if(placaSeleccionada !== ""){
      filtradas = filtradas.filter(
        (m) => (String(m.ID_USUARIO) || "") === String(placaSeleccionada)
      );
    }
    console.log("estoy en placa");
  }
  else{
    if (placaSeleccionada !== "") {
      filtradas = filtradas.filter(
        (m) => (m.NRO_PLACA || "") === placaSeleccionada
      );
    }
  }

  mostrarTablasPorPeriodo(filtradas, todosLosDocumentos);

  const bloques = container.querySelectorAll(".tabla-periodo");
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
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches("#placas, #identifitacions")) {
      aplicarFiltros();
      llenarSelectPeriodos(e.target.value);
    }
    if (e.target && e.target.matches("#time")) {
      aplicarFiltros();
    }
  });
});


