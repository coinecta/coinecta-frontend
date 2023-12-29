#!/bin/bash

# Build the Docker image
docker build -t local-postgres-ssl .

# Check if the container already exists
if [ $(docker ps -a -f name=coinecta-dev-postgres | grep -w coinecta-dev-postgres | wc -l) -gt 0 ]; then
    echo "Removing existing container..."
    docker rm -f coinecta-dev-postgres
fi

# Create the db folder if it doesn't exist
mkdir -p ./db

# Run the new Docker container with the volume mounted
docker run -d --name coinecta-dev-postgres \
  -p 15432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=test1234 \
  -v "$(pwd)/db:/var/lib/postgresql/data" \
  local-postgres-ssl

echo "Container has been successfully created/recreated."
