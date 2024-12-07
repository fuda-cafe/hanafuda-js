/**
 * @typedef {'gokou'|'shikou'|'ame-shikou'|'sankou'|'hanami-zake'|'tsukimi-zake'|
 *           'ino-shika-chou'|'aka-tan'|'ao-tan'|'tan-zaku'|'tane-zaku'|'kasu'|
 *           'kuttsuki'|'teshi'|'tsuki-fuda'} YakuName
 */

/**
 * @typedef {Object} CardPattern
 * @property {string} [id] Specific card ID to match
 * @property {import('../../core/types.js').CardType} [type] Card type to match
 * @property {import('../../core/types.js').FlowerType} [flower] Flower type to match
 * @property {number} [month] Month to match
 * @property {number} [count] Number of cards required (for type/flower/month matches)
 */

/**
 * @typedef {Object} RuleModifier
 * @property {string} condition Condition that affects the yaku
 * @property {number} [multiplier] Point multiplier when condition is met
 * @property {boolean} [required] Whether the condition is required for the yaku
 */

/**
 * @typedef {Object} YakuPattern
 * @property {CardPattern[]} cards Cards required for the yaku
 * @property {Object.<string, RuleModifier>} [rules] Rule-specific modifiers
 */

/**
 * @typedef {Object} YakuDefinition
 * @property {YakuName} name Unique identifier for the yaku
 * @property {string[]} description Human-readable description
 * @property {number} points Base points for completing the yaku
 * @property {YakuPattern} pattern Pattern that defines the yaku
 */

/**
 * @typedef {Object} YakuContext
 * @property {number} currentMonth Current month in the game (for tsuki-fuda yaku)
 * @property {RuleModifier[]} rules Rule modifiers
 * @property {Array<{name: YakuName, points: number}>} [completedYaku] List of already completed yaku
 * @property {import('../../core/collection.js').Collection} [tableCards] Cards on the table
 * @property {boolean} [checkTeyaku] Whether to check for hand yaku (teshi/kuttsuki)
 */

export {}
