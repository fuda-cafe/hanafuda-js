import Deck from "./src/deck.js"
import { GameState } from "./src/game.js"
import { GameLoop, PlayerChoice } from "./src/gameLoop.js"

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const gameState = new GameState()
  const gameLoop = new GameLoop(gameState)

  // Start a new round
  gameLoop.startRound()

  // Handle player turns
  gameLoop.playTurn(cardIndex, matchingCards)

  // Handle koi-koi choices
  gameLoop.makeChoice(PlayerChoice.KOI_KOI)
}
