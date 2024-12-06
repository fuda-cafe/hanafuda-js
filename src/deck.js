import { CARDS } from "./cards.js"

/**
 * @typedef {Object} Deck
 * @property {number[]} cards - Array of card indices
 * @property {number} remaining - Number of cards remaining in the deck
 */

export class Deck {
  /** @type {number[]} */
  #cards = []

  /** @type {boolean} */
  #noShuffle = false

  /** @type {boolean} */
  #testMode = false

  /**
   * @param {number[]} cards
   * @param {boolean} noShuffle
   */
  constructor(options = {}) {
    const { cards = [], noShuffle = false, testMode = false } = options
    this.#noShuffle = noShuffle || testMode
    this.#testMode = testMode
    this.reset(cards)
  }

  /**
   * Reset the deck to its initial state and shuffle
   */
  reset(cards = []) {
    if (cards.length > 0) {
      // Validate card indices
      if (!cards.every((card) => card >= 0 && card < CARDS.length)) {
        throw new Error("Invalid card indices provided")
      }
      // Check for duplicates
      if (new Set(cards).size !== cards.length) {
        throw new Error("Duplicate cards provided")
      }
      this.#cards = [...cards] // Create defensive copy
    } else {
      this.#cards = Array.from({ length: CARDS.length }, (_, i) => i)
    }
    this.shuffle()
  }

  /**
   * Shuffle the remaining cards in the deck
   */
  shuffle() {
    if (this.#noShuffle) return
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.#cards[i], this.#cards[j]] = [this.#cards[j], this.#cards[i]]
    }
  }

  /**
   * Draw a card from the deck
   * @returns {number | null} Card index or null if deck is empty
   */
  draw() {
    if (this.#cards.length === 0) return null
    return this.#cards.pop()
  }

  /**
   * Draw multiple cards from the deck
   * @param {number} count Number of cards to draw
   * @returns {number[]} Array of card indices
   */
  drawMany(count) {
    const cards = []
    for (let i = 0; i < count && this.#cards.length > 0; i++) {
      const card = this.draw()
      if (card !== null) cards.push(card)
    }
    return cards
  }

  /**
   * Get the number of cards remaining in the deck
   * @returns {number}
   */
  get remaining() {
    return this.#cards.length
  }

  /**
   * Check if the deck is empty
   * @returns {boolean}
   */
  get isEmpty() {
    return this.#cards.length === 0
  }

  /**
   * Get the current order of cards (for testing)
   * @returns {readonly number[]}
   */
  peek() {
    if (!this.#testMode) {
      throw new Error("peek() is only available in test mode")
    }
    return Object.freeze([...this.#cards])
  }

  /**
   * Get serializable state
   * @returns {{ cards: number[], noShuffle: boolean }}
   */
  getState() {
    return {
      cards: [...this.#cards],
      noShuffle: this.#noShuffle,
    }
  }

  /**
   * Restore from state
   * @param {{ cards: number[], noShuffle: boolean }} state
   */
  setState(state) {
    this.#cards = [...state.cards]
    this.#noShuffle = state.noShuffle
  }
}

/**
 * Deck for testing purposes. Does not shuffle.
 * @extends Deck
 */
export class TestDeck extends Deck {
  /** @type {number[]} */
  #cards

  constructor(cards) {
    super()
    this.#cards = cards
  }

  shuffle() {
    // Do nothing
  }
}
