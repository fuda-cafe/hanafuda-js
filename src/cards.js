/** @typedef {'chaff' | 'animal' | 'ribbon' | 'bright'} CardType */

export const CardType = Object.freeze({
  CHAFF: 0,
  ANIMAL: 1,
  RIBBON: 2,
  BRIGHT: 3,
})

/**
 * @typedef {Object} Card
 * @property {string} name
 * @property {CardType} type
 * @property {number} month
 */

const CARDS_LENGTH = 48

/** @type {ReadonlyArray<[string, CardType, number]>} */
const CARD_DATA = Object.freeze([
  // January - Pine (Matsu)
  ["matsu-ni-tsuru", CardType.BRIGHT, 1], // 0: Crane
  ["matsu-no-tan", CardType.RIBBON, 1], // 1: Poetry Ribbon
  ["matsu-no-kasu-1", CardType.CHAFF, 1], // 2: Chaff
  ["matsu-no-kasu-2", CardType.CHAFF, 1], // 3: Chaff

  // February - Plum (Ume)
  ["ume-ni-uguisu", CardType.ANIMAL, 2], // 4: Bush Warbler
  ["ume-no-tan", CardType.RIBBON, 2], // 5: Poetry Ribbon
  ["ume-no-kasu-1", CardType.CHAFF, 2], // 6: Chaff
  ["ume-no-kasu-2", CardType.CHAFF, 2], // 7: Chaff

  // March - Cherry (Sakura)
  ["sakura-ni-maku", CardType.BRIGHT, 3], // 8: Curtain
  ["sakura-no-tan", CardType.RIBBON, 3], // 9: Poetry Ribbon
  ["sakura-no-kasu-1", CardType.CHAFF, 3], // 10: Chaff
  ["sakura-no-kasu-2", CardType.CHAFF, 3], // 11: Chaff

  // April - Wisteria (Fuji)
  ["fuji-ni-hototogisu", CardType.ANIMAL, 4], // 12: Cuckoo
  ["fuji-no-tan", CardType.RIBBON, 4], // 13: Red Ribbon
  ["fuji-no-kasu-1", CardType.CHAFF, 4], // 14: Chaff
  ["fuji-no-kasu-2", CardType.CHAFF, 4], // 15: Chaff

  // May - Iris (Ayame)
  ["ayame-ni-yatsuhashi", CardType.ANIMAL, 5], // 16: Bridge
  ["ayame-no-tan", CardType.RIBBON, 5], // 17: Red Ribbon
  ["ayame-no-kasu-1", CardType.CHAFF, 5], // 18: Chaff
  ["ayame-no-kasu-2", CardType.CHAFF, 5], // 19: Chaff

  // June - Peony (Botan)
  ["botan-ni-chou", CardType.ANIMAL, 6], // 20: Butterfly
  ["botan-no-tan", CardType.RIBBON, 6], // 21: Blue Ribbon
  ["botan-no-kasu-1", CardType.CHAFF, 6], // 22: Chaff
  ["botan-no-kasu-2", CardType.CHAFF, 6], // 23: Chaff

  // July - Bush Clover (Hagi)
  ["hagi-ni-inoshishi", CardType.ANIMAL, 7], // 24: Boar
  ["hagi-no-tan", CardType.RIBBON, 7], // 25: Red Ribbon
  ["hagi-no-kasu-1", CardType.CHAFF, 7], // 26: Chaff
  ["hagi-no-kasu-2", CardType.CHAFF, 7], // 27: Chaff

  // August - Susuki Grass
  ["susuki-ni-kari", CardType.ANIMAL, 8], // 28: Geese
  ["susuki-ni-tsuki", CardType.BRIGHT, 8], // 29: Moon
  ["susuki-no-kasu-1", CardType.CHAFF, 8], // 30: Chaff
  ["susuki-no-kasu-2", CardType.CHAFF, 8], // 31: Chaff

  // September - Chrysanthemum (Kiku)
  ["kiku-ni-sakazuki", CardType.ANIMAL, 9], // 32: Sake Cup
  ["kiku-no-tan", CardType.RIBBON, 9], // 33: Blue Ribbon
  ["kiku-no-kasu-1", CardType.CHAFF, 9], // 34: Chaff
  ["kiku-no-kasu-2", CardType.CHAFF, 9], // 35: Chaff

  // October - Maple (Momiji)
  ["momiji-ni-shika", CardType.ANIMAL, 10], // 36: Deer
  ["momiji-no-tan", CardType.RIBBON, 10], // 37: Blue Ribbon
  ["momiji-no-kasu-1", CardType.CHAFF, 10], // 38: Chaff
  ["momiji-no-kasu-2", CardType.CHAFF, 10], // 39: Chaff

  // November - Willow (Yanagi)
  ["yanagi-ni-ono", CardType.BRIGHT, 11], // 40: Rain man
  ["yanagi-ni-tsubame", CardType.ANIMAL, 11], // 41: Swallow
  ["yanagi-no-tan", CardType.RIBBON, 11], // 42: Red Ribbon
  ["yanagi-no-kasu", CardType.CHAFF, 11], // 43: Chaff

  // December - Paulownia (Kiri)
  ["kiri-ni-phoenix", CardType.BRIGHT, 12], // 44: Phoenix
  ["kiri-no-kasu-1", CardType.CHAFF, 12], // 45: Chaff
  ["kiri-no-kasu-2", CardType.CHAFF, 12], // 46: Chaff
  ["kiri-no-kasu-3", CardType.CHAFF, 12], // 47: Chaff
])

/** @type {ReadonlyArray<Card>} */
export const CARDS = Object.freeze(
  Array.from({ length: CARDS_LENGTH }, (_, index) => {
    const cardData = CARD_DATA[index]
    return Object.freeze({
      name: cardData[0],
      type: cardData[1],
      month: cardData[2],
    })
  })
)

// Commonly referenced card groups
export const BRIGHT_CARDS = Object.freeze([
  0, // Crane
  8, // Curtain
  29, // Moon
  40, // Rain man
  44, // Phoenix
])

export const POETRY_RIBBONS = Object.freeze([
  1, // Pine
  5, // Plum
  9, // Cherry
])

export const BLUE_RIBBONS = Object.freeze([
  21, // Peony
  33, // Chrysanthemum
  37, // Maple
])

export const RED_RIBBONS = Object.freeze([
  13, // Wisteria
  17, // Iris
  25, // Bush Clover
  42, // Willow
])

export const ANIMAL_CARDS = Object.freeze([
  4, // Bush Warbler
  12, // Cuckoo
  16, // Bridge
  20, // Butterfly
  24, // Boar
  28, // Geese
  32, // Sake Cup
  36, // Deer
  41, // Swallow
])

export const BOAR = 24 // July Animal
export const DEER = 36 // October Animal
export const BUTTERFLY = 20 // November Animal
export const SAKE_CUP = 32 // December Animal
export const CURTAIN = 14 // March Bright
export const MOON = 29 // August Bright

// Helper functions for finding cards
/**
 * Find all cards of a specific type
 * @param {CardType} type
 * @returns {number[]}
 */
export const findCardsByType = (type) =>
  CARDS.reduce((indices, card, index) => {
    if (card.type === type) indices.push(index)
    return indices
  }, [])

/**
 * Find all cards from a specific month
 * @param {number} month
 * @returns {number[]}
 */
export const findCardsByMonth = (month) =>
  CARDS.reduce((indices, card, index) => {
    if (card.month === month) indices.push(index)
    return indices
  }, [])

export const getCardByIndex = (index) => {
  if (index < 0 || index >= CARDS_LENGTH) return null
  return CARDS[index]
}

export const getCardProperty = (index, property) => {
  const card = getCardByIndex(index)
  return card ? card[property] : null
}

export const getCardName = (index) => getCardProperty(index, "name")
export const getCardType = (index) => getCardProperty(index, "type")
export const getCardMonth = (index) => getCardProperty(index, "month")

/**
 * Check if two cards match (are from the same month)
 * @param {number} card1Index
 * @param {number} card2Index
 * @returns {boolean}
 */
export const isMatch = (card1Index, card2Index) => {
  const month1 = getCardMonth(card1Index)
  const month2 = getCardMonth(card2Index)
  return month1 !== null && month2 !== null && month1 === month2
}

/**
 * Compare two cards for sorting (by month, then by type)
 * @param {number} index1
 * @param {number} index2
 * @returns {number} -1 if card1 comes first, 1 if card2 comes first, 0 if equal
 */
export const compareCards = (index1, index2) => {
  const card1 = getCardByIndex(index1)
  const card2 = getCardByIndex(index2)

  if (!card1 || !card2) return 0

  // First compare by month
  if (card1.month !== card2.month) {
    return card1.month - card2.month
  }

  // Then by type (BRIGHT > ANIMAL > RIBBON > PLAIN)
  return card2.type - card1.type
}
