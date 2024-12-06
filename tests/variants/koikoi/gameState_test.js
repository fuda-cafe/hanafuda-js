import { assertEquals, assert } from "@std/assert"
import {
  KoiKoiGameState,
  KoiKoiPhase,
  PlayerChoice,
} from "../../../src/variants/koikoi/gameState.js"

/**
 * Creates a controlled game state for testing
 * @param {Object} options Test game state configuration
 * @param {number[]} options.player1Hand Cards in player 1's hand
 * @param {number[]} options.player2Hand Cards in player 2's hand
 * @param {number[]} options.table Cards on the table
 * @param {number[]} options.deck Cards in the deck
 * @param {number} [options.currentPlayer=1] Current player (1 or 2)
 * @param {KoiKoiPhase} [options.currentPhase=KoiKoiPhase.MATCHING_HAND] Current game phase
 * @param {boolean} [options.isKoiKoiCalled=false] Whether koi-koi has been called
 * @returns {KoiKoiGameState}
 */
function createTestGameState({
  player1Hand,
  player2Hand,
  table,
  deck,
  currentPlayer = 1,
  currentPhase = KoiKoiPhase.MATCHING_HAND,
  isKoiKoiCalled = false,
  player1Captured = [],
  player2Captured = [],
}) {
  return new KoiKoiGameState({
    player1Hand,
    player2Hand,
    table,
    deck: {
      cards: deck,
      noShuffle: true, // Ensure deterministic behavior for tests
    },
    currentPlayer,
    currentPhase,
    isKoiKoiCalled,
    player1Captured,
    player2Captured,
  })
}

Deno.test("KoiKoiGameState - initialization", () => {
  const game = new KoiKoiGameState()
  game.startRound()

  // Check initial state
  assertEquals(game.currentPhase, KoiKoiPhase.MATCHING_HAND)
  assert([1, 2].includes(game.currentPlayer)) // First player is determined by cards
  assertEquals(game.playerChoice, PlayerChoice.NONE)
  assertEquals(game.isKoiKoiCalled, false)

  // Check initial card distribution
  assertEquals(game.player1Hand.size, 8)
  assertEquals(game.player2Hand.size, 8)
  assertEquals(game.table.size, 8)
  assertEquals(game.deck.remaining, 24)
})

Deno.test("KoiKoiGameState - play turn - no match", () => {
  const game = createTestGameState({
    player1Hand: [0], // Pine Bright
    player2Hand: [4], // Pine 2
    table: [8, 12, 16, 20], // Cards from different months
    deck: [24], // Next card to draw (no match with table)
    currentPlayer: 1,
  })

  const initialTableSize = game.table.size

  // Play Pine Bright which has no matches on table
  assert(game.playTurn(0, []))

  // Card should move to table
  assert(!game.player1Hand.contains(0))
  assertEquals(
    game.table.size,
    initialTableSize + 2,
    "Table should have both played and drawn cards"
  )
  assertEquals(
    game.currentPhase,
    KoiKoiPhase.MATCHING_HAND,
    "Should return to MATCHING_HAND after no matches"
  )
})

Deno.test("KoiKoiGameState - play turn - with match", () => {
  const game = createTestGameState({
    player1Hand: [0], // Pine Bright
    player2Hand: [4], // Pine 2
    table: [1, 2, 3], // Other Pine cards
    deck: [24], // Next card to draw (no match with table)
    currentPlayer: 1,
  })

  const initialTableSize = game.table.size
  const initialCaptureSize = game.player1Captured.size

  // Play Pine Bright matching with Pine 1
  assert(game.playTurn(0, [1]))

  // Cards should move to capture pile
  assert(!game.player1Hand.contains(0))
  assert(!game.table.contains(1))
  assert(game.player1Captured.contains(0))
  assert(game.player1Captured.contains(1))
  assertEquals(game.player1Captured.size, initialCaptureSize + 2)
  assertEquals(
    game.table.size,
    initialTableSize - 1 + 1,
    "Table should have one less matched card plus drawn card"
  )
  assertEquals(
    game.currentPhase,
    KoiKoiPhase.MATCHING_HAND,
    "Should return to MATCHING_HAND after no matches with drawn card"
  )
})

Deno.test("KoiKoiGameState - phase transition after scoring yaku", () => {
  const game = createTestGameState({
    player1Hand: [0], // Pine Bright
    player2Hand: [4],
    table: [1],
    deck: [8],
    currentPlayer: 1,
    // Initialize player1Captured with Cherry Blossom Curtain and Moon (not Rain Man)
    player1Captured: [8, 29], // Cherry Blossom Curtain and Moon
  })

  // Play turn that completes sankou yaku by capturing Pine Bright
  assert(game.playTurn(0, [1]))
  assertEquals(game.currentPhase, KoiKoiPhase.CHOOSING_KOI)
})

Deno.test("KoiKoiGameState - makeChoice state updates", () => {
  const game = createTestGameState({
    currentPhase: KoiKoiPhase.CHOOSING_KOI,
    currentPlayer: 1,
  })

  assert(game.makeChoice(PlayerChoice.KOI_KOI))
  assertEquals(game.isKoiKoiCalled, true)
  assertEquals(game.currentPhase, KoiKoiPhase.MATCHING_HAND)
})

Deno.test("KoiKoiGameState - game end", () => {
  const game = new KoiKoiGameState()
  game.startRound()

  // Force game end by emptying the deck
  while (game.deck.remaining > 0) {
    game.deck.draw()
  }

  // Play any card to trigger end game check
  const currentPlayer = game.currentPlayer
  const playerHand = currentPlayer === 1 ? game.player1Hand : game.player2Hand
  assert(game.playTurn(playerHand.cards[0], []))

  assertEquals(game.currentPhase, KoiKoiPhase.ROUND_END)
  assertEquals(game.deck.remaining, 0)
})
