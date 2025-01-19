import type { Collection } from "../core/types.ts"
import type { YakuName } from "./yaku/types.ts"

export * from "./yaku/types.ts"
export * from "./rules/types.ts"

export type ScoringContext = {
  /** Current month in the game */
  currentMonth?: number
  /** Current weather condition */
  weather?: string
  /** Whether to check for hand yaku */
  checkTeyaku?: boolean
  /** Completed yaku */
  completedYaku?: YakuResult[]
}

export type YakuResult = {
  /** Name of the completed yaku */
  name: YakuName
  /** Points earned */
  points: number
}

export type ScoringManager = (collection: Collection, context?: ScoringContext) => YakuResult[]
