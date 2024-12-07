import { assertEquals } from "@std/assert"
import { createCollection } from "../../../src/core/collection.js"
import { createViewingChecker } from "../../../src/scoring/rules/viewing.js"

// Helper function to get card indices for specific cards
const CHERRY_CURTAIN = 8 // Cherry Blossom Curtain (Month 3)
const SUSUKI_MOON = 28 // Moon with Susuki Grass (Month 8)
const SAKE_CUP = 32 // Chrysanthemum Sake Cup (Month 9)

Deno.test("ViewingYaku - hanami-zake (flower viewing)", () => {
  const collection = createCollection()
  // Default rules
  // No weather or season dependent rules
  let viewingChecker = createViewingChecker()

  // Test basic flower viewing
  collection.addMany([CHERRY_CURTAIN, SAKE_CUP])
  let result = viewingChecker(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "hanami-zake", "Should be hanami-zake yaku")
  assertEquals(result[0].points, 3, "Should score 3 points")

  // Test with missing sake cup
  collection.remove(SAKE_CUP)
  result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not score without sake cup")

  // Test with missing curtain
  collection.clear()
  collection.add(SAKE_CUP)
  result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not score without curtain")

  // Test with weather penalty
  collection.add(CHERRY_CURTAIN)
  viewingChecker = createViewingChecker({ weatherDependent: true })
  result = viewingChecker(collection, { weather: "rainy" })
  assertEquals(result.length, 0, "Should not complete yaku in rainy weather")

  // Test with season bonus
  viewingChecker = createViewingChecker({ seasonalBonus: true })
  result = viewingChecker(collection, { currentMonth: 3 })
  assertEquals(result.length, 1, "Should complete yaku in season")
  assertEquals(result[0].points, 6, "Should double points during cherry blossom season")
})

Deno.test("ViewingYaku - tsukimi-zake (moon viewing)", () => {
  const collection = createCollection()
  // Default rules
  // No weather or season dependent rules
  let viewingChecker = createViewingChecker()

  // Test basic moon viewing
  collection.addMany([SUSUKI_MOON, SAKE_CUP])
  let result = viewingChecker(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "tsukimi-zake", "Should be tsukimi-zake yaku")
  assertEquals(result[0].points, 3, "Should score 3 points")

  // Test with missing sake cup
  collection.remove(SAKE_CUP)
  result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not score without sake cup")

  // Test with missing moon
  collection.clear()
  collection.add(SAKE_CUP)
  result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not score without moon")

  // Test with weather penalty
  collection.add(SUSUKI_MOON)
  viewingChecker = createViewingChecker({ weatherDependent: true })
  result = viewingChecker(collection, { weather: "foggy" })
  assertEquals(result.length, 0, "Should not complete yaku in foggy weather")

  // Test with season bonus
  viewingChecker = createViewingChecker({ seasonalBonus: true })
  result = viewingChecker(collection, { currentMonth: 8 })
  assertEquals(result.length, 1, "Should complete yaku in season")
  assertEquals(result[0].points, 6, "Should double points during moon viewing season")
})

Deno.test("ViewingYaku - multiple viewing yaku", () => {
  const collection = createCollection()
  let viewingChecker = createViewingChecker()

  // Add all viewing cards
  collection.addMany([CHERRY_CURTAIN, SUSUKI_MOON, SAKE_CUP])

  // Test that both yaku can be scored
  const result = viewingChecker(collection)
  assertEquals(result.length, 2, "Should find both viewing yaku")
  assertEquals(
    result.map((y) => y.name).sort(),
    ["hanami-zake", "tsukimi-zake"],
    "Should include both viewing yaku"
  )
})

Deno.test("ViewingYaku - weather cancellation", () => {
  const collection = createCollection()
  const viewingChecker = createViewingChecker({ weatherDependent: true })

  // Test Hanami cancellation
  collection.addMany([CHERRY_CURTAIN, SAKE_CUP])
  let result = viewingChecker(collection, { weather: "rainy" })
  assertEquals(result.length, 0, "Hanami should be cancelled in rain")

  // Test Tsukimi cancellation
  collection.clear()
  collection.addMany([SUSUKI_MOON, SAKE_CUP])
  result = viewingChecker(collection, { weather: "foggy" })
  assertEquals(result.length, 0, "Tsukimi should be cancelled in fog")

  // Test selective cancellation
  collection.clear()
  collection.addMany([CHERRY_CURTAIN, SUSUKI_MOON, SAKE_CUP])
  result = viewingChecker(collection, { weather: "rainy" })
  assertEquals(result.length, 1, "Only Hanami should be cancelled in rain")
  assertEquals(result[0].name, "tsukimi-zake", "Tsukimi should still be valid")
})

Deno.test("ViewingYaku - seasonal rules", () => {
  const collection = createCollection()

  // Test seasonal bonus without restriction
  let viewingChecker = createViewingChecker({ seasonalBonus: true })
  collection.addMany([CHERRY_CURTAIN, SAKE_CUP])

  // Out of season
  let result = viewingChecker(collection, { currentMonth: 1 })
  assertEquals(result.length, 1, "Should complete out of season with bonus only")
  assertEquals(result[0].points, 3, "Should not apply bonus out of season")

  // In season
  result = viewingChecker(collection, { currentMonth: 3 })
  assertEquals(result[0].points, 6, "Should apply bonus in season")

  // Test seasonal restriction
  viewingChecker = createViewingChecker({ seasonalOnly: true })

  // Out of season
  result = viewingChecker(collection, { currentMonth: 1 })
  assertEquals(result.length, 0, "Should not complete out of season with restriction")

  // In season
  result = viewingChecker(collection, { currentMonth: 3 })
  assertEquals(result.length, 1, "Should complete in season with restriction")
  assertEquals(result[0].points, 3, "Should score normal points with restriction only")

  // Test both bonus and restriction
  viewingChecker = createViewingChecker({ seasonalBonus: true, seasonalOnly: true })

  // Out of season
  result = viewingChecker(collection, { currentMonth: 1 })
  assertEquals(result.length, 0, "Should not complete out of season with both rules")

  // In season
  result = viewingChecker(collection, { currentMonth: 3 })
  assertEquals(result.length, 1, "Should complete in season with both rules")
  assertEquals(result[0].points, 6, "Should apply bonus with both rules in season")
})

Deno.test("ViewingYaku - recognition modes", () => {
  const collection = createCollection()
  collection.addMany([CHERRY_CURTAIN, SAKE_CUP])

  // Test NEVER mode
  let viewingChecker = createViewingChecker({ mode: "NEVER" })
  let result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not recognize viewing yaku in NEVER mode")

  // Test LIMITED mode without other yaku
  viewingChecker = createViewingChecker({ mode: "LIMITED" })
  result = viewingChecker(collection)
  assertEquals(result.length, 0, "Should not recognize viewing yaku without other yaku")

  // Test LIMITED mode with only viewing yaku
  result = viewingChecker(collection, {
    completedYaku: [{ name: "tsukimi-zake", points: 3 }],
  })
  assertEquals(result.length, 0, "Should not recognize viewing yaku with only other viewing yaku")

  // Test LIMITED mode with non-viewing yaku
  result = viewingChecker(collection, {
    completedYaku: [{ name: "tane-zaku", points: 1 }],
  })
  assertEquals(result.length, 1, "Should recognize viewing yaku with non-viewing yaku")
  assertEquals(result[0].name, "hanami-zake", "Should be hanami-zake yaku")

  // Test LIMITED mode with mixed yaku
  result = viewingChecker(collection, {
    completedYaku: [
      { name: "tsukimi-zake", points: 3 },
      { name: "tane-zaku", points: 1 },
    ],
  })
  assertEquals(result.length, 1, "Should recognize viewing yaku with mixed yaku types")

  // Test ALWAYS mode
  viewingChecker = createViewingChecker({ mode: "ALWAYS" })
  result = viewingChecker(collection)
  assertEquals(result.length, 1, "Should always recognize viewing yaku")
})

Deno.test("ViewingYaku - mode interaction with other rules", () => {
  const collection = createCollection()
  collection.addMany([CHERRY_CURTAIN, SAKE_CUP])

  // Test LIMITED mode with weather
  let viewingChecker = createViewingChecker({
    mode: "LIMITED",
    weatherDependent: true,
  })

  // Without other yaku
  let result = viewingChecker(collection, { weather: "clear" })
  assertEquals(result.length, 0, "Should not recognize without other yaku, regardless of weather")

  // With only viewing yaku
  result = viewingChecker(collection, {
    weather: "clear",
    completedYaku: [{ name: "tsukimi-zake", points: 3 }],
  })
  assertEquals(result.length, 0, "Should not recognize with only viewing yaku")

  // With other yaku but bad weather
  result = viewingChecker(collection, {
    weather: "rainy",
    completedYaku: [{ name: "tane-zaku", points: 1 }],
  })
  assertEquals(result.length, 0, "Should not recognize in bad weather, even with other yaku")

  // With other yaku and good weather
  result = viewingChecker(collection, {
    weather: "clear",
    completedYaku: [{ name: "tane-zaku", points: 1 }],
  })
  assertEquals(result.length, 1, "Should recognize with other yaku and good weather")

  // Test LIMITED mode with seasonal rules
  viewingChecker = createViewingChecker({
    mode: "LIMITED",
    seasonalOnly: true,
  })

  // Out of season with other yaku
  result = viewingChecker(collection, {
    currentMonth: 1,
    completedYaku: [{ name: "tane-zaku", points: 1 }],
  })
  assertEquals(result.length, 0, "Should not recognize out of season, even with other yaku")

  // In season with only viewing yaku
  result = viewingChecker(collection, {
    currentMonth: 3,
    completedYaku: [{ name: "tsukimi-zake", points: 3 }],
  })
  assertEquals(result.length, 0, "Should not recognize with only viewing yaku, even in season")

  // In season with non-viewing yaku
  result = viewingChecker(collection, {
    currentMonth: 3,
    completedYaku: [{ name: "tane-zaku", points: 1 }],
  })
  assertEquals(result.length, 1, "Should recognize in season with non-viewing yaku")
})
