import { INO_SHIKA_CHOU, TANE } from "../yaku/standard/animal.js"
import { CardType } from "../../core/cards.js"
import { createCollection } from "../../core/collection.js"

/**
 * @typedef {import('./types.js').AnimalRules} AnimalRules
 */

/**
 * Create a custom animal yaku checker with specific rules
 * @param {AnimalRules} [rules={}]
 */
export const createAnimalChecker = (rules = {}) => {
  const { allowMultiple = true, extraPoints = 1, sakeCupMode = "ANIMAL_ONLY" } = rules

  return (collection) => {
    const completed = []
    const SAKE_CUP = 32 // Chrysanthemum Sake Cup

    // Create a filtered collection that excludes sake cup in CHAFF_ONLY mode
    let effectiveCollection = collection
    if (sakeCupMode === "CHAFF_ONLY" && collection.has(SAKE_CUP)) {
      effectiveCollection = createCollection()
      for (const cardIndex of collection) {
        if (cardIndex !== SAKE_CUP) {
          effectiveCollection.add(cardIndex)
        }
      }
    }

    // Check Ino-Shika-Chou first (higher points)
    const inoShikaChouPoints = INO_SHIKA_CHOU.check(effectiveCollection)
    if (inoShikaChouPoints > 0) {
      // Calculate extra points for additional animals
      const animalCount = effectiveCollection.findByType(CardType.ANIMAL).length
      const extraAnimalPoints = Math.max(0, animalCount - 3) * extraPoints

      completed.push({
        name: INO_SHIKA_CHOU.name,
        points: inoShikaChouPoints + extraAnimalPoints,
      })
      if (!allowMultiple) return completed
    }

    // Check Tane (Animals)
    const basePoints = TANE.check(effectiveCollection)
    if (basePoints > 0) {
      // Calculate extra points for additional animals
      const animalCount = effectiveCollection.findByType(CardType.ANIMAL).length
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
