async function cargarJSON() {
    try {
        const respuesta = await fetch('assets/examenes.json'); // Cargar el JSON con los parciales
        if (!respuesta.ok) throw new Error('No se pudo cargar el JSON');
        const datosExamen = await respuesta.json();
        generarParciales(datosExamen);
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
    }
}

function generarParciales(datosExamen) {
    const parcialesDiv = document.getElementById("parciales");

    // Recorremos los parciales en el JSON
    datosExamen.examenes.forEach((examen, examenIndex) => {
        const parcialDiv = document.createElement("div");
        parcialDiv.classList.add("parcial");

        // Titulo del parcial
        const tituloParcial = document.createElement("h2");
        tituloParcial.textContent = examen.titulo;
        parcialDiv.appendChild(tituloParcial);

        // Recorremos las preguntas de cada parcial
        examen.preguntas.forEach((pregunta, preguntaIndex) => {
            const divPregunta = document.createElement("div");
            divPregunta.className = "pregunta";
            divPregunta.dataset.respuestas = JSON.stringify(pregunta.respuestaCorrecta);
            divPregunta.dataset.tipo = pregunta.tipo;

            if (pregunta?.texto) {
                const texto = pregunta.texto.split("\n");
                const p = document.createElement("p");
                p.textContent = `${preguntaIndex + 1}. ${texto.shift()}`;
                divPregunta.appendChild(p);
                
                texto.forEach((item) => {
                    const p = document.createElement("p");
                    p.textContent = item;

                    const pre = document.createElement("pre");
                    pre.appendChild(p);
                    
                    divPregunta.appendChild(pre);
                });
            }

            if (pregunta?.imagenes) {
                pregunta.imagenes.forEach((imagen) => {
                    const img = document.createElement("img");
                    img.src = imagen
                    divPregunta.appendChild(img);
                });
                divPregunta.appendChild(document.createElement("br"));
            }

            const letras = ['A', 'B', 'C', 'D', 'E', 'F'];

            Object.entries(pregunta.opciones).forEach(([key, value], idx) => {
                const label = document.createElement("label");
                const input = document.createElement("input");

                input.type = pregunta.tipo;
                input.name = `q${examenIndex + 1}_${preguntaIndex + 1}${pregunta.tipo === 'checkbox' ? '[]' : ''}`;
                input.value = key;

                label.appendChild(input);
                label.append(` ${letras[idx]}. ${value}`);

                divPregunta.appendChild(label);
                divPregunta.appendChild(document.createElement("br"));
            });

            const btnVerificar = document.createElement("button");
            btnVerificar.type = "button";
            btnVerificar.textContent = "Verificar";
            btnVerificar.onclick = () => verificar(divPregunta);
            divPregunta.appendChild(btnVerificar);

            parcialDiv.appendChild(divPregunta);
        });

        parcialesDiv.appendChild(parcialDiv);

        // Agregar el botón de calcular resultado final después de cada parcial
        const btnCalcular = document.createElement("button");
        btnCalcular.type = "button";
        btnCalcular.textContent = "Calcular Resultado Final";
        btnCalcular.onclick = () => calcularResultado(parcialDiv);
        parcialDiv.appendChild(btnCalcular);
    });
}

function verificar(div) {
    const respuestasCorrectas = JSON.parse(div.dataset.respuestas);
    const tipo = div.dataset.tipo;
    const inputs = div.querySelectorAll(`input[type=${tipo}]`);
    const seleccionadas = [];

    inputs.forEach(input => {
        if (input.checked) {
            seleccionadas.push(input.value);
        }
        // Desactivar inputs luego de verificar
        input.disabled = true;
    });

    const esCorrecto = (
        respuestasCorrectas.length === seleccionadas.length &&
        respuestasCorrectas.every(rc => seleccionadas.includes(rc))
    );

    // Marcar respuestas
    inputs.forEach(input => {
        const label = input.parentElement;
        const key = input.value;

        if (respuestasCorrectas.includes(key)) {
            label.style.backgroundColor = "lightgreen"; // respuesta correcta
        }

        if (input.checked && !respuestasCorrectas.includes(key)) {
            label.style.backgroundColor = "lightcoral"; // incorrecta seleccionada
        }
    });

    const resultado = document.createElement("p");
    resultado.textContent = esCorrecto
        ? "¡Correcto!"
        : `Incorrecto. Respuesta correcta: ${respuestasCorrectas.join(", ").toUpperCase()}`;

    if (esCorrecto) {
        div.classList.add("correcto");
        div.classList.remove("incorrecto");
    } else {
        div.classList.add("incorrecto");
        div.classList.remove("correcto");
    }

    div.appendChild(resultado);

    const btn = div.querySelector("button");
    btn.disabled = true;
}

function calcularResultado(parcialDiv) {
    const preguntas = parcialDiv.querySelectorAll(".pregunta");
    let correctas = 0;

    preguntas.forEach(pregunta => {
        if (pregunta.classList.contains('correcto')) {
            correctas++;
        }
    });

    const total = preguntas.length;

    const resultadoFinal = parcialDiv.querySelector("#resultado") || document.createElement("p");
    resultadoFinal.id = "resultado";
    resultadoFinal.style.fontWeight = "bold";

    const porcentaje = Math.round((correctas / total) * 100);
    resultadoFinal.textContent = `Aciertos: ${porcentaje}% - ${porcentaje >= 60 ? "¡Aprobado! 🎉" : "Desaprobado ❌"}`;
    parcialDiv.appendChild(resultadoFinal);
    alert(resultadoFinal.textContent);
}

function actualizarCalificacion() {
    const preguntas = document.querySelectorAll(".pregunta");
    let correctas = 0;

    preguntas.forEach(pregunta => {
        const resultado = pregunta.querySelector("p:last-of-type");
        if (resultado && resultado.textContent.includes("¡Correcto!")) {
            correctas++;
        }
    });

    const total = preguntas.length;
    const porcentaje = Math.round((correctas / total) * 100);

    const resultadoFinal = document.getElementById("resultadoFinal") || document.createElement("p");
    resultadoFinal.id = "resultadoFinal";
    resultadoFinal.style.fontWeight = "bold";

    resultadoFinal.textContent = `Aciertos: ${porcentaje}% - ${porcentaje >= 60 ? "¡Aprobado! 🎉" : "Desaprobado ❌"}`;

    document.body.appendChild(resultadoFinal);
}

// Inicia todo al cargar la página
cargarJSON();