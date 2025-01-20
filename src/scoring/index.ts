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

export * from "./rules/index.ts"
export * from "./yaku/index.ts"
export * from "./manager.ts"
