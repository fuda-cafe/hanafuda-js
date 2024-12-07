import { assertEquals } from "@std/assert"
import { createCollection } from "../../../src/core/collection.js"
import { createHandChecker } from "../../../src/scoring/rules/hand.js"

// Helper function to create cards of a specific month
const createMonthCards = (month, count) => {
  return Array.from({ length: count }, (_, i) => month * 4 + i)
}

Deno.test("HandYaku - teshi (four of a kind)", () => {
  const collection = createCollection()
  const handChecker = createHandChecker()

  // Add four cards of month 1 and four other cards
  const fourOfKind = createMonthCards(0, 4) // January cards
  const otherCards = createMonthCards(1, 4) // February cards
  collection.addMany([...fourOfKind, ...otherCards])

  // Test with teyaku checking enabled
  const result = handChecker(collection, { checkTeyaku: true })
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "teshi", "Should be teshi yaku")
  assertEquals(result[0].points, 6, "Should score 6 points")

  // Test without teyaku checking
  assertEquals(
    handChecker(collection, { checkTeyaku: false }).length,
    0,
    "Should not check when teyaku checking is disabled"
  )

  // Test with wrong number of cards
  collection.remove(fourOfKind[0])
  assertEquals(
    handChecker(collection, { checkTeyaku: true }).length,
    0,
    "Should not score with wrong number of cards"
  )
})

Deno.test("HandYaku - kuttsuki (four pairs)", () => {
  const collection = createCollection()
  const handChecker = createHandChecker()

  // Add four pairs (two cards each from four different months)
  const pairs = [
    ...createMonthCards(0, 2), // January pair
    ...createMonthCards(1, 2), // February pair
    ...createMonthCards(2, 2), // March pair
    ...createMonthCards(3, 2), // April pair
  ]
  collection.addMany(pairs)

  // Test with teyaku checking enabled
  const result = handChecker(collection, { checkTeyaku: true })
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "kuttsuki", "Should be kuttsuki yaku")
  assertEquals(result[0].points, 6, "Should score 6 points")

  // Test without pairs
  collection.clear()
  collection.addMany([
    ...createMonthCards(0, 3),
    ...createMonthCards(1, 3),
    ...createMonthCards(2, 2),
  ])
  assertEquals(
    handChecker(collection, { checkTeyaku: true }).length,
    0,
    "Should not score without proper pairs"
  )
})
