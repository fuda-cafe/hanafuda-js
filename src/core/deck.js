/**
 * @typedef {import('./types.js').Card} Card
 */

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
 * @property {() => boolean} isEmpty Check if deck is empty
 * @property {() => number} size Get number of remaining cards
 */

/**
 * Create a new deck of cards
 * @param {Object} [options]
 * @param {boolean} [options.shuffled=true] Whether to shuffle the deck
 * @param {Array<number>} [options.cards] Initial cards (indices) to use
 * @returns {Readonly<Deck>}
 */
export const createDeck = (options = {}) => {
  const { shuffled = true, cards = Array.from({ length: 48 }, (_, i) => i) } = options

  let cardArray = shuffled ? shuffle(cards) : [...cards]

  return Object.freeze({
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
  })
}

/**
 * Create a standard shuffled Hanafuda deck
 * @returns {Readonly<Deck>}
 */
export const createStandardDeck = () => createDeck({ shuffled: true })
