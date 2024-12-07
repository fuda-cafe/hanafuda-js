import { createCollection } from "../../core/collection.js"
import { GOKOU, SHIKOU, AME_SHIKOU, SANKOU } from "../yaku/standard/bright.js"

/**
 * @typedef {import('./types.js').BrightRules} BrightRules
 */

/**
 * Order of precedence for bright yaku (highest to lowest)
 */
const BRIGHT_PRECEDENCE = [GOKOU, SHIKOU, AME_SHIKOU, SANKOU]

/**
 * Rain-man card index
 */
const RAIN_MAN = 40

/**
 * Create a custom bright yaku checker with specific rules
 * @param {BrightRules} [rules={}]
 */
export const createBrightChecker = (rules = {}) => {
  const { allowMultiple = false } = rules

  /**
   * Check bright yaku for a collection of cards
   * @param {import('../../core/collection.js').Collection} collection
   */
  return (collection) => {
    const completed = []

    for (const yaku of BRIGHT_PRECEDENCE) {
      console.debug(`Checking ${yaku.name} with ${collection.size()} cards`)
      let effectiveCollection = collection
      if (yaku === SHIKOU) {
        effectiveCollection = createCollection({ cards: Array.from(collection) })
        effectiveCollection.remove(RAIN_MAN) // Remove Rain-man
        console.debug("Removed Rain-man")
      }
      console.debug({ effectiveCollection: Array.from(effectiveCollection) })
      const points = yaku.check(effectiveCollection)
      if (points > 0) {
        completed.push({ name: yaku.name, points })
        // Break after first match unless multiple scoring is allowed
        if (!allowMultiple) break
      }
    }

    return completed
  }
}

/**
 * Default bright yaku checker (no special rules)
 */
export const checkBrightYaku = createBrightChecker()
