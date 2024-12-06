import { getCardMonth, getCardType, CardType } from "./cards.js"

/**
 * @typedef {Object} CardCollection
 * @property {number[]} cards - Array of card indices
 * @property {Function} add - Add a card to the collection
 * @property {Function} remove - Remove a card from the collection
 * @property {Function} clear - Clear all cards from the collection
 */

export class CardCollection {
  /** @type {Set<number>} */
  #cards

  constructor(initialCards = []) {
    this.#cards = new Set(initialCards)
  }

  /**
   * Add a card to the collection
   * @param {number} cardIndex
   */
  add(cardIndex) {
    this.#cards.add(cardIndex)
  }

  /**
   * Add multiple cards to the collection
   * @param {number[]} cardIndices
   */
  addMany(cardIndices) {
    cardIndices.forEach((card) => this.#cards.add(card))
  }

  /**
   * Remove a card from the collection
   * @param {number} cardIndex
   * @returns {boolean} True if card was removed
   */
  remove(cardIndex) {
    return this.#cards.delete(cardIndex)
  }

  /**
   * Remove multiple cards from the collection
   * @param {number[]} cardIndices
   * @returns {boolean} True if all cards were removed
   */
  removeMany(cardIndices) {
    return cardIndices.every((card) => this.#cards.delete(card))
  }

  /**
   * Clear all cards from the collection
   */
  clear() {
    this.#cards.clear()
  }

  /**
   * Get all cards in the collection
   * @returns {readonly number[]}
   */
  get cards() {
    return Object.freeze([...this.#cards])
  }

  /**
   * Get the number of cards in the collection
   * @returns {number}
   */
  get size() {
    return this.#cards.size
  }

  /**
   * Check if collection contains a specific card
   * @param {number} cardIndex
   * @returns {boolean}
   */
  contains(cardIndex) {
    return this.#cards.has(cardIndex)
  }

  /**
   * Find cards of a specific month
   * @param {number} month
   * @returns {number[]}
   */
  findByMonth(month) {
    return [...this.#cards].filter((card) => getCardMonth(card) === month)
  }

  /**
   * Find cards of a specific type
   * @param {CardType} type
   * @returns {number[]}
   */
  findByType(type) {
    return [...this.#cards].filter((card) => getCardType(card) === type)
  }

  /**
   * Find all possible matches for a given card
   * @param {number} cardIndex
   * @returns {number[][]} Array of possible matching combinations
   */
  findMatches(cardIndex) {
    const month = getCardMonth(cardIndex)
    if (!month) return []

    const matchingCards = this.findByMonth(month)
    if (matchingCards.length === 0) return []

    const combinations = []

    // Single card matches
    matchingCards.forEach((card) => {
      combinations.push([card])
    })

    // Three card matches (if all three remaining cards of the month are present)
    if (matchingCards.length === 3) {
      combinations.push(matchingCards)
    }

    return combinations
  }
}
