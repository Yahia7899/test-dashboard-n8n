/**
 * Script de migration des données JSON vers SQLite
 *
 * Ce script migre les données des fichiers JSON existants vers la nouvelle base SQLite
 *
 * Usage: npx tsx scripts/migrate-json-to-sqlite.ts
 */

import fs from 'fs'
import path from 'path'
import db from '../lib/database'

const DATA_DIR = path.join(process.cwd(), 'data')
const WORKFLOWS_FILE = path.join(DATA_DIR, 'workflows.json')
const EXECUTIONS_FILE = path.join(DATA_DIR, 'executions.json')
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

async function migrateWorkflows() {
  try {
    if (!fs.existsSync(WORKFLOWS_FILE)) {
      console.log('⏭️  Aucun fichier workflows.json trouvé, passage...')
      return
    }

    const data = JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf-8'))
    if (!Array.isArray(data) || data.length === 0) {
      console.log('⏭️  Aucun workflow à migrer')
      return
    }

    const stmt = db.prepare(`
      INSERT INTO workflows (id, name, description, clientName, createdAt, updatedAt, isActive, valueGenerated, costPerExecution, timeSavedPerExecution)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    for (const workflow of data) {
      try {
        stmt.run(
          workflow.id,
          workflow.name,
          workflow.description || null,
          workflow.clientName,
          workflow.createdAt,
          workflow.updatedAt,
          workflow.isActive ? 1 : 0,
          workflow.valueGenerated || 0,
          workflow.costPerExecution || 0,
          workflow.timeSavedPerExecution || 0
        )
        count++
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`   ℹ️  Workflow "${workflow.name}" existe déjà, passage...`)
        } else {
          throw error
        }
      }
    }

    console.log(`✅ ${count} workflows migrés`)
  } catch (error) {
    console.error('❌ Erreur lors de la migration des workflows:', error)
  }
}

async function migrateExecutions() {
  try {
    if (!fs.existsSync(EXECUTIONS_FILE)) {
      console.log('⏭️  Aucun fichier executions.json trouvé, passage...')
      return
    }

    const data = JSON.parse(fs.readFileSync(EXECUTIONS_FILE, 'utf-8'))
    if (!Array.isArray(data) || data.length === 0) {
      console.log('⏭️  Aucune exécution à migrer')
      return
    }

    const stmt = db.prepare(`
      INSERT INTO executions (id, workflowId, status, startedAt, finishedAt, duration, itemsProcessed, errorMessage, metadata, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    for (const execution of data) {
      try {
        stmt.run(
          execution.id,
          execution.workflowId,
          execution.status,
          execution.startedAt,
          execution.finishedAt || null,
          execution.duration || null,
          execution.itemsProcessed || 0,
          execution.errorMessage || null,
          execution.metadata ? JSON.stringify(execution.metadata) : null,
          execution.createdAt
        )
        count++
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`   ℹ️  Exécution ${execution.id} existe déjà, passage...`)
        } else {
          throw error
        }
      }
    }

    console.log(`✅ ${count} exécutions migrées`)
  } catch (error) {
    console.error('❌ Erreur lors de la migration des exécutions:', error)
  }
}

async function migrateMessages() {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) {
      console.log('⏭️  Aucun fichier messages.json trouvé, passage...')
      return
    }

    const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'))
    if (!Array.isArray(data) || data.length === 0) {
      console.log('⏭️  Aucun message à migrer')
      return
    }

    const stmt = db.prepare(`
      INSERT INTO messages (id, role, content, timestamp, webhookResponse, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    let count = 0
    for (const message of data) {
      try {
        stmt.run(
          message.id,
          message.role,
          message.content,
          message.timestamp,
          message.webhookResponse ? JSON.stringify(message.webhookResponse) : null,
          message.error || null
        )
        count++
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`   ℹ️  Message ${message.id} existe déjà, passage...`)
        } else {
          throw error
        }
      }
    }

    console.log(`✅ ${count} messages migrés`)
  } catch (error) {
    console.error('❌ Erreur lors de la migration des messages:', error)
  }
}

async function migrateSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      console.log('⏭️  Aucun fichier settings.json trouvé, passage...')
      return
    }

    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))

    const stmt = db.prepare(`
      UPDATE settings
      SET ragWebhookUrl = ?, updatedAt = ?
      WHERE id = 1
    `)

    stmt.run(data.ragWebhookUrl || '', data.updatedAt || new Date().toISOString())

    console.log(`✅ Paramètres migrés`)
  } catch (error) {
    console.error('❌ Erreur lors de la migration des paramètres:', error)
  }
}

async function main() {
  console.log('\n🚀 Début de la migration JSON → SQLite\n')

  await migrateWorkflows()
  await migrateExecutions()
  await migrateMessages()
  await migrateSettings()

  console.log('\n✨ Migration terminée !\n')
}

main().catch(console.error)
