import { assertEquals, assertNotEquals } from "@std/assert"
import { createGameState } from "../../src/game/state.js"
import {
  determineFirstPlayer,
  dealInitialCards,
  checkInitialTeyaku,
  initializeRound,
} from "../../src/game/setup.js"

const TEST_PLAYERS = ["player1", "player2"]

Deno.test("Game State Creation", () => {
  const state = createGameState(TEST_PLAYERS)

  // Check basic structure
  assertEquals(state.deck.length, 48, "Should have full deck")
  assertEquals(state.field.size(), 0, "Field should be empty")
  assertEquals(Object.keys(state.players).length, 2, "Should have two players")
  assertEquals(state.currentMonth, 1, "Should default to month 1")
  assertEquals(state.weather, null, "Should have no weather by default")

  // Check player states
  for (const player of TEST_PLAYERS) {
    assertEquals(state.players[player].hand.size(), 0, "Hands should be empty")
    assertEquals(state.players[player].captured.size(), 0, "Captured should be empty")
  }
})

Deno.test("First Player Determination", () => {
  const state = createGameState(TEST_PLAYERS)
  const firstPlayer = determineFirstPlayer(state)

  // Check result
  assertNotEquals(firstPlayer, null, "Should determine a first player")
  assertEquals(TEST_PLAYERS.includes(firstPlayer), true, "Should be a valid player")
  assertEquals(state.deck.length, 48, "Deck should remain unchanged")
})

Deno.test("Initial Card Dealing", () => {
  const state = createGameState(TEST_PLAYERS)
  const dealtState = dealInitialCards(state)

  // Check card distribution
  assertEquals(dealtState.field.size(), 8, "Should deal 8 cards to field")
  for (const player of TEST_PLAYERS) {
    assertEquals(dealtState.players[player].hand.size(), 8, "Should deal 8 cards to each player")
  }
  assertEquals(dealtState.deck.length, 24, "Should have 24 cards remaining")

  // Check for duplicate cards
  const allCards = [
    ...dealtState.deck,
    ...Array.from(dealtState.field),
    ...Object.values(dealtState.players).flatMap((p) => Array.from(p.hand)),
  ]
  const uniqueCards = new Set(allCards)
  assertEquals(uniqueCards.size, 48, "All cards should be unique")
})

Deno.test("Round Initialization", () => {
  const { state, teyaku } = initializeRound(TEST_PLAYERS)

  // Check complete setup
  assertEquals(state.currentPlayer !== null, true, "Should set first player")
  assertEquals(state.field.size(), 8, "Should deal field")
  assertEquals(state.players[TEST_PLAYERS[0]].hand.size(), 8, "Should deal hands")
  assertEquals(typeof teyaku, "object", "Should check for teyaku")
})
