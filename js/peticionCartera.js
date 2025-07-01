let containerCartera = null;
let cartera = [];
let pagos = [];

let placaSelectCartera = document.getElementById("placaSelectCartera");

let periodoSelectCartera = null;

async function consultarCartera(htmlBoton) {
  const contenedor = htmlBoton.closest(".view");
  containerCartera = contenedor;

  const valor = contenedor.querySelector("#param1").value.replaceAll(".", "");

  if (contenedor.id.includes("plate")) {
    await consultarCarteraPorCampo("NRO_PLACA", valor);
  } else {
    await consultarCarteraPorCampo("ID_USUARIO", valor);
  }
}
async function consultarCarteraPorCampo(parametro, valor) {
  try {
    const body = {};
    body[parametro] = valor;

    const response = await fetch(
      "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/pagos",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

    cartera = (bodyDataCartera.cartera || []).map((m) => ({
      ...m,
      ANNO: String(m.ANNO).replaceAll(".0", ""),
      DOCUMENTO: String(m.DOCUMENTO).replaceAll(".0", ""),
    }));

    pagos = (bodyDataPagos.pagos || []).map((p) => ({
      ...p,
      ANNO: String(p.VIGENCIA).replaceAll(".0", ""),
      DOCUMENTO: String(p.DOCUMENTO).replaceAll(".0", ""),
    }));

    // Llenar filtro cruzado (placa si buscaste por ID, o ID si buscaste por placa)
    const valoresUnicos = new Set();
    if (parametro === "ID_USUARIO") {
      cartera.forEach((item) => item.NRO_PLACA && valoresUnicos.add(item.NRO_PLACA));
      pagos.forEach((item) => item.PLACA && valoresUnicos.add(item.PLACA));
      actualizarSelect("#placaSelectCartera", "Seleccione una placa", valoresUnicos);
    } else {
      cartera.forEach((item) => item.ID_USUARIO && valoresUnicos.add(item.ID_USUARIO));
      pagos.forEach((item) => item.ID_USUARIO && valoresUnicos.add(item.ID_USUARIO));
      actualizarSelect("#placaSelectCartera", "Seleccione una cédula", valoresUnicos);
    }

    aplicarFiltrosCartera();

  } catch (error) {
    console.error("Error al consultar cartera:", error);
  }
}

function actualizarSelect(selectorId, placeholder, valoresSet) {
  const select = containerCartera.querySelector(selectorId);
  select.innerHTML = "";

  const optionDefault = document.createElement("option");
  optionDefault.value = "";
  optionDefault.textContent = placeholder;
  select.appendChild(optionDefault);

  [...valoresSet].sort().forEach((valor) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });
}


function aplicarFiltrosCartera() {
  const valor = containerCartera.querySelector("#placaSelectCartera").value.trim();
  if (!valor) {
    mostrarTablaCartera([]);
    mostrarTablaPagos([]);
    return;
  }

  // Normaliza los campos a texto para comparación segura
  const filtradas = cartera.filter(
    (item) =>
      String(item.NRO_PLACA).trim() === valor ||
      String(item.ID_USUARIO).trim() === valor
  );

  const filtradosPagos = pagos.filter(
    (item) =>
      String(item.PLACA).trim() === valor ||
      String(item.ID_USUARIO).trim() === valor
  );


  mostrarTablaCartera(filtradas);
  mostrarTablaPagos(filtradosPagos);
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

        
        const placasUnicas = new Set();

        cartera = bodyDataCartera.cartera || [];
        pagos = bodyDataPagos.pagos || [];

        
        cartera.forEach((item) => {
            if (item.NRO_PLACA) placasUnicas.add(item.NRO_PLACA);
        });

        pagos.forEach((item) => {
            if (item.PLACA) placasUnicas.add(item.PLACA);
        });
        
        placaSelectCartera = containerCartera.querySelector("#placaSelectCartera");

        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Seleccione una placa";
        placaSelectCartera.innerHTML = ""; // Limpia las opciones previas
        placaSelectCartera.appendChild(optionDefault);

        Array.from(placasUnicas).sort().forEach((placa) => {
            const option = document.createElement("option");
            option.value = placa;
            option.textContent = placa;
            placaSelectCartera.appendChild(option);
        });
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
                ANNO: String(p.VIGENCIA).replaceAll(".0", ""),
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



function mostrarTablaCartera(cartera) {
    const contenedor = containerCartera.querySelector(".table-responsive1");
  const tabla = contenedor.querySelector("table");
  const tbody = tabla.querySelector("tbody");

    tbody.innerHTML = ""; // Limpia la tabla

    if (cartera.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="10" class = "text-center">No hay datos disponibles</td>`;
        tbody.appendChild(row);
        return;
    }

    cartera.forEach((item) => {
        const nombre = `${item.NOMBRES || ""} ${item.APELLIDOS || ""}`;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.NRO_PLACA}</td>
            <td>${item.DESC_ESTADO}</td>
            <td>${item.DESC_DOCUMENTO}</td>
            <td>${item.ID_USUARIO}</td>
            <td>${nombre}</td>
            <td>${item.ANNO}</td>
            <td>${item.ESTADO_VIGENCIA}</td>
            <td>${item.DERECHOS}</td>
            <td>${item.INTERESES}</td>
            <td>${item.COSTAS}</td>
        `;
        tbody.appendChild(row);
    });
}

function mostrarTablaPagos(pagos) {
    const contenedor = containerCartera.querySelector(".table-responsive2");
    const tabla = contenedor.querySelector("#tablePago");
    const tbody = tabla.querySelector("tbody");
    tbody.innerHTML = ""; // Limpia la tabla

    if (pagos.length === 0) {
        tbody.innerHTML = `<td colspan="8" class = "text-center">No hay datos disponibles</td>`;
        return;
    }

    pagos.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.NRO_RECIBO}</td>
            <td>${item.ID_PAGA_FACTURA}</td>
            <td>${item.PLACA}</td>
            <td>${item.FECHA_LIQUIDA}</td>
            <td>${item.VIGENCIA}</td>
            <td>${item.VALOR}</td>
            <td>${item.ID_TARIFA}</td>
            <td>${item.DESC_CONCEPTO}</td>
        `;
        tbody.appendChild(row);
    });
}

window.addEventListener("DOMContentLoaded", () => {

    document.addEventListener("change", (e) =>{
        if (e.target && e.target.matches("#placaSelectCartera")) {
            aplicarFiltrosCartera();
        }
    });
});