import { assertEquals } from "@std/assert"
import {
  CARDS,
  CardType,
  BRIGHT_CARDS,
  POETRY_RIBBONS,
  BLUE_RIBBONS,
  RED_RIBBONS,
  ANIMAL_CARDS,
  getCardName,
  getCardType,
  getCardMonth,
  findCardsByType,
  findCardsByMonth,
  compareCards,
} from "../src/cards.js"

Deno.test("Cards - Basic structure", () => {
  assertEquals(CARDS.length, 48)

  // Check first card (Crane)
  assertEquals(CARDS[0], {
    name: "matsu-ni-tsuru",
    type: CardType.BRIGHT,
    month: 1,
  })

  // Check last card (Kiri Chaff)
  assertEquals(CARDS[47], {
    name: "kiri-no-kasu-3",
    type: CardType.CHAFF,
    month: 12,
  })
})

Deno.test("Cards - Card groups are correct", () => {
  // Bright cards
  assertEquals(BRIGHT_CARDS.length, 5)
  BRIGHT_CARDS.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.BRIGHT)
  })

  // Poetry ribbons
  assertEquals(POETRY_RIBBONS.length, 3)
  POETRY_RIBBONS.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.RIBBON)
    assertEquals(CARDS[index].month <= 3, true) // First three months
  })

  // Blue ribbons
  assertEquals(BLUE_RIBBONS.length, 3)
  BLUE_RIBBONS.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.RIBBON)
  })

  // Red ribbons
  assertEquals(RED_RIBBONS.length, 4)
  RED_RIBBONS.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.RIBBON)
  })

  // Animal cards
  assertEquals(ANIMAL_CARDS.length, 9)
  ANIMAL_CARDS.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.ANIMAL)
  })
})

Deno.test("Cards - Helper functions", () => {
  // getCardName
  assertEquals(getCardName(0), "matsu-ni-tsuru")
  assertEquals(getCardName(47), "kiri-no-kasu-3")
  assertEquals(getCardName(48), null)

  // getCardType
  assertEquals(getCardType(0), CardType.BRIGHT)
  assertEquals(getCardType(2), CardType.CHAFF)
  assertEquals(getCardType(48), null)

  // getCardMonth
  assertEquals(getCardMonth(0), 1)
  assertEquals(getCardMonth(47), 12)
  assertEquals(getCardMonth(48), null)
})

Deno.test("Cards - Find functions", () => {
  // findCardsByType
  const brightCards = findCardsByType(CardType.BRIGHT)
  assertEquals(brightCards.length, 5)
  brightCards.forEach((index) => {
    assertEquals(CARDS[index].type, CardType.BRIGHT)
  })

  // findCardsByMonth
  const januaryCards = findCardsByMonth(1)
  assertEquals(januaryCards.length, 4)
  januaryCards.forEach((index) => {
    assertEquals(CARDS[index].month, 1)
  })
})

Deno.test("Cards - Distribution check", () => {
  // Count cards by month
  const monthCounts = new Array(13).fill(0)
  CARDS.forEach((card) => monthCounts[card.month]++)

  // All months should have exactly 4 cards
  for (let month = 1; month <= 12; month++) {
    assertEquals(monthCounts[month], 4)
  }

  // Count cards by type
  const typeCounts = {
    [CardType.BRIGHT]: 0,
    [CardType.ANIMAL]: 0,
    [CardType.RIBBON]: 0,
    [CardType.CHAFF]: 0,
  }
  CARDS.forEach((card) => typeCounts[card.type]++)

  // Verify type distribution
  assertEquals(typeCounts[CardType.BRIGHT], 5)
  assertEquals(typeCounts[CardType.ANIMAL], 9)
  assertEquals(typeCounts[CardType.RIBBON], 10)
  assertEquals(typeCounts[CardType.CHAFF], 24)
})

Deno.test("Cards - Compare function", () => {
  // Compare by month
  assertEquals(compareCards(0, 4) < 0, true) // January vs February
  assertEquals(compareCards(4, 0) > 0, true) // February vs January

  // Compare by type within same month
  assertEquals(compareCards(0, 2) < 0, true) // January Bright vs Plain
  assertEquals(compareCards(2, 0) > 0, true) // January Plain vs Bright

  // Compare same card
  assertEquals(compareCards(0, 0), 0)

  // Compare invalid indices
  assertEquals(compareCards(-1, 0), 0)
  assertEquals(compareCards(0, 48), 0)
  assertEquals(compareCards(-1, 48), 0)

  // Test sorting
  const unsorted = [2, 0, 1, 4, 3] // Mix of January and February cards
  const sorted = [...unsorted].sort(compareCards)
  assertEquals(sorted, [0, 1, 2, 3, 4])
})
