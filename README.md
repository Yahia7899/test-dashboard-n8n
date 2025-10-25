# Dashboard n8n - Suivi des Automatisations

Dashboard futuriste pour suivre la performance et la valeur générée par vos workflows n8n.

## Fonctionnalités

- **Suivi en temps réel** : Recevez les données de vos workflows via webhook
- **Métriques détaillées** : Valeur générée, coûts, temps économisé, ROI
- **Visualisations interactives** : Graphiques d'exécutions, taux de réussite, tendances
- **Design futuriste** : Interface moderne avec animations et effets visuels
- **Vue détaillée** : Statistiques approfondies pour chaque workflow

## Installation

1. Cloner le projet et installer les dépendances :

```bash
npm install
```

2. Lancer le serveur de développement :

```bash
npm run dev
```

3. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Configuration des Workflows

### 1. Créer un Workflow

Avant de recevoir des webhooks, vous devez créer un workflow dans le dashboard.

**Endpoint:** `POST /api/workflows`

**Exemple de requête:**

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Automatisation Email Marketing",
    "description": "Envoi automatique de newsletters aux clients",
    "clientName": "Entreprise ABC",
    "isActive": true,
    "valueGenerated": 0,
    "costPerExecution": 0.05,
    "timeSavedPerExecution": 15
  }'
```

**Paramètres:**
- `name` (requis) : Nom du workflow
- `clientName` (requis) : Nom du client
- `description` : Description du workflow
- `isActive` : Statut actif/inactif (par défaut: true)
- `valueGenerated` : Valeur totale générée en euros (par défaut: 0)
- `costPerExecution` : Coût par exécution en euros (par défaut: 0)
- `timeSavedPerExecution` : Temps économisé par exécution en minutes (par défaut: 0)

**Réponse:**

```json
{
  "success": true,
  "workflow": {
    "id": "uuid-du-workflow",
    "name": "Automatisation Email Marketing",
    "description": "Envoi automatique de newsletters aux clients",
    "clientName": "Entreprise ABC",
    "isActive": true,
    "valueGenerated": 0,
    "costPerExecution": 0.05,
    "timeSavedPerExecution": 15,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Workflow created successfully"
}
```

**Conservez l'ID du workflow** retourné, vous en aurez besoin pour configurer le webhook dans n8n.

### 2. Configurer le Webhook dans n8n

Dans votre workflow n8n, ajoutez un nœud **HTTP Request** à la fin de votre workflow :

**Configuration du nœud HTTP Request:**

- **Method:** POST
- **URL:** `http://localhost:3000/api/webhook` (ou l'URL de votre dashboard en production)
- **Authentication:** None
- **Send Body:** On
- **Specify Body:** Using Fields Below
- **Body Content Type:** JSON

**Champs à envoyer:**

```json
{
  "workflowId": "uuid-du-workflow-créé-précédemment",
  "status": "success",
  "startedAt": "{{ $now.toISO() }}",
  "finishedAt": "{{ $now.toISO() }}",
  "duration": 1500,
  "itemsProcessed": 10,
  "metadata": {
    "customField": "valeur personnalisée"
  }
}
```

**Paramètres du webhook:**
- `workflowId` (requis) : L'ID du workflow obtenu lors de la création
- `status` : "success", "error", ou "running" (par défaut: "success")
- `startedAt` : Date de début de l'exécution (ISO 8601)
- `finishedAt` : Date de fin de l'exécution (ISO 8601)
- `duration` : Durée de l'exécution en millisecondes
- `itemsProcessed` : Nombre d'éléments traités
- `errorMessage` : Message d'erreur (si status = "error")
- `metadata` : Données personnalisées (optionnel, format JSON)

### 3. Exemples de Configuration n8n

#### Exemple 1 : Workflow Simple

```json
{
  "workflowId": "abc-123-def-456",
  "status": "success",
  "itemsProcessed": 5
}
```

#### Exemple 2 : Workflow avec Timing

```json
{
  "workflowId": "abc-123-def-456",
  "status": "success",
  "startedAt": "{{ $workflow.startedAt }}",
  "finishedAt": "{{ $now.toISO() }}",
  "duration": "{{ $workflow.duration }}",
  "itemsProcessed": "{{ $('Previous Node').itemMatching(0).json.count }}"
}
```

#### Exemple 3 : Gestion d'Erreur

```json
{
  "workflowId": "abc-123-def-456",
  "status": "error",
  "startedAt": "{{ $workflow.startedAt }}",
  "finishedAt": "{{ $now.toISO() }}",
  "errorMessage": "{{ $json.error.message }}",
  "itemsProcessed": 0
}
```

#### Exemple 4 : Avec Métadonnées Personnalisées

```json
{
  "workflowId": "abc-123-def-456",
  "status": "success",
  "itemsProcessed": 25,
  "metadata": {
    "campaign": "Newsletter Q1 2025",
    "emailsSent": 1500,
    "openRate": 45.2,
    "clickRate": 12.8
  }
}
```

## API Endpoints

### Workflows

#### GET /api/workflows
Récupère tous les workflows

**Exemple:**
```bash
curl http://localhost:3000/api/workflows
```

#### POST /api/workflows
Crée un nouveau workflow (voir section Configuration)

#### GET /api/workflows/{id}
Récupère un workflow spécifique

**Exemple:**
```bash
curl http://localhost:3000/api/workflows/abc-123-def-456
```

#### GET /api/workflows/{id}/stats
Récupère les statistiques détaillées d'un workflow

**Exemple:**
```bash
curl http://localhost:3000/api/workflows/abc-123-def-456/stats
```

**Réponse:**
```json
{
  "workflow": { ... },
  "stats": {
    "total": {
      "executions": 150,
      "successfulExecutions": 145,
      "failedExecutions": 5,
      "valueGenerated": 1500,
      "totalCost": 7.5,
      "netValue": 1492.5,
      "totalTimeSaved": 2250
    },
    "weekly": {
      "totalExecutions": 35,
      "successfulExecutions": 34,
      "failedExecutions": 1,
      "averageDuration": 1200
    },
    "daily": [
      {
        "date": "2025-01-01",
        "success": 10,
        "error": 0,
        "total": 10
      }
    ]
  }
}
```

### Webhook

#### POST /api/webhook
Reçoit les données d'exécution des workflows n8n (voir section Configuration)

## Structure du Projet

```
/
├── app/
│   ├── api/
│   │   ├── webhook/          # Endpoint webhook
│   │   └── workflows/        # CRUD workflows
│   ├── workflow/[id]/        # Page détails workflow
│   └── page.tsx              # Dashboard principal
├── components/
│   ├── MetricCard.tsx        # Carte métrique
│   └── WorkflowCard.tsx      # Carte workflow
├── lib/
│   └── db.ts                 # Système de stockage
└── data/                     # Base de données JSON
    ├── workflows.json
    └── executions.json
```

## Technologies Utilisées

- **Next.js 15** : Framework React
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles utilitaires
- **Framer Motion** : Animations fluides
- **Recharts** : Graphiques interactifs
- **Lucide React** : Icônes modernes

## Design Futuriste

Le dashboard utilise un design moderne avec :
- Effets glassmorphism
- Gradients animés
- Grille en arrière-plan
- Orbes lumineux flous
- Animations au survol
- Transitions fluides
- Palette de couleurs néon (violet, cyan, rose)

## Métriques Calculées

### Valeur Nette
```
Valeur Nette = Valeur Générée - (Nombre d'Exécutions × Coût par Exécution)
```

### Taux de Réussite
```
Taux de Réussite = (Exécutions Réussies / Total Exécutions) × 100
```

### ROI (Return on Investment)
```
ROI = ((Valeur Générée - Coût Total) / Coût Total) × 100
```

### Temps Total Économisé
```
Temps Total = Nombre d'Exécutions Réussies × Temps Économisé par Exécution
```

## Stockage des Données

Les données sont stockées dans des fichiers JSON dans le dossier `data/` :
- `workflows.json` : Liste des workflows
- `executions.json` : Historique des exécutions

Pour une version production, il est recommandé de migrer vers une base de données PostgreSQL ou MongoDB.

## Développement

```bash
# Lancer en développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start
```

## Support

Pour toute question ou problème, créez une issue sur le repository GitHub.

## Licence

MIT
