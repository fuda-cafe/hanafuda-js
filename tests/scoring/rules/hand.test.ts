import { describe, it, expect } from "vitest"
import { createCollection } from "../../../src/core/collection.ts"
import { createHandChecker } from "../../../src/scoring/rules/hand.ts"
import type { Collection } from "../../../src/core/types.ts"
import type { ScoringManager, YakuResult, ScoringContext } from "../../../src/scoring/types.ts"

// Helper function to get card indices for specific cards
const PINE_CARDS = [0, 1, 2, 3] // All Pine cards (Month 1)
const PLUM_CARDS = [4, 5, 6, 7] // All Plum cards (Month 2)
const CHERRY_CARDS = [8, 9, 10, 11] // All Cherry Blossom cards (Month 3)
const MIXED_CARDS = [12, 16, 20, 24] // Mixed cards
const FOUR_PAIRS = [0, 1, 4, 5, 8, 9, 36, 37] // 2 pine, 2 plum, 2 cherry, 2 maple

describe("HandYaku", () => {
  it("scores teshi (four cards of same month)", () => {
    const collection: Collection = createCollection()
    const handChecker: ScoringManager = createHandChecker()

    // Test with all Pine cards
    collection.addMany(PINE_CARDS)
    collection.addMany(MIXED_CARDS)
    let result: YakuResult[] = handChecker(collection, { checkTeyaku: true } as ScoringContext)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("teshi")
    expect(result[0].points).toBe(6)

    // Test with all Plum cards
    collection.clear()
    collection.addMany(PLUM_CARDS)
    collection.addMany(MIXED_CARDS)
    result = handChecker(collection, { checkTeyaku: true } as ScoringContext)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("teshi")
    expect(result[0].points).toBe(6)

    // Test with all Cherry Blossom cards
    collection.clear()
    collection.addMany(CHERRY_CARDS)
    collection.addMany(MIXED_CARDS)
    result = handChecker(collection, { checkTeyaku: true } as ScoringContext)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("teshi")
    expect(result[0].points).toBe(6)

    // Test with mixed cards
    collection.clear()
    collection.addMany([...PINE_CARDS.slice(0, 2), ...PLUM_CARDS.slice(0, 2)])
    collection.addMany(MIXED_CARDS)
    result = handChecker(collection, { checkTeyaku: true } as ScoringContext)
    expect(result).toHaveLength(0)

    // Test without checkTeyaku flag
    collection.clear()
    collection.addMany(PINE_CARDS)
    collection.addMany(MIXED_CARDS)
    result = handChecker(collection, { checkTeyaku: false } as ScoringContext)
    expect(result).toHaveLength(0)
  })

  it("checks Kuttsuki", () => {
    const collection = createCollection()
    const handChecker = createHandChecker()

    // Add four pairs (two cards each from four different months)
    collection.addMany(FOUR_PAIRS)

    // Test with teyaku checking enabled
    const result = handChecker(collection, { checkTeyaku: true })
    expect(result.length).toBe(1)
    expect(result[0].name).toBe("kuttsuki")
    expect(result[0].points).toBe(6)

    // Test without pairs
    collection.clear()
    collection.addMany([...FOUR_PAIRS.slice(2), ...MIXED_CARDS])
    expect(handChecker(collection, { checkTeyaku: true }).length).toBe(0)
  })
})
