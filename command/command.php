<?php
include 'conexion.php'; // Incluir el archivo de conexión a la base de datos

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$cmd = isset($_GET['cmd']) ? $_GET['cmd'] : ''; // Detectar el comando desde la URL

header('Access-Control-Allow-Origin: *'); // Configurar cabeceras CORS
header('Content-Type: application/json');

switch ($cmd) {
    case 'guardar':
        // Obtener los datos del formulario desde POST
        $data = json_decode(file_get_contents('php://input'), true);
        $formularioData = $data['formularioData']; // Datos del formulario

        // Sanitizar y asignar valores
        $codigo = htmlspecialchars($formularioData['codigo']);
        $nombre = htmlspecialchars($formularioData['nombre']);
        $direccion = htmlspecialchars($formularioData['direccion']);
        $dotacion = (int)$formularioData['dotacion'];
        $encargados = $formularioData['encargados']; // Array de encargados

        try {
            // Verificar si el código de bodega ya existe
            $sql_verificar = "SELECT COUNT(*) AS existe FROM bodegas WHERE cod_bodega = ?";
            $stmt_verificar = $conn->prepare($sql_verificar);
            $stmt_verificar->execute([$codigo]);
            $resultado_verificar = $stmt_verificar->fetch(PDO::FETCH_ASSOC);

            if ($resultado_verificar['existe'] > 0) {
                // Si el código de bodega ya existe, devolver un error
                header('Content-Type: application/json');
                echo json_encode(['status' => 'error', 'message' => 'El código de bodega ya existe. No se puede guardar.']);
            } else {
                // Preparar la consulta para insertar en la tabla bodegas
                $sql_bodega = "INSERT INTO bodegas (cod_bodega, nom_bodega, direccion, dotacion, estado_bodega) 
                                VALUES (?, ?, ?, ?, true)";

                // Iniciar una transacción
                $conn->beginTransaction();

                // Ejecutar la consulta para insertar en la tabla bodegas
                $stmt_bodega = $conn->prepare($sql_bodega);
                $stmt_bodega->execute([$codigo, $nombre, $direccion, $dotacion]);

                // Obtener el ID de la bodega recién insertada
                $id_bodega = $conn->lastInsertId();

                // Preparar la consulta para insertar en la tabla bodega_encargado
                $sql_encargado = "INSERT INTO bodega_encargado (id_bodega, id_encargado) VALUES ";

                // Construir los valores para la consulta de inserción múltiple
                $values = [];
                foreach ($encargados as $encargado_id) {
                    $values[] = "($id_bodega, $encargado_id)";
                }

                $sql_encargado .= implode(", ", $values);

                // Ejecutar la consulta para insertar en la tabla bodega_encargado
                $stmt_encargado = $conn->prepare($sql_encargado);
                $stmt_encargado->execute();

                // Confirmar la transacción
                $conn->commit();

                // Devolver una respuesta de éxito
                header('Content-Type: application/json');
                echo json_encode(['status' => 'success', 'message' => 'Los datos se guardaron correctamente.']);
            }
        } catch (PDOException $e) {
            // Revertir la transacción en caso de error
            $conn->rollBack();

            // Devolver una respuesta de error
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error al guardar los datos: ' . $e->getMessage()]);
        }

        break;

    case 'traerDatosBodega':
        // Obtener el código de bodega desde la solicitud
        $cod_bodega = $_REQUEST['cod_bodega']; // Asegúrate de sanear y validar esta entrada según tus necesidades

        // Consulta para seleccionar la bodega específica por su código
        $sql = "SELECT b.id_bodega, b.cod_bodega, b.nom_bodega, b.direccion, b.dotacion, 
                       b.estado_bodega, b.fecha_creacion, 
                       array_agg(e.id_encargado) AS encargados_ids
                FROM bodegas b
                LEFT JOIN bodega_encargado be ON b.id_bodega = be.id_bodega
                LEFT JOIN encargados e ON be.id_encargado = e.id_encargado
                WHERE b.cod_bodega = :cod_bodega
                GROUP BY b.id_bodega, b.cod_bodega, b.nom_bodega, b.direccion, b.dotacion, 
                         b.estado_bodega, b.fecha_creacion";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':cod_bodega', $cod_bodega, PDO::PARAM_STR);
        $stmt->execute();

        // Obtener resultados como un array asociativo
        $bodega = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verificar si se encontró la bodega
        if ($bodega) {
            // Convertir el estado de booleano a un valor legible
            $estado = $bodega['estado_bodega'] ? 'Activada' : 'Desactivada';

            $encargados_ids = [];
            if ($bodega['encargados_ids']) {
                // Eliminar llaves y espacios alrededor
                $encargados_clean = trim(str_replace(['{', '}'], '', $bodega['encargados_ids']));

                // Dividir por comas para obtener un array de IDs
                $encargados_ids = explode(',', $encargados_clean);

                // Eliminar elementos vacíos (por si acaso)
                $encargados_ids = array_filter($encargados_ids, 'strlen');
            }

            // Preparar los datos de la bodega
            $data = [
                'id_bodega' => $bodega['id_bodega'],
                'cod_bodega' => $bodega['cod_bodega'],
                'nom_bodega' => $bodega['nom_bodega'],
                'direccion' => $bodega['direccion'],
                'dotacion' => $bodega['dotacion'],
                'estado_bodega' => $estado,
                'fecha_creacion' => $bodega['fecha_creacion'],
                'encargados_ids' => $encargados_ids
            ];

            // Devolver resultados como JSON
            header('Content-Type: application/json');
            echo json_encode(['status' => 'success', 'bodega' => $data]);
        } else {
            // Si no se encontró la bodega
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'No se encontró la bodega con el código especificado']);
        }
        break;

    case 'editar':
        // Obtener los datos del formulario enviado como JSON
        $datosFormulario = json_decode(file_get_contents('php://input'), true);

        if (!$datosFormulario || empty($datosFormulario)) {
            $respuesta = array('status' => 'error', 'message' => 'Datos de formulario no válidos.');
            echo json_encode($respuesta);
            exit;
        }

        // Extraer los datos de la bodega
        $id_bodega = $datosFormulario['id_bodega'];
        $codigo = $datosFormulario['codigo'];
        $nombre = $datosFormulario['nombre'];
        $direccion = $datosFormulario['direccion'];
        $dotacion = $datosFormulario['dotacion'];
        $estado = $datosFormulario['estado'];

        try {
            // Iniciar una transacción
            $conn->beginTransaction();

            // Actualizar los datos de la bodega en la base de datos
            $query = "UPDATE bodegas SET cod_bodega = :codigo, nom_bodega = :nombre, direccion = :direccion, dotacion = :dotacion, estado_bodega = :estado WHERE id_bodega = :id_bodega";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':codigo', $codigo);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':direccion', $direccion);
            $stmt->bindParam(':dotacion', $dotacion);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':id_bodega', $id_bodega);
            $stmt->execute();

            // Eliminar todos los encargados asociados previamente a esta bodega
            $deleteQuery = "DELETE FROM bodega_encargado WHERE id_bodega = :id_bodega";
            $stmtDelete = $conn->prepare($deleteQuery);
            $stmtDelete->bindParam(':id_bodega', $id_bodega);
            $stmtDelete->execute();

            // Insertar los nuevos encargados asociados
            $encargados = $datosFormulario['encargados']; // Suponiendo que recibes un array de IDs de encargados

            foreach ($encargados as $encargado_id) {
                $insertQuery = "INSERT INTO bodega_encargado (id_bodega, id_encargado) VALUES (:id_bodega, :encargado_id)";
                $stmtInsert = $conn->prepare($insertQuery);
                $stmtInsert->bindParam(':id_bodega', $id_bodega);
                $stmtInsert->bindParam(':encargado_id', $encargado_id);
                $stmtInsert->execute();
            }

            // Confirmar la transacción
            $conn->commit();

            $respuesta = array('status' => 'success', 'message' => 'Datos de la bodega actualizados correctamente.');
            echo json_encode($respuesta);

        } catch (PDOException $e) {
            // Revertir la transacción si hay un error
            $conn->rollBack();

            $respuesta = array('status' => 'error', 'message' => 'Error al actualizar los datos de la bodega: ' . $e->getMessage());
            echo json_encode($respuesta);
        }
        break;

    case 'eliminar':
        // Obtener el ID de la bodega a eliminar
        $cod_bodega = $_REQUEST['cod_bodega'];

        try {
            // Preparar la consulta para seleccionar el ID de la bodega
            $query = "SELECT id_bodega FROM bodegas WHERE cod_bodega = :cod_bodega";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':cod_bodega', $cod_bodega, PDO::PARAM_STR);
            $stmt->execute();

            // Verificar si se encontró la bodega
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $id_bodega = $row['id_bodega'];

                // Eliminar los registros de la tabla intermedia bodega_encargado
                $deleteQuery = "DELETE FROM bodega_encargado WHERE id_bodega = :id_bodega";
                $stmtDelete = $conn->prepare($deleteQuery);
                $stmtDelete->bindParam(':id_bodega', $id_bodega, PDO::PARAM_INT);
                $stmtDelete->execute();

                // Eliminar la bodega de la tabla principal
                $deleteQueryBodega = "DELETE FROM bodegas WHERE id_bodega = :id_bodega";
                $stmtDeleteBodega = $conn->prepare($deleteQueryBodega);
                $stmtDeleteBodega->bindParam(':id_bodega', $id_bodega, PDO::PARAM_INT);
                $stmtDeleteBodega->execute();

                // Verificar si se eliminaron registros y preparar la respuesta
                $affectedRows = $stmtDeleteBodega->rowCount();
                if ($affectedRows > 0) {
                    $respuesta = array('status' => 'success', 'message' => 'Bodega eliminada correctamente.');
                } else {
                    $respuesta = array('status' => 'error', 'message' => 'No se encontró ninguna bodega con el código proporcionado.');
                }
            } else {
                $respuesta = array('status' => 'error', 'message' => 'No se encontró ninguna bodega con el código proporcionado.');
            }
        } catch(PDOException $e) {
            $respuesta = array('status' => 'error', 'message' => 'Error al eliminar la bodega: ' . $e->getMessage());
        }

        // Enviar respuesta como JSON
        echo json_encode($respuesta);
        break;

    case 'cargarEncargados':
        // Consulta para seleccionar todos los encargados
        $sql = "SELECT id_encargado, nombre, primer_apellido, segundo_apellido FROM encargados";
        $stmt = $conn->query($sql);

        // Obtener resultados como un array asociativo
        $encargados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Devolver resultados como JSON
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'encargados' => $encargados]);

        break;

    case 'listarBodegas':
        // Consulta para seleccionar todas las bodegas
        $sql = "SELECT * FROM vista_bodega_encargados";
        $stmt = $conn->query($sql);

        // Obtener resultados como un array asociativo
        $bodegas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Devolver resultados como JSON
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'bodegas' => $bodegas]);

        break;

    case 'eliminarEncargado':
        $id_bodega = $_REQUEST['id_bodega'];
        $id_encargado = $_REQUEST['id_encargado'];

        // Query para eliminar el encargado de la bodega
        $query = "DELETE FROM bodega_encargado WHERE id_bodega = $id_bodega AND id_encargado = $id_encargado";

        // Ejecutar la sentencia
        $stmt = $conn->query($query);

        // Verificar el resultado
        if ($stmt) {
            // Eliminación exitosa
            $response = [
                'status' => 'success',
                'message' => 'Encargado eliminado correctamente.'
            ];
        } else {
            // Error al ejecutar la sentencia
            $response = [
                'status' => 'error',
                'message' => 'Error al eliminar el encargado.'
            ];
        }

        // Devolver respuesta como JSON
        header('Content-Type: application/json');
        echo json_encode($response);

        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Comando no reconocido.']);
        break;
}
?>
