# Yaku Patterns

This module defines the scoring patterns (役, yaku) used in Hanafuda games. Each yaku is defined declaratively using a pattern that describes its card requirements.

## Pattern System

### Card Patterns

Card patterns can match by various properties:

```javascript
{
  id: "willow-rain-man",     // Match specific card
  type: CardType.BRIGHT,     // Match card type
  flower: FlowerType.PINE,   // Match flower type
  month: 1,                  // Match month
  count: 3                   // Required count
}
```

### Pattern Composition

Patterns can combine multiple requirements:

```javascript
{
  pattern: {
    cards: [
      { id: "willow-rain-man" }, // Specific card
      { type: CardType.BRIGHT, count: 3 }, // Multiple cards
    ]
  }
}
```

## Standard Yaku

### Bright Yaku (光役)

| Name                | Description   | Points | Pattern                      |
| ------------------- | ------------- | ------ | ---------------------------- |
| Gokou (御光)        | Five Brights  | 15     | All 5 bright cards           |
| Shikou (四光)       | Four Brights  | 8      | 4 bright cards (no Rain-man) |
| Ame-shikou (雨四光) | Rain-man Four | 7      | Rain-man + 3 other brights   |
| Sankou (三光)       | Three Brights | 6      | Any 3 bright cards           |

### Viewing Yaku (見役)

| Name                  | Description    | Points | Pattern                   |
| --------------------- | -------------- | ------ | ------------------------- |
| Hanami-zake (花見酒)  | Flower Viewing | 3      | Cherry Curtain + Sake Cup |
| Tsukimi-zake (月見酒) | Moon Viewing   | 3      | Moon + Sake Cup           |

### Animal Yaku (タネ役)

| Name                    | Description         | Points | Pattern              |
| ----------------------- | ------------------- | ------ | -------------------- |
| Ino-shika-chou (猪鹿蝶) | Boar-Deer-Butterfly | 5      | Specific animal trio |
| Tane (タネ)             | Animals             | 1+     | 5+ animal cards      |

### Ribbon Yaku (短冊役)

| Name           | Description    | Points | Pattern          |
| -------------- | -------------- | ------ | ---------------- |
| Aka-tan (赤短) | Poetry Ribbons | 5      | 3 poetry ribbons |
| Ao-tan (青短)  | Blue Ribbons   | 5      | 3 blue ribbons   |
| Tan (短冊)     | Ribbons        | 1+     | 5+ ribbon cards  |

### Other Yaku

| Name                | Description    | Points | Pattern                       |
| ------------------- | -------------- | ------ | ----------------------------- |
| Kasu (カス)         | Chaff          | 1+     | 10+ chaff cards               |
| Tsuki-fuda (月札)   | Month Cards    | 4      | All 4 cards of current month  |
| Teshi (手四)        | Four of a Kind | 6      | 4 cards of same month in hand |
| Kuttsuki (くっつき) | Four Pairs     | 6      | 4 pairs in hand               |

## Implementation

### Defining New Yaku

```javascript
import { defineYaku } from "../base.js"
import { CardType } from "../../../core/cards.js"

export const CUSTOM_YAKU = defineYaku({
  name: "custom-yaku",
  description: ["Custom Yaku"],
  points: 5,
  pattern: {
    cards: [
      { type: CardType.ANIMAL, count: 2 },
      { flower: FlowerType.PINE, count: 1 },
    ],
  },
})
```

### Pattern Validation

The pattern system validates yaku definitions:

- Card properties must be valid
- Counts must be reasonable
- Names must be unique
- Points must be positive

### Rule Integration

Patterns can specify rule dependencies:

```javascript
{
  pattern: {
    cards: [...],
    rules: {
      weatherDependent: {
        condition: "sunny",
        multiplier: 2,
      },
    },
  },
}
```

## Design Notes

1. **Declarative Approach**: Patterns describe what constitutes a yaku, not how to find it
2. **Composability**: Patterns can be combined and modified
3. **Validation**: Strong typing and runtime checks
4. **Rule Integration**: Patterns can specify rule interactions
5. **Extensibility**: Easy to add new yaku types

## See Also

- [Rules Documentation](../rules/README.md) - How rules modify yaku scoring
- [Main Scoring Documentation](../README.md) - Overview of scoring system
