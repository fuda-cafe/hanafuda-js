/**
 * @typedef {import('./cards.js').CardType} CardType
 * @typedef {import('./cards.js').FlowerType} FlowerType
 * @typedef {import('./cards.js').Card} Card
 */

/**
 * @typedef {Object} GameState
 * @property {Array<Card>} deck Remaining cards in deck
 * @property {Array<Card>} field Cards on the field
 * @property {Object<string, Array<Card>>} players Cards held by each player
 * @property {string} currentPlayer ID of the current player
 * @property {string} phase Current game phase
 * @property {Object} [metadata] Additional game state data
 */

export {}
