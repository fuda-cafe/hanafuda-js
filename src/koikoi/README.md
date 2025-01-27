# Game Module

The game module provides the core game mechanics for Hanafuda Koi-Koi, managing game state, round setup, and state persistence.

## Components

### State Management (`state.ts`)

Defines and manages the game state structure:

```typescript
import { createGameState } from "./koikoi/state"

// Create a new game state
const state = createGameState(["player1", "player2"], {
  month: 1,
  weather: "clear",
})
```

The game state includes:

- Deck of remaining cards
- Field cards
- Player hands and captured cards
- Current player and month
- Weather conditions
- Completed yaku (scoring combinations)

### Round Setup (`setup.ts`)

Handles initialization and setup of game rounds:

```typescript
import { initializeRound, dealInitialCards } from "./koikoi/setup"

// Initialize a new round
const { state, teyaku } = initializeRound(["player1", "player2"])

// Or manually setup components
let state = createGameState(playerIds)
state.currentPlayer = determineFirstPlayer(state)
state = dealInitialCards(state)
```

Key functions:

- `initializeRound`: Complete round setup
- `determineFirstPlayer`: Traditional first player selection
- `dealInitialCards`: Initial 8-card deal to players and field
- `checkInitialTeyaku`: Check for special hand combinations

### State Serialization (`serialization.ts`)

Enables saving and loading game state:

```typescript
import { serializeGameState, deserializeGameState } from "./koikoi/serialization"

// Save game state
const serialized = serializeGameState(gameState)
localStorage.setItem("savedGame", JSON.stringify(serialized))

// Load game state
const saved = JSON.parse(localStorage.getItem("savedGame"))
if (validateSerializedState(saved) === null) {
  const restored = deserializeGameState(saved)
  // Continue game with restored state
}
```

Features:

- Serialization to plain JavaScript objects
- Validation of serialized state
- Safe deserialization with error checking
- Collection handling (converting between Sets and Arrays)

## State Structure

### Game State

```typescript
interface GameState {
  deck: Deck // Remaining cards in deck
  field: Collection // Cards on the field
  players: {
    // Player states
    [id: string]: {
      hand: Collection // Cards in hand
      captured: Collection // Captured cards
    }
  }
  currentPlayer: string // Active player ID
  currentMonth: number // Current month (1-12)
  weather?: string // Weather condition
  completedYaku?: Array<{
    // Completed scoring combinations
    name: string
    points: number
  }>
}
```

### Serialized State

```typescript
interface SerializedGameState {
  deck: number[] // Card indices
  field: number[] // Card indices
  players: {
    [id: string]: {
      hand: number[] // Card indices
      captured: number[] // Card indices
    }
  }
  currentPlayer: string
  currentMonth: number
  weather?: string
  completedYaku?: Array<{
    name: string
    points: number
  }>
}
```

## Usage Examples

### Complete Game Setup

```typescript
import { initializeRound } from "./koikoi/setup"
import { serializeGameState } from "./koikoi/serialization"

// Start new game
const players = ["player1", "player2"]
const { state, teyaku } = initializeRound(players, {
  month: 1,
  weather: "clear",
})

// Check for initial scoring hands
if (Object.keys(teyaku).length > 0) {
  // Handle teyaku scoring
}

// Save game state
const serialized = serializeGameState(state)
saveToStorage(serialized)
```

### Loading Saved Game

```typescript
import { deserializeGameState, validateSerializedState } from "./koikoi/serialization"

function loadGame(savedState: SerializedGameState) {
  // Validate saved state
  const validationError = validateSerializedState(savedState)
  if (validationError) {
    throw new Error(`Invalid saved state: ${validationError}`)
  }

  // Restore game state
  return deserializeGameState(savedState)
}
```

## Design Principles

1. **Immutability**: State modifications return new state objects
2. **Type Safety**: Comprehensive TypeScript type definitions
3. **Validation**: Thorough validation of all state changes
4. **Persistence**: Safe serialization and deserialization
5. **Modularity**: Clear separation of concerns between modules

## See Also

- [Core Module](../core/README.md) - Core game mechanics
- [Scoring Module](../scoring/README.md) - Yaku scoring system
