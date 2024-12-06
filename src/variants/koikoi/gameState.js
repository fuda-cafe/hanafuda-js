import { BaseGameState } from "../../state/base.js"
import { KoiKoiScoring } from "./scoring.js"
import { GameLogger, LogLevel } from "../../utils/logger.js"
import { CardCollection } from "../../collection.js"

export const KoiKoiPhase = Object.freeze({
  DEALING: "DEALING",
  MATCHING_HAND: "MATCHING_HAND",
  MATCHING_DECK: "MATCHING_DECK",
  CHOOSING_KOI: "CHOOSING_KOI",
  ROUND_END: "ROUND_END",
})

export const PlayerChoice = Object.freeze({
  NONE: "NONE",
  SHOBU: "SHOBU", // End round and collect points
  KOI_KOI: "KOI_KOI", // Continue round
})

/**
 * @typedef {Object} KoiKoiGameStateOptions
 * @property {KoiKoiPhase} [currentPhase=KoiKoiPhase.DEALING] - Current game phase
 * @property {number} [currentPlayer=1] - Current player (1 or 2)
 * @property {PlayerChoice} [playerChoice=PlayerChoice.NONE] - Current player choice
 * @property {boolean} [isKoiKoiCalled=false] - Whether koi-koi has been called
 * @augments BaseGameStateOptions
 */

export class KoiKoiGameState extends BaseGameState {
  /** @type {KoiKoiScoring} */
  #scoring
  /** @type {RoundResult[]} */
  #roundResults = []
  /** @type {KoiKoiPhase} */
  #currentPhase = KoiKoiPhase.DEALING
  /** @type {number} */
  #currentPlayer = 1
  /** @type {PlayerChoice} */
  #playerChoice = PlayerChoice.NONE
  /** @type {boolean} */
  #isKoiKoiCalled = false
  /** @type {GameLogger} */
  #logger
  /** @type {Set<string>} */
  #completedYaku
  /** @type {number} */
  #koiKoiCount

  /**
   * Create a new KoiKoiGameState
   * @param {KoiKoiGameStateOptions} [options={}] - Initial game state options
   */
  constructor(options = {}) {
    // Destructure KoiKoiGameState-specific properties with defaults
    const {
      currentPhase = KoiKoiPhase.DEALING,
      currentPlayer = 1,
      playerChoice = PlayerChoice.NONE,
      isKoiKoiCalled = false,
      // The rest parameter syntax (...) collects all remaining properties
      // This includes: table, player1Hand, player2Hand, player1Captured,
      // player2Captured, and deck options
      ...baseOptions
    } = options

    // Pass the collection and deck options to the BaseGameState constructor
    super(baseOptions)

    // Initialize KoiKoiGameState-specific properties
    this.#scoring = new KoiKoiScoring()
    this.#currentPhase = currentPhase
    this.#currentPlayer = currentPlayer
    this.#playerChoice = playerChoice
    this.#isKoiKoiCalled = isKoiKoiCalled

    const { logLevel = LogLevel.NONE } = options

    this.#logger = new GameLogger(logLevel)
    this.#completedYaku = new Set()
    this.#koiKoiCount = 0
  }

  dealInitial(handSize = 8, tableSize = 8) {
    super.dealInitial(handSize, tableSize)
    if (this.#scoring.rules.allowTeyaku) {
      let checkCount = 0
      while (checkCount < 2) {
        this.#logger.info("Checking for initial yaku")
        const playerHand = this.getPlayerHand(this.#currentPlayer)
        const yaku = this.#scoring.findYaku(playerHand, { checkTeyaku: true })
        this.#logger.info("Found Yaku", { yaku })

        if (yaku.length > 0) {
          this.#logger.info("Initial yaku detected!")
          const points = yaku.reduce((total, { value }) => total + value, 0)
          this.#roundResults.push(
            this.#endRound({
              winner: this.#currentPlayer,
              points,
              p1Score: 0,
              p2Score: 0,
            })
          )
          break
        } else {
          this.#switchPlayer()
          checkCount++
        }
      }
    }
  }

  /**
   * Start a new round
   */
  startRound() {
    this.#logger.info("Starting new round")
    this.reset()
    this.#currentPhase = KoiKoiPhase.DEALING
    this.#isKoiKoiCalled = false
    this.#completedYaku.clear()
    this.#koiKoiCount = 0

    this.#logger.debug("Dealing initial cards")
    this.dealInitial(8, 8) // Deal 8 cards to each player and 8 to the table

    this.#determineFirstPlayer()
    this.#currentPhase = KoiKoiPhase.MATCHING_HAND

    this.#logger.info("Round started", {
      firstPlayer: this.#currentPlayer,
      table: this.table.cards,
      player1Hand: this.player1Hand.cards,
      player2Hand: this.player2Hand.cards,
    })
  }

  /**
   * Determine which player goes first based on card months
   * @returns {number} Player number (1 or 2)
   */
  #determineFirstPlayer() {
    if (this.currentRound !== 1) {
      const lastRound = this.#roundResults.at(-1)
      if (lastRound?.winner) {
        this.#currentPlayer = lastRound.winner
        return this.#currentPlayer
      }
    }

    this.#logger.debug("Determining first player")
    const p1Months = new Map()
    const p2Months = new Map()

    // Count cards by month for each player
    for (const card of this.player1Hand.cards) {
      const month = Math.floor(card / 4) + 1
      p1Months.set(month, (p1Months.get(month) || 0) + 1)
    }

    for (const card of this.player2Hand.cards) {
      const month = Math.floor(card / 4) + 1
      p2Months.set(month, (p2Months.get(month) || 0) + 1)
    }

    const p1Max = Math.max(...Array.from(p1Months.values()))
    const p2Max = Math.max(...Array.from(p2Months.values()))

    this.#currentPlayer = p1Max >= p2Max ? 1 : 2
    this.#logger.info("First player determined", {
      player: this.#currentPlayer,
      p1MaxCards: p1Max,
      p2MaxCards: p2Max,
    })

    return this.#currentPlayer
  }

  /**
   * Process a player's turn
   * @param {number} handCardIndex Index of card from hand
   * @param {number[]} matchingTableCards Indices of matching cards from table
   * @returns {boolean} True if turn was valid and processed
   */
  playTurn(handCardIndex, matchingTableCards) {
    this.#logger.info("Starting turn", {
      player: this.#currentPlayer,
      phase: this.#currentPhase,
      handCard: handCardIndex,
      matchingCards: matchingTableCards,
    })

    switch (this.#currentPhase) {
      case KoiKoiPhase.MATCHING_HAND:
        return this.#handleMatchingHand(handCardIndex, matchingTableCards)
      case KoiKoiPhase.MATCHING_DECK:
        return this.#handleMatchingDeck(matchingTableCards)
      default:
        this.#logger.warn("Invalid phase for play turn")
        return false
    }
  }

  #handleMatchingHand(handCardIndex, matchingTableCards) {
    const playerHand = this.getPlayerHand(this.#currentPlayer)

    // Validate hand card
    if (!playerHand.contains(handCardIndex)) {
      this.#logger.warn("Invalid hand card")
      return false
    }

    // Process matching
    if (!this.#processMatching(handCardIndex, matchingTableCards, playerHand)) {
      return false
    }

    // Handle deck draw phase
    return this.#handleDeckDraw()
  }

  #handleMatchingDeck(matchingTableCards) {
    const drawnCard = this.table.cards[this.table.cards.length - 1]

    // Process matching for drawn card
    if (!this.#processMatching(drawnCard, matchingTableCards, this.table)) {
      return false
    }

    // Check for yaku after matching deck card
    this.#checkForYaku()
    return true
  }

  #processMatching(cardToMatch, matchingTableCards, sourceCollection) {
    if (matchingTableCards && matchingTableCards.length > 0) {
      // Validate matches
      const matches = this.table.findMatches(cardToMatch)
      this.#logger.debug("Possible matches", { matches })

      const isValidMatch = matches.some(
        (match) =>
          match.length === matchingTableCards.length &&
          match.every((card) => matchingTableCards.includes(card))
      )

      if (!isValidMatch) {
        this.#logger.warn("Invalid match")
        return false
      }

      // Move cards to player's capture pile
      const playerCapture = this.getPlayerCaptured(this.#currentPlayer)
      this.moveCard(cardToMatch, sourceCollection, playerCapture)
      this.moveCards(matchingTableCards, this.table, playerCapture)
      this.#logger.debug("After capture", { capturePile: playerCapture.cards })
    } else {
      // No match, card goes to table
      this.moveCard(cardToMatch, sourceCollection, this.table)
      this.#logger.info("No match - Card moved to table")
    }

    return true
  }

  #handleDeckDraw() {
    const drawnCard = this.drawFromDeck()
    this.#logger.info("Drawn card", { drawnCard })

    if (drawnCard === null) {
      this.#logger.info("No more cards - ending round")
      this.#endRound()
      return true
    }

    // Check for matches with drawn card
    const possibleMatches = this.table.findMatches(drawnCard)
    this.#logger.debug("Possible matches for drawn card", { possibleMatches })

    // Add drawn card to table
    this.table.add(drawnCard)

    if (possibleMatches.length > 0) {
      // Player must choose matches for drawn card
      this.#currentPhase = KoiKoiPhase.MATCHING_DECK
      this.#logger.info("Matches available for drawn card - switching to MATCHING_DECK phase")
    } else {
      this.#logger.info("No matches for drawn card - checking for yaku")
      this.#checkForYaku()
    }

    return true
  }

  /**
   * Check for achieved yaku and handle round continuation
   */
  #checkForYaku() {
    this.#logger.info("Checking for Yaku")
    this.#logger.info("Current Player", { currentPlayer: this.#currentPlayer })

    const playerCapture = this.getPlayerCaptured(this.#currentPlayer)
    this.#logger.info("Player Capture Pile", { capturePile: playerCapture.cards })

    const yaku = this.#scoring.findYaku(playerCapture, { currentMonth: this.currentRound })
    this.#logger.info("Found Yaku", { yaku })

    // Filter for newly completed yaku
    const newYaku = yaku.filter((y) => !this.#completedYaku.has(y.name))

    if (newYaku.length > 0) {
      this.#logger.info("New Yaku detected!")

      if (this.#isKoiKoiCalled) {
        // If opponent completes yaku after koi-koi was called
        if (this.#currentPlayer !== this.#getLastKoiKoiPlayer()) {
          this.#logger.info(
            "Opponent completed yaku after koi-koi - ending round with double points"
          )
          this.#roundResults.push(this.#endRound())
        } else {
          // Record newly completed yaku
          newYaku.forEach((y) => this.#completedYaku.add(y.name))
          this.#logger.info("Setting phase to CHOOSING_KOI")
          this.#currentPhase = KoiKoiPhase.CHOOSING_KOI
        }
      } else {
        // First yaku completion
        newYaku.forEach((y) => this.#completedYaku.add(y.name))
        this.#logger.info("Setting phase to CHOOSING_KOI")
        this.#currentPhase = KoiKoiPhase.CHOOSING_KOI
      }
    } else {
      this.#logger.info("No new yaku - switching player")
      this.#switchPlayer()
    }

    this.#logger.info("Final Phase", { finalPhase: this.#currentPhase })
    this.#logger.info("====================")
  }

  /**
   * Handle player's choice to continue or end round
   * @param {PlayerChoice} choice
   * @returns {boolean}
   */
  makeChoice(choice) {
    this.#logger.info("Player making choice", {
      player: this.#currentPlayer,
      choice,
      phase: this.#currentPhase,
    })

    if (this.#currentPhase !== KoiKoiPhase.CHOOSING_KOI) {
      this.#logger.warn("Invalid phase for making choice")
      return false
    }

    this.#playerChoice = choice

    if (choice === PlayerChoice.KOI_KOI) {
      this.#logger.info("Koi-Koi called - continuing round")
      this.#isKoiKoiCalled = true
      this.#koiKoiCount++
      this.#switchPlayer()
    } else {
      this.#logger.info("Shobu called - ending round")
      this.#roundResults.push(this.#endRound())
    }

    return true
  }

  /**
   * Switch to other player's turn
   */
  #switchPlayer() {
    this.#logger.info("Switching player", {
      from: this.#currentPlayer,
      to: this.#currentPlayer === 1 ? 2 : 1,
    })
    this.#currentPlayer = this.#currentPlayer === 1 ? 2 : 1
    this.#currentPhase = KoiKoiPhase.MATCHING_HAND
  }

  /**
   * End the round and calculate final scoring
   * @param {RoundResult} [result] - Optional round result to use
   * @returns {RoundResult}
   */
  #endRound(result = null) {
    this.#logger.info("Ending round")
    this.#currentPhase = KoiKoiPhase.ROUND_END

    let finalResult = result
    if (!finalResult) {
      const p1Score = this.#scoring.calculateScore(this.player1Captured)
      const p2Score = this.#scoring.calculateScore(this.player2Captured)

      const winner = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 0
      const points = Math.max(p1Score, p2Score)

      // Apply multiplier based on koi-koi count
      const multiplier = this.#isKoiKoiCalled
        ? this.#currentPlayer !== this.#getLastKoiKoiPlayer()
          ? 2
          : this.#koiKoiCount + 1
        : 1
      const finalPoints = points * multiplier

      finalResult = {
        winner,
        points: finalPoints,
        p1Score,
        p2Score,
      }
    }

    this.#logger.info("Round results", finalResult)
    return finalResult
  }

  /**
   * Get completed yaku for the round
   * @returns {Array<Yaku>}
   */
  get roundYaku() {
    if (this.#currentPlayer === 1) {
      return this.#scoring.findYaku(this.player1Captured)
    } else {
      return this.#scoring.findYaku(this.player2Captured)
    }
  }

  // Getters
  get currentPhase() {
    return this.#currentPhase
  }
  get currentPlayer() {
    return this.#currentPlayer
  }
  get playerChoice() {
    return this.#playerChoice
  }
  get isKoiKoiCalled() {
    return this.#isKoiKoiCalled
  }
  get roundResult() {
    return this.#roundResults.at(-1)
  }
  get currentRound() {
    return this.#roundResults.length + 1
  }

  #getLastKoiKoiPlayer() {
    return this.#currentPlayer
  }
}
