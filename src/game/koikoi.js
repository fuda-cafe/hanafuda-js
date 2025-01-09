import { createGameState } from "./state.js"
import { initializeRound } from "./setup.js"
import { isMatch, hasMatch } from "../core/matching.js"
import { createScoringManager, KOIKOI_RULES } from "../scoring/manager.js"

/**
 * @typedef {'WAITING_FOR_HAND_CARD'|'WAITING_FOR_FIELD_CARDS'|'WAITING_FOR_DECK_MATCH'|'WAITING_FOR_KOI_DECISION'|'NO_MATCHES_DISCARD'|'ROUND_END'} GamePhase
 */

/**
 * @typedef {Object} GameResult
 * @property {string} type - Type of result ('MATCH_INVALID'|'MATCH_VALID'|'SCORE_UPDATE'|'DECK_DRAW'|'ROUND_END'|'NO_MATCHES'|'CARD_PLACED')
 * @property {string} [message] - Optional message describing the result
 * @property {Object} [data] - Additional data specific to the result type
 */

export class KoiKoi {
  /**
   * @param {Object} [options]
   * @param {Object} [options.rules] - Custom scoring rules
   */
  constructor(options = {}) {
    this.state = null
    this.phase = null
    this.selectedHandCard = null
    this.selectedFieldCards = new Set()
    this.drawnCard = null
    this.scoring = createScoringManager(options.rules || KOIKOI_RULES)
  }

  /**
   * Start a new game round
   * @returns {Object} Initial game state and any teyaku
   */
  startRound() {
    const playerIds = ["player1", "player2"]
    const { state, teyaku } = initializeRound(playerIds)
    this.state = state
    this.phase = "WAITING_FOR_HAND_CARD"
    this.drawnCard = null
    return { state: this.getState(), teyaku }
  }

  /**
   * Get current game state
   * @returns {Object} Current game state and phase
   */
  getState() {
    return {
      ...this.state,
      phase: this.phase,
      selectedHandCard: this.selectedHandCard,
      selectedFieldCards: Array.from(this.selectedFieldCards),
      drawnCard: this.drawnCard,
    }
  }

  /**
   * Select a card from hand or field
   * @param {number} cardIndex
   * @param {string} source - 'hand' or 'field'
   * @returns {GameResult}
   */
  selectCard(cardIndex, source) {
    if (!this.state) {
      return { type: "ERROR", message: "Game not initialized" }
    }

    if (source === "hand") {
      return this._handleHandCardSelection(cardIndex)
    } else if (source === "field") {
      return this._handleFieldCardSelection(cardIndex)
    }

    return { type: "ERROR", message: "Invalid source" }
  }

  /**
   * Handle selection of a card from the current player's hand
   * @private
   */
  _handleHandCardSelection(cardIndex) {
    if (
      !["WAITING_FOR_HAND_CARD", "WAITING_FOR_FIELD_CARDS", "NO_MATCHES_DISCARD"].includes(
        this.phase
      )
    ) {
      return { type: "ERROR", message: "Not waiting for hand card selection" }
    }

    // Handle deselection if clicking the same card in field selection phase
    if (this.selectedHandCard === cardIndex) {
      this.selectedHandCard = null
      this.selectedFieldCards.clear()
      this.phase = "WAITING_FOR_HAND_CARD"
      return {
        type: "SELECTION_UPDATED",
        data: {
          selectedHandCard: null,
          selectedFieldCards: [],
          phase: this.phase,
        },
      }
    }

    const currentHand = this.state.players[this.state.currentPlayer].hand

    // Verify card is in current player's hand
    if (!currentHand.has(cardIndex)) {
      return { type: "ERROR", message: "Card not in current player's hand" }
    }

    // Check if any matches are available in the field
    const hasAnyMatches = Array.from(currentHand).some((handCard) =>
      hasMatch(this.state.field, handCard)
    )
    console.log({
      hasAnyMatches,
      hasMatch: hasMatch(this.state.field, cardIndex),
      cardIndex,
      currentSelectedCard: this.selectedHandCard,
    })

    // Select new hand card
    this.selectedHandCard = cardIndex
    this.selectedFieldCards.clear()

    // If no matches available, move to discard phase
    if (!hasAnyMatches || !hasMatch(this.state.field, cardIndex)) {
      this.phase = "NO_MATCHES_DISCARD"
    } else {
      this.phase = "WAITING_FOR_FIELD_CARDS"
    }

    return {
      type: hasAnyMatches ? "SELECTION_UPDATED" : "NO_MATCHES",
      data: {
        selectedHandCard: this.selectedHandCard,
        selectedFieldCards: Array.from(this.selectedFieldCards),
        phase: this.phase,
        hasMatches: hasAnyMatches,
        canMatch: hasAnyMatches && hasMatch(this.state.field, cardIndex),
      },
    }
  }

  /**
   * Handle selection of a card from the field
   * @private
   */
  _handleFieldCardSelection(cardIndex) {
    const isDrawnPhase = this.phase === "WAITING_FOR_DECK_MATCH"
    const isHandPhase = this.phase === "WAITING_FOR_FIELD_CARDS"

    if (!isDrawnPhase && !isHandPhase) {
      return { type: "ERROR", message: "Not in a matching phase" }
    }

    // In drawn card phase, we use the drawn card instead of selected hand card
    const matchingCard = isDrawnPhase ? this.drawnCard : this.selectedHandCard
    if (!matchingCard) {
      return {
        type: "ERROR",
        message: isDrawnPhase ? "No drawn card" : "Must select hand card first",
      }
    }

    if (!this.state.field.has(cardIndex)) {
      return { type: "ERROR", message: "Card not on field" }
    }

    // Handle deselection of field card
    if (this.selectedFieldCards.has(cardIndex)) {
      this.selectedFieldCards.delete(cardIndex)
      return {
        type: "SELECTION_UPDATED",
        data: {
          selectedHandCard: this.selectedHandCard,
          selectedFieldCards: Array.from(this.selectedFieldCards),
          drawnCard: this.drawnCard,
          phase: this.phase,
        },
      }
    }

    const isValidMatch = isMatch(matchingCard, cardIndex)
    if (!isValidMatch) {
      return { type: "MATCH_INVALID", message: "Cards do not match" }
    }

    this.selectedFieldCards.add(cardIndex)

    return {
      type: "SELECTION_UPDATED",
      data: {
        selectedHandCard: this.selectedHandCard,
        selectedFieldCards: Array.from(this.selectedFieldCards),
        drawnCard: this.drawnCard,
        phase: this.phase,
      },
    }
  }

  /**
   * Place selected card on field when no matches are available
   * @returns {GameResult}
   */
  placeSelectedCard() {
    if (this.phase !== "NO_MATCHES_DISCARD") {
      return { type: "ERROR", message: "Can only place card when no matches are available" }
    }

    if (!this.selectedHandCard) {
      return { type: "ERROR", message: "No card selected" }
    }

    const currentHand = this.state.players[this.state.currentPlayer].hand

    // Verify the card is still in hand
    if (!currentHand.has(this.selectedHandCard)) {
      return { type: "ERROR", message: "Selected card not in hand" }
    }

    // Place the card on the field
    currentHand.remove(this.selectedHandCard)
    this.state.field.add(this.selectedHandCard)

    // Clear selection and draw next card
    const cardPlaced = this.selectedHandCard
    this.selectedHandCard = null
    this.selectedFieldCards.clear()

    // Draw next card
    return {
      type: "CARD_PLACED",
      data: {
        placedCard: cardPlaced,
        nextAction: this._drawCard(),
      },
    }
  }

  /**
   * Play currently selected cards
   * @returns {GameResult}
   */
  playCards() {
    const isDrawnPhase = this.phase === "WAITING_FOR_DECK_MATCH"
    const isHandPhase = this.phase === "WAITING_FOR_FIELD_CARDS"

    if (!isDrawnPhase && !isHandPhase) {
      return { type: "ERROR", message: "Not in a matching phase" }
    }

    const matchingCard = isDrawnPhase ? this.drawnCard : this.selectedHandCard
    if (!matchingCard) {
      return { type: "ERROR", message: "No card selected" }
    }

    // Get current player's collections
    const currentHand = this.state.players[this.state.currentPlayer].hand
    const capturedPile = this.state.players[this.state.currentPlayer].captured

    if (isHandPhase) {
      // Regular matching play
      currentHand.remove(this.selectedHandCard)
      capturedPile.add(this.selectedHandCard)
    } else {
      // Add drawn card to captured pile
      capturedPile.add(this.drawnCard)
    }

    // Move matched field cards
    this.selectedFieldCards.forEach((cardIndex) => {
      this.state.field.remove(cardIndex)
      capturedPile.add(cardIndex)
    })

    if (isHandPhase) {
      // After hand phase, draw a card
      return this._drawCard()
    } else {
      // After drawn phase, check for scoring
      const completedYaku = this.scoring(capturedPile)
      if (completedYaku.length > 0) {
        this.state.completedYaku = completedYaku
        this.phase = "WAITING_FOR_KOI_DECISION"
        return {
          type: "SCORE_UPDATE",
          data: { completedYaku, phase: this.phase },
        }
      }

      // Switch players if no scoring
      this._switchPlayers()
      return { type: "TURN_END", data: { phase: this.phase } }
    }
  }

  /**
   * Draw a card from the deck
   * @private
   * @returns {GameResult}
   */
  _drawCard() {
    if (this.state.deck.length === 0) {
      this.phase = "ROUND_END"
      return { type: "ROUND_END", message: "Deck is empty" }
    }

    // Draw card
    this.drawnCard = this.state.deck.pop()
    this.selectedFieldCards.clear()
    this.selectedHandCard = null

    // Check if drawn card matches any field cards
    const matchingCards = Array.from(this.state.field).filter((fieldCard) =>
      isMatch(this.drawnCard, fieldCard)
    )
    const hasMatches = matchingCards.length > 0

    if (hasMatches) {
      // If there are matches, must enter matching phase
      this.phase = "WAITING_FOR_DECK_MATCH"
    } else {
      // If no matches, automatically place on field and check for scoring
      this.state.field.add(this.drawnCard)
      const placedCard = this.drawnCard
      this.drawnCard = null

      // Check for scoring
      const capturedPile = this.state.players[this.state.currentPlayer].captured
      const completedYaku = this.scoring(capturedPile)
      if (completedYaku.length > 0) {
        this.state.completedYaku = completedYaku
        this.phase = "WAITING_FOR_KOI_DECISION"
        return {
          type: "SCORE_UPDATE",
          data: {
            drawnCard: placedCard,
            placedOnField: true,
            completedYaku,
            phase: this.phase,
          },
        }
      }

      // Switch players if no scoring
      this._switchPlayers()
      return {
        type: "DECK_DRAW",
        data: {
          drawnCard: placedCard,
          hasMatches: false,
          placedOnField: true,
          phase: this.phase,
        },
      }
    }

    return {
      type: "DECK_DRAW",
      data: {
        drawnCard: this.drawnCard,
        hasMatches: true,
        matchingCards,
        phase: this.phase,
      },
    }
  }

  /**
   * Make koi-koi decision after scoring
   * @param {boolean} chooseKoiKoi - True to continue (koi-koi), false to end round
   * @returns {GameResult}
   */
  makeKoiKoiDecision(chooseKoiKoi) {
    if (this.phase !== "WAITING_FOR_KOI_DECISION") {
      return { type: "ERROR", message: "Not waiting for koi-koi decision" }
    }

    if (chooseKoiKoi) {
      this._switchPlayers()
      return { type: "TURN_END", data: { phase: this.phase } }
    } else {
      this.phase = "ROUND_END"
      return {
        type: "ROUND_END",
        data: {
          winner: this.state.currentPlayer,
          yaku: this.state.completedYaku,
        },
      }
    }
  }

  /**
   * Switch to the next player
   * @private
   */
  _switchPlayers() {
    this.state.currentPlayer = this.state.currentPlayer === "player1" ? "player2" : "player1"
    this.selectedHandCard = null
    this.selectedFieldCards.clear()
    this.drawnCard = null
    this.phase = "WAITING_FOR_HAND_CARD"
  }

  /**
   * Place drawn card on field (when no matches or choosing not to match)
   * @returns {GameResult}
   */
  placeDrawnCard() {
    if (this.phase !== "WAITING_FOR_DECK_MATCH") {
      return { type: "ERROR", message: "Not in deck matching phase" }
    }

    if (this.drawnCard === null) {
      return { type: "ERROR", message: "No drawn card" }
    }

    // Check if there are any matches
    const hasMatches = Array.from(this.state.field).some((fieldCard) =>
      isMatch(this.drawnCard, fieldCard)
    )

    if (hasMatches) {
      return { type: "ERROR", message: "Must capture matching cards when available" }
    }

    // Place card on field
    this.state.field.add(this.drawnCard)
    const placedCard = this.drawnCard
    this.drawnCard = null
    this.selectedFieldCards.clear()

    // Check for scoring
    const capturedPile = this.state.players[this.state.currentPlayer].captured
    const completedYaku = this.scoring(capturedPile)
    if (completedYaku.length > 0) {
      this.state.completedYaku = completedYaku
      this.phase = "WAITING_FOR_KOI_DECISION"
      return {
        type: "SCORE_UPDATE",
        data: {
          placedCard,
          completedYaku,
          phase: this.phase,
        },
      }
    }

    // Switch players if no scoring
    this._switchPlayers()
    return {
      type: "CARD_PLACED",
      data: {
        placedCard,
        phase: this.phase,
      },
    }
  }
}
