import { defineYaku } from "../base.js"

// Flower Viewing (花見酒)
export const HANAMI = defineYaku({
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
export const TSUKIMI = defineYaku({
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
