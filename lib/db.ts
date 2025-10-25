import fs from 'fs/promises'
import path from 'path'

const DB_DIR = path.join(process.cwd(), 'data')
const WORKFLOWS_FILE = path.join(DB_DIR, 'workflows.json')
const EXECUTIONS_FILE = path.join(DB_DIR, 'executions.json')
const MESSAGES_FILE = path.join(DB_DIR, 'messages.json')
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json')

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

// Initialiser la base de données
async function ensureDbExists() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true })

    try {
      await fs.access(WORKFLOWS_FILE)
    } catch {
      await fs.writeFile(WORKFLOWS_FILE, JSON.stringify([]))
    }

    try {
      await fs.access(EXECUTIONS_FILE)
    } catch {
      await fs.writeFile(EXECUTIONS_FILE, JSON.stringify([]))
    }

    try {
      await fs.access(MESSAGES_FILE)
    } catch {
      await fs.writeFile(MESSAGES_FILE, JSON.stringify([]))
    }

    try {
      await fs.access(SETTINGS_FILE)
    } catch {
      const defaultSettings: WebhookSettings = {
        ragWebhookUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2))
    }
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Workflows
export async function getWorkflows(): Promise<Workflow[]> {
  await ensureDbExists()
  const data = await fs.readFile(WORKFLOWS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const workflows = await getWorkflows()
  return workflows.find(w => w.id === id) || null
}

export async function createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
  const workflows = await getWorkflows()
  const newWorkflow: Workflow = {
    ...workflow,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  workflows.push(newWorkflow)
  await fs.writeFile(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2))
  return newWorkflow
}

export async function updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow | null> {
  const workflows = await getWorkflows()
  const index = workflows.findIndex(w => w.id === id)
  if (index === -1) return null

  workflows[index] = {
    ...workflows[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2))
  return workflows[index]
}

// Executions
export async function getExecutions(): Promise<Execution[]> {
  await ensureDbExists()
  const data = await fs.readFile(EXECUTIONS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getExecutionsByWorkflow(workflowId: string): Promise<Execution[]> {
  const executions = await getExecutions()
  return executions.filter(e => e.workflowId === workflowId)
}

export async function createExecution(execution: Omit<Execution, 'id' | 'createdAt'>): Promise<Execution> {
  const executions = await getExecutions()
  const newExecution: Execution = {
    ...execution,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  executions.push(newExecution)
  await fs.writeFile(EXECUTIONS_FILE, JSON.stringify(executions, null, 2))
  return newExecution
}

export async function updateExecution(id: string, data: Partial<Execution>): Promise<Execution | null> {
  const executions = await getExecutions()
  const index = executions.findIndex(e => e.id === id)
  if (index === -1) return null

  executions[index] = {
    ...executions[index],
    ...data,
  }
  await fs.writeFile(EXECUTIONS_FILE, JSON.stringify(executions, null, 2))
  return executions[index]
}

// Statistiques
export async function getWeeklyStats(workflowId: string) {
  const executions = await getExecutionsByWorkflow(workflowId)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const weeklyExecutions = executions.filter(e =>
    new Date(e.startedAt) >= weekAgo
  )

  return {
    totalExecutions: weeklyExecutions.length,
    successfulExecutions: weeklyExecutions.filter(e => e.status === 'success').length,
    failedExecutions: weeklyExecutions.filter(e => e.status === 'error').length,
    averageDuration: weeklyExecutions.reduce((acc, e) => acc + (e.duration || 0), 0) / weeklyExecutions.length || 0,
  }
}

// Messages (RAG Chat)
export async function getMessages(): Promise<Message[]> {
  await ensureDbExists()
  const data = await fs.readFile(MESSAGES_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function createMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const messages = await getMessages()
  const newMessage: Message = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }
  messages.push(newMessage)
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  return newMessage
}

export async function clearMessages(): Promise<void> {
  await ensureDbExists()
  await fs.writeFile(MESSAGES_FILE, JSON.stringify([]))
}

// Settings
export async function getSettings(): Promise<WebhookSettings> {
  await ensureDbExists()
  const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function updateSettings(settings: Partial<WebhookSettings>): Promise<WebhookSettings> {
  const currentSettings = await getSettings()
  const updatedSettings: WebhookSettings = {
    ...currentSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2))
  return updatedSettings
}
