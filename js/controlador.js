// Llamar a la función agregarSelectEncargado para inicializar el primer select
agregarSelectEncargado();
function validarFormulario() {
    var codigo = document.getElementById('codigo').value.trim();
    var nombre = document.getElementById('nombre').value.trim();
    var direccion = document.getElementById('direccion').value.trim();
    var dotacion = document.getElementById('dotacion').value.trim();
    var encargados = []; // Array para almacenar los encargados seleccionados

    // Obtener todos los valores seleccionados de los encargados
    var selectEncargados = document.getElementsByName('id_encargado');
    for (var i = 0; i < selectEncargados.length; i++) {
        var encargadoSeleccionado = selectEncargados[i].value;
        if (encargadoSeleccionado !== "") {
            // Verificar que no se repita la opción seleccionada
            if (encargados.includes(encargadoSeleccionado)) {
                alert("No se pueden seleccionar encargados duplicados.");
                return false;
            }
            encargados.push(encargadoSeleccionado);
        }
    }

    // Validación del campo código
    if (codigo === "" || codigo.length < 2 || codigo.length > 5) {
        alert("Ingrese un código de bodega válido (entre 2 y 5 caracteres alfanuméricos).");
        return false;
    }

    // Validación del campo nombre
    if (nombre === "" || nombre.length > 100) {
        alert("Ingrese un nombre de bodega válido (máximo 100 caracteres).");
        return false;
    }

    // Validación del campo dirección
    if (direccion === "") {
        alert("Ingrese la dirección de la bodega.");
        return false;
    }

    // Validación del campo dotación
    if (dotacion === "" || isNaN(dotacion) || dotacion <= 0) {
        alert("Ingrese una dotación válida (cantidad de personas que trabajan).");
        return false;
    }

    // Validación del campo encargados
    if (encargados.length === 0) {
        alert("Seleccione al menos un encargado de la bodega.");
        return false;
    }

    // Obtener el texto actual del botón
    var botonCrearEditar = document.getElementById('crear-bodega-btn');
    var buttonText = botonCrearEditar.textContent.trim();

    // Determinar la acción según el texto del botón
    if (buttonText === 'Crear Bodega') {
        // Crear nueva bodega
        var formularioData = {
            codigo: codigo,
            nombre: nombre,
            direccion: direccion,
            dotacion: dotacion,
            encargados: encargados
        };
        enviarDatosAlPHP(formularioData); // Llamar función para crear nueva bodega
    } else if (buttonText === 'Guardar Cambios') {
        // Guardar cambios en bodega existente
        guardarCambios(); // Llamar función para guardar cambios
    } else {
        console.error('Texto de botón no reconocido:', buttonText);
        return false; // Devolver false por si ocurre un error inesperado
    }

    // Devolver true para enviar el formulario si todo es válido
    return true;
}


// Función para enviar los datos al servidor PHP mediante AJAX
function enviarDatosAlPHP(formularioData) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'command/command.php?cmd=guardar', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            console.log(xhr.responseText); // Imprime la respuesta del servidor
            try {
                var datos = JSON.parse(xhr.responseText);
                if (datos.status === 'success') {
                    alert('Los datos se guardaron correctamente.');
                    cargarYMostrarBodegas();
                    limpiarFormulario();
                } else if (datos.status === 'error') {
                    // Aquí manejas el error según el mensaje recibido
                    alert('Error al guardar los datos: ' + datos.message);
                } else {
                    console.error('Respuesta inesperada del servidor:', xhr.responseText);
                }
            } catch (error) {
                console.error('Error al analizar JSON:', error);
            }
        } else {
            console.error('Error en la solicitud al servidor.');
        }
    };
    xhr.onerror = function() {
        console.error('Error de red al intentar enviar los datos.');
    };

    var jsonData = JSON.stringify({ formularioData: formularioData });
    xhr.send(jsonData);
}


function cargarSelect(selectEncargado) {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', 'command/command.php?cmd=cargarEncargados', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            try {
                var datos = JSON.parse(xhr.responseText);
                console.log(datos); // Verifica los datos recibidos en la consola

                if (datos.status === 'success') {
                    var encargados = datos.encargados;

                    // Crear opciones para cada encargado
                    encargados.forEach(function(encargado) {
                        var option = document.createElement('option');
                        option.value = encargado.id_encargado;
                        // Construir el nombre completo: nombre + primer_apellido + segundo_apellido
                        var nombreCompleto = encargado.nombre + ' ' + encargado.primer_apellido + ' ' + encargado.segundo_apellido;
                        option.textContent = nombreCompleto;
                        selectEncargado.appendChild(option);
                    });
                } else {
                    console.error('Error en la respuesta del servidor:', datos.message);
                }
            } catch (error) {
                console.error('Error al analizar JSON:', error);
            }
        } else {
            console.error('Error en la solicitud al servidor.');
        }
    };

    xhr.onerror = function() {
        console.error('Error de red al intentar enviar los datos.');
    };

    xhr.send();
}






// Función para cargar y mostrar las bodegas
function cargarYMostrarBodegas() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'command/command.php?cmd=listarBodegas', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            var respuesta = JSON.parse(xhr.responseText);
            console.log(respuesta); // Verifica los datos recibidos en la consola

            if (respuesta.status === 'success') {
                mostrarBodegasEnGrilla(respuesta.bodegas);
            } else {
                console.error('Error al obtener las bodegas:', respuesta.message);
            }
        } else {
            console.error('Error en la solicitud al servidor.');
        }
    };

    xhr.onerror = function() {
        console.error('Error de red al intentar obtener los datos.');
    };

    xhr.send();
}

// Función para mostrar las bodegas en la grilla
function mostrarBodegasEnGrilla(bodegas) {
    var grillaBodegas = document.getElementById('tablaBodegas');
    grillaBodegas.innerHTML = ''; // Limpiar la grilla antes de agregar nuevas filas
    bodegas.forEach(function(bodega) {
        var fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${bodega.codigo}</td>
            <td>${bodega.nombre_bodega}</td>
            <td>${bodega.direccion}</td>
            <td>${bodega.dotacion}</td>
            <td>${bodega.nombres_encargados}</td>
            <td>${bodega.fecha_creacion}</td>
            <td>${bodega.estado_actual}</td>
            <td class="actions-column">
                <button class="edit-button" onclick="buscarBodega('${bodega.codigo}');">Editar</button>
                <button class="delete-button" onclick="eliminarBodega('${bodega.codigo}')">Eliminar</button>
            </td>
        `;
        grillaBodegas.appendChild(fila);
    });
}
/// Función para buscar una bodega por código
function buscarBodega(cod_bodega) {
    if (!cod_bodega) {
        console.error('Código de bodega no válido.');
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'command/command.php?cmd=traerDatosBodega&cod_bodega=' + cod_bodega, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            var respuesta = JSON.parse(xhr.responseText);
            console.log(respuesta); // Verifica los datos recibidos en la consola

            if (respuesta.status === 'success') {
                var esEdicion = true;
                mostrarDatosBodega(respuesta.bodega, esEdicion);
            } else {
                console.error('Error al obtener la bodega:', respuesta.message);
            }
        } else {
            console.error('Error en la solicitud al servidor.');
        }
    };

    xhr.onerror = function () {
        console.error('Error de red al intentar obtener los datos.');
    };

    xhr.send();
}

// Función para mostrar los datos de la bodega en el formulario de edición
function mostrarDatosBodega(bodega, esEdicion) {
    if (!bodega || !bodega.encargados_ids) {
        console.error('Datos de bodega no válidos.');
        return;
    }

    // Mostrar los datos de la bodega en el formulario
    document.getElementById('codigo').value = bodega.cod_bodega;
    document.getElementById('nombre').value = bodega.nom_bodega;
    document.getElementById('direccion').value = bodega.direccion;
    document.getElementById('dotacion').value = bodega.dotacion;

    // Mostrar el estado de la bodega como checkbox
    var estadoBodegaCheckbox = document.getElementById('estado-bodega');
    estadoBodegaCheckbox.checked = bodega.estado_bodega;
    // Actualizar el campo hidden con el id_bodega
    var idBodegaInput = document.getElementById('id_bodega');
    if (idBodegaInput) {
        idBodegaInput.value = bodega.id_bodega;
    } else {
        console.error('Elemento con ID "id_bodega" no encontrado.');
    }
    // Habilitar el checkbox solo si es una edición
    estadoBodegaCheckbox.disabled = !esEdicion;

    // Hacer el campo de código de bodega no editable si es edición
    if (esEdicion) {
        document.getElementById('codigo').setAttribute('disabled', true);
    } else {
        document.getElementById('codigo').removeAttribute('disabled');
    }

    // Mostrar los encargados como selectores
    var encargadosContainer = document.getElementById('encargados-container');
    encargadosContainer.innerHTML = ''; // Limpiar contenido anterior

    bodega.encargados_ids.forEach(function (encargado_id) {
        var newSelectContainer = document.createElement('div');
        newSelectContainer.classList.add('encargado-container');

        var newSelect = document.createElement('select');
        newSelect.classList.add('encargado-select');
        newSelect.name = 'id_encargado';
        newSelect.id = `id_encargado_${encargado_id}`;
        newSelect.setAttribute('required', true);

        // Opciones de encargados (se cargarán dinámicamente)
        cargarSelect(newSelect);

        // Seleccionar el encargado correspondiente por su ID
        setTimeout(function () {
            newSelect.value = encargado_id;
        }, 80);

        // Botón para eliminar encargado
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('delete-button');

        deleteButton.addEventListener('click', function () {
            eliminarEncargado(bodega.id_bodega, encargado_id, newSelectContainer.id);
        });

        // Contenedor para cada select y su botón
        newSelectContainer.id = `encargadoContainer_${encargado_id}`;
        newSelectContainer.appendChild(newSelect);
        newSelectContainer.appendChild(deleteButton);
        
        encargadosContainer.appendChild(newSelectContainer);
    });

    // Cambiar el texto del botón de "Crear Bodega" a "Guardar Cambios"
    var botonCrearEditar = document.getElementById('crear-bodega-btn');
    if (botonCrearEditar) {
        if (esEdicion) {
            botonCrearEditar.textContent = 'Guardar Cambios';
            botonCrearEditar.setAttribute('onclick', 'guardarCambios()'); // Agregar función de guardado
        } else {
            botonCrearEditar.textContent = 'Crear Bodega';
            botonCrearEditar.setAttribute('onclick', 'crearBodega()'); // Agregar función de creación
        }
    } else {
        console.error('No se encontró el botón "crear-bodega-btn" en el HTML.');
    }
}

// Función para eliminar un encargado
function eliminarEncargado(id_bodega, id_encargado, selectContainerId) {
    if (!id_bodega || !id_encargado || !selectContainerId) {
        console.error('ID de bodega, ID de encargado o ID de contenedor no válido.');
        return;
    }

    // Mostrar mensaje de confirmación
    var confirmacion = confirm('¿Estás seguro de que deseas eliminar este encargado?');

    // Si el usuario confirma, proceder con la eliminación
    if (confirmacion) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'command/command.php?cmd=eliminarEncargado&id_bodega=' + id_bodega + '&id_encargado=' + id_encargado, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                var respuesta = JSON.parse(xhr.responseText);
                console.log(respuesta); // Verifica los datos recibidos en la consola

                if (respuesta.status === 'success') {
                    // Eliminar el contenedor completo del encargado
                    var selectContainer = document.getElementById(selectContainerId);
                    if (selectContainer) {
                        selectContainer.parentNode.removeChild(selectContainer);
                    } else {
                        console.error('No se encontró el contenedor del selector a eliminar.');
                    }
                } else {
                    console.error('Error al eliminar el encargado:', respuesta.message);
                }
            } else {
                console.error('Error en la solicitud al servidor.');
            }
        };

        xhr.onerror = function () {
            console.error('Error de red al intentar obtener los datos.');
        };

        xhr.send();
    } else {
        // Si el usuario cancela, puedes ejecutar alguna acción adicional o simplemente retornar
        console.log('Eliminación de encargado cancelada por el usuario.');
    }
}

// Función para enviar los datos actualizados al servidor
function guardarCambios() {
    // Obtener los datos del formulario
    var idBodega = document.getElementById('id_bodega').value; // Asegúrate de tener un campo oculto con el ID de la bodega
    var codigo = document.getElementById('codigo').value;
    var nombre = document.getElementById('nombre').value;
    var direccion = document.getElementById('direccion').value;
    var dotacion = document.getElementById('dotacion').value;
    var estado = document.getElementById('estado-bodega').checked ? 1 : 0;

    // Obtener los IDs de los encargados seleccionados
    var encargados = [];
    var selectEncargados = document.querySelectorAll('.encargado-select');
    selectEncargados.forEach(function(select) {
        if (select.value !== '') {
            encargados.push(parseInt(select.value));
        }
    });

    // Crear el objeto con los datos del formulario
    var formularioData = {
        id_bodega: idBodega,
        codigo: codigo,
        nombre: nombre,
        direccion: direccion,
        dotacion: dotacion,
        estado: estado,
        encargados: encargados
    };

    // Enviar los datos al servidor usando XMLHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'command/command.php?cmd=editar', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            var respuesta = JSON.parse(xhr.responseText);
            console.log(respuesta); // Verifica los datos recibidos en la consola

            if (respuesta.status === 'success') {
                alert('Los datos se guardaron correctamente.');
                cargarYMostrarBodegas();
                limpiarFormulario();
            } else {
                alert('Error al guardar los datos: ' + respuesta.message);
            }
        } else {
            console.error('Error en la solicitud al servidor.');
        }
    };

    xhr.onerror = function () {
        console.error('Error de red al intentar enviar los datos.');
    };

    // Convertir el objeto formularioData a JSON y enviarlo
    var jsonData = JSON.stringify(formularioData);
    xhr.send(jsonData);
}

function limpiarFormulario() {
    // Limpiar campos del formulario
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('dotacion').value = '';

    // Limpiar campo oculto de id_bodega
    document.getElementById('id_bodega').value = '';

    // Marcar el checkbox y deshabilitarlo
    var estadoBodegaCheckbox = document.getElementById('estado-bodega');
    estadoBodegaCheckbox.checked = true;
    estadoBodegaCheckbox.disabled = true;
    // Habilitar el input del código de bodega
    var codigoBodegaInput = document.getElementById('codigo');
    codigoBodegaInput.removeAttribute('disabled');
    // Limpiar contenedor de encargados
    var encargadosContainer = document.getElementById('encargados-container');
    encargadosContainer.innerHTML = '';

    // Cambiar el texto del botón a "Crear Bodega"
    var botonCrearEditar = document.getElementById('crear-bodega-btn');
    if (botonCrearEditar) {
        botonCrearEditar.textContent = 'Crear Bodega';
        botonCrearEditar.setAttribute('onclick', 'crearBodega()'); // Ajusta según tu función de creación
    } else {
        console.error('No se encontró el botón "crear-bodega-btn" en el HTML.');
    }
}
function eliminarBodega(cod_bodega) {
    if (!cod_bodega) {
        console.error('El codigo de bodega no válido.');
        return;
    }

    // Mostrar mensaje de confirmación
    var confirmacion = confirm('¿Estás seguro de que deseas eliminar esta bodega? Esta acción no se puede deshacer.');

    // Si el usuario confirma, proceder con la eliminación
    if (confirmacion) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'command/command.php?cmd=eliminar&cod_bodega=' + cod_bodega, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                var respuesta = JSON.parse(xhr.responseText);
                console.log(respuesta); // Verifica los datos recibidos en la consola

                if (respuesta.status === 'success') {
                    // Mostrar mensaje de éxito o realizar alguna acción adicional
                    alert('Bodega eliminada correctamente.');
                    
                    cargarYMostrarBodegas();

                } else {
                    console.error('Error al eliminar la bodega:', respuesta.message);
                    // Mostrar un mensaje de error al usuario si es necesario
                    alert('Error al eliminar la bodega: ' + respuesta.message);
                }
            } else {
                console.error('Error en la solicitud al servidor.');
            }
        };

        xhr.onerror = function () {
            console.error('Error de red al intentar obtener los datos.');
        };

        // Enviar el ID de la bodega a eliminar como cuerpo de la solicitud
        xhr.send(JSON.stringify({ id_bodega: id_bodega }));
    } else {
        // Si el usuario cancela, puedes ejecutar alguna acción adicional o simplemente retornar
        console.log('Eliminación de bodega cancelada por el usuario.');
    }
}


// Llamar a la función principal para cargar y mostrar las bodegas al cargar la página u otro evento necesario
cargarYMostrarBodegas();
