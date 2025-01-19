import { defineYaku } from "../base.ts"
import { CardType } from "../../../core/cards.ts"
import type { YakuInstance } from "../types.ts"

// Boar-Deer-Butterfly (猪鹿蝶)
export const INO_SHIKA_CHOU: YakuInstance = defineYaku({
  name: "ino-shika-chou",
  description: ["Boar, Deer, and Butterfly"],
  points: 5,
  pattern: {
    cards: [
      { id: "bush-clover-boar" }, // Boar
      { id: "maple-deer" }, // Deer
      { id: "peony-butterfly" }, // Butterfly
    ],
  },
})

// Animals (タネ)
export const TANE: YakuInstance = defineYaku({
  name: "tane-zaku",
  description: ["Five Animals"],
  points: 1,
  pattern: {
    cards: [{ type: CardType.ANIMAL, count: 5 }],
  },
})
