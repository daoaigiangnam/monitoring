<?php
declare(strict_types=1);
session_start();
$apiBase = getenv('API_BASE_URL') ?: 'http://api:8080';
function api_get(string $path): array {
    global $apiBase;
    $url = rtrim($apiBase, '/') . $path;
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]);
    $raw = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}
