import { defineYaku } from "../base.js"
import { CardType } from "../../../core/cards.js"

// Chaff (カス)
export const KASU = defineYaku({
  name: "kasu",
  description: ["Ten Chaff Cards"],
  points: 1,
  pattern: {
    cards: [{ type: CardType.CHAFF, count: 10 }],
  },
})
