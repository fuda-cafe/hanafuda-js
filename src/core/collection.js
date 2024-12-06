import { getCard, isValidCardIndex } from "./cards.js"

/**
 * @typedef {import('./types.js').Card} Card
 */

/**
 * Advantages of Set for card collections:
 * 1. Automatic deduplication (can't have same card twice)
 * 2. O(1) lookup, add, remove operations
 * 3. Built-in size tracking
 * 4. Easy to check card existence
 * 5. Memory efficient for storing primitives (indices)
 */

/**
 * @typedef {Object} Collection
 * @property {(card: number) => boolean} has Check if collection has card
 * @property {(card: number) => boolean} add Add card to collection
 * @property {(cards: Array<number>) => number} addMany Add multiple cards to collection
 * @property {(card: number) => boolean} remove Remove card from collection
 * @property {(cards: Array<number>) => number} removeMany Remove multiple cards from collection
 * @property {() => number} size Get collection size
 * @property {() => void} clear Clear all cards
 * @property {() => Iterator<number>} [Symbol.iterator] Iterator implementation
 */

/**
 * Create a new card collection
 * @param {Object} [options]
 * @param {Array<number>} [options.cards=[]] Initial cards (indices)
 * @returns {Readonly<Collection>}
 * @throws {Error} If any card index is invalid
 */
export const createCollection = (options = {}) => {
  const { cards = [] } = options
  // Validate initial cards
  cards.forEach((index, i) => {
    if (!isValidCardIndex(index)) {
      throw new Error(`Invalid card index at position ${i}: ${index}`)
    }
  })
  const cardSet = new Set(cards)

  return Object.freeze({
    /**
     * Make collection iterable
     * @returns {Iterator<number>}
     */
    [Symbol.iterator]() {
      return cardSet.values()
    },

    /**
     * Check if collection has card
     * @param {number} cardIndex
     * @returns {boolean}
     */
    has(cardIndex) {
      return cardSet.has(cardIndex)
    },

    /**
     * Add card to collection
     * @param {number} cardIndex
     * @returns {boolean} Whether card was added
     * @throws {Error} If card index is invalid
     */
    add(cardIndex) {
      if (!isValidCardIndex(cardIndex)) {
        throw new Error(`Invalid card index: ${cardIndex}`)
      }
      const size = cardSet.size
      cardSet.add(cardIndex)
      return cardSet.size > size
    },

    /**
     * Add multiple cards to collection
     * @param {Array<number>} cardIndices
     * @returns {number} Number of cards actually added
     * @throws {Error} If any card index is invalid
     */
    addMany(cardIndices) {
      cardIndices.forEach((index, i) => {
        if (!isValidCardIndex(index)) {
          throw new Error(`Invalid card index at position ${i}: ${index}`)
        }
      })
      const initialSize = cardSet.size
      cardIndices.forEach((index) => cardSet.add(index))
      return cardSet.size - initialSize
    },

    /**
     * Remove card from collection
     * @param {number} cardIndex
     * @returns {boolean} Whether card was removed
     */
    remove(cardIndex) {
      return cardSet.delete(cardIndex)
    },

    /**
     * Remove multiple cards from collection
     * @param {Array<number>} cardIndices
     * @returns {number} Number of cards actually removed
     */
    removeMany(cardIndices) {
      const initialSize = cardSet.size
      cardIndices.forEach((index) => cardSet.delete(index))
      return initialSize - cardSet.size
    },

    /**
     * Find cards of a specific type in the collection
     * @param {import('./cards.js').CardType} type
     * @returns {Array<number>}
     */
    findByType(type) {
      return Array.from(this).filter((index) => {
        const card = getCard(index)
        return card && card.type === type
      })
    },

    /**
     * Find cards from a specific month in the collection
     * @param {number} month
     * @returns {Array<number>}
     */
    findByMonth(month) {
      return Array.from(this).filter((index) => {
        const card = getCard(index)
        return card && card.month === month
      })
    },

    /**
     * Get collection size
     * @returns {number}
     */
    size() {
      return cardSet.size
    },

    /**
     * Clear all cards
     */
    clear() {
      cardSet.clear()
    },
  })
}
