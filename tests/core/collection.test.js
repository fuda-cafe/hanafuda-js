import { assertEquals, assertNotEquals, assertThrows } from "@std/assert"
import { createCollection } from "../../src/core/collection.js"
import { CardType } from "../../src/core/cards.js"

Deno.test("Create Empty Collection", () => {
  const collection = createCollection()
  assertEquals(collection.size, 0)
  assertEquals(Array.from(collection), [])
})

Deno.test("Create Collection with Initial Cards", () => {
  const cards = [0, 1, 2]
  const collection = createCollection({ cards })
  assertEquals(collection.size, 3)
  assertEquals(Array.from(collection), cards)
})

Deno.test("Add Cards", () => {
  const collection = createCollection()

  // Single card
  assertEquals(collection.add(0), true)
  assertEquals(collection.size, 1)

  // Duplicate card
  assertEquals(collection.add(0), false)
  assertEquals(collection.size, 1)

  // Multiple cards
  const added = collection.addMany([1, 2, 3])
  assertEquals(added, 3)
  assertEquals(collection.size, 4)

  // Multiple cards with duplicates
  const addedWithDups = collection.addMany([2, 3, 4])
  assertEquals(addedWithDups, 1)
  assertEquals(collection.size, 5)
})

Deno.test("Remove Cards", () => {
  const collection = createCollection({ cards: [0, 1, 2, 3] })

  // Single card
  assertEquals(collection.remove(0), true)
  assertEquals(collection.size, 3)

  // Non-existent card
  assertEquals(collection.remove(0), false)
  assertEquals(collection.size, 3)

  // Multiple cards
  const removed = collection.removeMany([1, 2])
  assertEquals(removed, 2)
  assertEquals(collection.size, 1)

  // Multiple cards with non-existent ones
  const removedNonExistent = collection.removeMany([1, 2, 3, 4])
  assertEquals(removedNonExistent, 1)
  assertEquals(collection.size, 0)
})

Deno.test("Find Cards", () => {
  const collection = createCollection({
    cards: [
      0, // Crane (BRIGHT, month 1)
      4, // Bush Warbler (ANIMAL, month 2)
      8, // Curtain (BRIGHT, month 3)
      12, // Cuckoo (ANIMAL, month 4)
    ],
  })

  // Find by type
  const brights = collection.findByType(CardType.BRIGHT)
  assertEquals(brights.length, 2)
  assertEquals(brights.includes(0), true)
  assertEquals(brights.includes(8), true)

  const animals = collection.findByType(CardType.ANIMAL)
  assertEquals(animals.length, 2)
  assertEquals(animals.includes(4), true)
  assertEquals(animals.includes(12), true)

  // Find by month
  const month1Cards = collection.findByMonth(1)
  assertEquals(month1Cards.length, 1)
  assertEquals(month1Cards[0], 0)

  // Non-existent month
  const month5Cards = collection.findByMonth(5)
  assertEquals(month5Cards.length, 0)
})

Deno.test("Collection Operations", () => {
  const collection = createCollection({ cards: [0, 1, 2] })

  // Check has
  assertEquals(collection.has(0), true)
  assertEquals(collection.has(3), false)

  // Clear
  collection.clear()
  assertEquals(collection.size, 0)
  assertEquals(collection.has(0), false)
})

Deno.test("Collection Immutability", () => {
  const collection = createCollection({ cards: [0, 1, 2] })
  const array = Array.from(collection)

  // Modifying returned array shouldn't affect collection
  array.pop()
  assertEquals(collection.size, 3)
  assertEquals(Array.from(collection).length, 3)

  // Collection methods should return new arrays
  const type1 = collection.findByType(CardType.BRIGHT)
  const type2 = collection.findByType(CardType.BRIGHT)
  type1.pop()
  assertNotEquals(type1.length, type2.length)
})

Deno.test("Collection Validation", () => {
  // Invalid initial cards
  assertThrows(() => createCollection({ cards: [-1] }), Error, "Invalid card index")

  assertThrows(() => createCollection({ cards: [48] }), Error, "Invalid card index")

  assertThrows(() => createCollection({ cards: [1.5] }), Error, "Invalid card index")

  assertThrows(() => createCollection({ cards: ["0"] }), Error, "Invalid card index")

  // Invalid add operations
  const collection = createCollection()
  assertThrows(() => collection.add(-1), Error, "Invalid card index")

  assertThrows(() => collection.addMany([0, 48, 1]), Error, "Invalid card index")
})

Deno.test("Collection String Representation", () => {
  const collection = createCollection({ cards: [0, 1, 2] })

  // Test toString method
  assertEquals(collection.toString(), "Collection(0, 1, 2)")

  // Test empty collection
  const emptyCollection = createCollection()
  assertEquals(emptyCollection.toString(), "Collection()")
})

Deno.test("Collection JSON Serialization", () => {
  const original = createCollection({ cards: [0, 1, 2] })

  // Test toJSON method
  assertEquals(original.toJSON(), [0, 1, 2])

  // Test JSON.stringify integration
  const json = JSON.stringify(original)
  assertEquals(json, "[0,1,2]")

  // Test empty collection
  const empty = createCollection()
  assertEquals(JSON.stringify(empty), "[]")
})

Deno.test("Collection JSON Deserialization", () => {
  const original = createCollection({ cards: [0, 1, 2] })
  const json = JSON.stringify(original)

  // Test creating from JSON string
  const restored = createCollection({ fromJSON: json })
  assertEquals(restored.size, 3)
  assertEquals(Array.from(restored), [0, 1, 2])

  // Test with empty collection
  const emptyJson = "[]"
  const emptyRestored = createCollection({ fromJSON: emptyJson })
  assertEquals(emptyRestored.size, 0)

  // Test invalid JSON
  assertThrows(() => createCollection({ fromJSON: "invalid json" }), Error, "Unexpected token")

  // Test invalid card indices in JSON
  assertThrows(() => createCollection({ fromJSON: "[-1]" }), Error, "Invalid card index")
})

Deno.test("Collection Array-like Access", () => {
  const collection = createCollection({ cards: [0, 1, 2] })
  assertEquals(collection[0], 0)
  assertEquals(collection[1], 1)
  assertEquals(collection[2], 2)
})
