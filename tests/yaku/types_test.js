import { assertEquals } from "@std/assert"
import { CardCollection } from "../../src/collection.js"
import { DynamicYaku } from "../../src/scoring/yaku/types.js"
import { findCardsByMonth } from "../../src/cards.js"

// Test data
const SAKE_CUP = 32
const CHERRY_BLOSSOM = 12
const MOON = 32

Deno.test("DynamicYaku - Flower Viewing", () => {
  const collection = new CardCollection()
  collection.add(SAKE_CUP)
  collection.add(CHERRY_BLOSSOM)

  const hanami = new DynamicYaku(
    "hanami-zake",
    ["Flower Viewing"],
    3,
    (context) => {
      const sakeCupMode = context?.rules.sakeCupMode ?? "BOTH"
      if (sakeCupMode === "DISABLED") {
        return [CHERRY_BLOSSOM]
      }
      return [CHERRY_BLOSSOM, SAKE_CUP]
    },
    2,
    3
  )

  // Test with default rules (BOTH)
  assertEquals(
    hanami.check(collection, { rules: {}, currentMonth: 3 }),
    3,
    "Should score with sake cup and cherry blossom"
  )

  // Test with DISABLED sake cup
  assertEquals(
    hanami.check(collection, { rules: { sakeCupMode: "DISABLED" }, currentMonth: 3 }),
    0,
    "Should not score when sake cup is disabled"
  )

  // Test with wrong month
  assertEquals(
    hanami.check(collection, { rules: {}, currentMonth: 4 }),
    3,
    "Should score regardless of month"
  )
})

Deno.test("DynamicYaku - Moon Viewing", () => {
  const collection = new CardCollection()
  collection.add(SAKE_CUP)
  collection.add(MOON)

  const tsukimi = new DynamicYaku(
    "tsukimi-zake",
    ["Moon Viewing"],
    3,
    (context) => {
      const sakeCupMode = context?.rules.sakeCupMode ?? "BOTH"
      if (sakeCupMode === "DISABLED") {
        return [MOON]
      }
      return [MOON, SAKE_CUP]
    },
    2,
    8
  )

  // Test with default rules (BOTH)
  assertEquals(
    tsukimi.check(collection, { rules: {}, currentMonth: 8 }),
    3,
    "Should score with sake cup and moon"
  )

  // Test with DISABLED sake cup
  assertEquals(
    tsukimi.check(collection, { rules: { sakeCupMode: "DISABLED" }, currentMonth: 8 }),
    0,
    "Should not score when sake cup is disabled"
  )

  // Test with wrong month
  assertEquals(
    tsukimi.check(collection, { rules: {}, currentMonth: 9 }),
    3,
    "Should score regardless of month"
  )
})

Deno.test("DynamicYaku - Month Cards", () => {
  const collection = new CardCollection()
  const currentMonth = 3 // March
  const marchCards = findCardsByMonth(currentMonth)
  collection.addMany(marchCards)

  const tsukiFuda = new DynamicYaku(
    "tsuki-fuda",
    ["Cards of the Month"],
    4,
    (context) => findCardsByMonth(context?.currentMonth ?? 1),
    4
  )

  // Test with all cards of the month
  assertEquals(
    tsukiFuda.check(collection, { rules: {}, currentMonth }),
    4,
    "Should score with 4 cards of the current month"
  )

  // Test with missing cards
  collection.remove(marchCards[0])
  assertEquals(
    tsukiFuda.check(collection, { rules: {}, currentMonth }),
    0,
    "Should not score with less than 4 cards"
  )

  // Test with different month
  assertEquals(
    tsukiFuda.check(collection, { rules: {}, currentMonth: 4 }),
    0,
    "Should not score with wrong month's cards"
  )
})
