import { defineYaku } from "../base.ts"
import { CardType } from "../../../core/cards.ts"

// Poetry Ribbons (赤短)
export const AKA_TAN = defineYaku({
  name: "aka-tan",
  description: ["Poetry Ribbons"],
  points: 5,
  pattern: {
    cards: [
      { id: "pine-poetry-ribbon" },
      { id: "plum-poetry-ribbon" },
      { id: "cherry-poetry-ribbon" },
    ],
  },
})

// Blue Ribbons (青短)
export const AO_TAN = defineYaku({
  name: "ao-tan",
  description: ["Blue Ribbons"],
  points: 5,
  pattern: {
    cards: [
      { id: "peony-blue-ribbon" },
      { id: "chrysanthemum-blue-ribbon" },
      { id: "maple-blue-ribbon" },
    ],
  },
})

// Ribbons (短冊)
export const TAN = defineYaku({
  name: "tan-zaku",
  description: ["Five Ribbons"],
  points: 1,
  pattern: {
    cards: [{ type: CardType.RIBBON, count: 5 }],
  },
})
