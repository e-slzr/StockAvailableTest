<?php
/**
 * Función para realizar peticiones a la API
 * @param string $endpoint El endpoint de la API a consultar
 * @return array Datos devueltos por la API
 */
function getApiData($endpoint) {
    $url = API_URL . $endpoint;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    // Debug info
    if ($response === false || $httpCode !== 200) {
        error_log("API Error - URL: $url");
        error_log("HTTP Code: $httpCode");
        error_log("cURL Error: $error");
        error_log("Response: $response");
        return [];
    }

    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON Decode Error: " . json_last_error_msg());
        error_log("Response received: $response");
        return [];
    }

    return $data;
}
