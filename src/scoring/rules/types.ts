export type ViewingYakuMode = "NEVER" | "LIMITED" | "ALWAYS"

export type BrightRules = {
  /** Whether to allow scoring multiple bright yaku */
  allowMultiple?: boolean
}

export type AnimalRules = {
  /** Whether to allow scoring both Ino-Shika-Chou and Tane */
  allowMultiple?: boolean
  /** Points per additional animal */
  extraPoints?: number
  /** Whether to count sake cup as animal */
  countSakeCup?: boolean
}

export type RibbonRules = {
  /** Whether to allow scoring multiple ribbon yaku */
  allowMultiple?: boolean
  /** Points per additional ribbon */
  extraPoints?: number
}

export type ViewingRules = {
  /** How to recognize viewing yaku */
  mode?: ViewingYakuMode
  /** Whether viewing yaku are affected by weather */
  weatherDependent?: boolean
  /** Whether to award bonus points during appropriate seasons */
  seasonalBonus?: boolean
  /** Whether to restrict yaku to their appropriate seasons */
  seasonalOnly?: boolean
}

export type ChaffRules = {
  /** Points per additional chaff */
  extraPoints?: number
  /** Whether to count sake cup as chaff */
  countSakeCup?: boolean
}

export type MonthRules = {
  /** Whether to allow scoring multiple month sets */
  allowMultipleMonths?: boolean
}

export type RuleConfig = {
  bright?: BrightRules
  animal?: AnimalRules
  ribbon?: RibbonRules
  viewing?: ViewingRules
  chaff?: ChaffRules
  month?: MonthRules
}
