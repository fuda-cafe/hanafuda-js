/**
 * Core functionality for Hanafuda card games.
 *
 * This module provides the fundamental building blocks:
 * - Card definitions and types
 * - Deck creation and manipulation
 * - Card collections and matching
 *
 * @module core
 */

/**
 * Card types and utility functions for working with Hanafuda cards.
 * Includes card definitions, type guards, and search functions.
 */
export * from "./cards.ts"

/**
 * Collection management for groups of cards (hands, captured cards, etc).
 * Provides methods for adding, removing, and querying cards.
 */
export * from "./collection.ts"

/**
 * Deck creation and manipulation utilities.
 * Handles shuffling, drawing, and deck state management.
 */
export * from "./deck.ts"
