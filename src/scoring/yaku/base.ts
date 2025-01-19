import { getCard } from "../../core/cards.ts"
import type { Collection } from "../../core/types.ts"
import type { CardPattern, YakuDefinition, YakuInstance } from "./types.ts"

/**
 * Check if a card matches a pattern
 */
const matchesPattern = (cardIndex: number, pattern: CardPattern): boolean => {
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
 */
const findMatches = (collection: Collection, pattern: CardPattern): number[] => {
  const matches: number[] = []
  for (const cardIndex of collection) {
    if (matchesPattern(cardIndex, pattern)) {
      matches.push(cardIndex)
    }
  }
  return matches
}

/**
 * Create a new yaku definition
 */
export const defineYaku = (definition: YakuDefinition): YakuInstance => {
  // Validate the definition
  if (!definition.name || !definition.description || !definition.points || !definition.pattern) {
    throw new Error("Invalid yaku definition")
  }

  return {
    ...definition,
    /**
     * Check if the yaku pattern is matched in the given collection
     * @returns Base points earned (0 if pattern is not matched)
     */
    check(collection: Collection): number {
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
