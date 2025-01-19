import { createDeck } from "../core/deck.ts"
import { createCollection } from "../core/collection.ts"

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
 * @param {string} [options.fromJSON] - JSON string to initialize from
 * @returns {Readonly<GameState>}
 */
export function createGameState(playerIds, options = {}) {
  const { month = 1, weather = null, fromJSON, debug = false } = options

  if (fromJSON) {
    return deserializeState(fromJSON, debug)
  }

  // Initialize empty player states
  const players = {}
  for (const id of playerIds) {
    players[id] = {
      hand: createCollection(),
      captured: createCollection(),
    }
  }

  // Create a mutable container for state that needs to change
  const mutableState = {
    currentMonth: month,
    completedYaku: [],
    currentPlayer: null,
  }

  const state = {
    deck: createDeck(),
    field: createCollection(),
    players,
    get currentMonth() {
      return mutableState.currentMonth
    },
    set currentMonth(newMonth) {
      if (newMonth >= 1 && newMonth <= 12) {
        mutableState.currentMonth = newMonth
      } else {
        throw new Error(`Invalid month: ${newMonth}`)
      }
    },
    weather,
    get completedYaku() {
      return [...mutableState.completedYaku]
    },
    set completedYaku(yaku) {
      mutableState.completedYaku = [...yaku]
    },
    toJSON() {
      return {
        deck: this.deck.toJSON(),
        field: this.field.toJSON(),
        players: Object.fromEntries(
          Object.entries(this.players).map(([id, state]) => [
            id,
            {
              hand: state.hand.toJSON(),
              captured: state.captured.toJSON(),
            },
          ])
        ),
        currentMonth: mutableState.currentMonth,
        weather: this.weather,
        completedYaku: mutableState.completedYaku,
      }
    },
    toString() {
      return `GameState(month: ${mutableState.currentMonth}, player: ${mutableState.currentPlayer})`
    },
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.toString()
    },
  }

  return Object.freeze(state)
}

/**
 * Deserialize a game state from JSON
 * @param {string} json - JSON string to parse
 * @returns {Readonly<GameState>}
 * @throws {Error} If JSON is invalid
 */
function deserializeState(json) {
  const data = JSON.parse(json)

  // Validate required properties
  if (!data.deck || !data.field || !data.players || !data.currentMonth) {
    throw new Error("Invalid state data: missing required properties")
  }

  // Create state with collections
  const state = {
    deck: createDeck({ fromJSON: JSON.stringify(data.deck) }),
    field: createCollection({ fromJSON: JSON.stringify(data.field) }),
    players: {},
    currentMonth: data.currentMonth,
    weather: data.weather,
    completedYaku: data.completedYaku || [],
  }

  // Restore player states
  for (const [playerId, playerData] of Object.entries(data.players)) {
    state.players[playerId] = {
      hand: createCollection({ fromJSON: JSON.stringify(playerData.hand) }),
      captured: createCollection({ fromJSON: JSON.stringify(playerData.captured) }),
    }
  }

  // Add serialization methods
  Object.assign(state, {
    toJSON() {
      return {
        deck: this.deck.toJSON(),
        field: this.field.toJSON(),
        players: Object.fromEntries(
          Object.entries(this.players).map(([id, state]) => [
            id,
            {
              hand: state.hand.toJSON(),
              captured: state.captured.toJSON(),
            },
          ])
        ),
        currentMonth: this.currentMonth,
        weather: this.weather,
        completedYaku: this.completedYaku,
      }
    },
    toString() {
      return `GameState(month: ${this.currentMonth}, player: ${currentPlayer})`
    },
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.toString()
    },
  })

  return Object.freeze(state)
}

/**
 * Validates a game state object
 * @param {GameState} state - State to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateGameState(state) {
  // Check required properties
  if (!state.deck || !state.field || !state.players) {
    throw new Error("Invalid state data: missing required properties")
  }

  // Validate players
  for (const [_, playerState] of Object.entries(state.players)) {
    if (!playerState.hand || !playerState.captured) {
      throw new Error("Invalid state data: missing player hand or captured")
    }
  }

  // Validate current player
  if (state.currentPlayer && !state.players[state.currentPlayer]) {
    throw new Error("Invalid state data: missing current player")
  }

  // Validate card uniqueness
  const allCards = new Set([
    ...state.deck.toJSON(),
    ...state.field.toJSON(),
    ...Object.values(state.players).flatMap((p) => [...p.hand.toJSON(), ...p.captured.toJSON()]),
  ])

  // Total cards should be 48
  if (allCards.size !== 48) {
    throw new Error("Invalid state data: total cards should be 48")
  }

  return true
}
