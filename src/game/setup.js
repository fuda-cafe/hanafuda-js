import { getCard } from "../core/cards.js"
import { checkHandYaku } from "../scoring/rules/hand.js"
import { createGameState } from "./state.js"

/**
 * Determine first player using traditional rules
 * @param {import('./state.js').GameState} state
 * @returns {string} ID of first player
 */
export function determineFirstPlayer(state) {
  // In traditional rules, each player draws a card
  // Player with earliest month goes first
  const draws = {}

  for (const playerId of Object.keys(state.players)) {
    const cardIndex = state.deck.draw()
    const card = getCard(cardIndex)
    draws[playerId] = card.month

    // Return card to deck
    state.deck.placeOnBottom(cardIndex)
  }

  // Find player with earliest month
  return Object.entries(draws).sort(([, monthA], [, monthB]) => monthA - monthB)[0][0]
}

/**
 * Deal initial cards to players and field
 * @param {import('./state.js').GameState} state
 * @returns {import('./state.js').GameState}
 */
export function dealInitialCards(state) {
  // Deal 8 cards to each player
  for (const playerId of Object.keys(state.players)) {
    const hand = state.deck.drawMany(8)
    state.players[playerId].hand.addMany(hand)
  }

  // Deal 8 cards to field
  const fieldCards = state.deck.drawMany(8)
  state.field.addMany(fieldCards)

  return state
}

/**
 * Check for teyaku (hand yaku) for all players
 * @param {import('./state.js').GameState} state
 * @returns {Object.<string, Array<{name: string, points: number}>>} Map of player ID to their teyaku
 */
export function checkInitialTeyaku(state) {
  const results = {}

  for (const [playerId, playerState] of Object.entries(state.players)) {
    const teyaku = checkHandYaku(playerState.hand, { checkTeyaku: true })
    if (teyaku.length > 0) {
      results[playerId] = teyaku
    }
  }

  return results
}

/**
 * Initialize a new round
 * @param {string[]} playerIds
 * @param {Object} [options]
 * @returns {{ state: import('./state.js').GameState, teyaku: Object.<string, Array> }}
 */
export function initializeRound(playerIds, options = {}) {
  // Create initial state
  let state = createGameState(playerIds, options)

  // Determine first player
  state.currentPlayer = determineFirstPlayer(state)

  // Deal cards
  state = dealInitialCards(state)

  // Check for teyaku
  const teyaku = checkInitialTeyaku(state)

  return { state, teyaku }
}
