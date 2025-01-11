import { createDeck } from "../core/deck.js"
import { createCollection } from "../core/collection.js"

/**
 * @typedef {Object} PlayerState
 * @property {import('../core/types.js').Collection} hand - Cards in player's hand
 * @property {import('../core/types.js').Collection} captured - Cards captured by player
 */

/**
 * @typedef {Object} GameState
 * @property {import('../core/types.js').Deck} deck - Cards remaining in deck
 * @property {import('../core/types.js').Collection} field - Cards on the field
 * @property {Object.<string, PlayerState>} players - Map of player ID to their state
 * @property {string} currentPlayer - ID of active player
 * @property {number} currentMonth - Current month (1-12)
 * @property {string} [weather] - Current weather condition
 * @property {Array<{name: string, points: number}>} [completedYaku] - Completed yaku this round
 */

/**
 * Create initial game state for a new round
 * @param {string[]} playerIds - Array of player IDs
 * @param {Object} [options] - Game options
 * @param {number} [options.month] - Starting month (1-12)
 * @param {string} [options.weather] - Weather condition
 * @returns {GameState}
 */
export function createGameState(playerIds, options = {}) {
  const { month = 1, weather = null } = options

  // Initialize empty player states
  const players = {}
  for (const id of playerIds) {
    players[id] = {
      hand: createCollection(),
      captured: createCollection(),
    }
  }

  return {
    deck: createDeck(),
    field: createCollection(),
    players,
    currentPlayer: null, // Will be set by determineFirstPlayer
    currentMonth: month,
    weather,
    completedYaku: [],
  }
}
