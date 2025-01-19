import { assertEquals, assertNotEquals } from "@std/assert"
import { createKoiKoiGame } from "../../src/game/koikoi.js"

Deno.test("KoiKoi - Game Initialization", () => {
  const game = createKoiKoiGame()
  const state = game.getState()

  // Initial state should be null until startRound is called
  assertEquals(state.phase, null)
  assertEquals(state.selectedHandCard, null)
  assertEquals(state.selectedFieldCards, [])
  assertEquals(state.drawnCard, null)
})

Deno.test("KoiKoi - Round Start", () => {
  const game = createKoiKoiGame()
  const { state, teyaku } = game.startRound(["player1", "player2"])

  // Check phase
  assertEquals(state.phase, "WAITING_FOR_HAND_CARD")

  // Check players exist
  assertEquals("player1" in state.players, true)
  assertEquals("player2" in state.players, true)

  // Check initial card distribution
  assertEquals(state.deck.size, 24)
  assertEquals(state.players.player1.hand.size, 8)
  assertEquals(state.players.player2.hand.size, 8)
  assertEquals(state.field.size, 8)

  // Verify teyaku object exists
  assertNotEquals(teyaku, undefined)
})

Deno.test("KoiKoi - Debug Mode Phase Setting", () => {
  const game = createKoiKoiGame({ debug: true })
  game.startRound()

  // Should be able to set phase in debug mode
  game.setPhase("WAITING_FOR_HAND_CARD")
  assertEquals(game.getState().phase, "WAITING_FOR_HAND_CARD")

  game.setPhase("WAITING_FOR_KOI_DECISION")
  assertEquals(game.getState().phase, "WAITING_FOR_KOI_DECISION")
})

Deno.test("KoiKoi - Production Mode Phase Setting", () => {
  const game = createKoiKoiGame()
  game.startRound()

  // Should not have setPhase method in production mode
  assertEquals(game.setPhase, undefined)
})

Deno.test("KoiKoi - Card Selection", () => {
  const game = createKoiKoiGame()
  game.startRound()

  const result = game.selectCard(game.getCurrentHand()[0], "hand")
  assertEquals(result.type === "NO_MATCHES" || result.type === "SELECTION_UPDATED", true)

  if (result.type === "NO_MATCHES") {
    assertEquals(result.data.hasMatches, false)
  } else {
    assertNotEquals(result.data.selectedHandCard, null)
  }
})

Deno.test("KoiKoi - Card Playing", () => {
  // Set correct phase for placing card (debug mode)
  const debugGame = createKoiKoiGame({ debug: true })
  debugGame.startRound()
  debugGame.selectCard(debugGame.getCurrentHand()[0], "hand")
  debugGame.setPhase("NO_MATCHES_DISCARD")

  const result = debugGame.placeSelectedCard()
  assertEquals(result.type, "CARD_PLACED")
  assertEquals(result.data.nextAction.type, "DECK_DRAW")
})

Deno.test("KoiKoi - Koi-Koi Decision", () => {
  const game = createKoiKoiGame({ debug: true })
  game.startRound()
  game.setPhase("WAITING_FOR_KOI_DECISION")

  // Test continuing (koi-koi)
  const continueResult = game.makeKoiKoiDecision(true)
  assertEquals(continueResult.type, "TURN_END")
  assertEquals(game.getState().phase, "WAITING_FOR_HAND_CARD")

  // Test ending
  game.setPhase("WAITING_FOR_KOI_DECISION")
  const endResult = game.makeKoiKoiDecision(false)
  assertEquals(endResult.type, "ROUND_END")
  assertEquals(endResult.data.phase, "ROUND_END")
  assertNotEquals(endResult.data.winner, undefined)
})
