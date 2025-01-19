import { defineYaku } from "../base.ts"
import { CardType } from "../../../core/cards.ts"

// Chaff (カス)
export const KASU = defineYaku({
  name: "kasu",
  description: ["Ten Chaff Cards"],
  points: 1,
  pattern: {
    cards: [{ type: CardType.CHAFF, count: 10 }],
  },
})
