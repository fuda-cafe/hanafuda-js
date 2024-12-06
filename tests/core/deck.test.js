import { assertEquals, assertNotEquals } from "@std/assert"
import { createDeck, createStandardDeck } from "../../src/core/deck.js"

Deno.test("Create Empty Deck", () => {
  const deck = createDeck({ cards: [] })
  assertEquals(deck.size(), 0)
  assertEquals(deck.isEmpty(), true)
  assertEquals(deck.draw(), null)
})

Deno.test("Create Standard Deck", () => {
  const deck = createStandardDeck()
  assertEquals(deck.size(), 48)
  assertEquals(deck.isEmpty(), false)

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
  const initialSize = deck.size()

  const card = deck.draw()
  assertEquals(typeof card, "number")
  assertEquals(card >= 0 && card < 48, true)
  assertEquals(deck.size(), initialSize - 1)

  // Drawing all cards
  const cards = []
  while (!deck.isEmpty()) {
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
  assertEquals(deck.size(), 40)

  // Custom draw count
  const threecards = deck.drawMany(3)
  assertEquals(threecards.length, 3)
  assertEquals(deck.size(), 37)

  // Drawing more cards than available
  const remaining = deck.drawMany(50)
  assertEquals(remaining.length, 37)
  assertEquals(deck.isEmpty(), true)
})

Deno.test("Deck Immutability", () => {
  const deck = createStandardDeck()
  const initialSize = deck.size()

  // Modifying returned cards array shouldn't affect deck
  const cards = deck.cards
  cards.pop()
  assertEquals(deck.size(), initialSize)
  assertEquals(deck.cards.length, initialSize)

  // Drawing shouldn't affect previously returned cards array
  deck.draw()
  assertEquals(cards.length + 1, initialSize)
})
