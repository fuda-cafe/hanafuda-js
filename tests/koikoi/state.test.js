import { assertEquals, assertThrows } from "@std/assert"
import { createGameState, validateGameState } from "../../src/koikoi/state.ts"

Deno.test("Game State - Creation", async (t) => {
  await t.step("should create initial game state", () => {
    const state = createGameState(["player1", "player2"])

    assertEquals(state.currentMonth, 1, "Default month should be 1")
    assertEquals(state.weather, null, "Default weather should be null")
    assertEquals(state.completedYaku.length, 0, "Should start with no completed yaku")
    assertEquals(Object.keys(state.players).length, 2, "Should create state for two players")
  })

  await t.step("should accept custom options", () => {
    const state = createGameState(["player1", "player2"], {
      month: 3,
      weather: "rain",
    })

    assertEquals(state.currentMonth, 3, "Should use provided month")
    assertEquals(state.weather, "rain", "Should use provided weather")
  })
})

Deno.test("Game State - Serialization", async (t) => {
  await t.step("should serialize and deserialize game state", () => {
    const originalState = createGameState(["player1", "player2"], {
      month: 3,
      weather: "rain",
    })

    // Serialize and restore
    const serialized = JSON.stringify(originalState)
    const restoredState = createGameState(["player1", "player2"], { fromJSON: serialized })

    // Verify core properties
    assertEquals(restoredState.currentMonth, 3)
    assertEquals(restoredState.weather, "rain")
  })

  await t.step("should reject invalid JSON", () => {
    assertThrows(
      () => createGameState(["player1", "player2"], { fromJSON: "invalid json" }),
      Error,
      "Unexpected token"
    )
  })
})

Deno.test("Game State - Validation", async (t) => {
  await t.step("should validate a correct game state", () => {
    const state = createGameState(["player1", "player2"])
    assertEquals(validateGameState(state), true, "Valid state should pass validation")
  })

  await t.step("should maintain state integrity through valid operations", () => {
    const state = createGameState(["player1", "player2"])

    // Perform valid operations
    state.field.addMany(state.deck.drawMany(8))
    state.players.player1.hand.addMany(state.deck.drawMany(8))
    state.players.player2.hand.addMany(state.deck.drawMany(8))

    // Check that core state remains valid
    assertEquals(validateGameState(state), true)
  })
})
