import { assertEquals, assertNotEquals } from "@std/assert"
import { Deck } from "../src/deck.js"
import { CardCollection } from "../src/collection.js"

Deno.test("Deck - initialization", () => {
  const deck = new Deck()
  assertEquals(deck.remaining, 48)
  assertEquals(deck.isEmpty, false)
})

Deno.test("Deck - draw single card", () => {
  const deck = new Deck()
  const initialSize = deck.remaining

  const card = deck.draw()
  assertEquals(typeof card, "number")
  assertEquals(deck.remaining, initialSize - 1)
})

Deno.test("Deck - draw multiple cards", () => {
  const deck = new Deck()
  const initialSize = deck.remaining
  const numToDraw = 5

  const cards = deck.drawMany(numToDraw)
  assertEquals(cards.length, numToDraw)
  assertEquals(deck.remaining, initialSize - numToDraw)
})

Deno.test("Deck - draw to collection", () => {
  const deck = new Deck()
  const collection = new CardCollection()
  const numToDraw = 5

  // Draw cards and add them to collection
  const cards = deck.drawMany(numToDraw)
  collection.addMany(cards)

  assertEquals(collection.size, numToDraw)
  assertEquals(deck.remaining, 48 - numToDraw)
})

Deno.test("Deck - reset", () => {
  const deck = new Deck()
  deck.drawMany(10)
  assertEquals(deck.remaining, 38)

  deck.reset()
  assertEquals(deck.remaining, 48)
  assertEquals(deck.isEmpty, false)
})

Deno.test("Deck - draw until empty", () => {
  const deck = new Deck()
  const allCards = deck.drawMany(48)

  assertEquals(allCards.length, 48)
  assertEquals(deck.remaining, 0)
  assertEquals(deck.isEmpty, true)

  // Drawing from empty deck should return null
  assertEquals(deck.draw(), null)
  assertEquals(deck.drawMany(1), [])
})

Deno.test("Deck - shuffle", () => {
  const deck = new Deck()

  // Draw all cards and note the order
  const firstDraw = deck.drawMany(48)

  // Reset and shuffle
  deck.reset()

  // Draw all cards again and compare
  const secondDraw = deck.drawMany(48)

  // Orders should be different
  assertNotEquals(firstDraw, secondDraw)

  // But should contain the same cards
  firstDraw.sort()
  secondDraw.sort()
  assertEquals(firstDraw, secondDraw)
})
