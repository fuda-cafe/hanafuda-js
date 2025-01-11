/**
 * @typedef {import('./cards.js').Card} Card
 */

import { isValidCardIndex } from "./cards.js"

/**
 * Fisher-Yates shuffle algorithm
 * @template T
 * @param {Array<T>} array Array to shuffle
 * @returns {Array<T>} New shuffled array
 */
const shuffle = (array) => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * @typedef {Object} Deck
 * @property {Array<number>} cards Array of card indices
 * @property {() => number|null} draw Draw a card from the deck
 * @property {() => Array<number>} drawMany Draw multiple cards from the deck
 * @property {boolean} isEmpty Check if deck is empty
 * @property {number} size Get number of remaining cards
 * @property {() => void} reset Reset deck to initial state
 */

/**
 * Create a new deck of cards
 * @param {Object} [options]
 * @param {boolean} [options.shuffled=true] Whether to shuffle the deck
 * @param {Array<number>} [options.cards] Initial cards (indices) to use
 * @param {string} [options.fromJSON] JSON string to initialize from
 * @returns {Readonly<Deck>}
 * @throws {Error} If any card index is invalid
 * @throws {Error} If JSON string is invalid
 */
export const createDeck = (options = {}) => {
  const { shuffled = true, cards = Array.from({ length: 48 }, (_, i) => i), fromJSON } = options

  // If JSON string provided, parse it and use those cards
  const initialCards = fromJSON ? JSON.parse(fromJSON) : cards

  // If cards are not an array, throw an error
  if (!Array.isArray(initialCards)) {
    throw new Error(`Invalid cards array from JSON: ${initialCards}`)
  }

  // Validate initial cards
  initialCards.forEach((index, i) => {
    if (!isValidCardIndex(index)) {
      throw new Error(`Invalid card index at position ${i}: ${index}`)
    }
  })

  /**
   * cardArray
   * @private
   * @type {Array<number>}
   */
  let cardArray = shuffled ? shuffle(initialCards) : [...initialCards]

  /**
   * isValidPlacement
   * @private
   * @param {number} cardIndex
   * @returns {boolean}
   * @throws {Error} If card index is invalid
   * @throws {Error} If card is already in deck
   */
  const isValidPlacement = (cardIndex) => {
    if (!isValidCardIndex(cardIndex)) {
      throw new Error(`Invalid card index: ${cardIndex}`)
    }
    if (cardArray.includes(cardIndex)) {
      throw new Error(`Card ${cardIndex} already in deck`)
    }
    return true
  }

  return Object.freeze({
    /**
     * Make deck iterable
     * @returns {Iterator<number>}
     */
    [Symbol.iterator]() {
      return cardArray[Symbol.iterator]()
    },

    /**
     * Current cards in deck
     * @returns {Array<number>}
     */
    get cards() {
      return [...cardArray]
    },

    /**
     * Draw a single card from the deck
     * @returns {number|null} Card index or null if deck is empty
     */
    draw() {
      return cardArray.length > 0 ? cardArray.pop() : null
    },

    /**
     * Draw multiple cards from the deck
     * @param {number} [count=8] Number of cards to draw
     * @returns {Array<number>} Array of card indices
     */
    drawMany(count = 8) {
      const drawn = []
      for (let i = 0; i < count && cardArray.length > 0; i++) {
        drawn.push(cardArray.pop())
      }
      return drawn
    },

    /**
     * Add a card to the deck
     * @param {number} cardIndex
     */
    placeOnTop(cardIndex) {
      if (isValidPlacement(cardIndex)) {
        cardArray.push(cardIndex)
      }
    },

    /**
     * Add a card to the deck
     * @param {number} cardIndex
     */
    placeOnBottom(cardIndex) {
      if (isValidPlacement(cardIndex)) {
        cardArray.unshift(cardIndex)
      }
    },

    /**
     * Reshuffle current deck
     */
    reshuffle() {
      cardArray = shuffle(cardArray)
    },

    /**
     * Check if deck is empty
     * @returns {boolean}
     */
    get isEmpty() {
      return cardArray.length === 0
    },

    /**
     * Get number of remaining cards
     * @returns {number}
     */
    get size() {
      return cardArray.length
    },

    /**
     * Reset deck to initial state
     */
    reset() {
      cardArray = shuffled ? shuffle(cards) : [...cards]
    },

    /**
     * Get string representation of deck
     * @returns {string}
     */
    toString() {
      return `Deck(${cardArray.join(", ")})`
    },

    /**
     * Custom inspection for console.log
     * @returns {string}
     */
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.toString()
    },

    /**
     * Get JSON representation of deck
     * @returns {string}
     */
    toJSON() {
      return this.cards
    },
  })
}

/**
 * Create a standard shuffled Hanafuda deck
 * @returns {Readonly<Deck>}
 */
export const createStandardDeck = () => createDeck({ shuffled: true })
