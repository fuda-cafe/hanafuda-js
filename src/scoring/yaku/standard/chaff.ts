import { defineYaku } from "../base.ts"
import { CardType } from "../../../core/cards.ts"
import type { YakuInstance } from "../types.ts"

// Chaff (カス)
export const KASU: YakuInstance = defineYaku({
  name: "kasu",
  description: ["Ten Chaff Cards"],
  points: 1,
  pattern: {
    cards: [{ type: CardType.CHAFF, count: 10 }],
  },
})
