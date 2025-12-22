import type { LogEntry } from '@/types'

const STORAGE_KEY = 'tshopper_action_logs'
const MAX_LOG_ENTRIES = 100

/**
 * Retrieves all log entries from LocalStorage
 */
export function getLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as LogEntry[]
    // Convert timestamp strings back to Date objects
    return parsed.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }))
  } catch (error) {
    console.error('Error reading logs from LocalStorage:', error)
    return []
  }
}

/**
 * Saves log entries to LocalStorage
 */
function saveLogs(logs: LogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  } catch (error) {
    console.error('Error saving logs to LocalStorage:', error)
  }
}

/**
 * Adds a new log entry to LocalStorage
 */
export function addLog(
  action: LogEntry['action'],
  details: LogEntry['details'],
  status: LogEntry['status'] = 'info',
  metadata?: LogEntry['metadata'],
): void {
  const logs = getLogs()

  const newEntry: LogEntry = {
    timestamp: new Date(),
    action,
    details,
    status,
    metadata,
  }

  // Add new entry at the beginning (most recent first)
  logs.unshift(newEntry)

  // Keep only the most recent entries
  const trimmedLogs = logs.slice(0, MAX_LOG_ENTRIES)

  saveLogs(trimmedLogs)
}

/**
 * Clears all log entries from LocalStorage
 */
export function clearLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing logs from LocalStorage:', error)
  }
}

/**
 * Gets the total count of log entries
 */
export function getLogCount(): number {
  return getLogs().length
}

/**
 * Filters logs by action type
 */
export function filterLogsByAction(action: LogEntry['action']): LogEntry[] {
  return getLogs().filter((log) => log.action === action)
}

/**
 * Filters logs by status
 */
export function filterLogsByStatus(status: LogEntry['status']): LogEntry[] {
  return getLogs().filter((log) => log.status === status)
}

/**
 * Searches logs by details text
 */
export function searchLogs(query: string): LogEntry[] {
  const lowerQuery = query.toLowerCase()
  return getLogs().filter(
    (log) =>
      log.details.toLowerCase().includes(lowerQuery) ||
      log.action.toLowerCase().includes(lowerQuery),
  )
}
