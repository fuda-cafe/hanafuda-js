import { assertEquals, assertThrows } from "@std/assert"
import { isMatch, compareCards, hasMatch } from "../../src/core/matching.ts"

Deno.test("Card Matching", () => {
  // Test matching cards from the same month
  assertEquals(isMatch(0, 1), true) // Pine cards (month 1)
  assertEquals(isMatch(4, 7), true) // Plum cards (month 2)

  // Test non-matching cards from different months
  assertEquals(isMatch(0, 4), false) // Pine (month 1) vs Plum (month 2)
  assertEquals(isMatch(0, 8), false) // Pine (month 1) vs Cherry (month 3)

  // Test invalid indices
  assertEquals(isMatch(-1, 0), false)
  assertEquals(isMatch(0, 48), false)
  assertEquals(isMatch(48, 48), false)
})

Deno.test("Card Comparison", () => {
  // Test same month comparison (should sort by type)
  // Pine cards (month 1): Bright Crane (0), Animal Poetry Ribbon (1), Chaff (2,3)
  assertEquals(compareCards(0, 1), 1) // Bright comes before Animal
  assertEquals(compareCards(1, 2), 1) // Animal comes before Chaff
  assertEquals(compareCards(2, 3), 0) // Same type (Chaff) should be equal
  assertEquals(compareCards(3, 0), -1) // Chaff comes after Bright

  // Test different month comparison
  assertEquals(compareCards(0, 4), -1) // Month 1 comes before Month 2
  assertEquals(compareCards(4, 0), 1) // Month 2 comes after Month 1

  // Test invalid indices
  assertEquals(compareCards(-1, 0), 0)
  assertEquals(compareCards(0, 48), 0)
  assertEquals(compareCards(48, 48), 0)
})

Deno.test("Has Match", () => {
  // Test finding matches in a collection
  const cards = [0, 4, 8] // One card from months 1, 2, and 3

  // Should find match with card from same month
  assertEquals(hasMatch(cards, 1), true) // Matches card 0 (both month 1)

  // Should not find match with card from different month
  assertEquals(hasMatch(cards, 5), true) // Matches card 4 (both month 2)
  assertEquals(hasMatch(cards, 12), false) // No month 4 cards in collection

  // Test with empty collection
  assertEquals(hasMatch([], 0), false)

  // Test invalid card index
  assertThrows(() => hasMatch(cards, -1), Error, "Invalid card index: -1")
  assertThrows(() => hasMatch(cards, 48), Error, "Invalid card index: 48")
})
