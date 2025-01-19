# Scoring Rules

This module provides a flexible system for configuring how yaku (役) are scored in Hanafuda games. Rules can modify scoring behavior, add conditions, and implement game variants.

## Rule Configuration

### Structure

Rule configurations are organized by yaku category:

```typescript
import type { RuleConfig } from "./types"

const config: RuleConfig = {
  bright: BrightRules,
  animal: AnimalRules,
  ribbon: RibbonRules,
  viewing: ViewingRules,
  chaff: ChaffRules,
  month: MonthRules,
}
```

### Available Rules

#### Bright Rules

```typescript
type BrightRules = {
  /** Allow scoring multiple bright yaku */
  allowMultiple?: boolean
}
```

#### Animal Rules

```typescript
type AnimalRules = {
  /** Allow scoring both Ino-Shika-Chou and Tane */
  allowMultiple?: boolean
  /** Points per additional animal */
  extraPoints?: number
  /** Count sake cup as an animal */
  countSakeCup?: boolean
}

type SakeCupMode = "ANIMAL_ONLY" | "CHAFF_ONLY" | "BOTH"
```

#### Ribbon Rules

```typescript
type RibbonRules = {
  /** Allow scoring multiple ribbon yaku */
  allowMultiple?: boolean
  /** Points per additional ribbon */
  extraPoints?: number
}
```

#### Viewing Rules

```typescript
type ViewingRules = {
  /** How to recognize viewing yaku */
  mode?: ViewingYakuMode
  /** Apply weather effects */
  weatherDependent?: boolean
  /** Award bonus points during appropriate seasons */
  seasonalBonus?: boolean
  /** Restrict yaku to their appropriate seasons */
  seasonalOnly?: boolean
}

type ViewingYakuMode = "NEVER" | "LIMITED" | "ALWAYS"
// NEVER: Viewing yaku are not recognized
// LIMITED: Viewing yaku require at least one non-viewing yaku
// ALWAYS: Viewing yaku are always recognized (default)
```

#### Chaff Rules

```typescript
type ChaffRules = {
  /** Points per additional chaff */
  extraPoints?: number
  /** Count sake cup as a chaff */
  countSakeCup?: boolean
}
```

#### Month Rules

```typescript
type MonthRules = {
  /** Allow scoring multiple month sets */
  allowMultipleMonths?: boolean
}
```

## Built-in Rule Sets

### Koi-Koi Rules

Standard Koi-Koi scoring rules:

```typescript
import type { RuleConfig } from "./types"

export const KOIKOI_RULES: RuleConfig = {
  bright: { allowMultiple: false },
  animal: {
    sakeCupMode: "ANIMAL_ONLY",
    allowMultiple: true,
  },
  ribbon: { allowMultiple: true },
  viewing: {
    mode: "ALWAYS",
    weatherDependent: true,
    seasonalBonus: true,
  },
  chaff: { extraPoints: 1 },
  month: { allowMultipleMonths: false },
}
```

### Game Variants

The scoring system is designed to support multiple game variants. Currently, it fully implements standard Koi-Koi rules, with partial support for other variants.

#### Variant Support Status

- **Koi-Koi**: ✅ Fully supported
- **Hachi-Hachi**: ⚠️ Partial support (basic rules only)
- **Other variants**: 🚧 Planned for future releases

The system is designed to be extensible, allowing new variants to be added as their rules are documented and implemented.

## Rule Effects

### Weather Effects

Weather conditions can modify viewing yaku:

- Rain cancels Hanami (Flower Viewing)
- Fog cancels Tsukimi (Moon Viewing)

### Seasonal Effects

Month/season can affect viewing yaku in two ways:

- **Bonus**: Double points during appropriate season
- **Restriction**: Only allow yaku during appropriate season

Seasons:

- Hanami: Month 3 (Cherry Blossom season)
- Tsukimi: Month 8 (Moon Viewing season)

### Sake Cup Handling

The Chrysanthemum Sake Cup can be counted differently:

- As an animal card (ANIMAL_ONLY)
- As a chaff card (CHAFF_ONLY)
- As both (BOTH)

### Viewing Yaku Recognition

Controls when viewing yaku are recognized:

- **ALWAYS**: Standard rules, always allowed
- **LIMITED**: Requires other non-viewing yaku
- **NEVER**: Viewing yaku disabled

## Implementation

### Creating Rule Checkers

Each yaku category has a rule checker factory:

```typescript
import { createViewingChecker } from "./rules/viewing"
import type { ViewingRules } from "./types"

// House rules example
const viewingChecker = createViewingChecker({
  mode: "LIMITED",
  weatherDependent: true,
  seasonalBonus: true,
} as ViewingRules)
```

### Custom Rule Sets

Create custom rule sets by combining options:

```typescript
import type { RuleConfig } from "./types"

const customRules: RuleConfig = {
  viewing: {
    mode: "LIMITED",
    weatherDependent: true,
    seasonalBonus: true,
    seasonalOnly: true,
  },
}

const scoring = createScoringManager(customRules)
```

## Design Notes

1. **Modularity**: Rules are organized by yaku category
2. **Flexibility**: Each rule aspect is independently configurable
3. **Type Safety**: Comprehensive type definitions
4. **Defaults**: Sensible defaults for all options
5. **Extensibility**: Easy to add new rule variations

### Future Considerations

The module is designed to evolve as more variant rules are documented and verified. When adding new rules or variants:

1. **Documentation**: Clear documentation of rule sources and variations
2. **Validation**: Thorough testing with known scoring patterns
3. **Compatibility**: Maintaining backward compatibility
4. **Flexibility**: Supporting rule combinations for custom variants

## See Also

- [Yaku Documentation](../yaku/README.md) - Yaku patterns and scoring
- [Main Scoring Documentation](../README.md) - Overview of scoring system
