#!/bin/bash
# Start both Go API server and React frontend

# Start Go server in background
cd "$(dirname "$0")"
echo "Starting Go API server on :8080..."
GO111MODULE=on nohup go run . > go_server.log 2>&1 &
GO_PID=$!

# Start React frontend
cd frontend
echo "Starting React frontend on :5173..."
npm run dev

# When frontend exits, kill Go server
echo "Shutting down Go API server (PID $GO_PID)..."
kill $GO_PID
echo "Go API server stopped. React frontend exited."
