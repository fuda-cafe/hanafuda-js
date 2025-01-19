import type { CardType, FlowerType, Collection } from "../../core/types.ts"

/** Unique identifier for the yaku */
export type YakuName =
  | "gokou"
  | "shikou"
  | "ame-shikou"
  | "sankou"
  | "hanami-zake"
  | "tsukimi-zake"
  | "ino-shika-chou"
  | "aka-tan"
  | "ao-tan"
  | "tan-zaku"
  | "tane-zaku"
  | "kasu"
  | "kuttsuki"
  | "teshi"
  | "tsuki-fuda"

/** Pattern for matching specific cards or card properties */
export type CardPattern = {
  /** Specific card ID to match */
  id?: string
  /** Card type to match */
  type?: CardType
  /** Flower type to match */
  flower?: FlowerType
  /** Month to match */
  month?: number
  /** Number of cards required (for type/flower/month matches) */
  count?: number
}

/** Condition that affects the yaku */
export type RuleModifier = {
  /** Condition that affects the yaku */
  condition: string
  /** Point multiplier when condition is met */
  multiplier?: number
  /** Whether the condition is required for the yaku */
  required?: boolean
}

/** Pattern that defines the yaku */
export type YakuPattern = {
  /** Cards required for the yaku */
  cards: CardPattern[]
  /** Rule-specific modifiers */
  rules?: Record<string, RuleModifier>
}

/** Complete definition of a yaku scoring pattern */
export type YakuDefinition = {
  /** Unique identifier for the yaku */
  name: YakuName
  /** Human-readable description */
  description: string[]
  /** Base points for completing the yaku */
  points: number
  /** Pattern that defines the yaku */
  pattern: YakuPattern
}

/** Instance of a yaku scoring pattern */
export type YakuInstance = YakuDefinition & {
  /** Check if the yaku pattern is matched in the given collection */
  check: (collection: Collection) => number
}

/** List of completed yaku with their points */
export type YakuResults = Array<{
  name: YakuName
  points: number
}>

/** Context for yaku checking */
export type YakuContext = {
  /** Current month in the game (for tsuki-fuda yaku) */
  currentMonth: number
  /** Rule modifiers */
  rules: RuleModifier[]
  /** List of already completed yaku */
  completedYaku?: YakuResults
  /** Cards on the table */
  tableCards?: Collection
  /** Whether to check for hand yaku (teshi/kuttsuki) */
  checkTeyaku?: boolean
}
