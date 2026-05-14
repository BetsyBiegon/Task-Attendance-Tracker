#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "$0")"

echo "=========================================="
echo "Starting Task & Attendance Tracker"
echo "=========================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    # Suppress kill errors if processes are already dead
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Trap exit signals to run the cleanup function when you press Ctrl+C
trap cleanup SIGINT SIGTERM EXIT

# --- Start Backend ---
echo "[1/2] Starting Backend..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Determine backend port (default 3000)
BACKEND_PORT=3000
if [ -f "backend/.env" ]; then
    ENV_PORT=$(grep -E '^PORT=' backend/.env | cut -d '=' -f2)
    if [ -n "$ENV_PORT" ]; then
        BACKEND_PORT=$ENV_PORT
    fi
fi

echo "Waiting for Backend health check on port $BACKEND_PORT..."
MAX_ATTEMPTS=30
ATTEMPT=0
HEALTHY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:$BACKEND_PORT/health | grep -q "Server is running"; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT+1))
done
echo ""

if [ "$HEALTHY" = false ]; then
    echo "❌ Backend failed to start or health check timed out."
    exit 1
fi
echo "✅ Backend is healthy and running!"

# --- Start Frontend ---
echo "[2/2] Starting Frontend..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend (default Vite port is 5173)
FRONTEND_PORT=5173
echo "Waiting for Frontend to start on port $FRONTEND_PORT..."
ATTEMPT=0
FRONTEND_UP=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    # Vite responds to standard curl requests on its port
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null; then
        FRONTEND_UP=true
        break
    fi
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT+1))
done
echo ""

if [ "$FRONTEND_UP" = false ]; then
    echo "⚠️ Frontend might not be fully up, or it might be running on a different port."
else
    echo "✅ Frontend is up and running!"
fi

echo "=========================================="
echo "🚀 All services started successfully!"
echo "Backend API: http://localhost:$BACKEND_PORT"
echo "Frontend UI: http://localhost:$FRONTEND_PORT"
echo "Press Ctrl+C to stop both services cleanly."
echo "=========================================="

# Keep the script running to hold the background processes open
wait
