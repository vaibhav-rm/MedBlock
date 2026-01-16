#!/bin/bash
set -e

# Pull IPFS image
echo "Pulling IPFS image..."
sudo docker pull ipfs/kubo

# Run IPFS container
echo "Running IPFS container..."
sudo docker run -d --name ipfs_node -v ipfs_data:/data/ipfs -p 4001:4001 -p 5001:5001 -p 8080:8080 ipfs/kubo

# Wait for IPFS to initialize
echo "Waiting for IPFS to initialize..."
sleep 10

# Configure CORS
echo "Configuring CORS..."
sudo docker exec ipfs_node ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
sudo docker restart ipfs_node

echo "IPFS setup complete!"
