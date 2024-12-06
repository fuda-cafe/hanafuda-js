/**
 * @typedef {'chaff' | 'animal' | 'ribbon' | 'bright'} CardType
 * @typedef {'pine' | 'plum' | 'cherry' | 'wisteria' | 'iris' | 'peony' |
 *           'bush-clover' | 'susuki' | 'chrysanthemum' | 'maple' | 'willow' |
 *           'paulownia'} FlowerType
 */

export const CardType = Object.freeze({
  CHAFF: "chaff",
  ANIMAL: "animal",
  RIBBON: "ribbon",
  BRIGHT: "bright",
})

export const FlowerType = Object.freeze({
  PINE: "pine",
  PLUM: "plum",
  CHERRY: "cherry",
  WISTERIA: "wisteria",
  IRIS: "iris",
  PEONY: "peony",
  BUSH_CLOVER: "bush-clover",
  SUSUKI: "susuki",
  CHRYSANTHEMUM: "chrysanthemum",
  MAPLE: "maple",
  WILLOW: "willow",
  PAULOWNIA: "paulownia",
})

/**
 * @typedef {Object} Card
 * @property {string} id Unique card identifier
 * @property {string} name Display name
 * @property {CardType} type Card type
 * @property {FlowerType} flower Flower type
 * @property {number} month Month number (1-12)
 */

const CARDS_LENGTH = 48

/** @type {ReadonlyArray<[string, CardType, FlowerType, number]>} */
const CARD_DATA = Object.freeze([
  // January - Pine (Matsu)
  ["crane", CardType.BRIGHT, FlowerType.PINE, 1],
  ["poetry-ribbon", CardType.RIBBON, FlowerType.PINE, 1],
  ["chaff-1", CardType.CHAFF, FlowerType.PINE, 1],
  ["chaff-2", CardType.CHAFF, FlowerType.PINE, 1],

  // February - Plum (Ume)
  ["bush-warbler", CardType.ANIMAL, FlowerType.PLUM, 2],
  ["poetry-ribbon", CardType.RIBBON, FlowerType.PLUM, 2],
  ["chaff-1", CardType.CHAFF, FlowerType.PLUM, 2],
  ["chaff-2", CardType.CHAFF, FlowerType.PLUM, 2],

  // March - Cherry (Sakura)
  ["curtain", CardType.BRIGHT, FlowerType.CHERRY, 3],
  ["poetry-ribbon", CardType.RIBBON, FlowerType.CHERRY, 3],
  ["chaff-1", CardType.CHAFF, FlowerType.CHERRY, 3],
  ["chaff-2", CardType.CHAFF, FlowerType.CHERRY, 3],

  // April - Wisteria (Fuji)
  ["cuckoo", CardType.ANIMAL, FlowerType.WISTERIA, 4],
  ["red-ribbon", CardType.RIBBON, FlowerType.WISTERIA, 4],
  ["chaff-1", CardType.CHAFF, FlowerType.WISTERIA, 4],
  ["chaff-2", CardType.CHAFF, FlowerType.WISTERIA, 4],

  // May - Iris (Ayame)
  ["bridge", CardType.ANIMAL, FlowerType.IRIS, 5],
  ["red-ribbon", CardType.RIBBON, FlowerType.IRIS, 5],
  ["chaff-1", CardType.CHAFF, FlowerType.IRIS, 5],
  ["chaff-2", CardType.CHAFF, FlowerType.IRIS, 5],

  // June - Peony (Botan)
  ["butterfly", CardType.ANIMAL, FlowerType.PEONY, 6],
  ["blue-ribbon", CardType.RIBBON, FlowerType.PEONY, 6],
  ["chaff-1", CardType.CHAFF, FlowerType.PEONY, 6],
  ["chaff-2", CardType.CHAFF, FlowerType.PEONY, 6],

  // July - Bush Clover (Hagi)
  ["boar", CardType.ANIMAL, FlowerType.BUSH_CLOVER, 7],
  ["red-ribbon", CardType.RIBBON, FlowerType.BUSH_CLOVER, 7],
  ["chaff-1", CardType.CHAFF, FlowerType.BUSH_CLOVER, 7],
  ["chaff-2", CardType.CHAFF, FlowerType.BUSH_CLOVER, 7],

  // August - Susuki Grass
  ["moon", CardType.BRIGHT, FlowerType.SUSUKI, 8],
  ["geese", CardType.ANIMAL, FlowerType.SUSUKI, 8],
  ["chaff-1", CardType.CHAFF, FlowerType.SUSUKI, 8],
  ["chaff-2", CardType.CHAFF, FlowerType.SUSUKI, 8],

  // September - Chrysanthemum (Kiku)
  ["sake-cup", CardType.ANIMAL, FlowerType.CHRYSANTHEMUM, 9],
  ["blue-ribbon", CardType.RIBBON, FlowerType.CHRYSANTHEMUM, 9],
  ["chaff-1", CardType.CHAFF, FlowerType.CHRYSANTHEMUM, 9],
  ["chaff-2", CardType.CHAFF, FlowerType.CHRYSANTHEMUM, 9],

  // October - Maple (Momiji)
  ["deer", CardType.ANIMAL, FlowerType.MAPLE, 10],
  ["blue-ribbon", CardType.RIBBON, FlowerType.MAPLE, 10],
  ["chaff-1", CardType.CHAFF, FlowerType.MAPLE, 10],
  ["chaff-2", CardType.CHAFF, FlowerType.MAPLE, 10],

  // November - Willow (Yanagi)
  ["rain-man", CardType.BRIGHT, FlowerType.WILLOW, 11],
  ["swallow", CardType.ANIMAL, FlowerType.WILLOW, 11],
  ["red-ribbon", CardType.RIBBON, FlowerType.WILLOW, 11],
  ["chaff", CardType.CHAFF, FlowerType.WILLOW, 11],

  // December - Paulownia (Kiri)
  ["phoenix", CardType.BRIGHT, FlowerType.PAULOWNIA, 12],
  ["chaff-1", CardType.CHAFF, FlowerType.PAULOWNIA, 12],
  ["chaff-2", CardType.CHAFF, FlowerType.PAULOWNIA, 12],
  ["chaff-3", CardType.CHAFF, FlowerType.PAULOWNIA, 12],
])

/** @type {ReadonlyArray<Card>} */
export const CARDS = Object.freeze(
  Array.from({ length: CARDS_LENGTH }, (_, index) => {
    const [name, type, flower, month] = CARD_DATA[index]
    return Object.freeze({
      id: `${flower}-${name}`,
      name,
      type,
      flower,
      month,
    })
  })
)

// Commonly referenced card indices
export const BRIGHT_INDICES = Object.freeze([0, 8, 28, 40, 44])
export const POETRY_RIBBON_INDICES = Object.freeze([1, 5, 9])
export const BLUE_RIBBON_INDICES = Object.freeze([21, 33, 37])
export const RED_RIBBON_INDICES = Object.freeze([13, 17, 25, 42])
export const ANIMAL_INDICES = Object.freeze([4, 12, 16, 20, 24, 29, 32, 36, 41])

/**
 * Get card data by index
 * @param {number} index
 * @returns {Card|null}
 */
export const getCard = (index) => {
  if (index < 0 || index >= CARDS_LENGTH) return null
  return CARDS[index]
}

/**
 * Get multiple cards by indices
 * @param {Array<number>} indices
 * @returns {Array<Card>}
 */
export const getCards = (indices) => {
  return indices.map(getCard).filter(Boolean)
}

/**
 * Find all cards of a specific type
 * @param {CardType} type
 * @returns {number[]}
 */
export const findCardIndicesByType = (type) =>
  CARDS.reduce((indices, card, index) => {
    if (card.type === type) indices.push(index)
    return indices
  }, [])

/**
 * Find all cards from a specific month
 * @param {number} month
 * @returns {number[]}
 */
export const findCardIndicesByMonth = (month) =>
  CARDS.reduce((indices, card, index) => {
    if (card.month === month) indices.push(index)
    return indices
  }, [])

/**
 * Check if a value is a valid card index
 * @param {unknown} index Value to check
 * @returns {boolean}
 */
export const isValidCardIndex = (index) => {
  return typeof index === "number" && Number.isInteger(index) && index >= 0 && index < CARDS_LENGTH
}
