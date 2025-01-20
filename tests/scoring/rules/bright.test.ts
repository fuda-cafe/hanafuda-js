import { describe, it, expect } from "vitest"
import { createCollection } from "../../../src/core/collection.ts"
import { createBrightChecker } from "../../../src/scoring/rules/bright.ts"
import type { Collection } from "../../../src/core/types.ts"
import type { ScoringManager, YakuResult } from "../../../src/scoring/types.ts"

// Helper function to get card indices for specific cards
const CRANE = 0 // Pine Crane (Month 1)
const CURTAIN = 8 // Cherry Blossom Curtain (Month 3)
const MOON = 28 // Susuki Grass Moon (Month 8)
const RAIN_MAN = 40 // Willow Rain-man (Month 11)
const PHOENIX = 44 // Paulownia Phoenix (Month 12)

describe("BrightYaku", () => {
  it("scores gokou (five brights)", () => {
    const collection: Collection = createCollection()
    const brightChecker: ScoringManager = createBrightChecker()

    // Test basic gokou
    collection.addMany([CRANE, CURTAIN, PHOENIX, MOON, RAIN_MAN])
    const result: YakuResult[] = brightChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("gokou")
    expect(result[0].points).toBe(15)
  })

  it("scores shikou (four brights, no rain-man)", () => {
    const collection: Collection = createCollection()
    const brightChecker: ScoringManager = createBrightChecker()

    // Test basic shikou
    collection.addMany([CRANE, CURTAIN, PHOENIX, MOON])
    const result: YakuResult[] = brightChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("shikou")
    expect(result[0].points).toBe(8)
  })

  it("scores ame-shikou (four brights with rain-man)", () => {
    const collection: Collection = createCollection()
    const brightChecker: ScoringManager = createBrightChecker()

    // Test basic ame-shikou
    collection.addMany([CRANE, CURTAIN, MOON, RAIN_MAN])
    const result: YakuResult[] = brightChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("ame-shikou")
    expect(result[0].points).toBe(7)
  })

  it("scores sankou (three brights)", () => {
    const collection: Collection = createCollection()
    const brightChecker: ScoringManager = createBrightChecker()

    // Test basic sankou
    collection.addMany([CRANE, CURTAIN, PHOENIX])
    const result: YakuResult[] = brightChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("sankou")
    expect(result[0].points).toBe(6)
  })

  it("handles multiple bright yaku", () => {
    const collection: Collection = createCollection()

    // Test with allowMultiple = false (default)
    let brightChecker: ScoringManager = createBrightChecker()
    collection.addMany([CRANE, CURTAIN, PHOENIX, MOON, RAIN_MAN])
    let result: YakuResult[] = brightChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("gokou")

    // Test with allowMultiple = true
    brightChecker = createBrightChecker({ allowMultiple: true })
    result = brightChecker(collection)
    expect(result).toHaveLength(4)
    expect(result.map((y) => y.name).sort()).toEqual(["ame-shikou", "gokou", "sankou", "shikou"])
  })
})
