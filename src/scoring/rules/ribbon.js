import { AKA_TAN, AO_TAN, TAN } from "../yaku/standard/ribbon.js"
import { CardType } from "../../core/cards.js"

/**
 * @typedef {import('./types.js').RibbonRules} RibbonRules
 */

/**
 * Create a custom ribbon yaku checker with specific rules
 * @param {RibbonRules} [rules={}]
 */
export const createRibbonChecker = (rules = {}) => {
  const { allowMultiple = true, extraPoints = 1 } = rules

  return (collection) => {
    const completed = []

    // Check Poetry Ribbons (aka-tan)
    const akaTanPoints = AKA_TAN.check(collection)
    if (akaTanPoints > 0) {
      completed.push({ name: AKA_TAN.name, points: akaTanPoints })
      if (!allowMultiple) return completed
    }

    // Check Blue Ribbons (ao-tan)
    const aoTanPoints = AO_TAN.check(collection)
    if (aoTanPoints > 0) {
      completed.push({ name: AO_TAN.name, points: aoTanPoints })
      if (!allowMultiple) return completed
    }

    // Check basic Ribbons (tan)
    const basePoints = TAN.check(collection)
    if (basePoints > 0) {
      // Calculate extra points for additional ribbons
      const ribbonCount = collection.findByType(CardType.RIBBON).length
      const extraRibbonPoints = Math.max(0, ribbonCount - 5) * extraPoints

      completed.push({
        name: TAN.name,
        points: basePoints + extraRibbonPoints,
      })
    }

    return completed
  }
}

/**
 * Default ribbon yaku checker (allows multiple scoring, 1 extra point per additional ribbon)
 */
export const checkRibbonYaku = createRibbonChecker()
