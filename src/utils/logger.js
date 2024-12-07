/**
 * @typedef {'NONE'|'ERROR'|'WARN'|'INFO'|'DEBUG'} LogLevelName
 */

/**
 * @typedef {Object} LogEntry
 * @property {Date} timestamp When the log was created
 * @property {LogLevelName} level Log level
 * @property {string} message Log message
 * @property {*} [data] Optional data payload
 */

/**
 * @typedef {Object} Logger
 * @property {(message: string, data?: any) => void} debug Log debug message
 * @property {(message: string, data?: any) => void} info Log info message
 * @property {(message: string, data?: any) => void} warn Log warning message
 * @property {(message: string, data?: any) => void} error Log error message
 * @property {() => LogEntry[]} getHistory Get log history
 * @property {() => void} clear Clear log history
 *
 * @example
 * // Using logger methods
 * logger.debug('Processing cards', { count: 5 })
 * logger.info('Game started')
 * logger.warn('Invalid move attempted')
 * logger.error('Game error', new Error('Invalid state'))
 *
 * // Get log history
 * const history = logger.getHistory()
 * console.log(history) // Array of LogEntry objects
 *
 * // Clear history
 * logger.clear()
 */

/**
 * Log levels in order of severity (lowest to highest)
 * @type {Object<LogLevelName, number>}
 *
 * @example
 * import { LogLevel } from './utils/logger.js'
 *
 * // Use numeric values
 * if (currentLevel >= LogLevel.WARN) {
 *   // Handle warning level or higher
 * }
 *
 * // Use as configuration
 * const logger = createLogger({ level: LogLevel.DEBUG })
 */
export const LogLevel = Object.freeze({
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
})

/**
 * Create a new log entry
 * @param {LogLevelName} level
 * @param {string} message
 * @param {*} [data]
 * @returns {LogEntry}
 *
 * @example
 * const entry = createLogEntry('INFO', 'Game started', { players: 2 })
 * // {
 * //   timestamp: Date,
 * //   level: 'INFO',
 * //   message: 'Game started',
 * //   data: { players: 2 }
 * // }
 */
const createLogEntry = (level, message, data = null) => ({
  timestamp: new Date(),
  level,
  message,
  data,
})

/**
 * Create a logger function for a specific level
 * @param {LogLevelName} level Level to log at
 * @param {number} configuredLevel Maximum level to log
 * @param {(entry: LogEntry) => void} addToHistory History callback
 * @returns {(message: string, data?: any) => void}
 *
 * @example
 * const debugLogger = createLoggerForLevel('DEBUG', LogLevel.DEBUG, addToHistory)
 * debugLogger('Processing move', { player: 1, card: 5 })
 * // Outputs: [DEBUG] Processing move { player: 1, card: 5 }
 */
const createLoggerForLevel = (level, configuredLevel, addToHistory) => {
  const levelValue = LogLevel[level]
  const consoleFn = console[level.toLowerCase()]

  return (message, data = null) => {
    // Create entry first to ensure accurate timestamp
    const entry = createLogEntry(level, message, data)
    addToHistory(entry)

    // Only output if level is enabled
    if (levelValue <= configuredLevel) {
      consoleFn(message, data || "")
    }
  }
}

/**
 * Create a new logger instance
 * @param {Object} [options]
 * @param {LogLevelName|number} [options.level='ERROR'] Maximum log level
 * @param {boolean} [options.keepHistory=true] Whether to keep log history
 * @returns {Logger}
 *
 * @example
 * // Create logger with custom options
 * const logger = createLogger({
 *   level: 'DEBUG',  // or LogLevel.DEBUG
 *   keepHistory: true
 * })
 *
 * // Use pre-configured loggers
 * import { defaultLogger, devLogger } from './utils/logger.js'
 *
 * // Production code (only errors)
 * defaultLogger.error('Critical error')
 *
 * // Development code (all levels)
 * devLogger.debug('Debug info')
 */
export const createLogger = (options = {}) => {
  const { level = LogLevel.ERROR, keepHistory = true } = options

  // Convert level name to number if needed
  const configuredLevel = typeof level === "string" ? LogLevel[level] : level

  /** @type {LogEntry[]} */
  let history = []

  /**
   * Add entry to history if enabled
   * @param {LogEntry} entry
   */
  const addToHistory = (entry) => {
    if (keepHistory && configuredLevel > LogLevel.NONE) {
      history.push(entry)
    }
  }

  return {
    debug: createLoggerForLevel("DEBUG", configuredLevel, addToHistory),
    info: createLoggerForLevel("INFO", configuredLevel, addToHistory),
    warn: createLoggerForLevel("WARN", configuredLevel, addToHistory),
    error: createLoggerForLevel("ERROR", configuredLevel, addToHistory),
    getHistory: () => [...history],
    clear: () => {
      history = []
    },
  }
}

// Default logger instance (ERROR level only)
export const defaultLogger = createLogger()

// Development logger instance (DEBUG level with history)
export const devLogger = createLogger({ level: LogLevel.DEBUG })
