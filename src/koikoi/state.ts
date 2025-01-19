import { createDeck } from "../core/deck.ts"
import { createCollection } from "../core/collection.ts"
import type { Collection, Deck } from "../core/types.ts"
import { InvalidStateError } from "../errors.ts"

export type PlayerState = {
  hand: Collection
  captured: Collection
}

export type GameState = {
  deck: Deck
  field: Collection
  players: Record<string, PlayerState>
  currentMonth: number
  weather: string | null
  completedYaku: Array<{ name: string; points: number }>
  debug?: boolean
  toJSON(): any
  toString(): string
}

/**
 * Create initial game state for a new round
 */
export function createGameState(
  playerIds: string[],
  options: { month?: number; weather?: string; fromJSON?: string; debug?: boolean } = {}
): Readonly<GameState> {
  const { month = 1, weather = null, fromJSON, debug = false } = options

  if (fromJSON) {
    return deserializeState(fromJSON)
  }

  // Initialize empty player states
  const players: Record<string, PlayerState> = {}
  for (const id of playerIds) {
    players[id] = {
      hand: createCollection(),
      captured: createCollection(),
    }
  }

  // Create a mutable container for state that needs to change
  const mutableState = {
    currentMonth: month,
    completedYaku: [],
  }

  const state = {
    deck: createDeck(),
    field: createCollection(),
    players,
    get currentMonth() {
      return mutableState.currentMonth
    },
    set currentMonth(newMonth: number) {
      if (newMonth >= 1 && newMonth <= 12) {
        mutableState.currentMonth = newMonth
      } else {
        throw new Error(`Invalid month: ${newMonth}`)
      }
    },
    weather,
    get completedYaku() {
      return [...mutableState.completedYaku]
    },
    set completedYaku(yaku) {
      mutableState.completedYaku = [...yaku]
    },
    toJSON() {
      return {
        deck: this.deck.toJSON(),
        field: this.field.toJSON(),
        players: Object.fromEntries(
          Object.entries(this.players).map(([id, state]) => [
            id,
            {
              hand: state.hand.toJSON(),
              captured: state.captured.toJSON(),
            },
          ])
        ),
        currentMonth: mutableState.currentMonth,
        weather: this.weather,
        completedYaku: mutableState.completedYaku,
      }
    },
    toString() {
      return `GameState(month: ${mutableState.currentMonth})`
    },
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.toString()
    },
  } as const satisfies GameState

  return Object.freeze(state)
}

/**
 * Deserialize a game state from JSON
 * @param {string} json - JSON string to parse
 * @returns {Readonly<GameState>}
 * @throws {InvalidStateError} If JSON is invalid
 */
function deserializeState(json: string): Readonly<GameState> {
  const data: GameState = JSON.parse(json)

  // Validate required properties
  if (!data.deck || !data.field || !data.players || !data.currentMonth) {
    throw new InvalidStateError("Invalid state data: missing required properties")
  }

  // Create state with collections
  const state: GameState = {
    deck: createDeck({ fromJSON: JSON.stringify(data.deck) }),
    field: createCollection({ fromJSON: JSON.stringify(data.field) }),
    players: {},
    currentMonth: data.currentMonth,
    weather: data.weather,
    completedYaku: data.completedYaku || [],
    toJSON() {
      return {
        deck: this.deck.toJSON(),
        field: this.field.toJSON(),
        players: Object.fromEntries(
          Object.entries(this.players).map(([id, state]) => [
            id,
            {
              hand: state.hand.toJSON(),
              captured: state.captured.toJSON(),
            },
          ])
        ),
        currentMonth: this.currentMonth,
        weather: this.weather,
        completedYaku: this.completedYaku,
      }
    },
    toString() {
      return `GameState(month: ${this.currentMonth})`
    },
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.toString()
    },
  }

  // Restore player states
  for (const [playerId, playerData] of Object.entries(data.players)) {
    state.players[playerId] = {
      hand: createCollection({ fromJSON: JSON.stringify(playerData.hand) }),
      captured: createCollection({ fromJSON: JSON.stringify(playerData.captured) }),
    }
  }

  return Object.freeze(state)
}

/**
 * Validates a game state object
 * @throws {InvalidStateError} If state is invalid
 */
export function validateGameState(state: GameState): boolean {
  // Check required properties
  if (!state.deck || !state.field || !state.players) {
    throw new InvalidStateError("Invalid state data: missing required properties")
  }

  // Validate players
  for (const [_, playerState] of Object.entries(state.players)) {
    if (!playerState.hand || !playerState.captured) {
      throw new InvalidStateError("Invalid state data: missing player hand or captured")
    }
  }

  // Validate card uniqueness
  const allCards = new Set([
    ...state.deck.toJSON(),
    ...state.field.toJSON(),
    ...Object.values(state.players).flatMap((p) => [...p.hand.toJSON(), ...p.captured.toJSON()]),
  ])

  // Total cards should be 48
  if (allCards.size !== 48) {
    throw new InvalidStateError("Invalid state data: total cards should be 48")
  }

  return true
}
