<?php
// Cargar configuración
require_once 'app/config/config.php';

// Cargar helpers
require_once 'app/helpers/api_helper.php';

// Determinar qué vista cargar
$view = isset($_GET['view']) ? $_GET['view'] : 'transactions';

// Validar que la vista existe
if (!file_exists("app/views/{$view}.php")) {
    $view = 'transactions'; // Vista por defecto
}

// Cargar el layout que incluirá la vista correspondiente
require_once 'app/views/layout.php';
?>
