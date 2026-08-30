param([string]$ServiceName='MonitoringAgent',[string]$InstallDir='C:\Program Files\MonitoringAgent')
$ErrorActionPreference='Stop'
sc.exe stop $ServiceName 2>$null | Out-Null
Start-Sleep -Seconds 2
sc.exe delete $ServiceName 2>$null | Out-Null
if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
Write-Host "Monitoring Agent removed."
