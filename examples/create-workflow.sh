#!/bin/bash

# Script pour créer un workflow exemple
# Usage: ./create-workflow.sh

API_URL="http://localhost:3000"

echo "Création d'un workflow exemple..."

curl -X POST "$API_URL/api/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Automatisation Email Marketing",
    "description": "Envoi automatique de newsletters aux clients avec segmentation",
    "clientName": "Entreprise ABC",
    "isActive": true,
    "valueGenerated": 0,
    "costPerExecution": 0.05,
    "timeSavedPerExecution": 15
  }' | jq '.'

echo ""
echo "Workflow créé ! Conservez l'ID pour l'utiliser dans vos webhooks n8n."
