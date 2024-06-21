<?php
// Archivo de conexión (por ejemplo, conexion.php)
$host = "localhost";
$port = '5433'; // Puerto específico de PostgreSQL
$username = 'prueba';
$password = "Prueba1234";
$dbname = 'bd_bodegas';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $username, $password);
    // Establecer el modo de error de PDO a excepción
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch(PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>
