<?php
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
function db(): PDO { static $pdo; if ($pdo) return $pdo; $host=getenv('DB_HOST')?:'mysql'; $name=getenv('DB_NAME')?:'monitoring'; $user=getenv('DB_USER')?:'monitor'; $pass=getenv('DB_PASSWORD')?:'change-me'; $pdo=new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]); return $pdo; }
function e($v): string { return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8'); }
function csrf(): string { if(empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
function check_csrf(): void { if(!hash_equals($_SESSION['csrf']??'',$_POST['csrf']??'')) { http_response_code(419); exit('Invalid CSRF token'); } }
function require_login(): void { if(empty($_SESSION['user'])) { header('Location: login.php'); exit; } }
function require_role(array $roles): void { require_login(); if(!in_array($_SESSION['user']['role'],$roles,true)){http_response_code(403);exit('Forbidden');} }
