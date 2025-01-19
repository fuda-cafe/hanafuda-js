import { initializeRound } from "./setup.js"
import { isMatch } from "../core/matching.js"
import { createScoringManager, KOIKOI_RULES } from "../scoring/manager.js"
import { validateGameState } from "./state.js"
import { isNullish } from "../utils/is-nullish.js"

/**
 * @typedef {'WAITING_FOR_HAND_CARD'|'WAITING_FOR_FIELD_CARDS'|'WAITING_FOR_DECK_MATCH'|'WAITING_FOR_KOI_DECISION'|'NO_MATCHES_DISCARD'|'ROUND_END'} GamePhase
 */

/**
 * @typedef {Object} GameResult
 * @property {string} type - Type of result ('MATCH_INVALID'|'MATCH_VALID'|'SCORE_UPDATE'|'DECK_DRAW'|'ROUND_END'|'NO_MATCHES'|'CARD_PLACED')
 * @property {string} [message] - Optional message describing the result
 * @property {Object} [data] - Additional data specific to the result type
 */

/**
 * @typedef {import('./state.js').GameState} GameState
 * @typedef {import('../scoring/manager.js').ScoringManager} ScoringManager
 */

/**
 * Creates a new KoiKoi game instance
 * @param {Object} [options]
 * @param {Object} [options.rules] - Custom scoring rules
 * @param {GameState} [options.initialState] - Initial game state
 * @param {boolean} [options.debug] - Whether to enable debug mode
 * @returns {KoiKoiGame}
 */
export const createKoiKoiGame = (options = {}) => {
  /** @type {GameState} */
  let state = null

  /** @type {string} */
  let currentPlayer = null

  /** @type {GamePhase} */
  let phase = null

  /** @type {number} */
  let selectedHandCard = null

  /** @type {Set<number>} */
  const selectedFieldCards = new Set()

  /** @type {number} */
  let drawnCard = null

  /** @type {ScoringManager} */
  const scoring = createScoringManager(options.rules || KOIKOI_RULES)

  /** @type {boolean} */
  const debug = options.debug || false

  const log = (message) => {
    if (debug) {
      console.log(message)
    }
  }

  /**
   * Sets the game phase (only available in debug mode)
   * @param {GamePhase} newPhase
   * @throws {Error} If not in debug mode
   */
  const setPhase = (newPhase) => {
    if (!debug) {
      throw new Error("Phase can only be set in debug mode")
    }
    phase = newPhase
    log(`Phase set to ${newPhase}`)
  }

  /**
   * Switches to the next player and resets selection state
   */
  const switchPlayers = () => {
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1"
    selectedHandCard = null
    selectedFieldCards.clear()
    drawnCard = null
    phase = "WAITING_FOR_HAND_CARD"
  }

  /**
   * Get the current player's hand
   * @returns {Collection}
   */
  const getCurrentHand = () => {
    return state.players[currentPlayer].hand
  }

  /**
   * Draws a card and handles matching logic
   * @returns {GameResult}
   */
  const drawCard = () => {
    if (state.deck.isEmpty) {
      phase = "ROUND_END"
      return { type: "ROUND_END", message: "Deck is empty" }
    }

    drawnCard = state.deck.draw()
    selectedFieldCards.clear()
    selectedHandCard = null

    const matchingCards = Array.from(state.field).filter((fieldCard) =>
      isMatch(drawnCard, fieldCard)
    )
    const hasMatches = matchingCards.length > 0

    if (hasMatches) {
      phase = "WAITING_FOR_DECK_MATCH"
      return {
        type: "DECK_DRAW",
        data: { drawnCard, hasMatches: true, matchingCards, phase },
      }
    }

    // Auto-place card and check scoring
    state.field.add(drawnCard)
    const placedCard = drawnCard
    drawnCard = null

    const capturedPile = state.players[currentPlayer].captured
    const completedYaku = scoring(capturedPile)

    if (completedYaku.length > 0) {
      state.completedYaku = completedYaku
      phase = "WAITING_FOR_KOI_DECISION"
      return {
        type: "SCORE_UPDATE",
        data: { drawnCard: placedCard, placedOnField: true, completedYaku, phase },
      }
    }

    if (getCurrentHand().isEmpty) {
      phase = "ROUND_END"
      return {
        type: "ROUND_END",
        message: `Exhaustive draw: ${currentPlayer} has no cards`,
      }
    }
    switchPlayers()
    return {
      type: "DECK_DRAW",
      data: { drawnCard: placedCard, hasMatches: false, placedOnField: true, phase },
    }
  }

  /**
   * Handles selection of a card from the player's hand
   * @param {number} cardIndex
   * @returns {GameResult}
   */
  const handleHandCardSelection = (cardIndex) => {
    const currentHand = getCurrentHand()

    if (!currentHand.has(cardIndex)) {
      return { type: "ERROR", message: `Card ${cardIndex} not in current player's hand` }
    }

    selectedHandCard = cardIndex
    selectedFieldCards.clear()

    const matchingCards = Array.from(state.field).filter((fieldCard) =>
      isMatch(cardIndex, fieldCard)
    )

    if (matchingCards.length === 0) {
      phase = "NO_MATCHES_DISCARD"
      return {
        type: "NO_MATCHES",
        data: {
          selectedCard: cardIndex,
          hasMatches: false,
        },
      }
    }

    phase = "WAITING_FOR_FIELD_CARDS"
    return {
      type: "SELECTION_UPDATED",
      data: {
        selectedHandCard: cardIndex,
        matchingCards,
        phase,
      },
    }
  }

  /**
   * Handles selection of cards from the field
   * @param {number} cardIndex
   * @returns {GameResult}
   */
  const handleFieldCardSelection = (cardIndex) => {
    if (isNullish(selectedHandCard) && isNullish(drawnCard)) {
      return { type: "ERROR", message: "Must select hand card first" }
    }

    const sourceCard = selectedHandCard || drawnCard
    const fieldCard = cardIndex

    if (!state.field.has(fieldCard)) {
      return { type: "ERROR", message: `Invalid field card index: ${fieldCard}` }
    }

    if (!isMatch(sourceCard, fieldCard)) {
      return {
        type: "ERROR",
        message: `Selected cards do not match: ${sourceCard} and ${fieldCard}`,
      }
    }

    if (selectedFieldCards.has(fieldCard)) {
      selectedFieldCards.delete(fieldCard)
    } else {
      selectedFieldCards.add(fieldCard)
    }

    return {
      type: "SELECTION_UPDATED",
      data: {
        selectedHandCard: sourceCard,
        selectedFieldCards: Array.from(selectedFieldCards),
        phase,
      },
    }
  }

  /**
   * Places selected card on the field when no matches are available
   * @returns {GameResult}
   */
  const placeSelectedCard = () => {
    if (isNullish(selectedHandCard)) {
      return { type: "ERROR", message: "No card selected" }
    }

    // Remove from hand and add to field
    getCurrentHand().remove(selectedHandCard)
    state.field.add(selectedHandCard)

    const placedCard = selectedHandCard
    selectedHandCard = null

    return {
      type: "CARD_PLACED",
      data: {
        placedCard,
        nextAction: drawCard(),
      },
    }
  }

  /**
   * Captures selected matching cards
   * @returns {GameResult}
   */
  const captureCards = () => {
    if ((isNullish(selectedHandCard) && isNullish(drawnCard)) || selectedFieldCards.size === 0) {
      return { type: "ERROR", message: "Invalid card selection" }
    }

    const sourceCard = selectedHandCard || drawnCard
    const fieldCards = Array.from(selectedFieldCards)

    // Validate all matches
    if (!fieldCards.every((card) => isMatch(sourceCard, card))) {
      return { type: "ERROR", message: "Invalid matches selected" }
    }

    // Remove cards from their sources
    if (selectedHandCard) {
      getCurrentHand().remove(selectedHandCard)
    }
    fieldCards.forEach((card) => state.field.remove(card))

    // Add to captured pile
    const capturedPile = state.players[currentPlayer].captured
    capturedPile.addMany([sourceCard, ...fieldCards])

    // Check for completed yaku
    const completedYaku = scoring(capturedPile)

    selectedHandCard = null
    selectedFieldCards.clear()
    drawnCard = null

    if (completedYaku.length > 0) {
      state.completedYaku = completedYaku
      phase = "WAITING_FOR_KOI_DECISION"
      return {
        type: "SCORE_UPDATE",
        data: { completedYaku, phase },
      }
    }

    if (isNullish(selectedHandCard)) {
      switchPlayers()
    }

    return {
      type: "CAPTURE_COMPLETE",
      data: { phase },
    }
  }

  /**
   * Loads a game state
   * @param {GameState} newState - State to load
   * @returns {GameResult}
   */
  const loadState = (newState) => {
    if (!validateGameState(newState)) {
      return {
        type: "ERROR",
        message: "Invalid game state",
      }
    }

    // Reset current selections and phase
    selectedHandCard = null
    selectedFieldCards.clear()
    drawnCard = null

    // Apply new state
    state = newState
    phase = "WAITING_FOR_HAND_CARD"

    return {
      type: "STATE_LOADED",
      data: { state: api.getState() },
    }
  }

  /**
   * @type {KoiKoiGame}
   */
  const api = {
    startRound: (players = ["player1", "player2"]) => {
      if (!Array.isArray(players) || players.length !== 2) {
        throw new Error("Players must be an array of length 2")
      }

      const result = initializeRound(players)

      // If initial state was provided, use it instead
      if (options.initialState) {
        const loadResult = loadState(options.initialState)
        if (loadResult.type === "ERROR") {
          throw new Error(loadResult.message)
        }
        return { state: api.getState(), teyaku: result.teyaku }
      }

      state = result.state
      phase = "WAITING_FOR_HAND_CARD"
      drawnCard = null
      currentPlayer = result.firstPlayer
      return { state: api.getState(), teyaku: result.teyaku }
    },

    getState: () => ({
      ...state,
      currentPlayer,
      phase,
      selectedHandCard,
      selectedFieldCards: Array.from(selectedFieldCards),
      drawnCard,
    }),

    selectCard: (cardIndex, source) => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (source === "hand") {
        return handleHandCardSelection(cardIndex)
      } else if (source === "field") {
        return handleFieldCardSelection(cardIndex)
      }

      return { type: "ERROR", message: "Invalid source" }
    },

    placeSelectedCard: () => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (phase !== "NO_MATCHES_DISCARD") {
        return { type: "ERROR", message: "Invalid game phase for placing card" }
      }

      return placeSelectedCard()
    },

    captureCards: () => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (phase !== "WAITING_FOR_FIELD_CARDS" && phase !== "WAITING_FOR_DECK_MATCH") {
        return { type: "ERROR", message: "Invalid game phase for capturing cards" }
      }

      return captureCards()
    },

    makeKoiKoiDecision: (continuePlay) => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (phase !== "WAITING_FOR_KOI_DECISION") {
        return { type: "ERROR", message: "Invalid game phase for koi-koi decision" }
      }

      if (continuePlay) {
        switchPlayers()
        return {
          type: "TURN_END",
          data: { phase },
        }
      }

      phase = "ROUND_END"
      return {
        type: "ROUND_END",
        data: {
          winner: currentPlayer,
          yaku: state.completedYaku,
          phase,
        },
      }
    },

    loadState,

    setPhase: debug ? setPhase : undefined,

    getCurrentPlayer: () => currentPlayer,

    getCurrentHand: () => state.players[currentPlayer].hand,

    ...(debug && {
      setCurrentPlayer: (player) => {
        if (state.players[player]) {
          currentPlayer = player
        } else {
          throw new Error(`Invalid player: ${player}`)
        }
      },
    }),
  }

  return api
}

/**
 * @typedef {Object} KoiKoiGame
 * @property {(players?: string[]) => Object} startRound
 * @property {() => Object} getState
 * @property {(cardIndex: number, source: string) => GameResult} selectCard
 * ... other method definitions
 */
