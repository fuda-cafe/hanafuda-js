/**
 * @typedef {import('./types.js').YakuName} YakuName
 * @typedef {import('./types.js').YakuDefinition} YakuDefinition
 * @typedef {import('./types.js').CardPattern} CardPattern
 */

import { getCard } from "../../core/cards.js"

/**
 * Check if a card matches a pattern
 * @param {number} cardIndex
 * @param {CardPattern} pattern
 * @returns {boolean}
 */
const matchesPattern = (cardIndex, pattern) => {
  const card = getCard(cardIndex)
  if (!card) return false

  if (pattern.id && card.id !== pattern.id) return false
  if (pattern.type && card.type !== pattern.type) return false
  if (pattern.flower && card.flower !== pattern.flower) return false
  if (pattern.month && card.month !== pattern.month) return false

  return true
}

/**
 * Find all cards in a collection that match a pattern
 * @param {import('../../core/collection.js').CardCollection} collection
 * @param {CardPattern} pattern
 * @returns {number[]}
 */
const findMatches = (collection, pattern) => {
  const matches = []
  for (const cardIndex of collection) {
    if (matchesPattern(cardIndex, pattern)) {
      matches.push(cardIndex)
    }
  }
  return matches
}

/**
 * Create a new yaku definition
 * @param {YakuDefinition} definition
 * @returns {YakuDefinition & { check: (collection: import('../../core/collection.js').Collection) => number }}
 */
export const defineYaku = (definition) => {
  // Validate the definition
  if (!definition.name || !definition.description || !definition.points || !definition.pattern) {
    throw new Error("Invalid yaku definition")
  }

  return {
    ...definition,
    /**
     * Check if the yaku pattern is matched in the given collection
     * @param {import('../../core/collection.js').Collection} collection
     * @returns {number} Base points earned (0 if pattern is not matched)
     */
    check(collection) {
      // Early return if collection is too small
      const minRequired = definition.pattern.cards.reduce(
        (sum, pattern) => sum + (pattern.count || 1),
        0
      )
      if (collection.size < minRequired) return 0

      // Check each card pattern
      for (const pattern of definition.pattern.cards) {
        const matches = findMatches(collection, pattern)
        if (matches.length < (pattern.count || 1)) return 0
      }

      return definition.points
    },
  }
}
