import { HANAMI, TSUKIMI } from "../yaku/standard/viewing.js"

/**
 * @typedef {import('./types.js').ViewingRules} ViewingRules
 */

/**
 * Apply viewing-specific rules to calculate final points
 * @param {string} yakuName
 * @param {number} basePoints
 * @param {Object} context
 * @param {ViewingRules} rules
 */
const applyViewingRules = (yakuName, basePoints, context, rules) => {
  let points = basePoints

  if (rules.weatherDependent && context?.weather) {
    // Weather penalties
    if (yakuName === "hanami-zake" && context.weather === "rainy") {
      points = 0 // Rainy weather cancels Hanami
    }
    if (yakuName === "tsukimi-zake" && context.weather === "foggy") {
      points = 0 // Foggy weather cancels Tsukimi
    }
  }

  if (rules.seasonDependent && context?.currentMonth) {
    // Season bonuses
    if (yakuName === "hanami-zake" && context.currentMonth === 3) {
      points *= 2 // Double points during Cherry Blossom season
    }
    if (yakuName === "tsukimi-zake" && context.currentMonth === 8) {
      points *= 2 // Double points during Moon Viewing season
    }
  }

  return points
}

/**
 * Create a custom viewing yaku checker with specific rules
 * @param {ViewingRules} [rules={}]
 */
export const createViewingChecker = (rules = {}) => {
  return (collection, context = null) => {
    const completed = []

    // Check Hanami (Flower Viewing)
    const hanamiPoints = HANAMI.check(collection)
    if (hanamiPoints > 0) {
      const points = applyViewingRules("hanami-zake", hanamiPoints, context, rules)
      if (points > 0) {
        completed.push({ name: HANAMI.name, points })
      }
    }

    // Check Tsukimi (Moon Viewing)
    const tsukimiPoints = TSUKIMI.check(collection)
    if (tsukimiPoints > 0) {
      const points = applyViewingRules("tsukimi-zake", tsukimiPoints, context, rules)
      if (points > 0) {
        completed.push({ name: TSUKIMI.name, points })
      }
    }

    return completed
  }
}

/**
 * Default viewing yaku checker (no special rules)
 */
export const checkViewingYaku = createViewingChecker()
