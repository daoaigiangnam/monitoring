param(
  [Parameter(Mandatory=$true)][string]$ApiUrl,
  [Parameter(Mandatory=$true)][string]$AgentToken,
  [string]$InstallDir = 'C:\Program Files\MonitoringAgent',
  [int]$IntervalSec = 30
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item "$root\*" $InstallDir -Recurse -Force
$config = @{ api_url=$ApiUrl.TrimEnd('/'); token=$AgentToken; interval_sec=$IntervalSec } | ConvertTo-Json
Set-Content -Path "$InstallDir\config.json" -Value $config -Encoding UTF8
$node = (Get-Command node -ErrorAction SilentlyContinue)
if (-not $node) { throw 'Node.js 22+ is required. Install Node.js before running the Agent.' }
$serviceName='MonitoringAgent'
$nodeExe=$node.Source
$entry=Join-Path $InstallDir 'src\index.js'
sc.exe stop $serviceName 2>$null | Out-Null
sc.exe delete $serviceName 2>$null | Out-Null
sc.exe create $serviceName binPath= "\"$nodeExe\" \"$entry\"" start= auto obj= LocalSystem DisplayName= "Infrastructure Monitoring Agent" | Out-Null
sc.exe description $serviceName "Infrastructure Monitoring Agent" | Out-Null
sc.exe failure $serviceName reset= 86400 actions= restart/5000/restart/15000/restart/30000 | Out-Null
sc.exe start $serviceName | Out-Null
Write-Host "Monitoring Agent installed and started: $InstallDir"
