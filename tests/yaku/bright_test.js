import { assertEquals } from "@std/assert"
import { CardCollection } from "../../src/collection.js"
import { BrightYaku } from "../../src/scoring/yaku/types.js"
import { BRIGHT_CARDS } from "../../src/cards.js"

Deno.test("BrightYaku - sankou (three brights)", () => {
  const collection = new CardCollection()
  const sankou = new BrightYaku("sankou", ["Three Brights"], 6, 3)

  // Test valid sankou (three brights without Rain Man)
  collection.add(BRIGHT_CARDS[0]) // Pine Bright
  collection.add(BRIGHT_CARDS[1]) // Cherry Blossom Curtain
  collection.add(BRIGHT_CARDS[2]) // Moon
  assertEquals(sankou.check(collection), 6, "Should score with three non-Rain Man bright cards")

  // Test invalid sankou (three brights including Rain Man)
  collection.clear()
  collection.add(BRIGHT_CARDS[0]) // Pine Bright
  collection.add(BRIGHT_CARDS[1]) // Cherry Blossom Curtain
  collection.add(BRIGHT_CARDS[3]) // Rain Man
  assertEquals(
    sankou.check(collection),
    0,
    "Should not score when Rain Man is one of the three brights"
  )
})

Deno.test("BrightYaku - shikou/ame-shikou (four brights)", () => {
  const collection = new CardCollection()
  const shikou = new BrightYaku("shikou", ["Four Brights"], 8, 4)
  const ameShikou = new BrightYaku("ame-shikou", ["Rain Man Four"], 7, 4)
  const rainMan = 40

  // Add four bright cards (excluding Rain Man)
  BRIGHT_CARDS.filter((card) => card !== rainMan).forEach((card) => collection.add(card))

  // Should score
  assertEquals(shikou.check(collection), 8, "Should score with four bright cards")
  assertEquals(
    ameShikou.check(collection),
    0,
    "Should not score with four bright cards excluding Rain Man"
  )

  // Remove one bright card
  collection.remove(BRIGHT_CARDS[0])
  assertEquals(shikou.check(collection), 0, "Should not score with only three bright cards")

  // Add Rain Man
  collection.add(rainMan)
  assertEquals(
    shikou.check(collection),
    0,
    "Should not score with four bright cards including Rain Man"
  )

  // Test ame-shikou
  assertEquals(
    ameShikou.check(collection),
    7,
    "Should score with four bright cards including Rain Man"
  )
})

Deno.test("BrightYaku - gokou (five brights)", () => {
  const collection = new CardCollection()
  const gokou = new BrightYaku("gokou", ["Five Brights"], 15, 5)

  // Add all bright cards
  BRIGHT_CARDS.forEach((card) => collection.add(card))

  // Should score
  assertEquals(gokou.check(collection), 15, "Should score with all five bright cards")

  // Remove one bright card
  collection.remove(BRIGHT_CARDS[0])
  assertEquals(gokou.check(collection), 0, "Should not score with only four bright cards")
})
