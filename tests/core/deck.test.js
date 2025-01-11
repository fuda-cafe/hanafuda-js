import { assertEquals, assertNotEquals, assertThrows, assert } from "@std/assert"
import { createDeck, createStandardDeck } from "../../src/core/deck.js"

Deno.test("Create Empty Deck", () => {
  const deck = createDeck({ cards: [] })
  assertEquals(deck.size, 0)
  assertEquals(deck.isEmpty, true)
  assertEquals(deck.draw(), null)
})

Deno.test("Create Standard Deck", () => {
  const deck = createStandardDeck()
  assertEquals(deck.size, 48)
  assertEquals(deck.isEmpty, false)

  // Test that all cards are present
  const allCards = new Set(deck.cards)
  assertEquals(allCards.size, 48)
  for (let i = 0; i < 48; i++) {
    assertEquals(allCards.has(i), true)
  }
})

Deno.test("Deck Shuffling", () => {
  // Test both initial shuffle and reshuffle
  const orderedDeck = createDeck({ shuffled: false })
  const originalOrder = [...orderedDeck.cards]

  let differentOrderCount = 0
  const iterations = 100

  for (let i = 0; i < iterations; i++) {
    orderedDeck.reshuffle()

    // Verify all cards are still present
    assertEquals(orderedDeck.size, 48)
    assertEquals(new Set(orderedDeck.cards), new Set(Array.from({ length: 48 }, (_, i) => i)))

    // Count if order is different from original
    if (orderedDeck.cards.some((card, index) => card !== originalOrder[index])) {
      differentOrderCount++
    }
  }

  assert(
    differentOrderCount > 98,
    `Shuffle produced too many identical orders: ${differentOrderCount} different out of ${iterations}`
  )

  // Test that unshuffled decks are in order
  const newOrderedDeck = createDeck({ shuffled: false })
  assertEquals(
    newOrderedDeck.cards,
    Array.from({ length: 48 }, (_, i) => i)
  )
})

Deno.test("Draw Single Card", () => {
  const deck = createStandardDeck()
  const initialSize = deck.size

  const card = deck.draw()
  assertEquals(typeof card, "number")
  assertEquals(card >= 0 && card < 48, true)
  assertEquals(deck.size, initialSize - 1)

  // Drawing all cards
  const cards = []
  while (!deck.isEmpty) {
    cards.push(deck.draw())
  }
  assertEquals(cards.length, initialSize - 1)
  assertEquals(deck.draw(), null)
})

Deno.test("Draw Multiple Cards", () => {
  const deck = createStandardDeck()

  // Default draw count (8)
  const hand = deck.drawMany()
  assertEquals(hand.length, 8)
  assertEquals(deck.size, 40)

  // Custom draw count
  const threecards = deck.drawMany(3)
  assertEquals(threecards.length, 3)
  assertEquals(deck.size, 37)

  // Drawing more cards than available
  const remaining = deck.drawMany(50)
  assertEquals(remaining.length, 37)
  assertEquals(deck.isEmpty, true)
})

Deno.test("Place Card on Top of Deck", () => {
  const deck = createDeck({ cards: [7, 8, 9, 10] })
  const initialSize = deck.size
  const cardToPlace = 47

  deck.placeOnTop(cardToPlace)
  assertEquals(deck.size, initialSize + 1)
  assertEquals(deck.cards[deck.size - 1], cardToPlace) // Check if card is on top

  // Attempt to place the same card again
  assertThrows(() => deck.placeOnTop(cardToPlace), Error, `Card ${cardToPlace} already in deck`)
  // Size should remain the same after attempting to add duplicate
  assertEquals(deck.size, initialSize + 1)
  // Card should still be on top
  assertEquals(deck.cards[deck.size - 1], cardToPlace)
})

Deno.test("Place Card on Bottom of Deck", () => {
  const deck = createDeck({ cards: [7, 8, 9, 10] })
  const initialSize = deck.size
  const cardToPlace = 47

  deck.placeOnBottom(cardToPlace)
  assertEquals(deck.size, initialSize + 1)
  assertEquals(deck.cards[0], cardToPlace) // Check if card is at the bottom

  // Attempt to place the same card again
  assertThrows(() => deck.placeOnBottom(cardToPlace), Error, `Card ${cardToPlace} already in deck`)
  // Size should remain the same after attempting to add duplicate
  assertEquals(deck.size, initialSize + 1)
  // Card should still be at the bottom
  assertEquals(deck.cards[0], cardToPlace)
})

Deno.test("Deck Immutability", () => {
  const deck = createStandardDeck()
  const initialSize = deck.size

  // Modifying returned cards array shouldn't affect deck
  const cards = deck.cards
  cards.pop()
  assertEquals(deck.size, initialSize)
  assertEquals(deck.cards.length, initialSize)

  // Drawing shouldn't affect previously returned cards array
  deck.draw()
  assertEquals(cards.length + 1, initialSize)
})

Deno.test("Deck String Representation", () => {
  const deck = createDeck({
    cards: [0, 1, 2],
    shuffled: false,
  })

  // Test toString method
  assertEquals(deck.toString(), "Deck(0, 1, 2)")

  // Test empty deck
  const emptyDeck = createDeck({ cards: [] })
  assertEquals(emptyDeck.toString(), "Deck()")
})

Deno.test("Deck JSON Serialization", () => {
  const original = createDeck({
    cards: [0, 1, 2],
    shuffled: false,
  })

  // Test toJSON method - returns array directly
  assertEquals(original.toJSON(), [0, 1, 2])

  // Test JSON.stringify integration - returns string
  const json = JSON.stringify(original)
  assertEquals(json, "[0,1,2]")

  // Test empty deck
  const empty = createDeck({ cards: [] })
  assertEquals(JSON.stringify(empty), "[]")
})

Deno.test("Deck JSON Deserialization", () => {
  const original = createDeck({
    cards: [0, 1, 2],
    shuffled: false,
  })
  const json = JSON.stringify(original)

  // Test creating from JSON string
  const restored = createDeck({ fromJSON: json, shuffled: false })
  assertEquals(restored.size, 3)
  assertEquals(restored.cards, [0, 1, 2])

  // Test with empty deck
  const emptyJson = "[]"
  const emptyRestored = createDeck({ fromJSON: emptyJson })
  assertEquals(emptyRestored.size, 0)

  // Test invalid JSON
  assertThrows(() => createDeck({ fromJSON: "invalid json" }), Error, "Unexpected token")

  // Test invalid card indices in JSON
  assertThrows(() => createDeck({ fromJSON: "[-1]" }), Error, "Invalid card index")
})
