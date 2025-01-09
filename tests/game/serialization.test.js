import { assertEquals, assertNotEquals } from "@std/assert"
import { createGameState } from "../../src/game/state.js"
import { dealInitialCards } from "../../src/game/setup.js"
import {
  serializeGameState,
  deserializeGameState,
  validateSerializedState,
} from "../../src/game/serialization.js"

const TEST_PLAYERS = ["player1", "player2"]

Deno.test("Game State Serialization - Empty State", () => {
  const state = createGameState(TEST_PLAYERS)
  const serialized = serializeGameState(state)

  // Check structure
  assertEquals(Array.isArray(serialized.deck), true, "Deck should be an array")
  assertEquals(Array.isArray(serialized.field), true, "Field should be an array")
  assertEquals(typeof serialized.players, "object", "Players should be an object")
  assertEquals(serialized.currentMonth, 1, "Should preserve month")
  assertEquals(serialized.weather, null, "Should preserve weather")

  // Check player states
  for (const player of TEST_PLAYERS) {
    assertEquals(Array.isArray(serialized.players[player].hand), true, "Hand should be an array")
    assertEquals(
      Array.isArray(serialized.players[player].captured),
      true,
      "Captured should be an array"
    )
    assertEquals(serialized.players[player].hand.length, 0, "Hand should be empty")
    assertEquals(serialized.players[player].captured.length, 0, "Captured should be empty")
  }
})

Deno.test("Game State Serialization - Dealt State", () => {
  let state = createGameState(TEST_PLAYERS)
  state = dealInitialCards(state)
  const serialized = serializeGameState(state)

  // Check card distribution
  assertEquals(serialized.deck.length, 24, "Should have 24 cards in deck")
  assertEquals(serialized.field.length, 8, "Should have 8 cards on field")
  for (const player of TEST_PLAYERS) {
    assertEquals(serialized.players[player].hand.length, 8, "Should have 8 cards in hand")
  }

  // Check for unique cards
  const allCards = [
    ...serialized.deck,
    ...serialized.field,
    ...Object.values(serialized.players).flatMap((p) => [...p.hand, ...p.captured]),
  ]
  const uniqueCards = new Set(allCards)
  assertEquals(uniqueCards.size, 48, "All cards should be unique")
})

Deno.test("Game State Deserialization", () => {
  // Create and serialize a state
  let originalState = createGameState(TEST_PLAYERS)
  originalState = dealInitialCards(originalState)
  const serialized = serializeGameState(originalState)

  // Deserialize back to state
  const deserializedState = deserializeGameState(serialized)

  // Compare structure
  assertEquals(deserializedState.deck.length, originalState.deck.length, "Should restore deck")
  assertEquals(deserializedState.field.size(), originalState.field.size(), "Should restore field")
  assertEquals(
    Object.keys(deserializedState.players).length,
    Object.keys(originalState.players).length,
    "Should restore all players"
  )

  // Compare player states
  for (const player of TEST_PLAYERS) {
    assertEquals(
      deserializedState.players[player].hand.size(),
      originalState.players[player].hand.size(),
      "Should restore hand"
    )
    assertEquals(
      deserializedState.players[player].captured.size(),
      originalState.players[player].captured.size(),
      "Should restore captured"
    )
  }

  // Compare metadata
  assertEquals(deserializedState.currentMonth, originalState.currentMonth, "Should restore month")
  assertEquals(deserializedState.weather, originalState.weather, "Should restore weather")
})

Deno.test("Serialized State Validation", () => {
  // Valid state
  const state = createGameState(TEST_PLAYERS)
  const serialized = serializeGameState(state)
  assertEquals(validateSerializedState(serialized), null, "Should validate correct state")

  // Invalid deck
  const invalidDeck = { ...serialized, deck: null }
  assertNotEquals(validateSerializedState(invalidDeck), null, "Should catch invalid deck")

  // Invalid card index
  const invalidCard = { ...serialized, deck: [48] } // Card index out of range
  assertNotEquals(validateSerializedState(invalidCard), null, "Should catch invalid card index")

  // Duplicate cards
  const duplicateCards = {
    ...serialized,
    deck: [...serialized.deck, serialized.deck[0]], // Add duplicate card
  }
  assertNotEquals(validateSerializedState(duplicateCards), null, "Should catch duplicate cards")

  // Missing required fields
  const missingField = { ...serialized }
  delete missingField.currentMonth
  assertNotEquals(validateSerializedState(missingField), null, "Should catch missing fields")
})
