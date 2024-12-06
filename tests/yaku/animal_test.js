import { assertEquals } from "@std/assert"
import { CardCollection } from "../../src/collection.js"
import { AnimalYaku } from "../../src/scoring/yaku/types.js"
import { ANIMAL_CARDS, BOAR, DEER, BUTTERFLY, SAKE_CUP } from "../../src/cards.js"

Deno.test("AnimalYaku - ino-shika-chou", () => {
  const collection = new CardCollection()
  const inoShikaChou = new AnimalYaku("ino-shika-chou", ["Boar-Deer-Butterfly"], 5, ANIMAL_CARDS, 3)

  // Test valid ino-shika-chou
  collection.add(BOAR)
  collection.add(DEER)
  collection.add(BUTTERFLY)
  assertEquals(inoShikaChou.check(collection), 5, "Should score with boar, deer, and butterfly")

  // Test with sake cup - default ANIMAL_ONLY mode
  collection.add(SAKE_CUP)
  assertEquals(inoShikaChou.check(collection), 6, "Should score extra point with additional animal")

  // Test with sake cup - BOTH mode
  assertEquals(
    inoShikaChou.check(collection, { rules: { sakeCupMode: "BOTH" } }),
    6,
    "Should count sake cup in BOTH mode"
  )

  // Test with sake cup - CHAFF_ONLY mode
  assertEquals(
    inoShikaChou.check(collection, { rules: { sakeCupMode: "CHAFF_ONLY" } }),
    5,
    "Should not count sake cup in CHAFF_ONLY mode"
  )
})

Deno.test("AnimalYaku - tane-zaku (animals)", () => {
  const collection = new CardCollection()
  const taneZaku = new AnimalYaku("tane-zaku", ["Animals"], 1, ANIMAL_CARDS, 5)

  // Add 5 animal cards
  const fiveAnimals = ANIMAL_CARDS.slice(0, 5)
  fiveAnimals.forEach((card) => collection.add(card))
  assertEquals(taneZaku.check(collection), 1, "Should score with five animals")

  // Add more animals for extra points
  collection.add(ANIMAL_CARDS[5])
  assertEquals(taneZaku.check(collection), 2, "Should score extra point with sixth animal")

  // Test precedence with ino-shika-chou
  collection.clear()
  collection.add(BOAR)
  collection.add(DEER)
  collection.add(BUTTERFLY)
  collection.add(ANIMAL_CARDS[0])
  collection.add(ANIMAL_CARDS[1])

  // Should not score when ino-shika-chou is present and multiple animal yaku are not allowed
  assertEquals(
    taneZaku.check(collection, { rules: { allowMultipleAnimalYaku: false } }),
    0,
    "Should not score when ino-shika-chou is present"
  )

  // Should score when multiple animal yaku are allowed
  assertEquals(
    taneZaku.check(collection, { rules: { allowMultipleAnimalYaku: true } }),
    1,
    "Should score when multiple animal yaku are allowed"
  )
})
