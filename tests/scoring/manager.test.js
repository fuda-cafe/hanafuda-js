import { assertEquals } from "@std/assert"
import { createCollection } from "../../src/core/collection.js"
import { createScoringManager, KOIKOI_RULES, HACHI_RULES } from "../../src/scoring/manager.js"

// Test card indices
const CRANE = 0 // Pine Bright
const CURTAIN = 8 // Cherry Bright
const MOON = 28 // Susuki Bright
const RAIN_MAN = 44 // Willow Bright
const PHOENIX = 40 // Paulownia Bright

const BOAR = 24 // Bush Clover Animal
const DEER = 36 // Maple Animal
const BUTTERFLY = 20 // Peony Animal
const SAKE_CUP = 32 // Chrysanthemum Animal/Chaff

Deno.test("ScoringManager - Koi-Koi Rules", () => {
  const collection = createCollection()
  const scoring = createScoringManager(KOIKOI_RULES)

  // Test bright yaku with no multiple scoring
  collection.addMany([CRANE, CURTAIN, MOON])
  let result = scoring(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "sankou", "Should be sankou")

  collection.add(RAIN_MAN)
  result = scoring(collection)
  assertEquals(result.length, 1, "Should still find one yaku")
  assertEquals(result[0].name, "shikou", "Should be shikou")

  // Test animal yaku with sake cup as animal
  collection.clear()
  collection.addMany([BOAR, DEER, BUTTERFLY, SAKE_CUP])
  result = scoring(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].points, 6, "Should count sake cup as animal")
})

// TODO: Fix this test
Deno.test.ignore("ScoringManager - Hachi-Hachi Rules", () => {
  const collection = createCollection()
  const scoring = createScoringManager(HACHI_RULES)

  // Test bright yaku with rain-man requirement
  collection.addMany([CRANE, CURTAIN, MOON, PHOENIX])
  let result = scoring(collection)
  assertEquals(result.length, 0, "Should not score without rain-man")

  collection.remove(PHOENIX)
  collection.add(RAIN_MAN)
  result = scoring(collection)
  assertEquals(result.length, 1, "Should score with rain-man")
  assertEquals(result[0].name, "ame-shikou", "Should be ame-shikou")

  // Test animal yaku with sake cup as chaff
  collection.clear()
  collection.addMany([BOAR, DEER, BUTTERFLY, SAKE_CUP])
  result = scoring(collection)
  assertEquals(result[0].points, 5, "Should not count sake cup as animal")
})

Deno.test("ScoringManager - Hand Yaku Priority", () => {
  const collection = createCollection()
  const scoring = createScoringManager(KOIKOI_RULES)

  // Create a hand that could score both teshi and animal yaku
  const fourOfKind = [0, 1, 2, 3] // Four Pine cards
  const otherCards = [4, 5, 6, 7] // Four Plum cards
  collection.addMany([...fourOfKind, ...otherCards])

  // Should only score teshi when checking hand yaku
  const result = scoring(collection, { checkTeyaku: true, currentMonth: 1 })
  assertEquals(result.length, 1, "Should only score hand yaku")
  assertEquals(result[0].name, "teshi", "Should be teshi")

  // Should score normal yaku when not checking hand yaku
  const normalResult = scoring(collection, { currentMonth: 1 })
  assertEquals(normalResult.length, 1, "Should score normal yaku")
  assertEquals(normalResult[0].name, "tsuki-fuda", "Should be tsuki-fuda")
})
