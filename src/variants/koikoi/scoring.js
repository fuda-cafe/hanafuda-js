import { BaseScoring } from "../../scoring/base.js"
import { getCompleteYaku } from "../../scoring/yaku/registry.js"
import { DEFAULT_RULES, createRuleConfig } from "../../scoring/rules.js"
/** @typedef {import("../../scoring/rules.js").RuleConfig} RuleConfig */

/** @typedef RoundResult */

export class KoiKoiScoring extends BaseScoring {
  /** @type {RuleConfig} */
  #rules

  /**
   * @param {Partial<RuleConfig>} [customRules]
   */
  constructor(customRules = {}) {
    super()
    this.#rules = createRuleConfig(customRules)
  }

  /**
   * Calculate score for a collection of cards in Koi-Koi rules
   * @param {import('../../collection.js').CardCollection} collection
   * @param {Omit<import('../../scoring/yaku/base.js').YakuContext, 'rules'>} [context]
   * @returns {number}
   */
  calculateScore(collection, context = null) {
    const yakuContext = context ? { ...context, rules: this.#rules } : { rules: this.#rules }
    const completeYaku = getCompleteYaku(collection, yakuContext)
    return completeYaku.reduce((total, { points }) => total + points, 0)
  }

  /**
   * Find all yaku in a collection of cards according to Koi-Koi rules
   * @param {import('../../collection.js').CardCollection} collection
   * @param {Omit<import('../../scoring/yaku/base.js').YakuContext, 'rules'>} [context]
   * @returns {import('../../scoring/base.js').Yaku[]}
   */
  findYaku(collection, context = null) {
    const yakuContext = context ? { ...context, rules: this.#rules } : { rules: this.#rules }
    return getCompleteYaku(collection, yakuContext).map(({ name, points }) => ({
      name,
      value: points,
      cards: [],
    }))
  }

  /**
   * Get the current rule configuration
   * @returns {Readonly<RuleConfig>}
   */
  get rules() {
    return Object.freeze({ ...this.#rules })
  }

  /**
   * Update the rule configuration
   * @param {Partial<RuleConfig>} newRules
   */
  updateRules(newRules) {
    this.#rules = createRuleConfig(newRules)
  }
}
