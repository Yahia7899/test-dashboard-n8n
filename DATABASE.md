# Base de données SQLite

## 📊 Vue d'ensemble

Le dashboard utilise **SQLite** avec la bibliothèque `better-sqlite3` pour le stockage des données.

**Fichier de base de données** : `data/database.db`

## 🏗️ Structure

### Tables

#### `workflows`
Stocke les workflows n8n connectés au dashboard.

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | UUID unique |
| name | TEXT | Nom du workflow |
| description | TEXT | Description (optionnel) |
| clientName | TEXT | Nom du client |
| createdAt | TEXT | Date de création (ISO 8601) |
| updatedAt | TEXT | Date de mise à jour (ISO 8601) |
| isActive | INTEGER | Actif (1) ou inactif (0) |
| valueGenerated | REAL | Valeur totale générée (€) |
| costPerExecution | REAL | Coût par exécution (€) |
| timeSavedPerExecution | INTEGER | Temps économisé par exécution (min) |

#### `executions`
Historique des exécutions de workflows.

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | UUID unique |
| workflowId | TEXT | Foreign key vers workflows |
| status | TEXT | success, error, running |
| startedAt | TEXT | Date de début (ISO 8601) |
| finishedAt | TEXT | Date de fin (ISO 8601, optionnel) |
| duration | INTEGER | Durée en millisecondes (optionnel) |
| itemsProcessed | INTEGER | Nombre d'items traités |
| errorMessage | TEXT | Message d'erreur (optionnel) |
| metadata | TEXT | Données JSON custom (optionnel) |
| createdAt | TEXT | Date de création (ISO 8601) |

**Index** : `workflowId`, `startedAt`

#### `messages`
Historique du chat RAG.

| Colonne | Type | Description |
|---------|------|-------------|
| id | TEXT | UUID unique |
| role | TEXT | user ou assistant |
| content | TEXT | Contenu du message |
| timestamp | TEXT | Date/heure (ISO 8601) |
| webhookResponse | TEXT | Réponse JSON du webhook (optionnel) |
| error | TEXT | Message d'erreur (optionnel) |

**Index** : `timestamp`

#### `settings`
Configuration globale du dashboard.

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | Toujours 1 (singleton) |
| ragWebhookUrl | TEXT | URL du webhook RAG |
| createdAt | TEXT | Date de création (ISO 8601) |
| updatedAt | TEXT | Date de mise à jour (ISO 8601) |

## 🔄 Migration depuis JSON

Si vous aviez des données dans les anciens fichiers JSON, utilisez le script de migration :

```bash
npx tsx scripts/migrate-json-to-sqlite.ts
```

**Ce script :**
- Lit les fichiers JSON existants (`data/*.json`)
- Importe les données dans SQLite
- Gère les doublons automatiquement
- Ne supprime pas les fichiers JSON (à faire manuellement)

## 🛠️ Accès à la base de données

### Via le code

```typescript
import { getWorkflows, createWorkflow } from '@/lib/db'

// Lire
const workflows = getWorkflows()

// Créer
const newWorkflow = createWorkflow({
  name: 'Mon workflow',
  clientName: 'Client ABC',
  isActive: true,
  valueGenerated: 0,
  costPerExecution: 0.05,
  timeSavedPerExecution: 15,
})
```

### Via CLI (développement)

Installez `sqlite3` :

```bash
npm install -g sqlite3
```

Puis :

```bash
sqlite3 data/database.db
```

**Exemples de requêtes :**

```sql
-- Voir tous les workflows
SELECT * FROM workflows;

-- Compter les exécutions par workflow
SELECT w.name, COUNT(e.id) as total
FROM workflows w
LEFT JOIN executions e ON w.id = e.workflowId
GROUP BY w.id;

-- Messages du chat
SELECT role, content, timestamp FROM messages ORDER BY timestamp DESC LIMIT 10;

-- Statistiques
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successes,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
FROM executions;
```

## 🔐 Sécurité

- ✅ Requêtes préparées (protection SQL injection)
- ✅ Foreign keys activées
- ✅ Types strictement définis
- ✅ Validation des données

## 📝 Sauvegarde

### Sauvegarde manuelle

```bash
cp data/database.db data/database.backup.db
```

### Sauvegarde automatique (recommandé pour production)

Ajoutez à votre `package.json` :

```json
{
  "scripts": {
    "backup": "cp data/database.db data/database.$(date +%Y%m%d_%H%M%S).db"
  }
}
```

Puis utilisez cron ou un scheduler :

```bash
npm run backup
```

## 🚀 Performance

**Optimisations appliquées :**
- Index sur les colonnes fréquemment recherchées
- Requêtes préparées réutilisables
- Transactions pour les opérations multiples
- SQLite en mode synchrone pour la simplicité

**Limites recommandées :**
- < 100 000 workflows : Excellent
- < 1 000 000 exécutions : Très bon
- < 10 000 000 messages : Bon

Au-delà, envisagez PostgreSQL.

## 🔧 Maintenance

### Nettoyer les anciennes exécutions

```sql
-- Supprimer les exécutions de plus de 6 mois
DELETE FROM executions
WHERE startedAt < datetime('now', '-6 months');
```

### Optimiser la base

```sql
VACUUM;
ANALYZE;
```

### Vérifier l'intégrité

```sql
PRAGMA integrity_check;
```

## ⚠️ Remarques importantes

1. **Thread-safety** : SQLite est en mode WAL par défaut (Write-Ahead Logging)
2. **Concurrence** : Un seul writer à la fois, lectures multiples OK
3. **Fichier unique** : Facile à sauvegarder et déplacer
4. **Pas de serveur** : Pas de configuration réseau nécessaire

## 📚 En savoir plus

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Schéma Prisma](./prisma/schema.prisma) - Référence pour une future migration vers PostgreSQL
