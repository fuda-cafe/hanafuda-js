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
  assertEquals(result[0].points, 0, "Should cancel hanami in rainy weather")

  // Test with season bonus
  viewingChecker = createViewingChecker({ seasonDependent: true })
  result = viewingChecker(collection, { currentMonth: 3 })
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
  assertEquals(result[0].points, 0, "Should cancel tsukimi in foggy weather")

  // Test with season bonus
  viewingChecker = createViewingChecker({ seasonDependent: true })
  result = viewingChecker(collection, { currentMonth: 8 })
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
