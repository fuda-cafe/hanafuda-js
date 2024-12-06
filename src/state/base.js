import { Deck } from "../deck.js"
import { CardCollection } from "../collection.js"

/**
 * @typedef {Object} BaseGameStateOptions
 * @property {number[]} [table] - Cards on the table
 * @property {number[]} [player1Hand] - Cards in player 1's hand
 * @property {number[]} [player2Hand] - Cards in player 2's hand
 * @property {number[]} [player1Captured] - Cards captured by player 1
 * @property {number[]} [player2Captured] - Cards captured by player 2
 * @property {Object} [deck] - Deck configuration
 * @property {number[]} deck.cards - Cards in the deck
 * @property {boolean} [deck.noShuffle] - Whether to disable shuffling
 */

export class BaseGameState {
  /** @type {CardCollection} */
  #table
  /** @type {CardCollection} */
  #player1Hand
  /** @type {CardCollection} */
  #player2Hand
  /** @type {CardCollection} */
  #player1Captured
  /** @type {CardCollection} */
  #player2Captured
  /** @type {Deck} */
  #deck

  /**
   * Create a new BaseGameState
   * @param {BaseGameStateOptions} [options={}] - Initial game state options
   */
  constructor(options = {}) {
    const {
      table = [],
      player1Hand = [],
      player2Hand = [],
      player1Captured = [],
      player2Captured = [],
      deck = { cards: [] },
    } = options

    this.#table = new CardCollection(table)
    this.#player1Hand = new CardCollection(player1Hand)
    this.#player2Hand = new CardCollection(player2Hand)
    this.#player1Captured = new CardCollection(player1Captured)
    this.#player2Captured = new CardCollection(player2Captured)
    this.#deck = new Deck(deck)
  }

  /**
   * Reset the game state
   */
  reset() {
    this.#table.clear()
    this.#player1Hand.clear()
    this.#player2Hand.clear()
    this.#player1Captured.clear()
    this.#player2Captured.clear()
    this.#deck.reset()
  }

  /**
   * Deal initial cards
   * @param {number} handSize Number of cards to deal to each player
   * @param {number} tableSize Number of cards to deal to the table
   */
  dealInitial(handSize, tableSize) {
    // Deal to players
    this.#player1Hand.addMany(this.#deck.drawMany(handSize))
    this.#player2Hand.addMany(this.#deck.drawMany(handSize))

    // Deal to table
    this.#table.addMany(this.#deck.drawMany(tableSize))
  }

  /**
   * Draw a card from the deck
   * @returns {number | null} Card index or null if deck is empty
   */
  drawFromDeck() {
    return this.#deck.draw()
  }

  /**
   * Move a card between collections
   * @param {number} cardIndex
   * @param {CardCollection} fromCollection
   * @param {CardCollection} toCollection
   * @returns {boolean} True if card was moved successfully
   */
  moveCard(cardIndex, fromCollection, toCollection) {
    if (!fromCollection.remove(cardIndex)) return false
    toCollection.add(cardIndex)
    return true
  }

  /**
   * Move multiple cards between collections
   * @param {number[]} cardIndices
   * @param {CardCollection} fromCollection
   * @param {CardCollection} toCollection
   * @returns {boolean} True if all cards were moved successfully
   */
  moveCards(cardIndices, fromCollection, toCollection) {
    if (!fromCollection.removeMany(cardIndices)) return false
    toCollection.addMany(cardIndices)
    return true
  }

  // Getters for collections
  get table() {
    return this.#table
  }
  get player1Hand() {
    return this.#player1Hand
  }
  get player2Hand() {
    return this.#player2Hand
  }
  get player1Captured() {
    return this.#player1Captured
  }
  get player2Captured() {
    return this.#player2Captured
  }
  get deck() {
    return this.#deck
  }

  /**
   * Get a player's hand
   * @param {number} playerNumber
   * @returns {CardCollection}
   */
  getPlayerHand(playerNumber) {
    return playerNumber === 1 ? this.#player1Hand : this.#player2Hand
  }

  /**
   * Get a player's captured cards
   * @param {number} playerNumber
   * @returns {CardCollection}
   */
  getPlayerCaptured(playerNumber) {
    return playerNumber === 1 ? this.#player1Captured : this.#player2Captured
  }

  /**
   * Check if the game is over (deck is empty and at least one player has no cards)
   * @returns {boolean}
   */
  isGameOver() {
    return this.#deck.isEmpty && (this.#player1Hand.size === 0 || this.#player2Hand.size === 0)
  }
}
