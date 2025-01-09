import { createCollection } from "../core/collection.js"
import { createGameState } from "./state.js"

/**
 * @typedef {import('./state.js').GameState} GameState
 */

/**
 * @typedef {Object} SerializedPlayerState
 * @property {number[]} hand - Array of card indices in player's hand
 * @property {number[]} captured - Array of card indices captured by player
 */

/**
 * @typedef {Object} SerializedGameState
 * @property {number[]} deck - Array of card indices in deck
 * @property {number[]} field - Array of card indices on field
 * @property {Object.<string, SerializedPlayerState>} players - Map of player ID to their serialized state
 * @property {string} currentPlayer - ID of active player
 * @property {number} currentMonth - Current month (1-12)
 * @property {string} [weather] - Current weather condition
 * @property {Array<{name: string, points: number}>} [completedYaku] - Completed yaku this round
 */

/**
 * Convert a Collection to an array of card indices
 * @param {import('../core/collection.js').Collection} collection
 * @returns {number[]}
 */
function serializeCollection(collection) {
  return Array.from(collection)
}

/**
 * Serialize game state for storage
 * @param {GameState} state
 * @returns {SerializedGameState}
 */
export function serializeGameState(state) {
  // Serialize player states
  const serializedPlayers = {}
  for (const [playerId, playerState] of Object.entries(state.players)) {
    serializedPlayers[playerId] = {
      hand: serializeCollection(playerState.hand),
      captured: serializeCollection(playerState.captured),
    }
  }

  return {
    deck: [...state.deck], // Create a copy of the deck array
    field: serializeCollection(state.field),
    players: serializedPlayers,
    currentPlayer: state.currentPlayer,
    currentMonth: state.currentMonth,
    weather: state.weather,
    completedYaku: state.completedYaku ? [...state.completedYaku] : [],
  }
}

/**
 * Deserialize game state from storage
 * @param {SerializedGameState} serialized
 * @returns {GameState}
 */
export function deserializeGameState(serialized) {
  // Create base state with empty collections
  const playerIds = Object.keys(serialized.players)
  const state = createGameState(playerIds, {
    month: serialized.currentMonth,
    weather: serialized.weather,
  })

  // Restore deck
  state.deck = [...serialized.deck]

  // Restore field
  state.field = createCollection({ cards: serialized.field })

  // Restore player states
  for (const [playerId, playerState] of Object.entries(serialized.players)) {
    state.players[playerId].hand = createCollection({ cards: playerState.hand })
    state.players[playerId].captured = createCollection({ cards: playerState.captured })
  }

  // Restore other state
  state.currentPlayer = serialized.currentPlayer
  state.completedYaku = serialized.completedYaku ? [...serialized.completedYaku] : []

  return state
}

/**
 * Validate a serialized game state
 * @param {SerializedGameState} serialized
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateSerializedState(serialized) {
  try {
    // Check required properties
    if (!serialized.deck || !Array.isArray(serialized.deck)) {
      return "Invalid deck"
    }
    if (!serialized.field || !Array.isArray(serialized.field)) {
      return "Invalid field"
    }
    if (!serialized.players || typeof serialized.players !== "object") {
      return "Invalid players"
    }
    if (!serialized.currentMonth || !Number.isInteger(serialized.currentMonth)) {
      return "Invalid month"
    }

    // Check card indices
    const allCards = [
      ...serialized.deck,
      ...serialized.field,
      ...Object.values(serialized.players).flatMap((p) => [...p.hand, ...p.captured]),
    ]

    // Check for valid card indices (0-47)
    if (!allCards.every((card) => Number.isInteger(card) && card >= 0 && card < 48)) {
      return "Invalid card indices"
    }

    // Check for duplicates
    if (new Set(allCards).size !== allCards.length) {
      return "Duplicate cards found"
    }

    // Check player states
    for (const [playerId, playerState] of Object.entries(serialized.players)) {
      if (!Array.isArray(playerState.hand) || !Array.isArray(playerState.captured)) {
        return `Invalid state for player ${playerId}`
      }
    }

    return null
  } catch (error) {
    return `Validation error: ${error.message}`
  }
}
