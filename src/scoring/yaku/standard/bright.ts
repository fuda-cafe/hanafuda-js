import { defineYaku } from "../base.ts"
import { CardType } from "../../../core/cards.ts"

// Five Brights (御光)
export const GOKOU = defineYaku({
  name: "gokou",
  description: ["Five Brights"],
  points: 15,
  pattern: {
    cards: [{ type: CardType.BRIGHT, count: 5 }],
  },
})

// Four Brights (四光)
export const SHIKOU = defineYaku({
  name: "shikou",
  description: ["Four Brights"],
  points: 8,
  pattern: {
    cards: [{ type: CardType.BRIGHT, count: 4 }],
  },
})

// Rain-man Four (雨四光)
export const AME_SHIKOU = defineYaku({
  name: "ame-shikou",
  description: ["Rain-man Four"],
  points: 7,
  pattern: {
    cards: [{ id: "willow-rain-man" }, { type: CardType.BRIGHT, count: 3 }],
  },
})

// Three Brights (三光)
export const SANKOU = defineYaku({
  name: "sankou",
  description: ["Three Brights"],
  points: 6,
  pattern: {
    cards: [{ type: CardType.BRIGHT, count: 3 }],
  },
})
