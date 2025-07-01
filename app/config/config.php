<?php
// API configuration local
define('API_URL', 'http://localhost:5012/api/');

//API configuration online
//define('API_URL', 'https://stockavaibletest-api.onrender.com/api/');


// DB configuration
define('BASE_URL', 'http://localhost/StockAvaibleBD');
define('DEFAULT_CONTROLLER', 'transactions');
define('DEFAULT_ACTION', 'index');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
