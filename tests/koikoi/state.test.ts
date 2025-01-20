import { describe, it, expect } from "vitest"
import { createGameState, validateGameState } from "../../src/koikoi/state.ts"
import type { GameState } from "../../src/koikoi/state.ts"

describe("KoiKoi - Game State", () => {
  describe("Creation", () => {
    it("creates initial game state", () => {
      const state = createGameState(["player1", "player2"])

      expect(state.currentMonth).toBe(1)
      expect(state.weather).toBeNull()
      expect(state.completedYaku).toHaveLength(0)
      expect(Object.keys(state.players)).toHaveLength(2)
    })

    it("accepts custom options", () => {
      const state = createGameState(["player1", "player2"], {
        month: 3,
        weather: "rain",
      })

      expect(state.currentMonth).toBe(3)
      expect(state.weather).toBe("rain")
    })
  })

  describe("Serialization", () => {
    it("serializes and deserializes game state", () => {
      const originalState = createGameState(["player1", "player2"], {
        month: 3,
        weather: "rain",
      })

      // Serialize and restore
      const serialized = JSON.stringify(originalState)
      const restoredState = createGameState(["player1", "player2"], { fromJSON: serialized })

      // Verify core properties
      expect(restoredState.currentMonth).toBe(3)
      expect(restoredState.weather).toBe("rain")
    })

    it("rejects invalid JSON", () => {
      expect(() => createGameState(["player1", "player2"], { fromJSON: "invalid json" })).toThrow(
        "Unexpected token"
      )
    })
  })

  describe("Validation", () => {
    it("validates a correct game state", () => {
      const state = createGameState(["player1", "player2"])
      expect(validateGameState(state)).toBe(true)
    })

    it("maintains state integrity through valid operations", () => {
      const state = createGameState(["player1", "player2"])

      // Perform valid operations
      state.field.addMany(state.deck.drawMany(8))
      state.players.player1.hand.addMany(state.deck.drawMany(8))
      state.players.player2.hand.addMany(state.deck.drawMany(8))

      // Check that core state remains valid
      expect(validateGameState(state)).toBe(true)
    })
  })
})
