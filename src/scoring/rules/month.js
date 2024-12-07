import { TSUKI_FUDA } from "../yaku/standard/month.js"
import { getCard } from "../../core/cards.js"

/**
 * @typedef {import('./types.js').MonthRules} MonthRules
 */

/**
 * Create a custom month cards yaku checker with specific rules
 * @param {MonthRules} [rules={}]
 */
export const createMonthChecker = (rules = {}) => {
  const { allowMultipleMonths = false } = rules

  return (collection, context = null) => {
    const completed = []

    if (!context?.currentMonth) return completed

    // Check current month
    const monthYaku = {
      ...TSUKI_FUDA,
      pattern: {
        cards: [{ month: context.currentMonth, count: 4 }],
      },
    }

    const monthPoints = monthYaku.check(collection)
    if (monthPoints > 0) {
      completed.push({ name: TSUKI_FUDA.name, points: monthPoints })
    }

    // If allowed, check other months too
    if (allowMultipleMonths) {
      // Get counts for all months
      const monthCounts = new Array(12).fill(0)
      for (const cardIndex of collection) {
        const card = getCard(cardIndex)
        if (card && card.month !== context.currentMonth) {
          monthCounts[card.month - 1]++
        }
      }

      // Add yaku for any other months with 4 cards
      monthCounts.forEach((count, month) => {
        if (count === 4) {
          completed.push({ name: TSUKI_FUDA.name, points: TSUKI_FUDA.points })
        }
      })
    }

    return completed
  }
}

/**
 * Default month cards yaku checker (only current month)
 */
export const checkMonthYaku = createMonthChecker()
