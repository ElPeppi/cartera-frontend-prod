// Asume que ya se cargó la respuesta y están en "todasLasMultas"

let todosLosDocumentos = [];
//quiero obtener la lista de contenerdores con clase continner
const contenedores = document.querySelectorAll(".container");

// Selectores globales
let placaSelect = document.getElementById("placas");
let periodoSelect = document.getElementById("time");

let container;

let parametroSeleccionado = "";

async function consultarDT(htmlBoton) {
  //saber en que contenedor se hizo la consulta
  const contenedor = htmlBoton.closest(".view");
  container = contenedor;
  if (contenedor) {
    const contenedorId = contenedor.id;

    if (contenedorId.includes("plate")) {
      const plate = contenedor.querySelector("#param1").value.replaceAll(".", "");
      
      peticion("NRO_PLACA", plate, contenedor);
    } else {
      const plate = contenedor.querySelector("#param1").value.replaceAll(".", "");
      peticion("ID_USUARIO", plate, contenedor);
    }
  }

}
async function peticion(parametro, tipo, contenedor) {
  try {
    let response;
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
    parametroSeleccionado = parametro;
    console.log("Parámetro seleccionado:", parametroSeleccionado);
    const result = await response.json();
    const segundoItem = result;
    const bodyDataDocumentos =
      typeof segundoItem.body === "string"
        ? JSON.parse(segundoItem.body)
        : segundoItem.body;

    const documentos = bodyDataDocumentos.documentos || [];
    //quiero que hace algo para que en documentos los años y los id si tienen un .0 se remplace por un espacio vacio
    documentos.forEach((doc) => {
      if (doc.ANNO) {
        doc.ANNO = doc.ANNO.replaceAll(".0", "");
      }
      if (doc.ID_USUARIO) {
        doc.ID_USUARIO = doc.ID_USUARIO.replaceAll(".0", "");
      }
      if (doc.NRO_PLACA) {
        doc.NRO_PLACA = doc.NRO_PLACA.replaceAll(".0", "");
      }
    });

    todosLosDocumentos = documentos;
    console.log("Documentos obtenidos:", todosLosDocumentos);
    if (parametro === "NRO_PLACA") {
      placaSelect = contenedor.querySelector("#identifitacions");
      periodoSelect = contenedor.querySelector("#time");
    } else {
      placaSelect = contenedor.querySelector("#placas");
      periodoSelect = contenedor.querySelector("#time");
    }

    placaSelect.innerHTML = "";
    const optionDefault = document.createElement("option");
    optionDefault.value = "";
    optionDefault.textContent = parametro === "ID_USUARIO"
      ? "Todas las Placas": "Todas las Cédulas";
    placaSelect.appendChild(optionDefault);

    let placasUnicas;
    if (parametro === "NRO_PLACA") {
      placasUnicas = [
        ...new Set(documentos.map((m) => m.ID_USUARIO).filter(Boolean)),
      ];
    } else {
      placasUnicas = [
        ...new Set(documentos.map((m) => m.NRO_PLACA).filter(Boolean)),
      ];
    }
    console.log("Placas únicas:", placasUnicas);
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

  if (parametroSeleccionado === "ID_USUARIO") {
    documentos.forEach((doc) => {
    if (!doc.ANNO) return;
    if (placas.length > 0 && !placas.includes(doc.NRO_PLACA)) return;
    annos.add(doc.ANNO);
  });
  }else{
    documentos.forEach((doc) => {
      if (!doc.ANNO) return;
      if (placas.length > 0 && !placas.includes(doc.ID_USUARIO)) return;
      annos.add(doc.ANNO);
    });
  }
  console.log("Años encontrados:", annos);
  return Array.from(annos).sort();
}

function llenarSelectPeriodos(placaSeleccionada = "") {
  const containerID = container.id;
  console.log("Llenando select periodos para el contenedor:", containerID);
  let placasAsociadas = [];

    console.log("Contenedor de placas");
    if (placaSeleccionada) {
      if (parametroSeleccionado === "ID_USUARIO"){
        placasAsociadas = [
        ...new Set(
          todosLosDocumentos
            .filter((m) => String(m.ID_USUARIO) == String(placaSeleccionada))
            .map((m) => m.NRO_PLACA)
            .filter(Boolean)
        ),
      ];
      console.log("Placas asociadas a la cédulaaaaaaaaaaaaaa:", placasAsociadas);
      }
      else {
        console.log("Contenedor de placas");
        placasAsociadas = [
          ...new Set(
            todosLosDocumentos
              .filter((m) => String(m.NRO_PLACA) == String(placaSeleccionada))
              .map((m) => m.ID_USUARIO)
              .filter(Boolean)
          ),
        ];
      }
    }
  console.log("Placas asociadassssssssssssssssssssssssssssssssss:", placasAsociadas);
  const periodos = obtenerPeriodosDesdeDocumentos(
    todosLosDocumentos,
    placasAsociadas
  );
  const select = container.querySelector("#time");
  select.innerHTML = `<option value="">Expediente [año1 - año2]</option>`;

  if (periodos.length === 0) return;

  const periodosNumericos = periodos
    .map((p) => parseInt(p))
    .filter((n) => !isNaN(n));
  periodosNumericos.sort((a, b) => a - b);

  const rangos = agruparAniosEnPeriodos(periodosNumericos);

  rangos.forEach(([inicio, fin]) => {
    const option = document.createElement("option");
    const label = `${inicio}-${fin}`;
    option.value = label;
    option.textContent = label;
    select.appendChild(option);
  });
}

function agruparAniosEnPeriodos(anios) {
  const rangos = [];

  const grupos = [
    [2004, 2010],
    [2011, 2015],
    [2016, 2017],
    [2018, 2019],
    [2020, 2021],
    [2022, 2023],
  ];

  grupos.forEach(([inicio, fin]) => {
    const tieneDatos = anios.some((a) => a >= inicio && a <= fin);
    if (tieneDatos) {
      rangos.push([inicio, fin]);
    }
  });

  return rangos;
}


function mostrarTablasPorPeriodo(multas, documentos = []) {
  const contenedor = container.querySelector(".table-responsive");
  contenedor.innerHTML = "";

  const placa = placaSelect.value;
  const periodoSeleccionado = periodoSelect.value;

  if (!periodoSeleccionado) return;

  const [desde, hasta] = periodoSeleccionado.split("-").map(Number);

  // Filtrar los años dentro del rango seleccionado
  const multasFiltradas = multas.filter((m) => {
    const anno = parseInt(m.ANNO);
    return anno >= desde && anno <= hasta;
  });

  const documentosFiltrados = documentos.filter((d) => {
    const anno = parseInt(d.ANNO);
    if (placa && d.NRO_PLACA !== placa && d.ID_USUARIO !== placa) return false;
    return anno >= desde && anno <= hasta;
  });

  const periodoKey = `tabla-${periodoSeleccionado.replace("-", "")}`;
  const bloque = document.createElement("div");
  bloque.className = "tabla-periodo table-responsive";
  bloque.id = periodoKey;
  contenedor.appendChild(bloque);

  const titulo = document.createElement("h3");
  titulo.textContent = `Documentos por derechos de tránsito ${periodoSeleccionado}`;
  bloque.appendChild(titulo);

  if (documentosFiltrados.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "No hay registros para este intervalo de fechas.";
    bloque.appendChild(mensaje);
    return;
  }

  const tabla = document.createElement("table");
  tabla.className = "table table-striped";
  tabla.innerHTML = `
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
      ${documentosFiltrados.map((data) => {
       if(data.TIPO_ACTO.toUpperCase() !== "LLAMADA TELEFONICA"){
         const nombre = `${data.NOMBRES || ""} ${data.APELLIDOS || ""}`;
        return `
          <tr>
            <td>${(data.TIPO_ACTO || "").toUpperCase()}</td>
            <td>${data.NOMBRE_APELLIDO || nombre}</td>
            <td>${data.DESC_DOCUMENTO || ""}</td>
            <td>${data.ANNO?.replaceAll?.(".0", "") || ""}</td>
            <td>${data.FECHA || ""}</td>
            <td><a href="${sanearURL(`https://litis.s3.us-east-1.amazonaws.com/pdfs/${data.RUTA_DOCUMENTO}/${data.DOCUMENTO}`)}" target="_blank">${data.DOCUMENTO}</a></td>
            <td><a href="${sanearURL(`https://litis.s3.us-east-1.amazonaws.com/pdfs/${data.RUTA_GUIA}`)}" target="_blank">${data.GUIA}</a></td>
          </tr>`;
       }
      }).join("")}
    </tbody>
  `;
  bloque.appendChild(tabla);
}


function sanearURL(url) {
  return url.replace(/([^:]\/)\/+/g, "$1");
}

function aplicarFiltros() {
  const containerID = container.id;
  const placaSeleccionada = placaSelect.value;
  const periodoSeleccionado = periodoSelect.value;

  let filtradas = [...todosLosDocumentos];
  if (containerID.includes("plate")) {
    if (placaSeleccionada !== "") {
      filtradas = filtradas.filter(
        (m) => (String(m.ID_USUARIO) || "") === String(placaSeleccionada)
      );
    }

  } else {
    if (placaSeleccionada !== "") {
      filtradas = filtradas.filter(
        (m) => (m.NRO_PLACA || "") === String(placaSeleccionada)
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
  const vistaActiva = document.querySelector(".view:not([style*='display: none'])");
  console.log("Vista activa:", vistaActiva ? vistaActiva.id : "Ninguna");

  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches("#placas, #identifitacions")) {
      aplicarFiltros();
      console.log("Placa seleccionada:", e.target.value);
      llenarSelectPeriodos(e.target.value);
    }
    if (e.target && e.target.matches("#time")) {
      aplicarFiltros();
    }
  });
});
