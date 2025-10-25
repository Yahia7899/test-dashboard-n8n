#!/bin/bash

# Script pour envoyer un webhook de test
# Usage: ./send-webhook.sh <workflow-id>

if [ -z "$1" ]; then
  echo "Usage: ./send-webhook.sh <workflow-id>"
  echo "Example: ./send-webhook.sh abc-123-def-456"
  exit 1
fi

WORKFLOW_ID="$1"
API_URL="http://localhost:3000"

echo "Envoi d'un webhook de test pour le workflow: $WORKFLOW_ID"

curl -X POST "$API_URL/api/webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"workflowId\": \"$WORKFLOW_ID\",
    \"status\": \"success\",
    \"startedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"finishedAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\",
    \"duration\": 1500,
    \"itemsProcessed\": 10,
    \"metadata\": {
      \"test\": true,
      \"campaign\": \"Test Campaign\"
    }
  }" | jq '.'

echo ""
echo "Webhook envoyé avec succès !"
