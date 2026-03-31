# tourniquet

An automated AWS infrastructure optimization and anomaly detection platform. 

Tourniquet helps catch unexpected AWS cost spikes and operational anomalies in real-time, simulating remediation impacts ("What-If" analysis) before applying them.

## Setup & Local Dev

You'll need Node.js (v18+), Python (3.10+), and Docker.

1. Clone the repo and navigate to the project root.
2. Spin up the database (TimescaleDB) and other containers:
   ```bash
   docker-compose up -d
   ```
3. Use the provided PowerShell script to install all dependencies and start the backend, frontend, and Python services:
   ```powershell
   .\setup_and_run.ps1
   ```
   *If you hit an execution policy error on Windows, run this first:* `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

## Project Structure

- **`/frontend`**: React + Vite dashboard. Pretty heavy on modern UI elements (glassmorphism) to visualize billing, carbon footprint, and human-in-the-loop workflows.
- **`/backend`**: Node.js service tracking metrics, handling user auth, scheduling cron jobs, and talking to TimescaleDB.
- **`main.py`, `nodes.py`, `state.py`, `aws_client.py`**: The core ML and LangGraph engine. This handles the anomaly detection, automated remediation workflows, and predictive "What-If" cost analysis.

## Key Features
- **Real-time Anomaly Detection**: Ingests AWS telemetry and flags unusual changes.
- **Human-in-the-Loop Remediation**: LangGraph workflows that pause for user confirmation via the dashboard before executing cost-saving changes.
- **Impact Simulation**: Predictive modeling to see how infrastructure optimizations affect cloud spend and environmental footprint.

## License
MIT
