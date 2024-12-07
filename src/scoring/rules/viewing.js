import { HANAMI, TSUKIMI } from "../yaku/standard/viewing.js"

/**
 * @typedef {import('./types.js').ViewingRules} ViewingRules
 */

/**
 * Check if a viewing yaku is in its appropriate season
 * @param {string} yakuName
 * @param {number} month
 * @returns {boolean}
 */
const isInSeason = (yakuName, month) => {
  return (
    (yakuName === "hanami-zake" && month === 3) || // Cherry Blossom season
    (yakuName === "tsukimi-zake" && month === 8) // Moon Viewing season
  )
}

/**
 * Check if there are any non-viewing yaku completed
 * @param {Array<{name: string}>} completedYaku
 * @returns {boolean}
 */
const hasNonViewingYaku = (completedYaku) => {
  return completedYaku.some((yaku) => yaku.name !== "hanami-zake" && yaku.name !== "tsukimi-zake")
}

/**
 * Apply viewing-specific rules to calculate final points
 * @param {string} yakuName
 * @param {number} basePoints
 * @param {Object} context
 * @param {ViewingRules} rules
 */
const applyViewingRules = (yakuName, basePoints, context, rules) => {
  let points = basePoints

  // Early return if viewing yaku are disabled
  if (rules.mode === "NEVER") {
    return 0
  }

  // Early return if viewing yaku are limited and no other non-viewing yaku exist
  if (rules.mode === "LIMITED") {
    if (!context?.completedYaku || !hasNonViewingYaku(context.completedYaku)) {
      return 0
    }
  }

  // Early return if yaku is restricted to its season
  if (rules.seasonalOnly && context?.currentMonth) {
    if (!isInSeason(yakuName, context.currentMonth)) {
      return 0 // Cancel yaku outside its season
    }
  }

  if (rules.weatherDependent && context?.weather) {
    // Weather penalties
    if (yakuName === "hanami-zake" && context.weather === "rainy") {
      return 0 // Rainy weather cancels Hanami
    }
    if (yakuName === "tsukimi-zake" && context.weather === "foggy") {
      return 0 // Foggy weather cancels Tsukimi
    }
  }

  if (rules.seasonalBonus && context?.currentMonth) {
    // Season bonuses
    if (isInSeason(yakuName, context.currentMonth)) {
      points *= 2 // Double points during appropriate season
    }
  }

  return points
}

/**
 * Create a custom viewing yaku checker with specific rules
 * @param {ViewingRules} [rules={}]
 */
export const createViewingChecker = (rules = {}) => {
  const {
    mode = "ALWAYS",
    weatherDependent = false,
    seasonalBonus = false,
    seasonalOnly = false,
  } = rules

  return (collection, context = null) => {
    const completed = []

    // Early return if viewing yaku are disabled
    if (mode === "NEVER") {
      return completed
    }

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
