import { createCollection } from "../../src/core/collection.ts"
import { CardType } from "../../src/core/cards.ts"
import { describe, it, expect } from "vitest"
import type { Collection } from "../../src/core/types.ts"

describe("Collection", () => {
  it("finds cards by type and month", () => {
    const collection: Collection = createCollection({
      cards: [
        0, // Crane (BRIGHT, month 1)
        4, // Bush Warbler (ANIMAL, month 2)
        8, // Curtain (BRIGHT, month 3)
        12, // Cuckoo (ANIMAL, month 4)
      ],
    })

    // Find by type
    const brights: number[] = collection.findByType(CardType.BRIGHT)
    expect(brights.length).toBe(2)
    expect(brights.includes(0)).toBe(true)
    expect(brights.includes(8)).toBe(true)

    const animals: number[] = collection.findByType(CardType.ANIMAL)
    expect(animals.length).toBe(2)
    expect(animals.includes(4)).toBe(true)
    expect(animals.includes(12)).toBe(true)

    // Find by month
    const month1Cards: number[] = collection.findByMonth(1)
    expect(month1Cards.length).toBe(1)
    expect(month1Cards[0]).toBe(0)

    // Non-existent month
    const month5Cards: number[] = collection.findByMonth(5)
    expect(month5Cards.length).toBe(0)
  })

  it("performs basic collection operations", () => {
    const collection: Collection = createCollection({ cards: [0, 1, 2] })

    // Check has
    expect(collection.has(0)).toBe(true)
    expect(collection.has(3)).toBe(false)

    // Clear
    collection.clear()
    expect(collection.size).toBe(0)
    expect(collection.has(0)).toBe(false)
  })

  it("maintains collection immutability", () => {
    const collection: Collection = createCollection({ cards: [0, 1, 2] })
    const array: number[] = Array.from(collection)

    // Modifying returned array shouldn't affect collection
    array.pop()
    expect(collection.size).toBe(3)
    expect(Array.from(collection).length).toBe(3)

    // Collection methods should return new arrays
    const type1: number[] = collection.findByType(CardType.BRIGHT)
    const type2: number[] = collection.findByType(CardType.BRIGHT)
    type1.pop()
    expect(type1.length).not.toBe(type2.length)
  })

  it("handles card addition and removal", () => {
    const collection: Collection = createCollection()

    // Add single card
    collection.add(0)
    expect(collection.has(0)).toBe(true)
    expect(collection.size).toBe(1)

    // Add multiple cards
    collection.addMany([1, 2])
    expect(collection.has(1)).toBe(true)
    expect(collection.has(2)).toBe(true)
    expect(collection.size).toBe(3)

    // Remove card
    collection.remove(0)
    expect(collection.has(0)).toBe(false)
    expect(collection.size).toBe(2)
  })

  it("prevents duplicate cards", () => {
    const collection: Collection = createCollection()

    collection.add(0)
    collection.add(0) // Try to add same card
    expect(collection.size).toBe(1)

    collection.addMany([0, 1, 1]) // Try to add duplicates
    expect(collection.size).toBe(2)
  })

  it("supports iteration", () => {
    const collection: Collection = createCollection({ cards: [0, 1, 2] })
    const cards: number[] = []

    for (const card of collection) {
      cards.push(card)
    }

    expect(cards).toEqual([0, 1, 2])
  })

  it("validates card indices", () => {
    // Invalid initial cards
    expect(() => createCollection({ cards: [-1] })).toThrow("Invalid card index")
    expect(() => createCollection({ cards: [48] })).toThrow("Invalid card index")
    expect(() => createCollection({ cards: [1.5] })).toThrow("Invalid card index")
    expect(() => createCollection({ cards: ["0"] as unknown as number[] })).toThrow(
      "Invalid card index"
    )

    // Invalid add operations
    const collection: Collection = createCollection()
    expect(() => collection.add(-1)).toThrow("Invalid card index")
    expect(() => collection.addMany([0, 48, 1])).toThrow("Invalid card index")
  })

  it("provides string representation", () => {
    const collection: Collection = createCollection({ cards: [0, 1, 2] })

    // Test toString method
    expect(collection.toString()).toBe("Collection(0, 1, 2)")

    // Test empty collection
    const emptyCollection: Collection = createCollection()
    expect(emptyCollection.toString()).toBe("Collection()")
  })

  it("handles JSON serialization", () => {
    const original: Collection = createCollection({ cards: [0, 1, 2] })

    // Test toJSON method
    expect(original.toJSON()).toEqual([0, 1, 2])

    // Test JSON.stringify integration
    const json: string = JSON.stringify(original)
    expect(json).toBe("[0,1,2]")

    // Test empty collection
    const empty: Collection = createCollection()
    expect(JSON.stringify(empty)).toBe("[]")
  })

  it("handles JSON deserialization", () => {
    const original: Collection = createCollection({ cards: [0, 1, 2] })
    const json: string = JSON.stringify(original)

    // Test creating from JSON string
    const restored: Collection = createCollection({ fromJSON: json })
    expect(restored.size).toBe(3)
    expect(Array.from(restored)).toEqual([0, 1, 2])

    // Test with empty collection
    const emptyJson = "[]"
    const emptyRestored: Collection = createCollection({ fromJSON: emptyJson })
    expect(emptyRestored.size).toBe(0)

    // Test invalid JSON
    expect(() => createCollection({ fromJSON: "invalid json" })).toThrow("Unexpected token")

    // Test invalid card indices in JSON
    expect(() => createCollection({ fromJSON: "[-1]" })).toThrow("Invalid card index")
  })

  it("supports array-like access", () => {
    const collection: Collection = createCollection({ cards: [0, 1, 2] })
    expect(collection[0]).toBe(0)
    expect(collection[1]).toBe(1)
    expect(collection[2]).toBe(2)
  })
})
