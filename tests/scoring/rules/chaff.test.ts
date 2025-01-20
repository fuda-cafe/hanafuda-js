import { describe, it, expect } from "vitest"
import { createCollection } from "../../../src/core/collection.ts"
import { createChaffChecker } from "../../../src/scoring/rules/chaff.ts"
import type { Collection } from "../../../src/core/types.ts"
import type { ScoringManager, YakuResult } from "../../../src/scoring/types.ts"

// Helper function to get card indices for specific cards
const SAKE_CUP = 32 // Chrysanthemum Sake Cup (Month 9)

// Chaff cards for testing
const CHAFF_CARDS = [
  2, // Pine Chaff 1 (Month 1)
  3, // Pine Chaff 2 (Month 1)
  6, // Plum Chaff 1 (Month 2)
  7, // Plum Chaff 2 (Month 2)
  10, // Cherry Blossom Chaff 1 (Month 3)
  11, // Cherry Blossom Chaff 2 (Month 3)
  14, // Wisteria Chaff 1 (Month 4)
  15, // Wisteria Chaff 2 (Month 4)
  38, // Maple Chaff 1 (Month 10)
  39, // Maple Chaff 2 (Month 10)
]

describe("ChaffYaku", () => {
  it("scores kasu (chaff cards)", () => {
    const collection: Collection = createCollection()
    let chaffChecker: ScoringManager = createChaffChecker()

    // Test with 10 chaff cards
    collection.addMany(CHAFF_CARDS)
    let result: YakuResult[] = chaffChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("kasu")
    expect(result[0].points).toBe(1)

    // Test with sake cup
    collection.add(SAKE_CUP)
    chaffChecker = createChaffChecker({ countSakeCup: true })
    result = chaffChecker(collection)
    expect(result[0].points).toBe(2)

    chaffChecker = createChaffChecker({ countSakeCup: false })
    result = chaffChecker(collection)
    expect(result[0].points).toBe(1)

    // Test with extra points
    chaffChecker = createChaffChecker({ extraPoints: 2 })
    result = chaffChecker(collection)
    expect(result[0].points).toBe(1)

    // Add more chaff cards
    collection.addMany([18, 19]) // Iris Chaff 1 & 2 (Month 5)
    result = chaffChecker(collection)
    expect(result[0].points).toBe(5)
  })
})
