/**
 * @typedef {'gokou'|'shikou'|'ame-shikou'|'sankou'|'hanami-zake'|'tsukimi-zake'|
 *           'ino-shika-chou'|'aka-tan'|'ao-tan'|'tan-zaku'|'tane-zaku'|'kasu'|
 *           'kuttsuki'|'teshi'|'tsuki-fuda'} YakuName
 */

/**
 * @typedef {Object} YakuContext
 * @property {number} currentMonth - Current month in the game (for tsuki-fuda yaku)
 * @property {import('../rules.js').RuleConfig} rules - Rule configuration
 * @property {Array<{name: YakuName, points: number}>} [completedYaku] - List of already completed yaku
 * @property {import('../../collection.js').CardCollection} [tableCards] - Cards currently on the table
 * @property {number[]} [selectedSakeCupTypes] - Card types the sake cup is being counted as (for CHOOSE_ONE mode)
 */

export class BaseYaku {
  /** @type {YakuName} */
  #name
  /** @type {string[]} */
  #description
  /** @type {number} */
  #points
  /** @type {number[]} */
  #requiredCards
  /** @type {number} */
  #numRequired

  /**
   * @param {YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {number[]} requiredCards
   * @param {number} numRequired
   */
  constructor(name, description, points, requiredCards, numRequired) {
    this.#name = name
    this.#description = description
    this.#points = points
    this.#requiredCards = requiredCards
    this.#numRequired = numRequired
  }

  /**
   * Check if the yaku is complete in the given collection
   * @param {import('../../collection.js').CardCollection} collection
   * @param {YakuContext} [context]
   * @returns {number} Points earned (0 if yaku is not complete)
   */
  check(collection, context = null) {
    if (collection.size < this.#numRequired) return 0
    const progress = this.find(collection)
    if (progress.length < this.#numRequired) return 0
    return this.#points
  }

  /**
   * Find all cards in the collection that contribute to this yaku
   * @param {import('../../collection.js').CardCollection} collection
   * @returns {number[]}
   */
  find(collection) {
    return this.#requiredCards.filter((card) => collection.contains(card))
  }

  // Getters
  get name() {
    return this.#name
  }
  get description() {
    return this.#description
  }
  get points() {
    return this.#points
  }
  get requiredCards() {
    return [...this.#requiredCards]
  }
  get numRequired() {
    return this.#numRequired
  }
}
