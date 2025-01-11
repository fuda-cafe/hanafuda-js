import { assertEquals, assertNotEquals } from "@std/assert"
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
  const deck1 = createStandardDeck()
  const deck2 = createStandardDeck()

  // Two shuffled decks should (very likely) be different
  assertNotEquals(deck1.cards, deck2.cards)

  // Unshuffled decks should be in order
  const orderedDeck = createDeck({ shuffled: false })
  assertEquals(
    orderedDeck.cards,
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
  deck.placeOnTop(cardToPlace)
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
  deck.placeOnBottom(cardToPlace)
  // Size should remain the same after attempting to add duplicate
  assertEquals(deck.size, initialSize + 1)
  // Card should still be at the bottom
  assertEquals(deck.cards[0], cardToPlace)
})

Deno.test("Deck Reshuffling", () => {
  const deck = createDeck({ cards: [1, 2, 3, 4, 5], shuffled: false })
  const originalOrder = [...deck.cards]

  deck.reshuffle()

  // After reshuffling, the cards should be the same but in a different order
  const newOrder = deck.cards
  assertEquals(new Set(originalOrder), new Set(newOrder))
  // Note: There's a tiny chance this could fail if the shuffle happens to produce the same order
  assertNotEquals(originalOrder, newOrder)
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
