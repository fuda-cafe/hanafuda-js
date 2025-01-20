import { describe, it, expect } from "vitest"
import { createKoiKoiGame } from "../../src/koikoi/game.ts"
import type { GamePhase, GameResult, KoiKoiGame } from "../../src/koikoi/types.ts"
import type { GameState } from "../../src/koikoi/state.ts"
import { createCollection } from "../../src/core/collection.ts"

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

  describe("Hand card selection", () => {
    it("handles selection with no matches", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state where there are no matches
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [0, 4, 8, 12] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [40] }),
          },
        },
      }
      game.loadState(testState)

      const result = game.selectHandCard(40)

      if (result.type === "NO_MATCHES") {
        expect(result.data).toEqual({
          selectedHandCard: 40,
        })
      } else {
        throw new Error(`Expected NO_MATCHES result. Received ${result.type}.`)
      }
    })

    it("handles selection with two matches", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state with exactly two matches
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [1, 2, 13, 25] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [0] }),
          },
        },
      }
      game.loadState(testState)

      const result = game.selectHandCard(0)

      if (result.type === "SELECTION_UPDATED") {
        const { matchingCards } = result.data
        expect(result.data).toEqual({
          selectedHandCard: 0,
          matchingCards: expect.arrayContaining([1, 2]),
          canAutoCapture: false,
          phase: "WAITING_FOR_FIELD_CARDS",
        })
        expect(matchingCards).toHaveLength(2)
      } else {
        throw new Error(`Expected SELECTION_UPDATED result. Received ${result.type}.`)
      }
    })

    it("handles selection with three matches", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state with three matches
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [1, 44, 45, 46] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [47] }),
          },
        },
      }
      game.loadState(testState)

      const result = game.selectHandCard(47)

      if (result.type === "SELECTION_UPDATED") {
        const { matchingCards } = result.data
        expect(result.data).toEqual({
          selectedHandCard: 47,
          matchingCards: expect.arrayContaining([44, 45, 46]),
          canAutoCapture: true,
          phase: "WAITING_FOR_FIELD_CARDS",
        })
        expect(matchingCards).toHaveLength(3)
      } else {
        throw new Error(`Expected SELECTION_UPDATED result. Received ${result.type}.`)
      }
    })
  })

  describe("Field card selection", () => {
    it("handles selection with three matches", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state with three matches
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [44, 45, 46] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [47] }),
          },
        },
      }
      game.loadState(testState)

      const handResult = game.selectHandCard(47)
      if (handResult.type === "SELECTION_UPDATED") {
        const fieldResult = game.selectFieldCard(44)

        expect(fieldResult).toEqual({
          type: "SELECTION_UPDATED",
          data: {
            selectedHandCard: 47,
            selectedFieldCards: expect.arrayContaining([44, 45, 46]),
            autoSelected: true,
            phase: "WAITING_FOR_FIELD_CARDS",
          },
        })
      }
    })

    it("handles selection with two matches", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state with two matches
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [1, 2] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [0] }),
          },
        },
      }
      game.loadState(testState)

      const handResult = game.selectHandCard(0)
      if (handResult.type === "SELECTION_UPDATED") {
        const fieldResult = game.selectFieldCard(1)

        expect(fieldResult).toEqual({
          type: "SELECTION_UPDATED",
          data: {
            selectedHandCard: 0,
            selectedFieldCards: [1],
            phase: "WAITING_FOR_FIELD_CARDS",
          },
        })
      }
    })

    it("handles invalid field card selection", () => {
      const game = createKoiKoiGame({ debug: true })
      game.startRound()

      // Set up a known state
      const initialState = game.getState()!
      const testState = {
        ...initialState,
        field: createCollection({ cards: [1, 2, 4] }),
        players: {
          ...initialState.players,
          player1: {
            ...initialState.players.player1,
            hand: createCollection({ cards: [0] }),
          },
        },
      }
      game.loadState(testState)

      const handResult = game.selectHandCard(0)
      if (handResult.type === "SELECTION_UPDATED") {
        const fieldResult = game.selectFieldCard(4) // Try to select non-matching card

        expect(fieldResult).toEqual({
          type: "ERROR",
          data: {
            message: expect.stringContaining("Selected cards do not match"),
          },
        })
      }
    })
  })

  it("handles card playing with no matches", () => {
    const debugGame = createKoiKoiGame({ debug: true })
    debugGame.startRound()

    const handResult = debugGame.selectHandCard(debugGame.getCurrentHand()?.[0] ?? 0)
    if (handResult.type === "NO_MATCHES") {
      debugGame.setPhase?.("NO_MATCHES_DISCARD")
      const result = debugGame.placeSelectedCard()

      expect(result.type).toBe("CARD_PLACED")
      expect(result.data).toEqual({
        placedCard: expect.any(Number),
        nextAction: expect.objectContaining({
          type: "DECK_DRAW",
          data: expect.objectContaining({
            drawnCard: expect.any(Number),
            matchingCards: expect.any(Array),
            phase: expect.any(String),
          }),
        }),
      })
    }
  })

  it("handles koi-koi decisions", () => {
    const game = createKoiKoiGame({ debug: true })
    game.startRound()
    game.setPhase?.("WAITING_FOR_KOI_DECISION")

    // Test continuing (koi-koi)
    const continueResult = game.makeKoiKoiDecision(true)
    expect(continueResult).toEqual({
      type: "TURN_END",
      data: {
        phase: "WAITING_FOR_HAND_CARD",
      },
    })

    // Test ending
    game.setPhase?.("WAITING_FOR_KOI_DECISION")
    const endResult = game.makeKoiKoiDecision(false)
    expect(endResult).toEqual({
      type: "ROUND_END",
      data: {
        winner: expect.any(String),
        phase: "ROUND_END",
        yaku: expect.any(Array),
      },
    })
  })
})
