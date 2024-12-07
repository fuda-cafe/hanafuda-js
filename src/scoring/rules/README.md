# Scoring Rules

This module provides a flexible system for configuring how yaku (役) are scored in Hanafuda games. Rules can modify scoring behavior, add conditions, and implement game variants.

## Rule Configuration

### Structure

Rule configurations are organized by yaku category:

```javascript
type RuleConfig = {
  bright?: BrightRules,
  animal?: AnimalRules,
  ribbon?: RibbonRules,
  viewing?: ViewingRules,
  chaff?: ChaffRules,
  month?: MonthRules,
}
```

### Available Rules

#### Bright Rules

```javascript
type BrightRules = {
  allowMultiple?: boolean, // Allow scoring multiple bright yaku
}
```

#### Animal Rules

```javascript
type AnimalRules = {
  allowMultiple?: boolean, // Allow scoring both Ino-Shika-Chou and Tane
  extraPoints?: number, // Points per additional animal
  sakeCupMode?: SakeCupMode, // How to count sake cup
}

type SakeCupMode = "ANIMAL_ONLY" | "CHAFF_ONLY" | "BOTH"
```

#### Ribbon Rules

```javascript
type RibbonRules = {
  allowMultiple?: boolean, // Allow scoring multiple ribbon yaku
  extraPoints?: number, // Points per additional ribbon
}
```

#### Viewing Rules

```javascript
type ViewingRules = {
  weatherDependent?: boolean, // Apply weather effects
  seasonDependent?: boolean, // Apply season bonuses
}
```

#### Chaff Rules

```javascript
type ChaffRules = {
  extraPoints?: number, // Points per additional chaff
}
```

#### Month Rules

```javascript
type MonthRules = {
  allowMultipleMonths?: boolean, // Allow scoring multiple month sets
}
```

## Built-in Rule Sets

### Koi-Koi Rules

Standard Koi-Koi scoring rules:

```javascript
export const KOIKOI_RULES = {
  bright: { allowMultiple: false },
  animal: {
    sakeCupMode: "ANIMAL_ONLY",
    allowMultiple: true,
  },
  ribbon: { allowMultiple: true },
  viewing: {
    weatherDependent: true,
    seasonDependent: true,
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

Month/season can provide bonuses:

- Double points for Hanami in month 3 (Cherry Blossom season)
- Double points for Tsukimi in month 8 (Moon Viewing season)

### Sake Cup Handling

The Chrysanthemum Sake Cup can be counted differently:

- As an animal card (ANIMAL_ONLY)
- As a chaff card (CHAFF_ONLY)
- As both (BOTH)

## Implementation

### Creating Rule Checkers

Each yaku category has a rule checker factory:

```javascript
import { createBrightChecker } from "./rules/bright.js"

const brightChecker = createBrightChecker({
  allowMultiple: true,
})
```

### Custom Rule Sets

Create custom rule sets by combining options:

```javascript
const customRules = {
  bright: {
    allowMultiple: true,
  },
  viewing: {
    weatherDependent: true,
    seasonDependent: false,
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
