#!/usr/bin/env tsx

/**
 * Script pour visualiser rapidement les données de la base
 * Usage: npx tsx scripts/view-database.ts
 */

import db from '../lib/database'

console.log('\n🗄️  BASE DE DONNÉES n8n Dashboard\n')
console.log('='.repeat(60))

// Workflows
console.log('\n📊 WORKFLOWS')
console.log('-'.repeat(60))
const workflows = db.prepare('SELECT * FROM workflows').all()
console.table(workflows.map((w: any) => ({
  id: w.id.substring(0, 8) + '...',
  name: w.name,
  client: w.clientName,
  actif: w.isActive ? '✅' : '❌',
  valeur: w.valueGenerated + '€',
})))

// Executions (dernières 10)
console.log('\n⚡ DERNIÈRES EXÉCUTIONS')
console.log('-'.repeat(60))
const executions = db.prepare(`
  SELECT e.*, w.name as workflowName
  FROM executions e
  JOIN workflows w ON e.workflowId = w.id
  ORDER BY e.startedAt DESC
  LIMIT 10
`).all()
console.table(executions.map((e: any) => ({
  workflow: e.workflowName,
  status: e.status === 'success' ? '✅' : e.status === 'error' ? '❌' : '⏳',
  items: e.itemsProcessed,
  date: new Date(e.startedAt).toLocaleString('fr-FR'),
})))

// Messages (derniers 10)
console.log('\n💬 DERNIERS MESSAGES CHAT')
console.log('-'.repeat(60))
const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10').all()
console.table(messages.map((m: any) => ({
  role: m.role === 'user' ? '👤' : '🤖',
  contenu: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
  erreur: m.error ? '❌' : '✅',
  heure: new Date(m.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
})))

// Settings
console.log('\n⚙️  PARAMÈTRES')
console.log('-'.repeat(60))
const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any
console.log(`Webhook RAG: ${settings.ragWebhookUrl || '(non configuré)'}`)
console.log(`Dernière mise à jour: ${new Date(settings.updatedAt).toLocaleString('fr-FR')}`)

// Statistiques globales
console.log('\n📈 STATISTIQUES GLOBALES')
console.log('-'.repeat(60))
const stats = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM workflows WHERE isActive = 1) as workflows_actifs,
    (SELECT COUNT(*) FROM workflows) as workflows_total,
    (SELECT COUNT(*) FROM executions) as executions_total,
    (SELECT COUNT(*) FROM executions WHERE status = 'success') as executions_success,
    (SELECT COUNT(*) FROM executions WHERE status = 'error') as executions_error,
    (SELECT COUNT(*) FROM messages) as messages_total,
    (SELECT SUM(valueGenerated) FROM workflows) as valeur_totale
`).get() as any

console.log(`Workflows actifs: ${stats.workflows_actifs}/${stats.workflows_total}`)
console.log(`Exécutions: ${stats.executions_total} (✅ ${stats.executions_success} / ❌ ${stats.executions_error})`)
console.log(`Messages chat: ${stats.messages_total}`)
console.log(`Valeur totale générée: ${(stats.valeur_totale || 0).toFixed(2)}€`)

const successRate = stats.executions_total > 0
  ? ((stats.executions_success / stats.executions_total) * 100).toFixed(1)
  : 0
console.log(`Taux de réussite: ${successRate}%`)

console.log('\n' + '='.repeat(60) + '\n')
