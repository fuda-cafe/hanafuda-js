import { createBrightChecker } from "./rules/bright.js"
import { createAnimalChecker } from "./rules/animal.js"
import { createRibbonChecker } from "./rules/ribbon.js"
import { createViewingChecker } from "./rules/viewing.js"
import { createChaffChecker } from "./rules/chaff.js"
import { createMonthChecker } from "./rules/month.js"
import { createHandChecker } from "./rules/hand.js"

/**
 * @typedef {import('./rules/types.js').RuleConfig} RuleConfig
 * @typedef {import('./yaku/types.js').YakuName} YakuName
 */

/**
 * @typedef {Object} ScoringContext
 * @property {number} [currentMonth] Current month in the game
 * @property {string} [weather] Current weather condition
 * @property {boolean} [checkTeyaku] Whether to check for hand yaku
 */

/**
 * @typedef {Object} YakuResult
 * @property {YakuName} name Name of the completed yaku
 * @property {number} points Points earned
 */

/**
 * Validate rule configuration
 * @param {RuleConfig} config
 * @throws {Error} If rule configuration is invalid
 */
const validateRuleConfig = (config) => {
  // Add validation logic here as rules become more complex
  // For now, all rule combinations are valid
}

/**
 * Create a scoring manager with the given rule configuration
 * @param {RuleConfig} [config={}] Rule configuration
 * @returns {(collection: import('../core/collection.js').Collection, context?: ScoringContext) => YakuResult[]}
 */
export const createScoringManager = (config = {}) => {
  // Validate rule configuration
  validateRuleConfig(config)

  // Create checkers with their respective rule configurations
  const brightChecker = createBrightChecker(config.bright)
  const animalChecker = createAnimalChecker(config.animal)
  const ribbonChecker = createRibbonChecker(config.ribbon)
  const viewingChecker = createViewingChecker(config.viewing)
  const chaffChecker = createChaffChecker(config.chaff)
  const monthChecker = createMonthChecker(config.month)
  const handChecker = createHandChecker()

  /**
   * Score a collection of cards
   * @param {import('../core/collection.js').Collection} collection
   * @param {ScoringContext} [context]
   * @returns {YakuResult[]}
   */
  return (collection, context = {}) => {
    // If checking teyaku, only check hand yaku and return
    // This is for initial hand check only
    if (context.checkTeyaku) {
      return handChecker(collection, { checkTeyaku: true })
    }

    // For captured cards, check all standard yaku
    const completed = []
    completed.push(...brightChecker(collection))
    completed.push(...animalChecker(collection))
    completed.push(...ribbonChecker(collection))
    completed.push(
      ...viewingChecker(collection, {
        weather: context.weather,
        currentMonth: context.currentMonth,
      })
    )
    completed.push(...chaffChecker(collection))
    completed.push(...monthChecker(collection, { currentMonth: context.currentMonth }))

    return completed
  }
}

/**
 * Standard Koi-Koi rules
 * @type {RuleConfig}
 */
export const KOIKOI_RULES = {
  bright: { allowMultiple: false },
  animal: { sakeCupMode: "ANIMAL_ONLY", allowMultiple: true },
  ribbon: { allowMultiple: true },
  viewing: { weatherDependent: true, seasonDependent: true },
  chaff: { extraPoints: 1 },
  month: { allowMultipleMonths: false },
}

/**
 * Hachi-Hachi rules variant
 * @type {RuleConfig}
 */
export const HACHI_RULES = {
  bright: { allowMultiple: true, requireRainMan: true },
  animal: { sakeCupMode: "CHAFF_ONLY", allowMultiple: false },
  ribbon: { allowMultiple: false, requireAllPoetry: true, requireAllBlue: true },
  viewing: { weatherDependent: false, seasonDependent: false },
  chaff: { extraPoints: 0 },
  month: { allowMultipleMonths: true },
}
