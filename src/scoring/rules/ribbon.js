import { AKA_TAN, AO_TAN, TAN } from "../yaku/standard/ribbon.js"
import { CardType } from "../../core/cards.js"

/**
 * @typedef {Object} RibbonRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring multiple ribbon yaku
 * @property {number} [extraPoints=1] Points for each additional ribbon beyond 5 for basic ribbon yaku
 * @property {boolean} [requireAllPoetry=false] Whether all poetry ribbons must be present to score aka-tan
 * @property {boolean} [requireAllBlue=false] Whether all blue ribbons must be present to score ao-tan
 */

/**
 * Create a custom ribbon yaku checker with specific rules
 * @param {RibbonRules} rules
 */
export const createRibbonChecker = (rules = {}) => {
  const {
    allowMultiple = true,
    extraPoints = 1,
    requireAllPoetry = false,
    requireAllBlue = false,
  } = rules

  return (collection) => {
    const completed = []

    // Check Poetry Ribbons (aka-tan)
    const akaTanPoints = AKA_TAN.check(collection)
    if (akaTanPoints > 0 || !requireAllPoetry) {
      completed.push({ name: AKA_TAN.name, points: akaTanPoints })
      if (!allowMultiple) return completed
    }

    // Check Blue Ribbons (ao-tan)
    const aoTanPoints = AO_TAN.check(collection)
    if (aoTanPoints > 0 || !requireAllBlue) {
      completed.push({ name: AO_TAN.name, points: aoTanPoints })
      if (!allowMultiple) return completed
    }

    // Check basic Ribbons (tan)
    const basePoints = TAN.check(collection)
    if (basePoints > 0) {
      // Count total ribbons for potential extra points
      let points = basePoints
      if (extraPoints > 0) {
        const ribbonCount = collection.findByType(CardType.RIBBON).length
        if (ribbonCount > 5) {
          points += (ribbonCount - 5) * extraPoints
        }
      }
      completed.push({ name: TAN.name, points })
    }

    return completed
  }
}

/**
 * Default ribbon yaku checker (allows multiple scoring, 1 extra point per additional ribbon)
 */
export const checkRibbonYaku = createRibbonChecker()
