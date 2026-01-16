#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "Starting MedBlock..."

# 1. Check/Start IPFS
if command_exists docker; then
    echo "Checking IPFS status..."
    if [ ! "$(docker ps -q -f name=ipfs_node)" ]; then
        if [ "$(docker ps -aq -f name=ipfs_node)" ]; then
            echo "Starting existing IPFS container..."
            docker start ipfs_node
        else
            echo "Creating and running new IPFS container..."
            docker pull ipfs/kubo
            docker run -d --name ipfs_node -v ipfs_data:/data/ipfs -p 4001:4001 -p 5001:5001 -p 8080:8080 ipfs/kubo
            
            echo "Configuring IPFS CORS..."
            # Wait a moment for container to initialize
            sleep 5
            docker exec ipfs_node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:5001", "https://webui.ipfs.io"]'
            docker exec ipfs_node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'
            docker restart ipfs_node
        fi
    else
        echo "IPFS container is already running."
    fi
else
    echo "Warning: Docker not found. IPFS might not work."
fi

# 2. Start Web App
echo "Starting React Web App..."
npm start
