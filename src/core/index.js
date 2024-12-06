/**
 * @typedef {import('./types').Card} Card
 * @typedef {import('./types').GameState} GameState
 */

export class HanafudaGame {
  /**
   * @param {Object} config
   * @param {string} [config.variant='koikoi'] Game variant
   * @param {Object} [config.rules] Custom rules
   */
  constructor(config) {
    // Initialize game
  }

  /**
   * @returns {GameState} Current game state
   */
  getState() {}

  /**
   * @param {string} serializedState
   * @returns {void}
   */
  loadState(serializedState) {}

  /**
   * @param {number} cardIndex
   * @param {number} targetIndex
   * @returns {boolean} Whether the move was valid
   */
  makeMove(cardIndex, targetIndex) {}

  /**
   * @returns {Array<Card>}
   */
  getValidMoves() {}
}
