async function docGen(htmlBoton) {
    const contenedor = htmlBoton.closest('.view');
    if (contenedor) {
        const id = contenedor.querySelector('#param1').value
            .replaceAll(".", "")
            .replaceAll(" ", "");
        const plantilla = contenedor.querySelector('#doc_gen').value; // <-- Obtiene el valor de plantilla

        try {
            const response = await fetch(
                "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/generation_doc",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ID_USUARIO: id }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // El backend devuelve un JSON con un body serializado como string
            const result = await response.json();
            const data = JSON.parse(result.body);
            console.log("Datos obtenidos:", data);
            // ✅ Validación
            if (!data.documentos || data.documentos.length === 0) {
                console.warn("No se encontraron documentos para este usuario");
                alert("⚠️ No se encontró información para la cédula ingresada.");
                return;
            }

            // Añade el valor de plantilla al objeto que enviarás
            const payload = {
                ...data,
                plantilla: parseInt(plantilla, 10)
            };

            try {
                const response2 = await fetch(
                    "https://oee14dgk0m.execute-api.us-east-1.amazonaws.com/production/generation_doc_2", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
                );
                const result2 = await response2.json();
                console.log("Documentos procesados:", result2);
                console.log(result2.download_url);
                window.open(result2.download_url, '_blank');
                const toastEl = document.getElementById('docToast');
                const toast = new bootstrap.Toast(toastEl);
                toast.show();



            } catch (error) {
                console.error("Error al procesar los documentos:", error);
                alert("❌ Error procesando los documentos, intenta de nuevo.");
                return;
            }

        } catch (error) {
            console.error("Error en la petición:", error);
            alert("❌ Error consultando la API, intenta de nuevo.");
        }
    }
}
