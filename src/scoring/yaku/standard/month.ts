import { defineYaku } from "../base.ts"
import type { YakuInstance } from "../types.ts"

// Month Cards (月札)
export const TSUKI_FUDA: YakuInstance = defineYaku({
  name: "tsuki-fuda",
  description: ["Four Cards of the Same Month"],
  points: 4,
  pattern: {
    // Note: The actual month to match will be provided via context
    cards: [
      { month: undefined, count: 4 }, // month will be set by the rules checker
    ],
  },
})
