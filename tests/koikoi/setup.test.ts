import { describe, it, expect } from "vitest"
import { createGameState } from "../../src/koikoi/state.ts"
import { determineFirstPlayer, dealInitialCards, initializeRound } from "../../src/koikoi/setup.ts"
import type { GameState } from "../../src/koikoi/state.ts"

const TEST_PLAYERS = ["player1", "player2"]

describe("KoiKoi - Setup", () => {
  it("creates initial game state", () => {
    const state = createGameState(TEST_PLAYERS)

    // Check basic structure
    expect(state.deck.size).toBe(48)
    expect(state.field.size).toBe(0)
    expect(Object.keys(state.players)).toHaveLength(2)
    expect(state.currentMonth).toBe(1)
    expect(state.weather).toBeNull()

    // Check player states
    for (const player of TEST_PLAYERS) {
      expect(state.players[player].hand.size).toBe(0)
      expect(state.players[player].captured.size).toBe(0)
    }
  })

  it("determines first player correctly", () => {
    const state = createGameState(TEST_PLAYERS)
    const firstPlayer = determineFirstPlayer(state)

    // Check result
    expect(firstPlayer).not.toBeNull()
    expect(TEST_PLAYERS).toContain(firstPlayer)
    expect(state.deck.size).toBe(48)
  })

  it("deals initial cards correctly", () => {
    const state = createGameState(TEST_PLAYERS)
    const dealtState = dealInitialCards(state)

    // Check card distribution
    expect(dealtState.field.size).toBe(8)
    for (const player of TEST_PLAYERS) {
      expect(dealtState.players[player].hand.size).toBe(8)
    }
    expect(dealtState.deck.size).toBe(24)

    // Check for duplicate cards
    const allCards = [
      ...dealtState.deck,
      ...Array.from(dealtState.field),
      ...Object.values(dealtState.players).flatMap((p) => Array.from(p.hand)),
    ]
    const uniqueCards = new Set(allCards)
    expect(uniqueCards.size).toBe(48)
  })

  it("initializes round correctly", () => {
    const { state, teyaku, firstPlayer } = initializeRound(TEST_PLAYERS)

    // Check basic structure
    expect(state.deck.size).toBe(24)
    expect(state.field.size).toBe(8)
    expect(Object.keys(state.players)).toHaveLength(2)

    // Check player states
    for (const player of TEST_PLAYERS) {
      expect(state.players[player].hand.size).toBe(8)
      expect(state.players[player].captured.size).toBe(0)
    }

    // Check first player determination
    expect(firstPlayer).not.toBeNull()
    expect(TEST_PLAYERS).toContain(firstPlayer)

    // Check teyaku object exists
    expect(teyaku).toBeDefined()
  })
})
