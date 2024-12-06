import { assertEquals, assert } from "@std/assert"
import { CardCollection } from "../src/collection.js"
import { CardType } from "../src/cards.js"

Deno.test("CardCollection - initialization", () => {
  const collection = new CardCollection()
  assertEquals(collection.size, 0)
  assertEquals(collection.cards.length, 0)

  const initialCards = [0, 1, 2]
  const collectionWithCards = new CardCollection(initialCards)
  assertEquals(collectionWithCards.size, 3)
  assertEquals(collectionWithCards.cards, initialCards)
})

Deno.test("CardCollection - add and remove cards", () => {
  const collection = new CardCollection()

  // Add single card
  collection.add(0)
  assertEquals(collection.size, 1)
  assert(collection.contains(0))

  // Add multiple cards
  collection.addMany([1, 2, 3])
  assertEquals(collection.size, 4)
  assert(collection.contains(1))
  assert(collection.contains(2))
  assert(collection.contains(3))

  // Remove single card
  assert(collection.remove(0))
  assertEquals(collection.size, 3)
  assert(!collection.contains(0))

  // Remove multiple cards
  assert(collection.removeMany([1, 2]))
  assertEquals(collection.size, 1)
  assert(!collection.contains(1))
  assert(!collection.contains(2))
  assert(collection.contains(3))

  // Try to remove non-existent card
  assert(!collection.remove(10))
})

Deno.test("CardCollection - find cards by type and month", () => {
  const collection = new CardCollection([0, 1, 4, 5, 8, 9]) // Mix of bright and animal cards

  const brightCards = collection.findByType(CardType.BRIGHT)
  assertEquals(brightCards.length, 2)
  assert(brightCards.includes(0))
  assert(brightCards.includes(8))

  const monthOneCards = collection.findByMonth(1)
  assertEquals(monthOneCards.length, 2)
  assert(monthOneCards.includes(0))
  assert(monthOneCards.includes(1))
})

Deno.test("CardCollection - find matches", () => {
  const collection = new CardCollection([1, 2, 3]) // Three cards from month 1 (excluding the bright)

  // Find matches for a month 1 card
  const matches = collection.findMatches(0) // Looking for matches for Pine Bright (month 1)
  assertEquals(matches.length, 4) // Three single-card matches and one three-card match

  // Check single card matches
  assert(matches.some((match) => match.length === 1 && match[0] === 1))
  assert(matches.some((match) => match.length === 1 && match[0] === 2))
  assert(matches.some((match) => match.length === 1 && match[0] === 3))

  // Check three card match
  assert(
    matches.some(
      (match) => match.length === 3 && match.includes(1) && match.includes(2) && match.includes(3)
    )
  )

  // Find matches for card from different month
  const noMatches = collection.findMatches(4) // Card from month 2
  assertEquals(noMatches.length, 0)
})

Deno.test("CardCollection - clear", () => {
  const collection = new CardCollection([0, 1, 2])
  assertEquals(collection.size, 3)

  collection.clear()
  assertEquals(collection.size, 0)
  assertEquals(collection.cards.length, 0)
})
