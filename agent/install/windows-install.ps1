param(
  [string]$InstallDir = "$env:ProgramFiles\InfrastructureMonitoringAgent",
  [string]$ApiUrl = "",
  [string]$AgentId = $env:COMPUTERNAME,
  [string]$AgentToken = "",
  [int]$IntervalSeconds = 60
)
$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Run PowerShell as Administrator.' }
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { throw 'Node.js 20+ is required. Install Node.js before installing the agent.' }
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$root = Split-Path -Parent $PSScriptRoot
Copy-Item "$root\*" $InstallDir -Recurse -Force -Exclude 'node_modules','data'
New-Item -ItemType Directory -Force -Path "$InstallDir\data\queue" | Out-Null
@"
API_URL=$ApiUrl
AGENT_ID=$AgentId
AGENT_TOKEN=$AgentToken
INTERVAL_MS=$($IntervalSeconds * 1000)
AGENT_CONFIG=$InstallDir\config.json
QUEUE_DIR=$InstallDir\data\queue
"@ | Set-Content "$InstallDir\.env" -Encoding UTF8
Push-Location $InstallDir
npm install --omit=dev
Pop-Location
$node = (Get-Command node.exe).Source
$envFile = "$InstallDir\.env"
$taskName = 'Infrastructure Monitoring Agent'
$action = New-ScheduledTaskAction -Execute $node -Argument "`"$InstallDir\src\index.js`"" -WorkingDirectory $InstallDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Write-Host "Agent installed and started: $taskName"
Write-Host "Config: $envFile"
