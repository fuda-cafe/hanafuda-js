import { assertEquals } from "@std/assert"
import { createCollection } from "../../../src/core/collection.js"
import { checkBrightYaku, createBrightChecker } from "../../../src/scoring/rules/bright.js"
import { BRIGHT_INDICES } from "../../../src/core/cards.js"

Deno.test("Bright Yaku Precedence", () => {
  const collection = createCollection()

  // Add 3 brights
  collection.add(BRIGHT_INDICES[0]) // Crane
  collection.add(BRIGHT_INDICES[1]) // Curtain
  collection.add(BRIGHT_INDICES[2]) // Moon

  // Should score Sankou (3 brights)
  let completed = checkBrightYaku(collection)
  assertEquals(completed.length, 1)
  assertEquals(completed[0].name, "sankou")
  assertEquals(completed[0].points, 6)

  // Add 4th bright
  collection.add(BRIGHT_INDICES[3]) // Rain-man

  // Should score Ame-shikou (4 brights) instead of Sankou
  completed = checkBrightYaku(collection)
  assertEquals(completed.length, 1)
  assertEquals(completed[0].name, "ame-shikou")
  assertEquals(completed[0].points, 7)

  // Replace Rain-man with Phoenix
  collection.remove(BRIGHT_INDICES[3])
  collection.add(BRIGHT_INDICES[4]) // Phoenix

  // Should score Shikou (4 brights) instead of Sankou or Ame-shikou
  completed = checkBrightYaku(collection)
  assertEquals(completed.length, 1)
  assertEquals(completed[0].name, "shikou")
  assertEquals(completed[0].points, 8)

  // Add 5th bright
  collection.add(BRIGHT_INDICES[3]) // Rain-man

  // Should score Gokou (5 brights) instead of Shikou or Sankou
  completed = checkBrightYaku(collection)
  assertEquals(completed.length, 1)
  assertEquals(completed[0].name, "gokou")
  assertEquals(completed[0].points, 15)
})

Deno.test("Custom Bright Scoring Rules", () => {
  const collection = createCollection()

  // Add all 5 brights
  for (const index of BRIGHT_INDICES) {
    collection.add(index)
  }

  // Test allowing multiple bright yaku
  const multipleScoring = createBrightChecker({ allowMultiple: true })
  const multipleResults = multipleScoring(collection)

  assertEquals(multipleResults.length, 4) // Should score all bright yaku
  assertEquals(multipleResults[0].name, "gokou")
  assertEquals(multipleResults[1].name, "shikou")
  assertEquals(multipleResults[2].name, "ame-shikou")
  assertEquals(multipleResults[3].name, "sankou")

  // Test requiring Rain-man for 4-bright yaku
  const requireRainMan = createBrightChecker({ requireRainMan: true })
  const rainManResults = requireRainMan(collection)

  assertEquals(rainManResults.length, 1)
  assertEquals(rainManResults[0].name, "gokou") // Should still score Gokou
})
