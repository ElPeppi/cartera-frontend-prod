let todasLasMultas = []; // Variable global

async function consultarMultasCedula() {
    const user_id = document.getElementById("param1").value;
    const select = document.getElementById("placas");
    const placa = select.value;

    try {
        const response = await fetch(
            "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "ID_USUARIO": user_id }),
            }
        );

        const result = await response.json();
        console.log(result);

        // 🔧 Asegurarse que sea un arreglo
        const multas = typeof result.body === "string"
            ? JSON.parse(result.body)
            : Array.isArray(result.body)
            ? result.body
            : [];

        // Guardar todas las multas globalmente
        todasLasMultas = multas;

        // Limpiar y llenar el select de placas
        select.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Todas las Placas";
        select.appendChild(optionDefault);

        // Extraer placas únicas asegurando que existan
        const placasUnicas = [...new Set(multas.map((m) => m.NRO_PLACA).filter(Boolean))];

        placasUnicas.forEach((placa) => {
            const option = document.createElement("option");
            const cleanPlaca = String(placa).replaceAll('"', '');
            option.value = cleanPlaca;
            option.textContent = cleanPlaca;
            select.appendChild(option);
        });

        // Renderizar todas las multas en la tabla
        renderizarTabla(multas);

        // Mostrar el div del select
        const placaDiv = document.querySelector(".plate");
        placaDiv.style.display = "block";

    } catch (error) {
        console.error("Error al consultar multas:", error);
    }
}


async function consultarMultasPlaca() {
    const placa = '"' + document.getElementById("param1").value + '"';
    const select =   document.getElementById("cedula");
    const cedula = select.value;

    

    try {
        const response = await fetch(
            "https://x9ptks4kpi.execute-api.us-east-1.amazonaws.com/Producction",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ placa, cedula }),
            }
        );

        const result = await response.json();
        

        const bodyData = typeof result.body === "string" ? JSON.parse(result.body) : result.body;
        const multas = bodyData.multas || [];

        // Guardar todas las multas globalmente
        todasLasMultas = multas;

        // Limpiar y llenar el select de placas
        select.innerHTML = "";
        const optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Todas las Placas";
        select.appendChild(optionDefault);

        const placasUnicas = [...new Set(multas.map((m) => m.nro_placa))];
        placasUnicas.forEach((placa) => {
            const option = document.createElement("option");
            option.value = placa.replaceAll('"', '');
            option.textContent = placa.replaceAll('"', '');
            select.appendChild(option);
        });

        // Renderizar todas las multas en la tabla
        renderizarTabla(multas);

        // Mostrar el div del select
        const placaDiv = document.querySelector(".plate");
        placaDiv.style.display = "block";

    } catch (error) {
        console.error("Error al consultar multas:", error);
    }
}

function renderizarTabla(multas, bodyId = "bodyTable") {
    const bodyTable = document.getElementById(bodyId);
    bodyTable.innerHTML = "";

    const keysOrdenados = [
        "TIPO_ENTIDAD",
        "DESC_DOCUMENTO",
        "ID_USUARIO",
        "nombre_completo", 
        "NRO_PLACA",
    ];

    multas.forEach((data) => {
        const tr = document.createElement("tr");

        keysOrdenados.forEach((key) => {
            const td = document.createElement("td");

            let valor;

            if (key === "nombre_completo") {
                const nombres = String(data["NOMBRES"] ?? "").replaceAll('"', '');
                const apellidos = String(data["APELLIDOS"] ?? "").replaceAll('"', '');
                valor = `${nombres} ${apellidos}`.trim();
            } else {
                valor = typeof data[key] === "string"
                    ? data[key].replaceAll('"', '')
                    : data[key] ?? "";
            }

            td.textContent = valor;
            tr.appendChild(td);
        });

        bodyTable.appendChild(tr);
    });
}


// Evento para aplicar filtros combinados
document.addEventListener("DOMContentLoaded", function () {
    const placaSelect = document.getElementById("placas");
    const periodoSelect = document.getElementById("time");

    function agruparPorPeriodo(multas) {
        const periodos = {
            "2004-2010": [],
            "2011-2015": [],
            "2016-2017": [],
            "2018-2019": [],
            "2020-2021": [],
            "2022-2023": [],
        };

        multas.forEach((multa) => {
            const anioStr = multa["anno"] ?? "";
            const anio = parseInt(anioStr.toString().replaceAll('"', '').trim());

            for (const periodo in periodos) {
                const [desde, hasta] = periodo.split("-").map(n => parseInt(n));
                if (!isNaN(anio) && anio >= desde && anio <= hasta) {
                    periodos[periodo].push(multa);
                    break;
                }
            }
        });

        return periodos;
    }

    function mostrarTablasPorPeriodo(multas) {
        const contenedor = document.querySelector(".table-responsive");
        contenedor.innerHTML = ""; // Limpiar tablas anteriores

        const periodosAgrupados = agruparPorPeriodo(multas);

        for (const periodo in periodosAgrupados) {
            const grupo = periodosAgrupados[periodo];
            if (grupo.length > 0) {
                const titulo = document.createElement("h3");
                titulo.textContent = `Multas del periodo ${periodo}`;
                contenedor.appendChild(titulo);

                const tabla = document.createElement("table");
                tabla.className = "table table-striped";

                const thead = document.createElement("thead");
                thead.innerHTML = `
                    <tr>
                        <th>TIPO DE ACTO</th>
                        <th>DESC DOCUMENTO</th>
                        <th>ID USUARIO</th>
                        <th>NOMBRE COMPLETO</th>
                        <th>NRO PLACA</th>
                    </tr>
                `;
                tabla.appendChild(thead);

                const tbody = document.createElement("tbody");
                grupo.forEach((data) => {
                    const tr = document.createElement("tr");

                    const keysOrdenados = [
                        "tipo de acto",
                        "desc_documento",
                        "id_usuario",
                        "nombre_completo",
                        "nro_placa",
                    ];

                    keysOrdenados.forEach((key) => {
                        const td = document.createElement("td");
                        let valor;
                        if (key === "nombre_completo") {
                            const nombres = String(data["nombres"] ?? "").replaceAll('"', '');
                            const apellidos = String(data["apellidos"] ?? "").replaceAll('"', '');
                            valor = `${nombres} ${apellidos}`.trim();
                        } else {
                            valor = typeof data[key] === "string"
                                ? data[key].replaceAll('"', '')
                                : data[key] ?? "";
                        }
                        td.textContent = valor;
                        tr.appendChild(td);
                    });

                    tbody.appendChild(tr);
                });

                tabla.appendChild(tbody);
                contenedor.appendChild(tabla);
            }
        }
    }

    function aplicarFiltros() {
        const placaSeleccionada = placaSelect.value;

        let filtradas = [...todasLasMultas];

        if (placaSeleccionada !== "") {
            filtradas = filtradas.filter((m) => {
                const placa = (m.nro_placa || "").replaceAll('"', '');
                return placa === placaSeleccionada;
            });
        }

        mostrarTablasPorPeriodo(filtradas);
    }

    if (placaSelect) placaSelect.addEventListener("change", aplicarFiltros);
    if (periodoSelect) periodoSelect.addEventListener("change", aplicarFiltros);
});


