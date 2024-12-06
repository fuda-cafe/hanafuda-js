export const LogLevel = Object.freeze({
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
})

export class GameLogger {
  #level
  #history
  #enabled

  constructor(level = LogLevel.NONE) {
    this.#level = level
    this.#history = []
    this.#enabled = level > LogLevel.NONE
  }

  debug(message, data = null) {
    if (this.#level >= LogLevel.DEBUG) {
      console.debug(message, data || "")
    }
    this.#addToHistory("DEBUG", message, data)
  }

  info(message, data = null) {
    if (this.#level >= LogLevel.INFO) {
      console.info(message, data || "")
    }
    this.#addToHistory("INFO", message, data)
  }

  warn(message, data = null) {
    if (this.#level >= LogLevel.WARN) {
      console.warn(message, data || "")
    }
    this.#addToHistory("WARN", message, data)
  }

  error(message, data = null) {
    if (this.#level >= LogLevel.ERROR) {
      console.error(message, data || "")
    }
    this.#addToHistory("ERROR", message, data)
  }

  #addToHistory(level, message, data) {
    if (!this.#enabled) return

    this.#history.push({
      timestamp: new Date(),
      level,
      message,
      data,
    })
  }

  getHistory() {
    return [...this.#history]
  }

  clear() {
    this.#history = []
  }
}
