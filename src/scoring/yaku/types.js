import { BaseYaku } from "./base.js"
import {
  BOAR,
  BRIGHT_CARDS,
  BUTTERFLY,
  CardType,
  DEER,
  getCardMonth,
  SAKE_CUP,
  POETRY_RIBBONS,
  BLUE_RIBBONS,
} from "../../cards.js"

/**
 * Yaku that gives extra points for additional matches beyond the required number
 */
export class ExtraPointsYaku extends BaseYaku {
  /** @type {number} */
  #extraPoints

  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {number[]} requiredCards
   * @param {number} numRequired
   * @param {number} extraPoints
   */
  constructor(name, description, points, requiredCards, numRequired, extraPoints) {
    super(name, description, points, requiredCards, numRequired)
    this.#extraPoints = extraPoints
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} [context]
   * @returns {number}
   */
  check(collection, context = null) {
    const progress = this.find(collection)
    if (progress.length < this.numRequired) return 0

    let totalPoints = this.points
    if (progress.length > this.numRequired) {
      totalPoints += this.#extraPoints * (progress.length - this.numRequired)
    }

    return totalPoints
  }
}

/**
 * Animal Yaku with precedence rules and extra points for additional animals
 */
export class AnimalYaku extends BaseYaku {
  /** @type {boolean} */
  #isInoShikaChou

  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {number[]} requiredCards
   * @param {number} numRequired
   */
  constructor(name, description, points, requiredCards, numRequired) {
    super(name, description, points, requiredCards, numRequired)
    this.#isInoShikaChou = name === "ino-shika-chou"
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} [context]
   * @returns {number}
   */
  check(collection, context = null) {
    const progress = this.find(collection)
    if (progress.length < this.numRequired) return 0

    // Handle sake cup counting rules
    const sakeCupMode = context?.rules.sakeCupMode ?? "ANIMAL_ONLY"
    const hasSakeCup = collection.contains(SAKE_CUP)
    const sakeCupIsChaff = sakeCupMode === "CHAFF_ONLY"

    // Calculate extra points for additional animals
    const extraPoints = Math.max(
      0,
      progress.length - this.numRequired - Number(hasSakeCup && sakeCupIsChaff)
    )

    // If this is tane-zaku and ino-shika-chou is present, only score if multiple animal yaku are allowed
    if (!this.#isInoShikaChou) {
      const hasInoShikaChou = [BOAR, DEER, BUTTERFLY].every((card) => collection.contains(card))
      if (hasInoShikaChou && !context?.rules.allowMultipleAnimalYaku) {
        return 0
      }
      return this.points + extraPoints
    }

    // This is ino-shika-chou, give extra points for additional animals
    return this.points + extraPoints
  }
}

/**
 * Teyaku (hand yaku) that checks for special initial hand conditions
 */
export class Teyaku extends BaseYaku {
  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   */
  constructor(name, description, points) {
    super(name, description, points, [], 8) // 8 cards for initial hand
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @returns {number}
   */
  check(collection) {
    if (collection.size !== 8) return 0

    const monthCounts = new Map()

    // Count cards by month
    for (const cardIndex of collection.cards) {
      const month = Math.floor(cardIndex / 4)
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
    }

    // For teshi (four of a kind), check if any month has exactly 4 cards
    if (this.name === "teshi") {
      return [...monthCounts.values()].some((count) => count === 4) ? this.points : 0
    }

    // For kuttsuki (four pairs), check if all months have exactly 2 cards
    if (this.name === "kuttsuki") {
      return [...monthCounts.values()].every((count) => count === 2) ? this.points : 0
    }

    return 0
  }
}

/**
 * Bright Yaku that checks for specific bright card combinations with precedence rules
 */
export class BrightYaku extends BaseYaku {
  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {number} numRequired
   */
  constructor(name, description, points, numRequired) {
    super(name, description, points, BRIGHT_CARDS, numRequired)
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @returns {number}
   */
  check(collection) {
    const brightCards = this.find(collection)
    const hasRainMan = brightCards.includes(40) // Rain Man's index is 40
    const numBrights = brightCards.length

    if (numBrights < this.numRequired) return 0

    // Check combinations from highest to lowest points
    if (numBrights === 5) {
      return this.name === "gokou" ? this.points : 0
    }

    if (numBrights === 4) {
      if (hasRainMan) {
        return this.name === "ame-shikou" ? this.points : 0
      }
      return this.name === "shikou" ? this.points : 0
    }

    if (numBrights === 3) {
      // Only score sankou if Rain Man is not one of the three brights
      return this.name === "sankou" && !hasRainMan ? this.points : 0
    }

    return 0
  }
}

/**
 * Yaku that depends on game state conditions
 */
export class DynamicYaku extends BaseYaku {
  /** @type {number | null} */
  #viewingMonth
  /** @type {(context: import('./base.js').YakuContext) => number[]} */
  #getRequiredCards

  /**
   * Check if viewing is blocked by weather conditions
   * @param {import('./base.js').YakuContext} context
   * @returns {boolean}
   */
  #isViewingBlockedByWeather(context) {
    if (!context.tableCards) return false

    // Flower viewing is blocked by November (Willow) cards
    if (this.name === "hanami-zake") {
      const willowCards = context.tableCards.cards.filter((card) => getCardMonth(card) === 11)
      if (willowCards.length > 0) return true
    }

    // Moon viewing is blocked by December (Paulownia) cards
    if (this.name === "tsukimi-zake") {
      const paulowniaCards = context.tableCards.cards.filter((card) => getCardMonth(card) === 12)
      if (paulowniaCards.length > 0) return true
    }

    return false
  }

  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {(context: import('./base.js').YakuContext) => number[]} getRequiredCards
   * @param {number} numRequired
   */
  constructor(name, description, points, getRequiredCards, numRequired) {
    // Initialize with empty array, will be populated in check()
    super(name, description, points, [], numRequired)
    this.#getRequiredCards = getRequiredCards
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} context
   * @returns {number}
   */
  check(collection, context) {
    if (!context) return 0

    switch (this.name) {
      case "hanami-zake":
      case "tsukimi-zake": {
        if (context.viewingYakuMode === "DISABLED") return 0
        if (this.#isViewingBlockedByWeather(context)) return 0

        // Get required cards based on context
        const requiredCards = this.#getRequiredCards(context)
        const progress = requiredCards.filter((card) => collection.contains(card))

        if (progress.length < this.numRequired) return 0
        return this.points
      }
      case "tsuki-fuda": {
        // Get required cards based on context
        const requiredCards = this.#getRequiredCards(context)
        const progress = requiredCards.filter((card) => collection.contains(card))

        if (progress.length < this.numRequired) return 0
        return this.points
      }
      default:
        return 0
    }
  }

  /**
   * Find all cards in the collection that contribute to this yaku
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} context
   * @returns {number[]}
   */
  find(collection, context = null) {
    if (!context) return []
    const requiredCards = this.#getRequiredCards(context)
    return requiredCards.filter((card) => collection.contains(card))
  }
}

/**
 * Ribbon Yaku with precedence rules
 */
export class RibbonYaku extends BaseYaku {
  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} [context]
   * @returns {number}
   */
  check(collection, context = null) {
    const progress = this.find(collection)
    const matchCount = progress.length

    // Early return if not enough matches
    if (matchCount < this.numRequired) return 0

    const extraPoints = Math.max(
      0,
      collection.findByType(CardType.RIBBON).length - this.numRequired
    )

    // For tanzaku (5+ ribbons), check if aotan or akatan are present
    if (this.name === "tan-zaku" && !context?.rules.allowMultipleRibbonYaku) {
      const hasAotan = BLUE_RIBBONS.every((card) => collection.contains(card))
      const hasAkatan = POETRY_RIBBONS.every((card) => collection.contains(card))

      // If either aotan or akatan is present, this yaku doesn't score
      if (hasAotan || hasAkatan) return 0
    }

    return this.points + extraPoints
  }
}

/**
 * Chaff Yaku with precedence rules
 */
export class ChaffYaku extends BaseYaku {
  /**
   * @param {import('./base.js').YakuName} name
   * @param {string[]} description
   * @param {number} points
   * @param {number[]} requiredCards
   * @param {number} numRequired
   */
  constructor(name, description, points, requiredCards, numRequired) {
    super(name, description, points, requiredCards, numRequired)
  }

  /**
   * @param {import('../../collection.js').CardCollection} collection
   * @param {import('./base.js').YakuContext} [context]
   * @returns {number}
   */
  check(collection, context = null) {
    const progress = this.find(collection)
    if (progress.length < this.numRequired) return 0

    // Handle sake cup counting rules
    const sakeCupMode = context?.rules.sakeCupMode ?? "ANIMAL_ONLY"
    const sakeCupCard = 32 // Sake Cup's index
    const hasSakeCup = collection.contains(sakeCupCard)
    const sakeCupIsChaff = sakeCupMode !== "ANIMAL_ONLY"

    const extraPoints = Math.max(
      0,
      progress.length - this.numRequired + Number(hasSakeCup && sakeCupIsChaff)
    )

    // Calculate points including extra points for additional chaff cards
    return this.points + extraPoints
  }
}
