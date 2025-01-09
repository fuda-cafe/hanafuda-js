import { KoiKoi } from "../game/koikoi.js"
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

  let result
  if (containerId === `player${game.getState().currentPlayer === "player1" ? "1" : "2"}Hand`) {
    // Handle hand card selection
    result = game.selectCard(cardIndex, "hand")
    if (result.type === "NO_MATCHES") {
      alert("No matches available - this card will be discarded")
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
    if (result.type === "MATCH_INVALID") {
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
  console.log("updatePlayButton", state)
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
  } else {
    result = game.playCards()
  }

  handleGameResult(result)
}

const handleGameResult = (result) => {
  switch (result.type) {
    case "DECK_DRAW":
      if (result.data.hasMatches) {
        // Must select matching cards
        alert("Select matching cards from the field")
      } else {
        // Card was automatically placed
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
  game = new KoiKoi()
  const { teyaku } = game.startRound()

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

  localStorage.setItem("hanafudaGameState", JSON.stringify(game.getState()))
  alert("Game saved successfully!")
}

const handleLoadGame = () => {
  const savedState = localStorage.getItem("hanafudaGameState")
  if (!savedState) {
    alert("No saved game found!")
    return
  }

  try {
    game = new KoiKoi()
    // TODO: Implement proper state loading in KoiKoi class
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
    "bg-white border rounded p-2 text-center hover:bg-gray-50 cursor-pointer transition-all"

  const cardData = getCard(cardIndex)
  const cardName = `${cardData.flower} (${cardData.type})`
  card.textContent = cardName

  // Add data attributes for card info
  card.dataset.cardIndex = cardIndex
  card.dataset.month = cardData.month
  card.dataset.type = cardData.type

  // Add selection state if applicable
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
  const cards = Array.from(collection)
  cards.forEach((cardIndex) => {
    container.appendChild(createCardElement(cardIndex))
  })
}

const renderGameState = () => {
  if (!game) return
  const state = game.getState()

  // Update field
  renderCollection(state.field, elements.fieldCards)

  // Update player hands and captured cards
  renderCollection(state.players["player1"].hand, elements.player1Hand)
  renderCollection(state.players["player1"].captured, elements.player1Captured)
  renderCollection(state.players["player2"].hand, elements.player2Hand)
  renderCollection(state.players["player2"].captured, elements.player2Captured)

  // Update game info
  const currentPlayerNum = state.currentPlayer === "player1" ? "1" : "2"
  elements.currentPlayer.textContent = `Player ${currentPlayerNum}'s Turn (${state.phase})`
  elements.currentMonth.textContent = `Month: ${state.currentMonth}`
  elements.weather.textContent = `Weather: ${state.weather || "Normal"}`

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
