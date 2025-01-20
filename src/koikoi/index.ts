/**
 * Koi-Koi game implementation.
 *
 * This module provides:
 * - Game state management
 * - Round setup and initialization
 * - Player actions and turn handling
 * - Game flow control
 *
 * Implements the complete Koi-Koi variant of Hanafuda.
 *
 * @module koikoi
 */

/**
 * Core game logic and state management.
 * Handles player actions and game flow.
 */
export * from "./game.ts"

/**
 * Game setup and initialization utilities.
 * Manages round setup and initial card distribution.
 */
export * from "./setup.ts"

/**
 * Game state types and management.
 * Defines state structure and phase transitions.
 */
export * from "./state.ts"
