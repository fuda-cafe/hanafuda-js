import { INO_SHIKA_CHOU, TANE } from "../yaku/standard/animal.js"
import { CardType } from "../../core/cards.js"
import { createCollection } from "../../core/collection.js"

/**
 * @typedef {Object} AnimalRules
 * @property {boolean} [allowMultiple=true] Whether to allow scoring both Ino-Shika-Chou and Tane
 * @property {number} [extraPoints=1] Points for each additional animal beyond base requirement
 * @property {'ANIMAL_ONLY'|'CHAFF_ONLY'|'BOTH'} [sakeCupMode='ANIMAL_ONLY'] How to count the sake cup
 */

/**
 * Create a custom animal yaku checker with specific rules
 * @param {AnimalRules} rules
 */
export const createAnimalChecker = (rules = {}) => {
  const { allowMultiple = true, extraPoints = 1, sakeCupMode = "ANIMAL_ONLY" } = rules

  /**
   * @param {import("../../core/collection.js").Collection} collection
   * @returns {YakuResult[]}
   */
  return (collection) => {
    const completed = []

    const effectiveCollection = createCollection({ cards: Array.from(collection) })
    if (sakeCupMode === "CHAFF_ONLY") {
      effectiveCollection.remove(32)
    }
    // Calculate base animal count
    let animalCount = effectiveCollection.findByType(CardType.ANIMAL).length
    // Check Ino-Shika-Chou first (higher points)
    const inoShikaChouPoints = INO_SHIKA_CHOU.check(collection)
    if (inoShikaChouPoints > 0) {
      // Calculate extra points for additional animals beyond 3
      const extraAnimalPoints = Math.max(0, animalCount - 3) * extraPoints

      completed.push({
        name: INO_SHIKA_CHOU.name,
        points: inoShikaChouPoints + extraAnimalPoints,
      })
      if (!allowMultiple) return completed
    }

    // Check Tane (Animals)
    const basePoints = TANE.check(collection)
    if (basePoints > 0) {
      // Calculate extra points for additional animals beyond 5
      const extraAnimalPoints = Math.max(0, animalCount - 5) * extraPoints

      completed.push({
        name: TANE.name,
        points: basePoints + extraAnimalPoints,
      })
    }

    return completed
  }
}

/**
 * Default animal yaku checker (allows multiple scoring, 1 extra point per additional animal)
 */
export const checkAnimalYaku = createAnimalChecker()
