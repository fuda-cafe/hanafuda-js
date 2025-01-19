import { initializeRound } from "./setup.ts"
import { isMatch } from "../core/matching.ts"
import { createScoringManager, KOIKOI_RULES } from "../scoring/manager.ts"
import { validateGameState } from "./state.ts"
import { isNullish } from "../utils/is-nullish.ts"
import type { GameState } from "./types.ts"
import { RuleConfig, YakuResults } from "../scoring/types.ts"
import { Collection } from "../core/types.ts"
import { InvalidStateError } from "../errors.ts"

export const GamePhase = {
  WAITING_FOR_HAND_CARD: "WAITING_FOR_HAND_CARD",
  WAITING_FOR_FIELD_CARDS: "WAITING_FOR_FIELD_CARDS",
  WAITING_FOR_DECK_MATCH: "WAITING_FOR_DECK_MATCH",
  WAITING_FOR_KOI_DECISION: "WAITING_FOR_KOI_DECISION",
  NO_MATCHES_DISCARD: "NO_MATCHES_DISCARD",
  ROUND_END: "ROUND_END",
} as const
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase]

export const GameResultType = {
  SELECTION_UPDATED: "SELECTION_UPDATED",
  MATCH_INVALID: "MATCH_INVALID",
  MATCH_VALID: "MATCH_VALID",
  SCORE_UPDATE: "SCORE_UPDATE",
  DECK_DRAW: "DECK_DRAW",
  ROUND_END: "ROUND_END",
  NO_MATCHES: "NO_MATCHES",
  CARD_PLACED: "CARD_PLACED",
  CAPTURE_COMPLETE: "CAPTURE_COMPLETE",
  TURN_END: "TURN_END",
  ERROR: "ERROR",
  STATE_LOADED: "STATE_LOADED",
} as const
export type GameResultType = (typeof GameResultType)[keyof typeof GameResultType]

export type GameResult = {
  type: GameResultType
  message?: string
  data?: any
}

export type KoiKoiGame = {
  startRound: (players?: string[]) => {
    state: GameState
    teyaku: Record<keyof GameState["players"], YakuResults>
  }
  getState: () => GameState | null
  selectCard: (cardIndex: number, source: "hand" | "field") => GameResult
  placeSelectedCard: () => GameResult
  captureCards: () => GameResult
  makeKoiKoiDecision: (continuePlay: boolean) => GameResult
  loadState: (state: GameState) => GameResult
  getCurrentPlayer: () => string | null
  getCurrentHand: () => Collection | null
  setCurrentPlayer?: (player: keyof GameState["players"]) => void
  setPhase?: (phase: GamePhase) => void
}

/**
 * Creates a new KoiKoi game instance
 * @param options - Game options
 * @param options.rules - Custom scoring rules
 * @param options.initialState - Initial game state
 * @param options.debug - Whether to enable debug mode
 * @returns {KoiKoiGame}
 */
export const createKoiKoiGame = (
  options: { rules?: RuleConfig; initialState?: GameState; debug?: boolean } = {}
): KoiKoiGame => {
  let state: GameState | null = null

  let currentPlayer: string | null = null

  let phase: GamePhase | null = null

  let selectedHandCard: number | null = null

  const selectedFieldCards = new Set<number>()

  let drawnCard: number | null = null

  const scoring = createScoringManager(options.rules || KOIKOI_RULES)

  const debug = options.debug || false

  const log = (message: string) => {
    if (debug) {
      console.log(message)
    }
  }

  /**
   * Sets the game phase (only available in debug mode)
   * @throws {Error} If not in debug mode
   */
  const setPhase = (newPhase: GamePhase) => {
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
   * @throws {InvalidStateError}
   */
  const getCurrentHand = (): Collection => {
    if (!state) {
      throw new InvalidStateError("Game not initialized")
    }

    if (!currentPlayer) {
      throw new InvalidStateError("Current player not set")
    }

    return state.players[currentPlayer].hand
  }

  /**
   * Draws a card and handles matching logic
   * @throws {InvalidStateError}
   */
  const drawCard = (): GameResult => {
    if (!state) {
      throw new InvalidStateError("Game not initialized")
    }

    if (state.deck.isEmpty) {
      phase = "ROUND_END"
      return { type: "ROUND_END", message: "Deck is empty" }
    }

    drawnCard = state.deck.draw()

    if (isNullish(drawnCard)) {
      throw new InvalidStateError("Failed to draw card")
    }

    const cardToMatch = drawnCard
    selectedFieldCards.clear()
    selectedHandCard = null

    const matchingCards = Array.from(state.field).filter((fieldCard) =>
      isMatch(cardToMatch, fieldCard)
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

    if (!currentPlayer) {
      throw new InvalidStateError("Current player not set")
    }

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
   * @throws {InvalidStateError}
   */
  const handleHandCardSelection = (cardIndex: number): GameResult => {
    if (!state) {
      throw new InvalidStateError("Game not initialized")
    }

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
   * @throws {InvalidStateError}
   */
  const handleFieldCardSelection = (cardIndex: number): GameResult => {
    if (!state) {
      throw new InvalidStateError("Game not initialized")
    }

    if (isNullish(selectedHandCard) && isNullish(drawnCard)) {
      return { type: "ERROR", message: "Must select hand card first" }
    }

    const sourceCard = selectedHandCard ?? drawnCard
    if (isNullish(sourceCard)) {
      throw new InvalidStateError("Source card is null despite previous check")
    }

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
   * @throws {InvalidStateError}
   */
  const placeSelectedCard = (): GameResult => {
    if (!state || !currentPlayer) {
      throw new InvalidStateError("Game not initialized")
    }

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
   * @throws {InvalidStateError}
   */
  const captureCards = (): GameResult => {
    if (!state || !currentPlayer) {
      throw new InvalidStateError("Game not initialized")
    }

    if ((isNullish(selectedHandCard) && isNullish(drawnCard)) || selectedFieldCards.size === 0) {
      return { type: "ERROR", message: "Invalid card selection" }
    }

    const sourceCard = selectedHandCard ?? drawnCard
    if (isNullish(sourceCard)) {
      throw new InvalidStateError("Source card is null despite previous check")
    }

    const fieldCards = Array.from(selectedFieldCards)

    // Validate all matches
    if (!fieldCards.every((card) => isMatch(sourceCard, card))) {
      return { type: "ERROR", message: "Invalid matches selected" }
    }

    // Remove cards from their sources
    if (!isNullish(selectedHandCard)) {
      getCurrentHand().remove(selectedHandCard)
    }
    fieldCards.forEach((card) => state!.field.remove(card))

    // Add to captured pile
    const capturedPile = state!.players[currentPlayer].captured
    capturedPile?.addMany([sourceCard, ...fieldCards])

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
   * @throws {InvalidStateError}
   */
  const loadState = (newState: GameState): GameResult => {
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
  const api: KoiKoiGame = {
    startRound: (players: string[] = ["player1", "player2"]) => {
      if (!Array.isArray(players) || players.length !== 2) {
        throw new Error("Players must be an array of length 2")
      }

      const result = initializeRound(players)

      if (!result.state) {
        throw new Error("Failed to initialize round")
      }
      // If initial state was provided, use it instead
      if (options.initialState) {
        const loadResult = loadState(options.initialState)
        if (loadResult.type === "ERROR") {
          throw new Error(loadResult.message)
        }
        return { state: api.getState()!, teyaku: result.teyaku }
      }

      state = result.state
      phase = "WAITING_FOR_HAND_CARD"
      drawnCard = null
      currentPlayer = result.firstPlayer
      return { state: api.getState()!, teyaku: result.teyaku }
    },

    getState: () =>
      state
        ? Object.freeze({
            ...state,
            currentPlayer,
            phase,
            selectedHandCard,
            selectedFieldCards: Array.from(selectedFieldCards),
            drawnCard,
          })
        : null,

    selectCard: (cardIndex: number, source: "hand" | "field"): GameResult => {
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

    placeSelectedCard: (): GameResult => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (phase !== "NO_MATCHES_DISCARD") {
        return { type: "ERROR", message: "Invalid game phase for placing card" }
      }

      return placeSelectedCard()
    },

    captureCards: (): GameResult => {
      if (!state) {
        return { type: "ERROR", message: "Game not initialized" }
      }

      if (phase !== "WAITING_FOR_FIELD_CARDS" && phase !== "WAITING_FOR_DECK_MATCH") {
        return { type: "ERROR", message: "Invalid game phase for capturing cards" }
      }

      return captureCards()
    },

    makeKoiKoiDecision: (continuePlay: boolean): GameResult => {
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

    getCurrentHand: () => (currentPlayer ? state!.players[currentPlayer].hand : null),

    ...(debug && {
      setCurrentPlayer: (player: keyof GameState["players"]) => {
        if (state!.players[player]) {
          currentPlayer = player
        } else {
          throw new Error(`Invalid player: ${player}`)
        }
      },
    }),
  }

  return api
}
