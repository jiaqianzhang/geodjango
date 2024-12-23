#!/bin/bash

TIMEOUT=60  # Set timeout in seconds
START_TIME=$(date +%s)

until nc -z postgis 5432; do
    echo "Waiting for PostgreSQL..."
    sleep 0.5  # Check every 0.5 seconds

    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
        echo "Timeout: PostgreSQL is still not available after $TIMEOUT seconds."
        exit 1
    fi
done

echo "PostgreSQL is up!"

