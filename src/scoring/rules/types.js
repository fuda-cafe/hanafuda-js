/**
 * @typedef {'NEVER'|'LIMITED'|'ALWAYS'} ViewingYakuMode
 * NEVER: Viewing yaku are not recognized
 * LIMITED: Viewing yaku require at least one other non-viewing yaku
 * ALWAYS: Viewing yaku are always recognized (default)
 */

/**
 * @typedef {Object} BrightRules
 * @property {boolean} [allowMultiple=false] Whether to allow scoring multiple bright yaku
 */

/**
 * @typedef {Object} AnimalRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring both Ino-Shika-Chou and Tane
 * @property {number} [extraPoints=1] Points per additional animal
 * @property {boolean} [countSakeCup=true] Whether to count sake cup as animal
 */

/**
 * @typedef {Object} RibbonRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring multiple ribbon yaku
 * @property {number} [extraPoints=1] Points per additional ribbon
 */

/**
 * @typedef {Object} ViewingRules
 * @property {ViewingYakuMode} [mode='ALWAYS'] How to recognize viewing yaku
 * @property {boolean} [weatherDependent=false] Whether viewing yaku are affected by weather
 * @property {boolean} [seasonalBonus=false] Whether to award bonus points during appropriate seasons
 * @property {boolean} [seasonalOnly=false] Whether to restrict yaku to their appropriate seasons
 */

/**
 * @typedef {Object} ChaffRules
 * @property {number} [extraPoints=1] Points per additional chaff
 * @property {boolean} [countSakeCup=false] Whether to count sake cup as chaff
 */

/**
 * @typedef {Object} MonthRules
 * @property {boolean} [allowMultipleMonths=false] Whether to allow scoring multiple month sets
 */

/**
 * @typedef {Object} RuleConfig
 * @property {BrightRules} [bright] Bright yaku rules
 * @property {AnimalRules} [animal] Animal yaku rules
 * @property {RibbonRules} [ribbon] Ribbon yaku rules
 * @property {ViewingRules} [viewing] Viewing yaku rules
 * @property {ChaffRules} [chaff] Chaff yaku rules
 * @property {MonthRules} [month] Month yaku rules
 */

export {}
