import { describe, it, expect } from "vitest"
import { createKoiKoiGame } from "../../src/koikoi/game.ts"
import type { GamePhase, GameResult, KoiKoiGame } from "../../src/koikoi/types.ts"
import type { GameState } from "../../src/koikoi/state.ts"

// Define the augmented state type that includes runtime properties
type RuntimeGameState = GameState & {
  phase: GamePhase
  currentPlayer: string | null
  selectedHandCard: number | null
  selectedFieldCards: number[]
  drawnCard: number | null
}

const TEST_PLAYERS = ["player1", "player2"]

describe("KoiKoi - Game", () => {
  it("initializes game state", () => {
    const game = createKoiKoiGame()
    const uninitializedState = game.getState()

    // Initial state should be null until startRound is called
    expect(uninitializedState).toBeNull()

    game.startRound()
    const initializedState = game.getState()
    expect(initializedState).not.toBeNull()
  })

  it("starts a round correctly", () => {
    const game = createKoiKoiGame()
    const { state } = game.startRound(TEST_PLAYERS)
    const runtimeState = state as RuntimeGameState

    // Check phase
    expect(runtimeState.phase).toBe("WAITING_FOR_HAND_CARD")

    // Check players exist
    expect("player1" in state.players).toBe(true)
    expect("player2" in state.players).toBe(true)

    // Check initial card distribution
    expect(state.deck.size).toBe(24)
    expect(state.players.player1.hand.size).toBe(8)
    expect(state.players.player2.hand.size).toBe(8)
    expect(state.field.size).toBe(8)
  })

  it("allows phase setting in debug mode", () => {
    const game = createKoiKoiGame({ debug: true })
    game.startRound()

    // Should be able to set phase in debug mode
    game.setPhase?.("WAITING_FOR_HAND_CARD")
    const state = game.getState() as RuntimeGameState
    expect(state?.phase).toBe("WAITING_FOR_HAND_CARD")

    game.setPhase?.("WAITING_FOR_KOI_DECISION")
    expect((game.getState() as RuntimeGameState)?.phase).toBe("WAITING_FOR_KOI_DECISION")
  })

  it("prevents phase setting in production mode", () => {
    const game = createKoiKoiGame()
    game.startRound()

    // Should not have setPhase method in production mode
    expect(game.setPhase).toBeUndefined()
  })

  it("handles card selection", () => {
    const game = createKoiKoiGame()
    game.startRound()

    const result = game.selectCard(game.getCurrentHand()?.[0] ?? 0, "hand")
    expect(result.type === "NO_MATCHES" || result.type === "SELECTION_UPDATED").toBe(true)

    if (result.type === "NO_MATCHES") {
      expect(result.data.hasMatches).toBe(false)
    } else {
      expect(result.data.selectedHandCard).not.toBeNull()
    }
  })

  it("handles card playing", () => {
    // Set correct phase for placing card (debug mode)
    const debugGame = createKoiKoiGame({ debug: true })
    debugGame.startRound()
    debugGame.selectCard(debugGame.getCurrentHand()?.[0] ?? 0, "hand")
    debugGame.setPhase?.("NO_MATCHES_DISCARD")

    const result = debugGame.placeSelectedCard()
    expect(result.type).toBe("CARD_PLACED")
    expect(result.data.nextAction.type).toBe("DECK_DRAW")
  })

  it("handles koi-koi decisions", () => {
    const game = createKoiKoiGame({ debug: true })
    game.startRound()
    game.setPhase?.("WAITING_FOR_KOI_DECISION")

    // Test continuing (koi-koi)
    const continueResult = game.makeKoiKoiDecision(true)
    expect(continueResult.type).toBe("TURN_END")
    expect((game.getState() as RuntimeGameState)?.phase).toBe("WAITING_FOR_HAND_CARD")

    // Test ending
    game.setPhase?.("WAITING_FOR_KOI_DECISION")
    const endResult = game.makeKoiKoiDecision(false)
    expect(endResult.type).toBe("ROUND_END")
    expect(endResult.data.phase).toBe("ROUND_END")
    expect(endResult.data.winner).toBeDefined()
  })
})
