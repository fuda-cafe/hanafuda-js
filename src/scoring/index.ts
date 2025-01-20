/**
 * Scoring system for Hanafuda card games.
 *
 * This module handles:
 * - Yaku (scoring pattern) definitions
 * - Rule variations and configurations
 * - Score calculation and validation
 *
 * Supports multiple rule sets including standard Koi-Koi and variants.
 *
 * @module scoring
 */

/**
 * Rule configurations for different game variants.
 * Controls how yaku patterns are scored and combined.
 */
export * from "./rules/index.ts"

/**
 * Yaku (scoring pattern) definitions and checking logic.
 * Includes standard patterns and pattern matching system.
 */
export * from "./yaku/index.ts"

/**
 * Scoring manager for coordinating rule application and yaku checking.
 * Handles score calculation and validation.
 */
export * from "./manager.ts"
