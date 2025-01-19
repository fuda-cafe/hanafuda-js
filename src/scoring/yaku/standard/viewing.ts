import { defineYaku } from "../base.ts"
import type { YakuInstance } from "../types.ts"

// Flower Viewing (花見酒)
export const HANAMI: YakuInstance = defineYaku({
  name: "hanami-zake",
  description: ["Flower Viewing"],
  points: 3,
  pattern: {
    cards: [
      { id: "cherry-curtain" }, // Curtain with Cherry Blossoms
      { id: "chrysanthemum-sake-cup" }, // Sake Cup
    ],
  },
})

// Moon Viewing (月見酒)
export const TSUKIMI: YakuInstance = defineYaku({
  name: "tsukimi-zake",
  description: ["Moon Viewing"],
  points: 3,
  pattern: {
    cards: [
      { id: "susuki-moon" }, // Moon with Susuki Grass
      { id: "chrysanthemum-sake-cup" }, // Sake Cup
    ],
  },
})
