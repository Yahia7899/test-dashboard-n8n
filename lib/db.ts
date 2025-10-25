import db from './database'
import { randomUUID } from 'crypto'

export interface Workflow {
  id: string
  name: string
  description?: string
  clientName: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  valueGenerated: number
  costPerExecution: number
  timeSavedPerExecution: number
}

export interface Execution {
  id: string
  workflowId: string
  status: 'success' | 'error' | 'running'
  startedAt: string
  finishedAt?: string
  duration?: number
  itemsProcessed: number
  errorMessage?: string
  metadata?: any
  createdAt: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  webhookResponse?: any
  error?: string
}

export interface WebhookSettings {
  ragWebhookUrl: string
  createdAt: string
  updatedAt: string
}

// Workflows
export function getWorkflows(): Workflow[] {
  const stmt = db.prepare('SELECT * FROM workflows ORDER BY createdAt DESC')
  const rows = stmt.all() as any[]
  return rows.map(row => ({
    ...row,
    isActive: Boolean(row.isActive),
    description: row.description || undefined,
  }))
}

export function getWorkflow(id: string): Workflow | null {
  const stmt = db.prepare('SELECT * FROM workflows WHERE id = ?')
  const row = stmt.get(id) as any
  if (!row) return null
  return {
    ...row,
    isActive: Boolean(row.isActive),
    description: row.description || undefined,
  }
}

export function createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
  const id = randomUUID()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO workflows (id, name, description, clientName, createdAt, updatedAt, isActive, valueGenerated, costPerExecution, timeSavedPerExecution)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    workflow.name,
    workflow.description || null,
    workflow.clientName,
    now,
    now,
    workflow.isActive ? 1 : 0,
    workflow.valueGenerated,
    workflow.costPerExecution,
    workflow.timeSavedPerExecution
  )

  return getWorkflow(id)!
}

export function updateWorkflow(id: string, data: Partial<Workflow>): Workflow | null {
  const now = new Date().toISOString()

  const updates: string[] = []
  const values: any[] = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description || null)
  }
  if (data.clientName !== undefined) {
    updates.push('clientName = ?')
    values.push(data.clientName)
  }
  if (data.isActive !== undefined) {
    updates.push('isActive = ?')
    values.push(data.isActive ? 1 : 0)
  }
  if (data.valueGenerated !== undefined) {
    updates.push('valueGenerated = ?')
    values.push(data.valueGenerated)
  }
  if (data.costPerExecution !== undefined) {
    updates.push('costPerExecution = ?')
    values.push(data.costPerExecution)
  }
  if (data.timeSavedPerExecution !== undefined) {
    updates.push('timeSavedPerExecution = ?')
    values.push(data.timeSavedPerExecution)
  }

  updates.push('updatedAt = ?')
  values.push(now)
  values.push(id)

  const stmt = db.prepare(`UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getWorkflow(id)
}

// Executions
export function getExecutions(): Execution[] {
  const stmt = db.prepare('SELECT * FROM executions ORDER BY startedAt DESC')
  const rows = stmt.all() as any[]
  return rows.map(row => ({
    ...row,
    finishedAt: row.finishedAt || undefined,
    duration: row.duration || undefined,
    errorMessage: row.errorMessage || undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }))
}

export function getExecutionsByWorkflow(workflowId: string): Execution[] {
  const stmt = db.prepare('SELECT * FROM executions WHERE workflowId = ? ORDER BY startedAt DESC')
  const rows = stmt.all(workflowId) as any[]
  return rows.map(row => ({
    ...row,
    finishedAt: row.finishedAt || undefined,
    duration: row.duration || undefined,
    errorMessage: row.errorMessage || undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }))
}

export function createExecution(execution: Omit<Execution, 'id' | 'createdAt'>): Execution {
  const id = randomUUID()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO executions (id, workflowId, status, startedAt, finishedAt, duration, itemsProcessed, errorMessage, metadata, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    execution.workflowId,
    execution.status,
    execution.startedAt,
    execution.finishedAt || null,
    execution.duration || null,
    execution.itemsProcessed,
    execution.errorMessage || null,
    execution.metadata ? JSON.stringify(execution.metadata) : null,
    now
  )

  const getStmt = db.prepare('SELECT * FROM executions WHERE id = ?')
  const row = getStmt.get(id) as any
  return {
    ...row,
    finishedAt: row.finishedAt || undefined,
    duration: row.duration || undefined,
    errorMessage: row.errorMessage || undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }
}

export function updateExecution(id: string, data: Partial<Execution>): Execution | null {
  const updates: string[] = []
  const values: any[] = []

  if (data.status !== undefined) {
    updates.push('status = ?')
    values.push(data.status)
  }
  if (data.finishedAt !== undefined) {
    updates.push('finishedAt = ?')
    values.push(data.finishedAt || null)
  }
  if (data.duration !== undefined) {
    updates.push('duration = ?')
    values.push(data.duration || null)
  }
  if (data.itemsProcessed !== undefined) {
    updates.push('itemsProcessed = ?')
    values.push(data.itemsProcessed)
  }
  if (data.errorMessage !== undefined) {
    updates.push('errorMessage = ?')
    values.push(data.errorMessage || null)
  }
  if (data.metadata !== undefined) {
    updates.push('metadata = ?')
    values.push(data.metadata ? JSON.stringify(data.metadata) : null)
  }

  values.push(id)

  const stmt = db.prepare(`UPDATE executions SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  const getStmt = db.prepare('SELECT * FROM executions WHERE id = ?')
  const row = getStmt.get(id) as any
  if (!row) return null
  return {
    ...row,
    finishedAt: row.finishedAt || undefined,
    duration: row.duration || undefined,
    errorMessage: row.errorMessage || undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }
}

// Statistiques
export function getWeeklyStats(workflowId: string) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoISO = weekAgo.toISOString()

  const stmt = db.prepare(`
    SELECT
      COUNT(*) as totalExecutions,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successfulExecutions,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failedExecutions,
      AVG(CASE WHEN duration IS NOT NULL THEN duration ELSE 0 END) as averageDuration
    FROM executions
    WHERE workflowId = ? AND startedAt >= ?
  `)

  const result = stmt.get(workflowId, weekAgoISO) as any

  return {
    totalExecutions: result.totalExecutions || 0,
    successfulExecutions: result.successfulExecutions || 0,
    failedExecutions: result.failedExecutions || 0,
    averageDuration: result.averageDuration || 0,
  }
}

// Messages (RAG Chat)
export function getMessages(): Message[] {
  const stmt = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC')
  const rows = stmt.all() as any[]
  return rows.map(row => ({
    ...row,
    webhookResponse: row.webhookResponse ? JSON.parse(row.webhookResponse) : undefined,
    error: row.error || undefined,
  }))
}

export function createMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
  const id = randomUUID()
  const timestamp = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO messages (id, role, content, timestamp, webhookResponse, error)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    message.role,
    message.content,
    timestamp,
    message.webhookResponse ? JSON.stringify(message.webhookResponse) : null,
    message.error || null
  )

  const getStmt = db.prepare('SELECT * FROM messages WHERE id = ?')
  const row = getStmt.get(id) as any
  return {
    ...row,
    webhookResponse: row.webhookResponse ? JSON.parse(row.webhookResponse) : undefined,
    error: row.error || undefined,
  }
}

export function clearMessages(): void {
  const stmt = db.prepare('DELETE FROM messages')
  stmt.run()
}

// Settings
export function getSettings(): WebhookSettings {
  const stmt = db.prepare('SELECT * FROM settings WHERE id = 1')
  const row = stmt.get() as any
  return {
    ragWebhookUrl: row.ragWebhookUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function updateSettings(settings: Partial<WebhookSettings>): WebhookSettings {
  const now = new Date().toISOString()

  const updates: string[] = []
  const values: any[] = []

  if (settings.ragWebhookUrl !== undefined) {
    updates.push('ragWebhookUrl = ?')
    values.push(settings.ragWebhookUrl)
  }

  updates.push('updatedAt = ?')
  values.push(now)
  values.push(1)

  const stmt = db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)

  return getSettings()
}
