import { assertEquals } from "@std/assert"
import { createCollection } from "../../../src/core/collection.ts"
import { createChaffChecker } from "../../../src/scoring/rules/chaff.ts"

// Helper function to get chaff cards
const getChaffCards = (count) => {
  // Start from index 3 (first chaff card) and skip every 4th card (non-chaff)
  return Array.from({ length: count }, (_, i) => i * 4 + 3)
}

const SAKE_CUP = 32 // Chrysanthemum Sake Cup

Deno.test("ChaffYaku - basic scoring", () => {
  const collection = createCollection()
  const chaffChecker = createChaffChecker()
  const chaffCards = getChaffCards(12)

  // Test with exactly 10 chaff
  collection.addMany(chaffCards.slice(0, 10))
  let result = chaffChecker(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "kasu", "Should be kasu yaku")
  assertEquals(result[0].points, 1, "Should score 1 point")

  // Test with additional chaff
  collection.addMany(chaffCards.slice(10, 12))
  result = chaffChecker(collection)
  assertEquals(result[0].points, 3, "Should score extra points for additional chaff")

  // Test with insufficient chaff
  collection.clear()
  collection.addMany(chaffCards.slice(0, 9))
  result = chaffChecker(collection)
  assertEquals(result.length, 0, "Should not score with insufficient chaff")
})

Deno.test("ChaffYaku - sake cup handling", () => {
  const collection = createCollection()
  const chaffCards = getChaffCards(12)

  // Add 9 regular chaff cards plus sake cup
  collection.addMany(chaffCards.slice(0, 9))
  collection.add(SAKE_CUP)

  // Test with sake cup excluded (default)
  let chaffChecker = createChaffChecker({ countSakeCup: false })
  let result = chaffChecker(collection)
  assertEquals(result.length, 0, "Should not complete without counting sake cup")

  // Test with sake cup included
  chaffChecker = createChaffChecker({ countSakeCup: true })
  result = chaffChecker(collection)
  assertEquals(result.length, 1, "Should complete when counting sake cup")
  assertEquals(result[0].points, 1, "Should score base points")

  // Test extra points with sake cup
  collection.addMany(chaffCards.slice(10, 11))
  result = chaffChecker(collection)
  assertEquals(result[0].points, 2, "Should include sake cup in extra points calculation")
})

Deno.test("ChaffYaku - extra points configuration", () => {
  const collection = createCollection()
  const chaffCards = getChaffCards(12)
  const chaffChecker = createChaffChecker({ extraPoints: 2, countSakeCup: true })

  // Add 12 chaff cards (including sake cup)
  collection.addMany(chaffCards.slice(0, 11))
  collection.add(SAKE_CUP)

  const result = chaffChecker(collection)
  assertEquals(result[0].points, 5, "Should apply configured extra points rate")
})
