import { assertEquals } from "@std/assert"
import { createCollection } from "../../../src/core/collection.js"
import { createAnimalChecker } from "../../../src/scoring/rules/animal.js"

// Helper function to get card indices for specific cards
const BOAR = 24 // Bush Clover Boar (Month 7)
const DEER = 36 // Maple Deer (Month 10)
const BUTTERFLY = 20 // Peony Butterfly (Month 6)
const SAKE_CUP = 32 // Chrysanthemum Sake Cup (Month 9)

// Additional animal cards for tane testing
const GEESE = 29 // Susuki Grass Goose (Month 8)
const WARBLER = 4 // Plum Warbler (Month 2)
const CUCKOO = 12 // Wisteria Cuckoo (Month 4)
const SWALLOW = 41 // Swallow (Month 11)

Deno.test("AnimalYaku - ino-shika-chou (boar-deer-butterfly)", () => {
  const collection = createCollection()
  let animalChecker = createAnimalChecker()

  // Test basic ino-shika-chou
  collection.addMany([BOAR, DEER, BUTTERFLY])
  let result = animalChecker(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "ino-shika-chou", "Should be ino-shika-chou yaku")
  assertEquals(result[0].points, 5, "Should score 5 points")

  // Test with missing animal
  collection.remove(BOAR)
  result = animalChecker(collection)
  assertEquals(result.length, 0, "Should not score without all three animals")

  // Test with extra animal
  collection.addMany([BOAR, GEESE])
  result = animalChecker(collection)
  assertEquals(result[0].points, 6, "Should score extra point for additional animal")

  // Test with sake cup in different modes
  animalChecker = createAnimalChecker({ sakeCupMode: "ANIMAL_ONLY" })
  collection.add(SAKE_CUP)
  result = animalChecker(collection)
  assertEquals(result[0].points, 7, "Should count sake cup in ANIMAL_ONLY mode")

  animalChecker = createAnimalChecker({ sakeCupMode: "CHAFF_ONLY" })
  result = animalChecker(collection)
  assertEquals(result[0].points, 6, "Should not count sake cup in CHAFF_ONLY mode")
})

Deno.test("AnimalYaku - tane-zaku (animals)", () => {
  const collection = createCollection()
  let animalChecker = createAnimalChecker()

  // Test basic tane (5 animals)
  collection.addMany([BOAR, DEER, CUCKOO, GEESE, WARBLER])
  let result = animalChecker(collection)
  assertEquals(result.length, 1, "Should find one yaku")
  assertEquals(result[0].name, "tane-zaku", "Should be tane-zaku yaku")
  assertEquals(result[0].points, 1, "Should score 1 point")

  // Test with extra animals
  collection.add(SWALLOW)
  result = animalChecker(collection)
  assertEquals(result[0].points, 2, "Should score extra point for additional animal")

  // Test with sake cup
  collection.add(SAKE_CUP)
  result = animalChecker(collection) // Default mode is ANIMAL_ONLY
  assertEquals(result[0].points, 3, "Should count sake cup in ANIMAL_ONLY mode")

  animalChecker = createAnimalChecker({ sakeCupMode: "CHAFF_ONLY" })
  result = animalChecker(collection)
  assertEquals(result[0].points, 2, "Should not count sake cup in CHAFF_ONLY mode")

  // Test precedence with ino-shika-chou
  collection.clear()
  collection.addMany([BOAR, DEER, BUTTERFLY, GEESE, WARBLER])
  animalChecker = createAnimalChecker() // Default for allowMultiple is true
  result = animalChecker(collection)
  assertEquals(result.length, 2, "Should score both animal yaku")
  assertEquals(
    result.map((y) => y.name).sort(),
    ["ino-shika-chou", "tane-zaku"],
    "Should include both animal yaku"
  )
  animalChecker = createAnimalChecker({ allowMultiple: false })
  result = animalChecker(collection)
  assertEquals(result.length, 1, "Should only score one animal yaku")
  assertEquals(result[0].name, "ino-shika-chou", "Should prioritize ino-shika-chou")
})
