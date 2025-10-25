import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'database.db')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Initialize database
const db = new Database(DB_PATH)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    clientName TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 1,
    valueGenerated REAL NOT NULL DEFAULT 0,
    costPerExecution REAL NOT NULL DEFAULT 0,
    timeSavedPerExecution INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY,
    workflowId TEXT NOT NULL,
    status TEXT NOT NULL,
    startedAt TEXT NOT NULL,
    finishedAt TEXT,
    duration INTEGER,
    itemsProcessed INTEGER NOT NULL DEFAULT 0,
    errorMessage TEXT,
    metadata TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (workflowId) REFERENCES workflows(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_executions_workflowId ON executions(workflowId);
  CREATE INDEX IF NOT EXISTS idx_executions_startedAt ON executions(startedAt);

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    webhookResponse TEXT,
    error TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    ragWebhookUrl TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  -- Insert default settings if not exists
  INSERT OR IGNORE INTO settings (id, ragWebhookUrl, createdAt, updatedAt)
  VALUES (1, '', datetime('now'), datetime('now'));
`)

export default db
