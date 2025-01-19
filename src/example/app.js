import { createKoiKoiGame } from "../koikoi/game.js"
import { createGameState } from "../koikoi/state.js"
import { getCard } from "../core/cards.js"

// DOM Elements
const elements = {
  newGame: document.getElementById("newGame"),
  saveGame: document.getElementById("saveGame"),
  loadGame: document.getElementById("loadGame"),
  fieldCards: document.getElementById("fieldCards"),
  currentPlayer: document.getElementById("currentPlayer"),
  currentMonth: document.getElementById("currentMonth"),
  weather: document.getElementById("weather"),
  player1Hand: document.getElementById("player1Hand"),
  player1Captured: document.getElementById("player1Captured"),
  player2Hand: document.getElementById("player2Hand"),
  player2Captured: document.getElementById("player2Captured"),
  completedYaku: document.getElementById("completedYaku"),
}

// Game instance
let game = null

// Event Handlers
const handleCardSelect = (event) => {
  const cardElement = event.target.closest("[data-card-index]")
  if (!cardElement) return

  const cardIndex = parseInt(cardElement.dataset.cardIndex)
  const container = cardElement.closest("[id]")
  const containerId = container.id
  console.log(game.getState().toJSON())

  let result
  if (containerId === `player${game.getCurrentPlayer() === "player1" ? "1" : "2"}Hand`) {
    // Handle hand card selection
    result = game.selectCard(cardIndex, "hand")
    if (result.type === "NO_MATCHES") {
      // alert("No matches available - this card will be discarded")
    } else if (result.type === "ERROR") {
      alert(result.message)
      return
    }
  } else if (
    containerId === "fieldCards" &&
    (game.getState().phase === "WAITING_FOR_FIELD_CARDS" ||
      game.getState().phase === "WAITING_FOR_DECK_MATCH")
  ) {
    // Handle field card selection
    result = game.selectCard(cardIndex, "field")
    if (result.type === "ERROR") {
      alert(result.message)
      return
    }
  }

  renderGameState()
  updatePlayButton()
}

const updatePlayButton = () => {
  const playButton = document.getElementById("playButton")
  if (!playButton) return

  const state = game.getState()
  const canPlay =
    (state.phase === "WAITING_FOR_FIELD_CARDS" &&
      state.selectedHandCard !== null &&
      state.selectedFieldCards.length > 0) ||
    (state.phase === "NO_MATCHES_DISCARD" && state.selectedHandCard !== null) ||
    (state.phase === "WAITING_FOR_DECK_MATCH" && state.drawnCard !== null)

  playButton.disabled = !canPlay
  playButton.classList.toggle("opacity-50", !canPlay)

  // Update button text based on phase
  if (state.phase === "NO_MATCHES_DISCARD") {
    playButton.textContent = "Discard Selected Card"
  } else if (state.phase === "WAITING_FOR_DECK_MATCH") {
    playButton.textContent = "Capture Selected Cards"
  } else {
    playButton.textContent = "Play Selected Cards"
  }
}

const handlePlay = () => {
  const state = game.getState()
  let result

  if (state.phase === "NO_MATCHES_DISCARD") {
    result = game.placeSelectedCard()
  } else if (
    state.phase === "WAITING_FOR_FIELD_CARDS" ||
    state.phase === "WAITING_FOR_DECK_MATCH"
  ) {
    result = game.captureCards()
  }

  handleGameResult(result)
}

const handleGameResult = (result) => {
  switch (result.type) {
    case "DECK_DRAW":
      if (result.data.hasMatches) {
        alert("Select matching cards from the field")
      } else {
        alert(`Card was placed on the field`)
      }
      break

    case "SCORE_UPDATE":
      const yakuNames = result.data.completedYaku
        .map((y) => `${y.name} (${y.points} points)`)
        .join(", ")
      const response = confirm(
        `Completed yaku: ${yakuNames}\n\nWould you like to declare Koi-Koi and continue?`
      )
      handleKoiKoiDecision(response)
      break

    case "ROUND_END":
      if (result.data?.winner) {
        alert(`Round ended! Winner: Player ${result.data.winner === "player1" ? "1" : "2"}`)
      } else {
        alert("Round ended! (Deck empty)")
      }
      break

    case "ERROR":
      alert(result.message)
      break
  }

  renderGameState()
  updatePlayButton()
}

const handleKoiKoiDecision = (chooseKoiKoi) => {
  const result = game.makeKoiKoiDecision(chooseKoiKoi)
  handleGameResult(result)
}

const handleNewGame = () => {
  game = createKoiKoiGame()
  const { state, teyaku } = game.startRound()

  // Display any teyaku
  if (Object.keys(teyaku).length > 0) {
    for (const [playerId, playerTeyaku] of Object.entries(teyaku)) {
      const playerNum = playerId === "player1" ? "1" : "2"
      playerTeyaku.forEach((yaku) => {
        alert(`Player ${playerNum} has ${yaku.name} (${yaku.points} points)!`)
      })
    }
  }

  renderGameState()
  updatePlayButton()
}

const handleSaveGame = () => {
  if (!game) return

  const state = game.getState()
  localStorage.setItem("hanafudaGameState", JSON.stringify(state))
  alert("Game saved successfully!")
}

const handleLoadGame = () => {
  const savedState = localStorage.getItem("hanafudaGameState")
  if (!savedState) {
    alert("No saved game found!")
    return
  }

  try {
    game = createKoiKoiGame({ debug: true })
    const state = createGameState(["player1", "player2"], {
      fromJSON: savedState,
      debug: true,
    })
    const result = game.loadState(state)

    if (result.type === "ERROR") {
      throw new Error(result.message)
    }

    alert("Game loaded successfully!")
    renderGameState()
    updatePlayButton()
  } catch (error) {
    alert("Error loading game: " + error.message)
  }
}

// Rendering Functions
const createCardElement = (cardIndex) => {
  const card = document.createElement("div")
  card.className =
    "bg-white border rounded p-2 text-center hover:bg-gray-50 cursor-pointer transition-all relative w-24 h-40 flex flex-col items-center justify-center"

  const cardData = getCard(cardIndex)

  // Create a container for the card name that wraps properly
  const nameContainer = document.createElement("div")
  nameContainer.className = "text-sm leading-tight px-1"
  nameContainer.textContent = `${cardData.flower} (${cardData.type})`
  card.appendChild(nameContainer)

  // Add month badge
  const monthBadge = document.createElement("div")
  monthBadge.className =
    "absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold shadow-sm"
  monthBadge.textContent = cardData.month
  card.appendChild(monthBadge)

  card.dataset.cardIndex = cardIndex
  card.dataset.month = cardData.month
  card.dataset.type = cardData.type

  switch (cardData.type) {
    case "bright":
      card.classList.add("bg-yellow-50")
      monthBadge.classList.remove("bg-gray-800")
      monthBadge.classList.add("bg-yellow-500")
      break
    case "ribbon":
      card.classList.add("bg-blue-50")
      monthBadge.classList.remove("bg-gray-800")
      monthBadge.classList.add("bg-blue-500")
      break
    case "animal":
      card.classList.add("bg-green-50")
      monthBadge.classList.remove("bg-gray-800")
      monthBadge.classList.add("bg-green-500")
      break
    case "chaff":
      card.classList.add("bg-red-50")
      monthBadge.classList.remove("bg-gray-800")
      monthBadge.classList.add("bg-red-500")
      break
    default:
    // Default case
  }

  const state = game.getState()
  if (cardIndex === state.selectedHandCard || cardIndex === state.drawnCard) {
    card.classList.add("ring-2", "ring-blue-500")
  } else if (state.selectedFieldCards.includes(cardIndex)) {
    card.classList.add("ring-2", "ring-green-500")
  }

  return card
}

const renderCollection = (collection, container) => {
  container.innerHTML = ""
  Array.from(collection).forEach((cardIndex) => {
    container.appendChild(createCardElement(cardIndex))
  })
}

const renderGameState = () => {
  if (!game) return
  const state = game.getState()

  // Update field
  renderCollection(state.field, elements.fieldCards)

  // Update player hands and captured cards
  renderCollection(state.players.player1.hand, elements.player1Hand)
  renderCollection(state.players.player1.captured, elements.player1Captured)
  renderCollection(state.players.player2.hand, elements.player2Hand)
  renderCollection(state.players.player2.captured, elements.player2Captured)

  // Update game info
  const currentPlayerNum = game.getCurrentPlayer() === "player1" ? "1" : "2"
  elements.currentPlayer.textContent = `Player ${currentPlayerNum}'s Turn (${state.phase})`
  elements.currentMonth.textContent = `Month: ${state.currentMonth}`
  elements.weather.textContent = `Weather: ${state.weather || "Normal"}`

  // Add player indicators
  elements.player1Hand.classList.toggle("relative", true)
  elements.player2Hand.classList.toggle("relative", true)

  // Remove existing border highlights
  elements.player1Hand.classList.remove("border-l", "border-purple-500")
  elements.player2Hand.classList.remove("border-r", "border-purple-500")

  // Add arrow indicator for current player
  const indicator = document.createElement("div")
  indicator.className = "absolute -left-8 top-1/2 -translate-y-1/2 text-2xl text-purple-500"
  indicator.textContent = "➤"

  // Remove any existing indicators
  const oldIndicator = document.querySelector(".player-indicator")
  if (oldIndicator) oldIndicator.remove()

  // Add indicator to current player's hand
  indicator.classList.add("player-indicator")
  if (game.getCurrentPlayer() === "player1") {
    elements.player1Hand.appendChild(indicator)
  } else {
    elements.player2Hand.appendChild(indicator)
  }

  // Update completed yaku
  elements.completedYaku.innerHTML = ""
  if (state.completedYaku) {
    state.completedYaku.forEach((yaku) => {
      const yakuElement = document.createElement("div")
      yakuElement.className = "bg-yellow-50 p-2 rounded"
      yakuElement.textContent = `${yaku.name} (${yaku.points} points)`
      elements.completedYaku.appendChild(yakuElement)
    })
  }

  // Show drawn card if any
  if (state.drawnCard !== null) {
    const drawnCardInfo = document.createElement("div")
    drawnCardInfo.className = "bg-blue-50 p-2 rounded mt-2"
    drawnCardInfo.textContent = `Drawn Card: ${getCard(state.drawnCard).flower}`
    elements.currentPlayer.appendChild(drawnCardInfo)
  }
}

// Event Listeners
elements.newGame.addEventListener("click", handleNewGame)
elements.saveGame.addEventListener("click", handleSaveGame)
elements.loadGame.addEventListener("click", handleLoadGame)
elements.fieldCards.addEventListener("click", handleCardSelect)
elements.player1Hand.addEventListener("click", handleCardSelect)
elements.player2Hand.addEventListener("click", handleCardSelect)

// Add play button to the UI
const playButtonContainer = document.createElement("div")
playButtonContainer.className = "flex justify-center mt-4"
const playButton = document.createElement("button")
playButton.id = "playButton"
playButton.className =
  "bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
playButton.textContent = "Play Selected Cards"
playButton.disabled = true
playButton.addEventListener("click", handlePlay)
playButtonContainer.appendChild(playButton)
elements.fieldCards.parentElement.appendChild(playButtonContainer)

// Initialize
handleNewGame()
