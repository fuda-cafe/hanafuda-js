import { KASU } from "../yaku/standard/chaff.js"
import { CardType } from "../../core/cards.js"

/**
 * @typedef {import('./types.js').ChaffRules} ChaffRules
 */

/**
 * Create a custom chaff yaku checker with specific rules
 * @param {ChaffRules} [rules={}]
 */
export const createChaffChecker = (rules = {}) => {
  const { extraPoints = 1 } = rules

  return (collection) => {
    const completed = []

    const basePoints = KASU.check(collection)
    if (basePoints > 0) {
      // Calculate extra points for additional chaff cards
      const chaffCount = collection.findByType(CardType.CHAFF).length
      const extraChaffPoints = Math.max(0, chaffCount - 10) * extraPoints

      completed.push({
        name: KASU.name,
        points: basePoints + extraChaffPoints,
      })
    }

    return completed
  }
}

/**
 * Default chaff yaku checker (1 extra point per chaff beyond 10)
 */
export const checkChaffYaku = createChaffChecker()
