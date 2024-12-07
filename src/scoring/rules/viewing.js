import { HANAMI, TSUKIMI } from "../yaku/standard/viewing.js"

/**
 * @typedef {Object} ViewingRules
 * @property {string} [weather] Current weather condition
 * @property {boolean} [weatherDependent] Whether viewing yaku are affected by weather
 * @property {boolean} [seasonDependent] Whether viewing yaku are affected by season/month
 */

/**
 * @typedef {Object} ViewingContext
 * @property {number} currentMonth Current month in the game
 * @property {ViewingRules} rules Rule configuration
 */

/**
 * Apply viewing-specific rules to calculate final points
 * @param {string} yakuName
 * @param {number} basePoints
 * @param {ViewingContext} context
 * @param {ViewingRules} rules
 */
const applyViewingRules = (yakuName, basePoints, context, rules) => {
  let points = basePoints

  if (rules.weatherDependent && context?.weather) {
    // Weather penalties
    // November cards on the table are rainy
    if (yakuName === "hanami-zake" && context.weather === "rainy") {
      points = 0 // Rainy weather cancels Hanami
    }
    // December cards on the table are foggy
    if (yakuName === "tsukimi-zake" && context.weather === "foggy") {
      points = 0
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
 * @param {ViewingRules} rules
 */
export const createViewingChecker = (rules = {}) => {
  return (collection, context = null) => {
    const completed = []

    // Check Hanami (Flower Viewing)
    const hanamiPoints = HANAMI.check(collection)
    if (hanamiPoints > 0) {
      const points = applyViewingRules(HANAMI.name, hanamiPoints, context, rules)
      completed.push({ name: HANAMI.name, points })
    }

    // Check Tsukimi (Moon Viewing)
    const tsukimiPoints = TSUKIMI.check(collection)
    if (tsukimiPoints > 0) {
      const points = applyViewingRules(TSUKIMI.name, tsukimiPoints, context, rules)
      completed.push({ name: TSUKIMI.name, points })
    }

    return completed
  }
}

/**
 * Default viewing yaku checker (no special rules)
 */
export const checkViewingYaku = createViewingChecker()
