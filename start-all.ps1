# Learnivo Microservices Startup Script (Unified Architecture)
# This script starts all services from the unified root structure.

$ErrorActionPreference = "Continue"

function Test-Port {
    param([int]$Port, [string]$Name)
    Write-Host "Checking $Name on port $Port..." -NoNewline
    $socket = New-Object Net.Sockets.TcpClient
    try {
        $asyncResult = $socket.BeginConnect("localhost", $Port, $null, $null)
        $wait = $asyncResult.AsyncWaitHandle.WaitOne(1000, $false)
        if ($wait -and $socket.Connected) {
            Write-Host " Running!" -ForegroundColor Green
            return $true
        } else {
            Write-Host " NOT FOUND" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
        return $false
    } finally {
        $socket.Close()
    }
}

function Wait-For-Port {
    param([int]$Port, [string]$Name, [int]$TimeoutSeconds = 60)
    Write-Host "Waiting for $Name to start on port $Port..."
    $start = Get-Date
    while ((Get-Date) -lt $start.AddSeconds($TimeoutSeconds)) {
        if (Test-Port -Port $Port -Name $Name) { return $true }
        Start-Sleep -Seconds 2
    }
    Write-Host "Timeout waiting for $Name" -ForegroundColor Yellow
    return $false
}

Write-Host "=========================================="
Write-Host "   Learnivo Startup Prerequisites      "
Write-Host "=========================================="

# Check MySQL
if (-not (Test-Port -Port 3306 -Name "MySQL")) {
    Write-Host "ERROR: MySQL is not running on port 3306. Please start it first!" -ForegroundColor Red
    exit 1
}

# Check RabbitMQ
if (-not (Test-Port -Port 5672 -Name "RabbitMQ")) {
    Write-Host "ERROR: RabbitMQ is not running on port 5672. Please start it first!" -ForegroundColor Yellow
    # We don't exit here strictly, let them know.
}

Write-Host ""
Write-Host "=========================================="
Write-Host "   Starting Unified Microservices Stack  "
Write-Host "=========================================="

$workspaceRoot = $PSScriptRoot

$services = @(
    @{ Name = "Eureka Server"; Path = "$workspaceRoot\eureka-service"; Port = 8761; Wait = $true; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "API Gateway"; Path = "$workspaceRoot\api-gateway"; Port = 8081; Wait = $true; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "User Service"; Path = "$workspaceRoot\user-service"; Port = 8085; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Class Service"; Path = "$workspaceRoot\class-service"; Port = 9090; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Competition Service"; Path = "$workspaceRoot\competition-service"; Port = 8082; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Course Service"; Path = "$workspaceRoot\course-service"; Port = 8083; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Quiz Service"; Path = "$workspaceRoot\quiz-service"; Port = 8084; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Club-Event Service"; Path = "$workspaceRoot\club-event-service"; Port = 8087; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Imed Service"; Path = "$workspaceRoot\imed-service"; Port = 8086; Wait = $false; Cmd = "mvn spring-boot:run -DskipTests" },
    @{ Name = "Claims Service"; Path = "$workspaceRoot\claims-service"; Port = 8088; Wait = $false; Cmd = "npm install; npm start" }
)

foreach ($svc in $services) {
    Write-Host "Starting $($svc.Name)..." -ForegroundColor Cyan
    
    $startScript = @"
`$Host.UI.RawUI.WindowTitle = 'Learnivo: $($svc.Name)'
Set-Location '$($svc.Path)'
Write-Host 'Starting $($svc.Name) at $($svc.Path)...'
$($svc.Cmd)
"@

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $startScript
    
    if ($svc.Wait) {
        Wait-For-Port -Port $svc.Port -Name $svc.Name
    } else {
        Start-Sleep -Seconds 2
    }
}

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
$frontendPath = "$workspaceRoot\frontend"
$frontScript = @"
`$Host.UI.RawUI.WindowTitle = 'Learnivo: Frontend'
Set-Location '$frontendPath'
Write-Host 'Starting Frontend at $frontendPath...'
npm start
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontScript

Write-Host ""
Write-Host "=========================================="
Write-Host "   All services initiated!              "
Write-Host "=========================================="
Write-Host "Check the individual PowerShell windows for logs."
