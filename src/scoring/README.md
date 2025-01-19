# Scoring Module

The scoring module provides a flexible and extensible system for implementing Hanafuda scoring rules, with a focus on Koi-Koi (こいこい) scoring patterns (役, yaku). It uses a declarative pattern matching system and supports multiple rule variants.

## Components

### Manager (`manager.ts`)

The scoring manager orchestrates yaku checking and rule application:

```typescript
import { createScoringManager, KOIKOI_RULES } from "./scoring/manager"
import type { ScoringContext, YakuResult } from "./scoring/rules/types"

// Create manager with standard Koi-Koi rules
const scoring = createScoringManager(KOIKOI_RULES)

// Score a collection of cards
const results: YakuResult[] = scoring(collection, {
  currentMonth: 3,
  weather: "clear",
  checkTeyaku: false,
} as ScoringContext)
// [{ name: "hanami-zake", points: 6 }, ...]
```

### Yaku Definitions

Yaku are defined declaratively using patterns that describe card requirements:

```typescript
import { CardType } from "../core/types"
import type { YakuDefinition } from "./types"

const SANKOU: YakuDefinition = {
  name: "sankou",
  description: ["Three Brights"],
  points: 6,
  pattern: {
    cards: [{ type: CardType.BRIGHT, count: 3 }],
  },
}
```

See [Yaku Documentation](./yaku/README.md) for details on all yaku patterns.

### Rule Configuration

Rules modify how yaku are scored and can be customized per game variant:

```typescript
import type { RuleConfig } from "./rules/types"

const config: RuleConfig = {
  bright: { allowMultiple: false },
  animal: { countSakeCup: true },
  viewing: { weatherDependent: true },
}
```

See [Rules Documentation](./rules/README.md) for complete rule options.

## Scoring Process

1. **Pattern Matching**: Each yaku checker looks for specific card patterns
2. **Rule Application**: Rules modify scoring based on configuration
3. **Context Processing**: External factors (weather, month) affect scoring
4. **Result Aggregation**: All valid yaku are collected and returned

## Game Variants

### Koi-Koi Rules (`KOIKOI_RULES`)

Standard Koi-Koi scoring rules:

- No multiple scoring for bright yaku
- Sake cup counts as animal
- Weather affects viewing yaku
- Extra points for additional cards

### Variant Support

The module currently provides:

- ✅ Full support for standard Koi-Koi rules
- ⚠️ Partial support for other variants (basic rules only)
- 🚧 Extensible design for future variant implementations

See [Rules Documentation](./rules/README.md) for current variant support status.

## Usage Examples

### Basic Scoring

```typescript
import { createScoringManager, KOIKOI_RULES } from "./scoring/manager"
import { createCollection } from "../core/collection"
import type { YakuResult } from "./rules/types"

// Create scoring manager
const scoring = createScoringManager(KOIKOI_RULES)

// Create and populate collection
const collection = createCollection()
collection.addMany([0, 8, 28]) // Three brights

// Score collection
const results: YakuResult[] = scoring(collection)
console.log(results)
// [{ name: "sankou", points: 6 }]
```

### Custom Rules

```typescript
import type { RuleConfig } from "./rules/types"

// Create custom rule set
const customRules: RuleConfig = {
  bright: {
    allowMultiple: true,
  },
  viewing: {
    weatherDependent: false,
    seasonalBonus: true,
  },
}

// Create manager with custom rules
const scoring = createScoringManager(customRules)
```

### Initial Hand Scoring

```typescript
import type { ScoringContext, YakuResult } from "./rules/types"

// Check for teyaku (hand yaku)
const results: YakuResult[] = scoring(collection, {
  checkTeyaku: true,
} as ScoringContext)
// [{ name: "teshi", points: 6 }]
```

## Design Principles

1. **Declarative Patterns**: Yaku defined by what they require, not how to find them
2. **Rule Separation**: Scoring logic separate from pattern matching
3. **Extensibility**: Easy to add new yaku and rule variants
4. **Type Safety**: Comprehensive type definitions for configurations
5. **Context Awareness**: External factors can influence scoring

## Future Development

The module is designed to evolve as more variant rules are documented and verified:

1. **Documentation**: Clear sources for rule variations
2. **Validation**: Thorough testing of scoring patterns
3. **Compatibility**: Maintaining stable interfaces
4. **Flexibility**: Supporting custom rule combinations

## See Also

- [Yaku Documentation](./yaku/README.md) - Details on yaku patterns and scoring
- [Rules Documentation](./rules/README.md) - Rule configuration options
- [Core Module](../core/README.md) - Core game functionality

```

```
