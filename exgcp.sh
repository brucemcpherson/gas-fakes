#!/bin/bash

# This script reads the GCP_PROJECT_ID from a .env file
# and exports it as GOOGLE_CLOUD_PROJECT for the current shell session.
#
# Usage: source . ./exgcp.sh

# Define the path to your .env file relative to the script's location
ENV_FILE="$(dirname "$0")/.env"

# Check if the .env file exists

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at path: $ENV_FILE"
  # Use 'return' instead of 'exit' so it doesn't close the user's terminal when sourced
  return 1
fi

# Read the GCP_PROJECT_ID, remove quotes, and handle potential carriage returns
GOOGLE_CLOUD_PROJECT_VALUE=$(grep -E '^GOOGLE_CLOUD_PROJECT=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"\r')
GEMINI_API_KEY_VALUE=$(grep -E '^GEMINI_API_KEY=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"\r')
GEMINI_MODEL_VALUE=$(grep -E '^GEMINI_MODEL=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"\r')
OMDB_API_KEY_VALUE=$(grep -E '^OMDB_API_KEY=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"\r')
# Check if a value was extracted
if [ -z "$GOOGLE_CLOUD_PROJECT_VALUE" ]; then
  echo "Error: GOOGLE_CLOUD_PROJECT not found or is empty in $ENV_FILE."
  return 1
fi

if [ -z "GEMINI_API_KEY_VALUE" ]; then
  echo "GEMINI_API_KEY not found or is empty in $ENV_FILE."
else
  echo "exported: GEMINI_API_KEY"
  export GEMINI_API_KEY="$GEMINI_API_KEY_VALUE"
fi  

if [ -z "OMDB_API_KEY_VALUE" ]; then
  echo "OMDB_API_KEY not found or is empty in $ENV_FILE."
else
  echo "exported: OMDB_API_KEY"
  export OMDB_API_KEY="$OMDB_API_KEY_VALUE"
fi  

if [ -z "GEMINI_MODEL_VALUE" ]; then
  echo "GEMINI_MODEL not found or is empty in $ENV_FILE."
else
  echo "exported: GEMINI_MODEL=$GEMINI_MODEL_VALUE"
  export GEMINI_MODEL="$GEMINI_MODEL_VALUE"
fi  

# Export the variable for the current session
export GOOGLE_CLOUD_PROJECT="$GOOGLE_CLOUD_PROJECT_VALUE"

echo "exported: GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"