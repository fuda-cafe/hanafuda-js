# Core Module

The core module provides the fundamental building blocks for implementing Hanafuda (花札) card games, with a focus on Koi-Koi (こいこい). It handles card definitions, deck operations, collections, and card matching utilities.

## Components

### Cards (`cards.js`)

Defines the basic card types, properties, and utility functions for working with Hanafuda cards.

```javascript
import { CardType, FlowerType, getCard, findCardIndicesByType } from "./cards.js"

// Get the Crane card (Pine Bright)
const crane = getCard(0)
// { type: 'bright', flower: 'pine', month: 1, name: 'crane' }

// Find all Bright cards
const brights = findCardIndicesByType(CardType.BRIGHT)
// [0, 8, 29, 40, 44]
```

### Deck (`deck.js`)

Provides functions for creating and manipulating a deck of Hanafuda cards.

```javascript
import { createDeck, shuffle } from "./deck.js"

// Create a new deck (returns array of card indices)
const deck = createDeck()

// Shuffle the deck
shuffle(deck)
```

### Collection (`collection.js`)

A factory function for creating collections of cards (e.g., hand, captured cards).

```javascript
import { createCollection } from "./collection.js"

// Create a new collection
const hand = createCollection()

// Add cards individually or in bulk
hand.add(0) // Add the Crane
hand.addMany([1, 2]) // Add multiple cards

// Remove cards individually or in bulk
const crane = hand.remove(0) // Remove the Crane
const cards = hand.removeMany([1, 2]) // Remove multiple cards

// Check contents
hand.has(0) // => false
hand.has(1) // => false
hand.size // => 0

// Iterate over cards (Collection is iterable)
for (const cardIndex of hand) {
  console.log(getCard(cardIndex))
}

// Alternative iteration using values()
for (const cardIndex of hand.values()) {
  console.log(getCard(cardIndex))
}

// Invalid operations throw errors
try {
  hand.add(-1) // Error: Invalid card index: -1
  hand.remove(48) // Error: Card not in collection: 48
} catch (error) {
  console.error(error.message)
}
```

### Matching (`matching.js`)

Utilities for comparing and matching cards.

```javascript
import { isMatch, compareCards, hasMatch } from "./matching.js"

// Check if two cards match (same month)
isMatch(0, 1) // true (both Pine cards)
isMatch(0, 4) // false (Pine vs Plum)

// Compare cards for sorting
compareCards(0, 4) // -1 (month 1 before month 2)
compareCards(0, 1) // 1 (Bright before Animal)

// Find matches in a collection
const cards = [0, 4, 8]
hasMatch(cards, 1) // true (matches card 0)
hasMatch(cards, 12) // false (no month 4 cards)
```

## Card Index System

The module uses a zero-based index system for cards, where each card is represented by its index in the standard ordering:

- 0-3: Pine (Month 1)
- 4-7: Plum (Month 2)
- 8-11: Cherry (Month 3)
- ...and so on

This provides a memory-efficient way to reference cards while maintaining the ability to access full card information when needed through the `getCard` function.

## Type Definitions

The module includes TypeScript-compatible JSDoc type definitions for better development experience:

```javascript
/** @typedef {'chaff' | 'animal' | 'ribbon' | 'bright'} CardType */
/** @typedef {'pine' | 'plum' | 'cherry' | ...} FlowerType */
/**
 * @typedef {Object} Card
 * @property {string} id Unique card identifier
 * @property {string} name Display name
 * @property {CardType} type Card type
 * @property {FlowerType} flower Flower type
 * @property {number} month Month number (1-12)
 */
```

## Design Principles

1. **Immutability**: Card definitions and type constants are frozen objects
2. **Type Safety**: Comprehensive JSDoc type definitions
3. **Efficiency**: Card index system for memory efficiency
4. **Validation**: Built-in validation for card operations
5. **Iteration**: Collections implement the iterator protocol
