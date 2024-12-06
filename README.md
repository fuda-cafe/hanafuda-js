# Hanafuda Game Library

A modular JavaScript library for implementing Hanafuda card games, with a focus on Koi-Koi. This library provides core functionality for card management, game state handling, and scoring according to traditional Koi-Koi rules.

## Features

- Complete Hanafuda deck management
- Card collection handling with matching and grouping
- Koi-Koi game state management
- Comprehensive yaku (scoring combinations) system
- Configurable rule variations
- Test mode for deterministic card distributions

## Installation

```bash
# TODO: Add installation instructions once published
```

## Basic Usage

Here's a basic example of setting up and playing a game of Koi-Koi:

```javascript
import { KoiKoiGameState, PlayerChoice } from './src/variants/koikoi/gameState.js'

// Create a new game instance
const game = new KoiKoiGameState()

// Start a new round
game.startRound()

// Game loop example
while (game.currentPhase !== 'ROUND_END') {
  const currentPlayer = game.currentPlayer
  const playerHand = currentPlayer === 1 ? game.player1Hand : game.player2Hand

  switch (game.currentPhase) {
    case 'MATCHING_HAND': {
      // Player selects a card from their hand and optional matching cards from table
      const selectedHandCard = // ... get player's hand card selection
      const selectedTableCards = // ... get player's table card selections
      game.playTurn(selectedHandCard, selectedTableCards)
      break
    }

    case 'MATCHING_DECK': {
      // Handle drawn card matches if any
      // This phase occurs after playing a card from hand
      break
    }

    case 'CHOOSING_KOI': {
      // Player decides whether to continue (Koi-Koi) or end round
      const choice = // ... get player's choice
      game.makeChoice(choice) // PlayerChoice.KOI_KOI or PlayerChoice.SHOBU
      break
    }
  }
}
```

## Game State Management

The `KoiKoiGameState` class manages the complete game flow:

### Game Phases

- `DEALING`: Initial card distribution
- `MATCHING_HAND`: Player selecting card from hand and matching with table cards
- `MATCHING_DECK`: Handling matches with drawn card
- `CHOOSING_KOI`: Player deciding to continue or end round after scoring
- `ROUND_END`: Round is complete, final scoring

### Player Actions

1. Playing a Card:

```javascript
// Play a card from hand with optional matching cards from table
game.playTurn(handCardIndex, matchingTableCards)
```

2. Making Koi-Koi Decision:

```javascript
// Choose to continue (Koi-Koi) or end round (Shobu)
game.makeChoice(PlayerChoice.KOI_KOI) // or PlayerChoice.SHOBU
```

## Card Collections

The library provides a `CardCollection` class for managing groups of cards:

```javascript
import { CardCollection } from "./src/collection.js"

// Create collections for different card groups
const hand = new CardCollection()
const table = new CardCollection()

// Add/remove cards
hand.add(cardIndex)
hand.remove(cardIndex)

// Find matching cards
const matches = table.findMatches(cardIndex)

// Find cards by type or month
const brightCards = hand.findByType(CardType.BRIGHT)
const januaryCards = hand.findByMonth(1)
```

## Scoring System

The scoring system is based on traditional yaku combinations:

### Basic Yaku Types

1. Bright Cards (光):

   - Five Brights (五光): 15 points
   - Four Brights (四光): 8 points
   - Rain Man Four (雨四光): 7 points
   - Three Brights (三光): 6 points

2. Animal Cards (タネ):

   - Boar-Deer-Butterfly (猪鹿蝶): 5 points
   - Animals (タネ): 1 point per card after 5

3. Ribbon Cards (短冊):

   - Poetry Ribbons (赤短): 6 points
   - Blue Ribbons (青短): 6 points
   - Ribbons (短冊): 1 point per card after 5

4. Viewing Cards:
   - Flower Viewing (花見酒): 3 points
   - Moon Viewing (月見酒): 3 points

### Customizing Rules

```javascript
import { createRuleConfig } from "./src/scoring/rules.js"

const customRules = createRuleConfig({
  viewingYakuMode: "WEATHER_DEPENDENT",
  sakeCupMode: "BOTH",
  allowMultipleAnimalYaku: true,
  allowMultipleRibbonYaku: false,
})

// Apply custom rules to scoring
game.scoring.updateRules(customRules)
```

## Testing Support

The library includes support for testing with deterministic card distributions:

```javascript
import { Deck } from "./src/deck.js"

// Create a deck with known card order
const testDeck = new Deck({
  cards: [0, 1, 2, 3], // Specific card indices
  noShuffle: true, // Prevent shuffling
  testMode: true, // Enable peeking at cards
})
```

## License

[Add your chosen license here]
