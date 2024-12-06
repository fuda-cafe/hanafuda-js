import { KoiKoiGameState, KoiKoiPhase, PlayerChoice } from "./variants/koikoi/gameState.js"
import { getCardName, getCardMonth, getCardType } from "./cards.js"
import { readLines } from "https://deno.land/std/io/mod.ts"

class KoiKoiCLI {
  /** @type {KoiKoiGameState} */
  #gameState
  /** @type {ReadLines} */
  #reader

  constructor() {
    this.#gameState = new KoiKoiGameState({ logLevel: 3 })
    this.#reader = readLines(Deno.stdin)
  }

  async start() {
    console.log("Welcome to Hanafuda Koi-Koi!")
    this.#gameState.startRound()

    while (true) {
      this.#displayGameState()

      switch (this.#gameState.currentPhase) {
        case KoiKoiPhase.MATCHING_HAND:
          await this.#handleMatchingHand()
          break
        case KoiKoiPhase.MATCHING_DECK:
          await this.#handleMatchingDeck()
          break
        case KoiKoiPhase.CHOOSING_KOI:
          await this.#handleKoiChoice()
          break
        case KoiKoiPhase.ROUND_END:
          if (await this.#handleRoundEnd()) {
            return
          }
          break
      }
    }
  }

  #displayGameState() {
    console.clear()
    console.log("\nCurrent Game State:")
    console.log("--------------------")
    console.log(`Current Player: ${this.#gameState.currentPlayer}`)
    console.log(`Phase: ${this.#gameState.currentPhase}`)
    console.log(`Koi-Koi Called: ${this.#gameState.isKoiKoiCalled}`)

    console.log("\nTable Cards:")
    console.log("--------------------")
    this.#displayCards(this.#gameState.table.cards)

    const currentHand = this.#gameState.getPlayerHand(this.#gameState.currentPlayer)
    console.log(`\nPlayer ${this.#gameState.currentPlayer}'s Hand:`)
    console.log("--------------------")
    this.#displayCards(currentHand.cards)

    const currentCapture = this.#gameState.getPlayerCaptured(this.#gameState.currentPlayer)
    console.log(`\nPlayer ${this.#gameState.currentPlayer}'s Captured:`)
    console.log("--------------------")
    this.#displayCards(currentCapture.cards)

    // Show opponent's cards
    const otherPlayer = this.#gameState.currentPlayer === 1 ? 2 : 1
    // const otherHand = this.#gameState.getPlayerHand(otherPlayer)
    const otherCapture = this.#gameState.getPlayerCaptured(otherPlayer)

    // console.log(`\nPlayer ${otherPlayer}'s Hand:`)
    // console.log("--------------------")
    // this.#displayCards(otherHand.cards)
    console.log(`\nPlayer ${otherPlayer}'s Captured:`)
    console.log("--------------------")
    this.#displayCards(otherCapture.cards)

    console.log("\n")
  }

  /**
   * @param {number[]} cards
   */
  #displayCards(cards) {
    if (cards.length === 0) {
      console.log("(empty)")
      return
    }
    cards.forEach((card) => {
      console.log(
        `[${card.toString().padStart(2)}] ${getCardName(card).padEnd(20)} ${getCardMonth(card)
          .toString()
          .padStart(2)}-${getCardType(card)}`
      )
    })
  }

  /**
   * @param {import('./scoring/base.js').Yaku[]} yaku
   */
  #displayYaku(yaku) {
    yaku.forEach((y) => {
      console.log(`${y.name} - ${y.value} points`)
    })
  }

  async #handleMatchingHand() {
    const currentHand = this.#gameState.getPlayerHand(this.#gameState.currentPlayer)

    while (true) {
      console.log(`\nPlayer ${this.#gameState.currentPlayer}:`)
      console.log("Select a card from your hand (index):")
      const input = await this.#prompt()

      // Allow quitting
      if (input.toLowerCase() === "q") {
        process.exit(0)
      }

      const cardIndex = parseInt(input)
      if (isNaN(cardIndex) || !currentHand.cards.includes(cardIndex)) {
        console.log("Invalid card selection. Try again.")
        continue
      }

      // Show possible matches
      const matches = this.#gameState.table.findMatches(cardIndex)
      if (matches.length > 0) {
        console.log("\nPossible matches:")
        matches.forEach((card) => {
          console.log(`${getCardName(card)} [${card}]`)
        })
      }

      console.log(`\nPlayer ${this.#gameState.currentPlayer}:`)
      console.log(
        "Select matching cards from table (comma-separated indices, or empty for no match):"
      )
      const matchInput = await this.#prompt()
      const matchingCards = matchInput ? matchInput.split(",").map(Number) : []

      if (this.#gameState.playTurn(cardIndex, matchingCards)) {
        break
      }
      console.log("Invalid move! Try again.")
    }
  }

  async #handleMatchingDeck() {
    const drawnCard = this.#gameState.table.cards[this.#gameState.table.cards.length - 1]
    console.log(`\nDrawn card: ${getCardName(drawnCard)} [${drawnCard}]`)

    // Show possible matches
    const matches = this.#gameState.table.findMatches(drawnCard)
    if (matches.length > 0) {
      console.log("\nPossible matches:")
      matches.forEach((match) => {
        if (match.length === 1 && match[0] === drawnCard) {
          return
        }
        console.log(
          `${match
            .map((card) => `[${card.toString().padStart(2)}] ${getCardName(card)}`)
            .join(", ")}`
        )
      })
    }

    while (true) {
      console.log(`\nPlayer ${this.#gameState.currentPlayer}:`)
      console.log(
        "Select matching cards from table (comma-separated indices, or empty for no match):"
      )
      const input = await this.#prompt()
      const matchingCards = input ? input.split(",").map(Number) : []

      if (this.#gameState.playTurn(null, matchingCards)) {
        break
      }
      console.log("Invalid move! Try again.")
    }
  }

  async #handleKoiChoice() {
    while (true) {
      console.log("\nCurrent Yaku:")
      console.log("--------------------")
      this.#displayYaku(this.#gameState.roundYaku)

      console.log("\nMake your choice:")
      console.log("--------------------")
      console.log("1: Koi-Koi (continue)")
      console.log("2: Shobu (end round)")

      const input = await this.#prompt()
      const choice = input === "1" ? PlayerChoice.KOI_KOI : PlayerChoice.SHOBU

      if (this.#gameState.makeChoice(choice)) {
        break
      }
      console.log("Invalid choice! Try again.")
    }
  }

  async #handleRoundEnd() {
    const result = this.#gameState.roundResult
    console.log("\nRound ended!")
    console.log(`Winner: Player ${result.winner}`)
    console.log(`Points: ${result.points}`)
    console.log("\nCompleted Yaku:")
    console.log("--------------------")
    this.#displayYaku(this.#gameState.roundYaku)
    console.log("--------------------")
    console.log(`Player 1 Score: ${result.p1Score}`)
    console.log(`Player 2 Score: ${result.p2Score}`)

    while (true) {
      console.log("\nPlay another round? (y/n)")
      const input = await this.#prompt()

      if (input.toLowerCase() === "y") {
        this.#gameState.startRound()
        return false
      } else if (input.toLowerCase() === "n") {
        return true
      }
      console.log("Invalid input! Please enter 'y' or 'n'.")
    }
  }

  async #prompt() {
    const line = await this.#reader.next()
    return line.value?.trim() ?? ""
  }
}

// Start the game if this is the main module
if (import.meta.main) {
  const cli = new KoiKoiCLI()
  await cli.start()
}
