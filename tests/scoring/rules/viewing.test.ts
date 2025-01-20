import { describe, it, expect } from "vitest"
import { createCollection } from "../../../src/core/collection.ts"
import { createViewingChecker } from "../../../src/scoring/rules/viewing.ts"
import type { Collection } from "../../../src/core/types.ts"
import type { ScoringManager, YakuResult, ScoringContext } from "../../../src/scoring/types.ts"
import type { ViewingYakuMode } from "../../../src/scoring/rules/types.ts"

// Helper function to get card indices for specific cards
const CURTAIN = 8 // Cherry Blossom Curtain (Month 3)
const SAKE_CUP = 32 // Chrysanthemum Sake Cup (Month 9)
const MOON = 28 // Susuki Grass Moon (Month 8)
const RAIN_MAN = 40 // Willow Rain-man (Month 11)

describe("ViewingYaku", () => {
  it("scores hanami-zake (flower viewing)", () => {
    const collection: Collection = createCollection()
    const viewingChecker: ScoringManager = createViewingChecker()

    // Test basic hanami-zake
    collection.addMany([CURTAIN, SAKE_CUP])
    let result: YakuResult[] = viewingChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("hanami-zake")
    expect(result[0].points).toBe(3)

    // Test with missing card
    collection.remove(CURTAIN)
    result = viewingChecker(collection)
    expect(result).toHaveLength(0)

    // Test with wrong combination
    collection.add(RAIN_MAN) // Using Rain-man instead of Moon
    result = viewingChecker(collection)
    expect(result).toHaveLength(0)
  })

  it("scores tsukimi-zake (moon viewing)", () => {
    const collection: Collection = createCollection()
    const viewingChecker: ScoringManager = createViewingChecker()

    // Test basic tsukimi-zake
    collection.addMany([MOON, SAKE_CUP])
    let result: YakuResult[] = viewingChecker(collection)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("tsukimi-zake")
    expect(result[0].points).toBe(3)

    // Test with missing card
    collection.remove(MOON)
    result = viewingChecker(collection)
    expect(result).toHaveLength(0)

    // Test with wrong combination
    collection.add(RAIN_MAN)
    result = viewingChecker(collection)
    expect(result).toHaveLength(0)
  })

  it("handles weather effects", () => {
    const collection: Collection = createCollection()
    const viewingChecker: ScoringManager = createViewingChecker({ weatherDependent: true })

    // Test hanami-zake in rain
    collection.addMany([CURTAIN, SAKE_CUP])
    let result: YakuResult[] = viewingChecker(collection, { weather: "rainy" } as ScoringContext)
    expect(result).toHaveLength(0)

    // Test tsukimi-zake in fog
    collection.clear()
    collection.addMany([MOON, SAKE_CUP])
    result = viewingChecker(collection, { weather: "foggy" } as ScoringContext)
    expect(result).toHaveLength(0)

    // Test with weather effects disabled
    const weatherlessChecker: ScoringManager = createViewingChecker({ weatherDependent: false })
    result = weatherlessChecker(collection, { weather: "foggy" } as ScoringContext)
    expect(result).toHaveLength(1)
  })

  it("handles seasonal effects", () => {
    const collection: Collection = createCollection()
    const viewingChecker: ScoringManager = createViewingChecker({
      seasonalBonus: true,
      seasonalOnly: false,
    })

    // Test hanami-zake in season (month 3)
    collection.addMany([CURTAIN, SAKE_CUP])
    let result: YakuResult[] = viewingChecker(collection, { currentMonth: 3 } as ScoringContext)
    expect(result).toHaveLength(1)
    expect(result[0].points).toBe(6) // Double points in season

    // Test tsukimi-zake in season (month 8)
    collection.clear()
    collection.addMany([MOON, SAKE_CUP])
    result = viewingChecker(collection, { currentMonth: 8 } as ScoringContext)
    expect(result).toHaveLength(1)
    expect(result[0].points).toBe(6) // Double points in season

    // Test with seasonal restriction
    const seasonalChecker: ScoringManager = createViewingChecker({
      seasonalBonus: true,
      seasonalOnly: true,
    })

    // Test hanami-zake out of season
    result = seasonalChecker(collection, { currentMonth: 4 } as ScoringContext)
    expect(result).toHaveLength(0)
  })

  it("handles viewing mode restrictions", () => {
    const collection: Collection = createCollection()

    // Test with NEVER mode
    const neverChecker: ScoringManager = createViewingChecker({ mode: "NEVER" as ViewingYakuMode })
    collection.addMany([CURTAIN, SAKE_CUP])
    let result: YakuResult[] = neverChecker(collection)
    expect(result).toHaveLength(0)

    // Test with LIMITED mode (no other yaku)
    const limitedChecker: ScoringManager = createViewingChecker({
      mode: "LIMITED" as ViewingYakuMode,
    })
    result = limitedChecker(collection)
    expect(result).toHaveLength(0)

    // Test with LIMITED mode (with other yaku)
    result = limitedChecker(collection, {
      completedYaku: [{ name: "tane-zaku", points: 1 }],
    } as ScoringContext)
    expect(result).toHaveLength(1)

    // Test with ALWAYS mode (default)
    const alwaysChecker: ScoringManager = createViewingChecker({
      mode: "ALWAYS" as ViewingYakuMode,
    })
    result = alwaysChecker(collection)
    expect(result).toHaveLength(1)
  })
})
