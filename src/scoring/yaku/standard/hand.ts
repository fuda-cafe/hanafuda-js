import { defineYaku } from "../base.ts"

// Four of a Kind (手四)
export const TESHI = defineYaku({
  name: "teshi",
  description: ["Four Cards of the Same Month in Initial Hand"],
  points: 6,
  pattern: {
    cards: [
      { month: undefined, count: 4 }, // month will be determined during checking
    ],
  },
})

// Four Pairs (くっつき)
export const KUTTSUKI = defineYaku({
  name: "kuttsuki",
  description: ["Four Pairs in Initial Hand"],
  points: 6,
  pattern: {
    cards: [
      { month: undefined, count: 2 }, // First pair
      { month: undefined, count: 2 }, // Second pair
      { month: undefined, count: 2 }, // Third pair
      { month: undefined, count: 2 }, // Fourth pair
    ],
  },
})