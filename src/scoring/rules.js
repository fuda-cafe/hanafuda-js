/**
 * @typedef {'DISABLED' | 'ENABLED' | 'REQUIRES_OTHER_YAKU' | 'WEATHER_DEPENDENT'} ViewingYakuMode
 */

/**
 * @typedef {'BOTH' | 'EITHER' | 'ANIMAL_ONLY' | 'CHAFF_ONLY'} SakeCupMode
 */

/**
 * @typedef {Object} RuleConfig
 * @property {ViewingYakuMode} viewingYakuMode - How viewing-dependent yaku (hanami-zake, tsukimi-zake) are handled
 * @property {SakeCupMode} sakeCupMode - How the sake cup card is counted for animal/chaff yaku
 * @property {boolean} allowMultipleAnimalYaku - Whether tane-zaku can score alongside ino-shika-chou
 * @property {boolean} allowMultipleRibbonYaku - Whether multiple ribbon yaku can score simultaneously
 */

/**
 * Default rule configuration
 * @type {RuleConfig}
 */
export const DEFAULT_RULES = Object.freeze({
  viewingYakuMode: "ENABLED",
  sakeCupMode: "ANIMAL_ONLY",
  allowMultipleAnimalYaku: false,
  allowMultipleRibbonYaku: false,
  allowTeyaku: true,
})

/**
 * Create a rule configuration by merging with default rules
 * @param {Partial<RuleConfig>} customRules
 * @returns {RuleConfig}
 */
export function createRuleConfig(customRules = {}) {
  return {
    ...DEFAULT_RULES,
    ...customRules,
  }
}

/**
 * Validate a rule configuration
 * @param {RuleConfig} rules
 * @returns {string[]} Array of validation errors, empty if valid
 */
export function validateRuleConfig(rules) {
  const errors = []

  // Check required properties
  const requiredProps = [
    "viewingYakuMode",
    "sakeCupMode",
    "allowMultipleAnimalYaku",
    "allowMultipleRibbonYaku",
  ]

  for (const prop of requiredProps) {
    if (!(prop in rules)) {
      errors.push(`Missing required property: ${prop}`)
    }
  }

  // Validate types and values
  if (
    !["DISABLED", "ENABLED", "REQUIRES_OTHER_YAKU", "WEATHER_DEPENDENT"].includes(
      rules.viewingYakuMode
    )
  ) {
    errors.push(
      "viewingYakuMode must be one of: DISABLED, ENABLED, REQUIRES_OTHER_YAKU, WEATHER_DEPENDENT"
    )
  }
  if (!["BOTH", "ANIMAL_ONLY", "CHAFF_ONLY"].includes(rules.sakeCupMode)) {
    errors.push("sakeCupMode must be one of: BOTH, ANIMAL_ONLY, CHAFF_ONLY")
  }
  if (typeof rules.allowMultipleAnimalYaku !== "boolean") {
    errors.push("allowMultipleAnimalYaku must be a boolean")
  }
  if (typeof rules.allowMultipleRibbonYaku !== "boolean") {
    errors.push("allowMultipleRibbonYaku must be a boolean")
  }

  return errors
}
