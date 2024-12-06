import { CardType } from "../cards.js"

/**
 * @typedef {Object} Yaku
 * @property {string} name - Name of the yaku
 * @property {number} value - Point value of the yaku
 * @property {number[]} cards - Cards that form the yaku
 */

export class BaseScoring {
  /**
   * Calculate score for a collection of cards
   * @param {import('../collection.js').CardCollection} collection
   * @returns {number}
   */
  calculateScore(collection) {
    throw new Error("calculateScore must be implemented by subclass")
  }

  /**
   * Find all yaku in a collection of cards
   * @param {import('../collection.js').CardCollection} collection
   * @returns {Yaku[]}
   */
  findYaku(collection) {
    throw new Error("findYaku must be implemented by subclass")
  }

  /**
   * Count cards of a specific type in a collection
   * @param {import('../collection.js').CardCollection} collection
   * @param {CardType} type
   * @returns {number}
   */
  countCardType(collection, type) {
    return collection.findByType(type).length
  }

  /**
   * Check if a collection contains all specified cards
   * @param {import('../collection.js').CardCollection} collection
   * @param {number[]} requiredCards
   * @returns {boolean}
   */
  hasAllCards(collection, requiredCards) {
    return requiredCards.every((card) => collection.contains(card))
  }

  /**
   * Check if a collection contains any of the specified cards
   * @param {import('../collection.js').CardCollection} collection
   * @param {number[]} cards
   * @returns {boolean}
   */
  hasAnyCards(collection, cards) {
    return cards.some((card) => collection.contains(card))
  }

  /**
   * Get all cards of specific types from a collection
   * @param {import('../collection.js').CardCollection} collection
   * @param {CardType[]} types
   * @returns {number[]}
   */
  getCardsByTypes(collection, types) {
    return types.flatMap((type) => collection.findByType(type))
  }
}
