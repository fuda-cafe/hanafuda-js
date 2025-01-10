/**
 * @typedef {import('./cards.js').Card} Card
 */

import { getCard, isValidCardIndex } from "./cards.js"

/**
 * Check if two card indices match (are from the same month)
 * @param {number} index1
 * @param {number} index2
 * @returns {boolean}
 */
export const isMatch = (index1, index2) => {
  if (!isValidCardIndex(index1) || !isValidCardIndex(index2)) return false
  const card1 = getCard(index1)
  const card2 = getCard(index2)
  return card1 && card2 && card1.month === card2.month
}

/**
 * Compare two card indices for sorting (by month, then by type)
 * @param {number} index1
 * @param {number} index2
 * @returns {number} -1 if card1 comes first, 1 if card2 comes first, 0 if equal
 */
export const compareCards = (index1, index2) => {
  const card1 = getCard(index1)
  const card2 = getCard(index2)

  if (!card1 || !card2) return 0

  // First compare by month
  if (card1.month !== card2.month) {
    return card1.month - card2.month
  }

  // Then by type (BRIGHT > ANIMAL > RIBBON > CHAFF)
  const typeOrder = { bright: 3, animal: 2, ribbon: 1, chaff: 0 }
  return typeOrder[card1.type] - typeOrder[card2.type] > 0
    ? 1
    : typeOrder[card1.type] - typeOrder[card2.type] < 0
    ? -1
    : 0
}

/**
 * Check if any cards in the iterable match the given card
 * @param {Iterable<number>} cards Iterable of card indices to search
 * @param {number} cardIndex Card to find matches for
 * @returns {boolean}
 */
export const hasMatch = (cards, cardIndex) => {
  if (!isValidCardIndex(cardIndex)) {
    throw new Error(`Invalid card index: ${cardIndex}`)
  }
  for (const index of cards) {
    if (isMatch(cardIndex, index)) return true
  }
  return false
}
