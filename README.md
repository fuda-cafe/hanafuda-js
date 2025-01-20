# Hanafuda Koi-Koi

A modular JavaScript library for implementing Hanafuda card games, with a focus on Koi-Koi. This library provides core functionality for card management, game state handling, and scoring according to traditional Koi-Koi rules.

## Features

- Complete Hanafuda card game engine
- Scoring system with traditional yaku (combinations)
- State management with serialization support
- Collection-based card management
- Phase-based game flow

## Installation

### NPM

```bash
npm install @fudapop/hanafuda-js
```

### Deno

```typescript
import { KoiKoi } from "jsr:@fudapop/hanafuda-js"
```

### CDN

You can include Hanafuda-JS directly in your HTML:

```html
<script src="https://unpkg.com/@fudapop/hanafuda-js"></script>
```

Then use it globally:

```html
<script>
  const game = new hanafudaJS.KoiKoi()

  // Start a new round
  const { state, teyaku } = game.startRound()

  // Access other exports
  const deck = hanafudaJS.createStandardDeck()
  const collection = hanafudaJS.createCollection()
</script>
```

## Usage

### ESM/TypeScript

```typescript
import { KoiKoi, createStandardDeck, createCollection } from "@fudapop/hanafuda-js"

// Create a new game instance
const game = new KoiKoi()

// Start a new round
const { state, teyaku } = game.startRound()
```

### CommonJS

```javascript
const { KoiKoi, createStandardDeck, createCollection } = require("@fudapop/hanafuda-js")

// Create a new game instance
const game = new KoiKoi()

// Start a new round
const { state, teyaku } = game.startRound()
```

### Basic Game Setup

```javascript
import { KoiKoi } from "./src/koikoi/koikoi.js"

// Create a new game instance
const game = new KoiKoi()

// Start a new round
const { state, teyaku } = game.startRound()

// Check for any initial teyaku (hand yaku)
if (Object.keys(teyaku).length > 0) {
  for (const [playerId, playerTeyaku] of Object.entries(teyaku)) {
    console.log(`Player ${playerId} has teyaku:`, playerTeyaku)
  }
}
```

### Playing a Turn

```javascript
// Select a card from hand
const result = game.selectCard(cardIndex, "hand")
if (result.type === "NO_MATCHES") {
  // No matches available - card will be discarded
  game.placeSelectedCard()
} else if (result.type === "SELECTION_UPDATED") {
  // Card selected - now select matching field cards
  const fieldResult = game.selectCard(fieldCardIndex, "field")
  if (fieldResult.type === "SELECTION_UPDATED") {
    // Play the selected cards
    const playResult = game.playCards()
    // Handle the result (DECK_DRAW, SCORE_UPDATE, etc.)
  }
}
```

### Handling Drawn Cards

```javascript
// After playing cards, a card is automatically drawn
// The result will indicate if there are matches
if (result.type === "DECK_DRAW") {
  if (result.data.hasMatches) {
    // Must select matching cards from the field
    const fieldResult = game.selectCard(fieldCardIndex, "field")
    if (fieldResult.type === "SELECTION_UPDATED") {
      game.playCards()
    }
  } else {
    // Card was automatically placed on the field
    // Game moves to next player
  }
}
```

### Scoring and Koi-Koi Decisions

```javascript
// When a scoring combination is completed
if (result.type === "SCORE_UPDATE") {
  const { completedYaku } = result.data
  console.log("Completed yaku:", completedYaku)

  // Player decides whether to continue (koi-koi) or end the round
  const chooseKoiKoi = confirm("Would you like to declare Koi-Koi and continue?")
  const decision = game.makeKoiKoiDecision(chooseKoiKoi)

  if (decision.type === "ROUND_END") {
    console.log("Round ended! Winner:", decision.data.winner)
    console.log("Final yaku:", decision.data.yaku)
  }
}
```

### State Management

```javascript
// Get current game state
const state = game.getState()

// Save game state
const savedState = JSON.stringify(state)
localStorage.setItem("hanafudaGameState", savedState)

// Load game state
const loadedState = localStorage.getItem("hanafudaGameState")
if (loadedState) {
  const game = new KoiKoi()
  // TODO: Implement state loading
}
```

## Game Phases

The game follows these phases:

- `WAITING_FOR_HAND_CARD`: Player needs to select a card from their hand
- `WAITING_FOR_FIELD_CARDS`: Player needs to select matching cards from the field
- `NO_MATCHES_DISCARD`: No matches available, card will be discarded
- `WAITING_FOR_DECK_MATCH`: Player must capture matching cards for drawn card
- `WAITING_FOR_KOI_DECISION`: Player must decide whether to continue (koi-koi)
- `ROUND_END`: Round is complete

## Development

```bash
# Clone the repository
git clone https://github.com/fudapop/hanafuda-js.git

# Navigate to the project directory
cd hanafuda-js

# Install dependencies (if any)
deno install
```

## Project Structure

```
hanafuda-js/
├── src/
│   ├── core/           # Core game mechanics (cards, matching, collections)
│   ├── koikoi/           # Game state management and main game loop
│   └── scoring/        # Yaku scoring system and rules
├── tests/              # Test suites
└── README.md
```

## License

MIT
