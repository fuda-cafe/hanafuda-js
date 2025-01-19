import { TESHI, KUTTSUKI } from "../yaku/standard/hand.ts"
import { getCard } from "../../core/cards.ts"
import type { Collection } from "../../core/types.ts"
import type { ScoringContext, ScoringManager, YakuResult } from "../types.ts"

/**
 * Create a hand yaku checker
 */
export const createHandChecker = (): ScoringManager => {
  /**
   * Check hand yaku
   */
  return (collection: Collection, context: ScoringContext = {}): YakuResult[] => {
    // Only check hand yaku if explicitly requested via context
    if (!context?.checkTeyaku) return []

    // Verify we have exactly 8 cards (initial hand size)
    if (collection.size !== 8) return []

    // Count cards by month
    const monthCounts = new Map()
    for (const cardIndex of collection) {
      const card = getCard(cardIndex)
      if (!card) continue

      const month = card.month
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
    }

    // Check for teshi (four of a kind)
    const hasTeshi = [...monthCounts.values()].some((count) => count === 4)
    if (hasTeshi) {
      return [{ name: TESHI.name, points: TESHI.points }]
    }

    // Check for kuttsuki (four pairs)
    const hasKuttsuki = [...monthCounts.values()].every((count) => count === 2)
    if (hasKuttsuki) {
      return [{ name: KUTTSUKI.name, points: KUTTSUKI.points }]
    }

    return []
  }
}

/**
 * Default hand yaku checker
 */
export const checkHandYaku: ScoringManager = createHandChecker()
