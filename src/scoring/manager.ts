import { createBrightChecker } from "./rules/bright.ts"
import { createAnimalChecker } from "./rules/animal.ts"
import { createRibbonChecker } from "./rules/ribbon.ts"
import { createViewingChecker } from "./rules/viewing.ts"
import { createChaffChecker } from "./rules/chaff.ts"
import { createMonthChecker } from "./rules/month.ts"
import { createHandChecker } from "./rules/hand.ts"
import type { RuleConfig, ScoringContext, YakuResult, ScoringManager } from "./types.ts"
import { Collection } from "../core/types.ts"

/**
 * Validate rule configuration
 * @throws {Error} If rule configuration is invalid
 */
const validateRuleConfig = (config: RuleConfig) => {
  // Add validation logic here as rules become more complex
  // For now, all rule combinations are valid
}

/**
 * Create a scoring manager with the given rule configuration
 */
export const createScoringManager = (config: RuleConfig = {}): ScoringManager => {
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
   */
  return (collection: Collection, context: ScoringContext = {}): YakuResult[] => {
    // If checking teyaku, only check hand yaku and return
    // This is for initial hand check only
    if (context.checkTeyaku) {
      return handChecker(collection, { checkTeyaku: true })
    }

    // For captured cards, check all standard yaku
    const completed: YakuResult[] = []
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
 */
export const KOIKOI_RULES: RuleConfig = {
  bright: { allowMultiple: false },
  animal: { countSakeCup: true, allowMultiple: true },
  ribbon: { allowMultiple: true },
  viewing: { weatherDependent: true, seasonalBonus: true, seasonalOnly: true },
  chaff: { extraPoints: 1 },
  month: { allowMultipleMonths: false },
}

/**
 * Hachi-Hachi rules variant
 */
export const HACHI_RULES: RuleConfig = {
  bright: { allowMultiple: true },
  animal: { countSakeCup: false, allowMultiple: false },
  ribbon: { allowMultiple: false },
  viewing: { weatherDependent: false, seasonalBonus: false, seasonalOnly: false },
  chaff: { extraPoints: 0 },
  month: { allowMultipleMonths: true },
}
