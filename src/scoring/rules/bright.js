import { GOKOU, SHIKOU, AME_SHIKOU, SANKOU } from "../yaku/standard/bright.js"

/**
 * @typedef {Object} BrightRules
 * @property {boolean} [allowMultiple=false] Whether to allow scoring multiple bright yaku
 * @property {boolean} [requireRainMan=false] Whether Rain-man is required for 4-bright yaku
 */

/**
 * Order of precedence for bright yaku (highest to lowest)
 */
const BRIGHT_PRECEDENCE = [GOKOU, SHIKOU, AME_SHIKOU, SANKOU]

/**
 * Create a custom bright yaku checker with specific rules
 * @param {BrightRules} rules
 */
export const createBrightChecker = (rules = {}) => {
  const { allowMultiple = false, requireRainMan = false } = rules

  return (collection, context = null) => {
    const completed = []

    for (const yaku of BRIGHT_PRECEDENCE) {
      // Skip Shikou if Rain-man is required
      if (requireRainMan && yaku === SHIKOU) continue

      const points = yaku.check(collection)
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
