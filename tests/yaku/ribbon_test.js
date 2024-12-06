import { assertEquals } from "@std/assert"
import { CardCollection } from "../../src/collection.js"
import { RibbonYaku } from "../../src/scoring/yaku/types.js"
import { POETRY_RIBBONS, BLUE_RIBBONS, RED_RIBBONS } from "../../src/cards.js"

Deno.test("RibbonYaku - aka-tan (poetry ribbons)", () => {
  const collection = new CardCollection()
  const akaTan = new RibbonYaku("aka-tan", ["Poetry Ribbons"], 6, POETRY_RIBBONS, 3)

  // Add three poetry ribbons
  POETRY_RIBBONS.forEach((card) => collection.add(card))
  assertEquals(akaTan.check(collection), 6, "Should score with three poetry ribbons")

  // Add extra ribbon for bonus point
  collection.add(RED_RIBBONS[0])
  assertEquals(akaTan.check(collection), 7, "Should score extra point with fourth ribbon")
})

Deno.test("RibbonYaku - ao-tan (blue ribbons)", () => {
  const collection = new CardCollection()
  const aoTan = new RibbonYaku("ao-tan", ["Blue Ribbons"], 6, BLUE_RIBBONS, 3)

  // Add three blue ribbons
  BLUE_RIBBONS.forEach((card) => collection.add(card))
  assertEquals(aoTan.check(collection), 6, "Should score with three blue ribbons")

  // Add extra ribbon for bonus point
  collection.add(RED_RIBBONS[0])
  assertEquals(aoTan.check(collection), 7, "Should score extra point with fourth ribbon")
})

Deno.test("RibbonYaku - tan-zaku (ribbons)", () => {
  const collection = new CardCollection()
  const tanZaku = new RibbonYaku(
    "tan-zaku",
    ["Ribbons"],
    1,
    [...POETRY_RIBBONS, ...BLUE_RIBBONS, ...RED_RIBBONS],
    5
  )

  // Add five ribbons
  const fiveRibbons = [...RED_RIBBONS, BLUE_RIBBONS[0]]
  collection.addMany(fiveRibbons)
  assertEquals(tanZaku.check(collection), 1, "Should score with five ribbons")

  // Test precedence with aka-tan
  collection.clear()
  collection.addMany(POETRY_RIBBONS)
  collection.add(RED_RIBBONS[0])
  collection.add(BLUE_RIBBONS[0])

  // Should not score when aka-tan is present and multiple ribbon yaku are not allowed
  assertEquals(
    tanZaku.check(collection, { rules: { allowMultipleRibbonYaku: false } }),
    0,
    "Should not score when aka-tan is present"
  )

  // Test precedence with ao-tan
  collection.clear()
  collection.addMany(BLUE_RIBBONS)
  collection.add(RED_RIBBONS[0])
  collection.add(POETRY_RIBBONS[0])

  // Should not score when ao-tan is present and multiple ribbon yaku are not allowed
  assertEquals(
    tanZaku.check(collection, { rules: { allowMultipleRibbonYaku: false } }),
    0,
    "Should not score when ao-tan is present"
  )

  // Should score when multiple ribbon yaku are allowed
  assertEquals(
    tanZaku.check(collection, { rules: { allowMultipleRibbonYaku: true } }),
    1,
    "Should score when multiple ribbon yaku are allowed"
  )
})
