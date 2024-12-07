/**
 * @typedef {'ANIMAL_ONLY'|'CHAFF_ONLY'|'BOTH'} SakeCupMode
 */

/**
 * @typedef {Object} BrightRules
 * @property {boolean} [allowMultiple=false] Whether to allow scoring multiple bright yaku
 * @property {boolean} [requireRainMan=false] Whether Rain-man is required for 4-bright yaku
 */

/**
 * @typedef {Object} AnimalRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring both Ino-Shika-Chou and Tane
 * @property {number} [extraPoints=1] Points for each additional animal beyond base requirement
 * @property {SakeCupMode} [sakeCupMode='ANIMAL_ONLY'] How to count the sake cup
 */

/**
 * @typedef {Object} RibbonRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring multiple ribbon yaku
 * @property {number} [extraPoints=1] Points for each additional ribbon beyond 5
 * @property {boolean} [requireAllPoetry=false] Whether all poetry ribbons must be present
 * @property {boolean} [requireAllBlue=false] Whether all blue ribbons must be present
 */

/**
 * @typedef {Object} ViewingRules
 * @property {boolean} [weatherDependent=false] Whether viewing yaku are affected by weather
 * @property {boolean} [seasonDependent=false] Whether viewing yaku are affected by season
 */

/**
 * @typedef {Object} ChaffRules
 * @property {number} [extraPoints=1] Points for each additional chaff beyond 10
 */

/**
 * @typedef {Object} MonthRules
 * @property {boolean} [allowMultipleMonths=false] Whether to allow scoring tsuki-fuda for multiple months
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
