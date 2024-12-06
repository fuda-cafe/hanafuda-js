import { assertEquals } from "@std/assert"
import { CardCollection } from "../../src/collection.js"
import { ChaffYaku } from "../../src/scoring/yaku/types.js"

const SAKE_CUP = 32 // Sake Cup card
const CHAFF_CARDS = Array.from({ length: 12 }, (_, i) => i * 4 + 3) // Sample chaff cards

Deno.test("ChaffYaku - kasu (chaff)", () => {
  const collection = new CardCollection()
  const kasu = new ChaffYaku("kasu", ["Chaff"], 1, CHAFF_CARDS, 10)

  // Add 10 chaff cards
  CHAFF_CARDS.slice(0, 10).forEach((card) => collection.add(card))
  assertEquals(kasu.check(collection), 1, "Should score with ten chaff cards")

  // Add sake cup - test different modes
  collection.add(SAKE_CUP)

  // BOTH mode
  assertEquals(
    kasu.check(collection, { rules: { sakeCupMode: "BOTH" } }),
    2,
    "Should count sake cup in BOTH mode"
  )

  // ANIMAL_ONLY mode
  assertEquals(
    kasu.check(collection, { rules: { sakeCupMode: "ANIMAL_ONLY" } }),
    1,
    "Should not count sake cup in ANIMAL_ONLY mode"
  )

  // Test extra points for additional cards
  CHAFF_CARDS.slice(10, 12).forEach((card) => collection.add(card))
  assertEquals(
    kasu.check(collection, { rules: { sakeCupMode: "ANIMAL_ONLY" } }),
    3,
    "Should score extra points for additional chaff cards"
  )
})
