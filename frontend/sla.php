<?php
require_once __DIR__.'/includes/auth.php';
require_login();
require_once __DIR__.'/includes/api.php';
$data = api_get('/api/v1/sla/summary');
$rows = $data['data'] ?? [];
?><!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SLA & Availability</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head><body class="bg-light"><main class="container py-4"><div class="d-flex justify-content-between align-items-center mb-4"><h2>SLA & Availability</h2><a class="btn btn-outline-secondary" href="index.php">Dashboard</a></div><div class="card"><div class="card-body"><div class="table-responsive"><table class="table align-middle"><thead><tr><th>Host</th><th>Availability</th><th>UP</th><th>DOWN</th><th>UNKNOWN</th></tr></thead><tbody><?php foreach($rows as $r): ?><tr><td><?=htmlspecialchars($r['hostname']??'')?></td><td><?=htmlspecialchars($r['availability_pct']??'0')?>%</td><td><?=htmlspecialchars($r['up_seconds']??0)?>s</td><td><?=htmlspecialchars($r['down_seconds']??0)?>s</td><td><?=htmlspecialchars($r['unknown_seconds']??0)?>s</td></tr><?php endforeach; ?></tbody></table></div></div></div></main></body></html>
