import { assertEquals } from "@std/assert"
import {
  CardType,
  FlowerType,
  CARDS,
  getCard,
  findCardIndicesByType,
  findCardIndicesByMonth,
} from "../../src/core/cards.js"

Deno.test("Card Types", () => {
  assertEquals(CardType.BRIGHT, "bright")
  assertEquals(CardType.ANIMAL, "animal")
  assertEquals(CardType.RIBBON, "ribbon")
  assertEquals(CardType.CHAFF, "chaff")
})

Deno.test("Flower Types", () => {
  assertEquals(FlowerType.PINE, "pine")
  assertEquals(FlowerType.PLUM, "plum")
  assertEquals(FlowerType.CHERRY, "cherry")
  assertEquals(FlowerType.WISTERIA, "wisteria")
  assertEquals(FlowerType.IRIS, "iris")
  assertEquals(FlowerType.PEONY, "peony")
  assertEquals(FlowerType.BUSH_CLOVER, "bush-clover")
  assertEquals(FlowerType.SUSUKI, "susuki")
  assertEquals(FlowerType.CHRYSANTHEMUM, "chrysanthemum")
  assertEquals(FlowerType.MAPLE, "maple")
  assertEquals(FlowerType.WILLOW, "willow")
  assertEquals(FlowerType.PAULOWNIA, "paulownia")
})

Deno.test("Card Definitions", () => {
  // Test total number of cards
  assertEquals(CARDS.length, 48)

  // Test first card (Crane)
  const crane = CARDS[0]
  assertEquals(crane.type, CardType.BRIGHT)
  assertEquals(crane.flower, FlowerType.PINE)
  assertEquals(crane.month, 1)
  assertEquals(crane.name, "crane")

  // Test last card (Paulownia chaff)
  const lastCard = CARDS[47]
  assertEquals(lastCard.type, CardType.CHAFF)
  assertEquals(lastCard.flower, FlowerType.PAULOWNIA)
  assertEquals(lastCard.month, 12)
})

Deno.test("Card Retrieval", () => {
  // Test valid card
  const card = getCard(0)
  assertEquals(card?.type, CardType.BRIGHT)

  // Test invalid indices
  assertEquals(getCard(-1), null)
  assertEquals(getCard(48), null)
})

Deno.test("Find Cards by Type", () => {
  const brights = findCardIndicesByType(CardType.BRIGHT)
  assertEquals(brights.length, 5)

  const animals = findCardIndicesByType(CardType.ANIMAL)
  assertEquals(animals.length, 9)

  const ribbons = findCardIndicesByType(CardType.RIBBON)
  assertEquals(ribbons.length, 10)

  const chaff = findCardIndicesByType(CardType.CHAFF)
  assertEquals(chaff.length, 24)
})

Deno.test("Find Cards by Month", () => {
  // Test each month has exactly 4 cards
  for (let month = 1; month <= 12; month++) {
    const cards = findCardIndicesByMonth(month)
    assertEquals(cards.length, 4, `Month ${month} should have 4 cards`)
  }

  // Test invalid month
  assertEquals(findCardIndicesByMonth(13).length, 0)
  assertEquals(findCardIndicesByMonth(0).length, 0)
})
