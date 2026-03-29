# Check for Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Attempting to install via winget..."
    winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
    Write-Host "Docker installation finished. IMPORTANT: You usually need to restart your computer and start Docker Desktop manually to complete the WSL2 virtualization setup before containers can run."
    Write-Host "Please restart, ensure Docker is running, and then re-run this script."
    exit
}

Write-Host "Starting TimescaleDB with Docker Compose..."
docker-compose up -d

Write-Host "Installing Backend Dependencies..."
cd c:\Users\avira\Downloads\TechSolstice\backend
npm install

Write-Host "Installing Frontend Dependencies..."
cd c:\Users\avira\Downloads\TechSolstice\frontend
npm install

Write-Host "Starting Backend (Port 3001)..."
cd c:\Users\avira\Downloads\TechSolstice\backend
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "start"

Write-Host "Starting Frontend (Port 5174)..."
cd c:\Users\avira\Downloads\TechSolstice\frontend
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev"

Write-Host "Waiting for servers to boot up..."
Start-Sleep -Seconds 5
Write-Host "Launching site..."
Start-Process "http://localhost:5174"
