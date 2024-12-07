import { KASU } from "../yaku/standard/chaff.js"
import { CardType } from "../../core/cards.js"

/**
 * @typedef {Object} ChaffRules
 * @property {number} [extraPoints=1] Points for each additional chaff beyond 10
 */

/**
 * Create a custom chaff yaku checker with specific rules
 * @param {ChaffRules} rules
 */
export const createChaffChecker = (rules = {}) => {
  const { extraPoints = 1 } = rules

  return (collection) => {
    const completed = []

    const basePoints = KASU.check(collection)
    if (basePoints > 0) {
      let points = basePoints
      if (extraPoints > 0) {
        const chaffCount = collection.findByType(CardType.CHAFF).length
        if (chaffCount > 10) {
          points += (chaffCount - 10) * extraPoints
        }
      }
      completed.push({ name: KASU.name, points })
    }

    return completed
  }
}

/**
 * Default chaff yaku checker (1 extra point per chaff beyond 10)
 */
export const checkChaffYaku = createChaffChecker()
