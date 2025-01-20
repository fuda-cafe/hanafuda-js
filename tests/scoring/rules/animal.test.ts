import { describe, it, expect } from "vitest"
import { createCollection } from "../../../src/core/collection.ts"
import { createAnimalChecker } from "../../../src/scoring/rules/animal.ts"
import type { Collection } from "../../../src/core/types.ts"
import type { ScoringManager, YakuResult } from "../../../src/scoring/types.ts"

// Helper function to get card indices for specific cards
const BOAR = 24 // Bush Clover Boar (Month 7)
const DEER = 36 // Maple Deer (Month 10)
const BUTTERFLY = 20 // Peony Butterfly (Month 6)
const SAKE_CUP = 32 // Chrysanthemum Sake Cup (Month 9)

// Additional animal cards for tane testing
const GEESE = 29 // Susuki Grass Goose (Month 8)
const WARBLER = 4 // Plum Warbler (Month 2)
const CUCKOO = 12 // Wisteria Cuckoo (Month 4)
const SWALLOW = 41 // Swallow (Month 11)

describe("AnimalYaku", () => {
  it("scores ino-shika-chou (boar-deer-butterfly)", () => {
    const collection: Collection = createCollection()
    let animalChecker: ScoringManager = createAnimalChecker()

    // Test basic ino-shika-chou
    collection.addMany([BOAR, DEER, BUTTERFLY])
    let result: YakuResult[] = animalChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("ino-shika-chou")
    expect(result[0].points).toBe(5)

    // Test with missing animal
    collection.remove(BOAR)
    result = animalChecker(collection)
    expect(result).toHaveLength(0)

    // Test with extra animal
    collection.addMany([BOAR, GEESE])
    result = animalChecker(collection)
    expect(result[0].points).toBe(6)

    // Test with sake cup in different modes
    collection.add(SAKE_CUP)
    animalChecker = createAnimalChecker({ countSakeCup: true })
    result = animalChecker(collection)
    expect(result[0].points).toBe(7)

    animalChecker = createAnimalChecker({ countSakeCup: false })
    result = animalChecker(collection)
    expect(result[0].points).toBe(6)
  })

  it("scores tane-zaku (animals)", () => {
    const collection: Collection = createCollection()
    let animalChecker: ScoringManager = createAnimalChecker()

    // Test basic tane (5 animals)
    collection.addMany([BOAR, DEER, CUCKOO, GEESE, WARBLER])
    let result: YakuResult[] = animalChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("tane-zaku")
    expect(result[0].points).toBe(1)

    // Test with extra animals
    collection.add(SWALLOW)
    result = animalChecker(collection)
    expect(result[0].points).toBe(2)

    // Test with sake cup
    collection.add(SAKE_CUP)
    animalChecker = createAnimalChecker({ countSakeCup: true })
    result = animalChecker(collection)
    expect(result[0].points).toBe(3)

    animalChecker = createAnimalChecker({ countSakeCup: false })
    result = animalChecker(collection)
    expect(result[0].points).toBe(2)

    // Test precedence with ino-shika-chou
    collection.clear()
    collection.addMany([BOAR, DEER, BUTTERFLY, GEESE, WARBLER])
    animalChecker = createAnimalChecker() // Default for allowMultiple is true
    result = animalChecker(collection)
    expect(result).toHaveLength(2)
    expect(result.map((y) => y.name).sort()).toEqual(["ino-shika-chou", "tane-zaku"])

    animalChecker = createAnimalChecker({ allowMultiple: false })
    result = animalChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("ino-shika-chou")
  })
})
