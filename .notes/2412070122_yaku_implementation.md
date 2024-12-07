# Yaku Implementation Notes

## Declarative vs Imperative Approaches

When implementing yaku (scoring combinations) in Hanafuda, we can take either a declarative or imperative approach. Here's an analysis of both approaches with examples.

### Imperative Approach (Class-Based)

The imperative approach focuses on HOW to check for yaku, implementing the checking logic directly in classes:

```javascript
export class BrightYaku extends BaseYaku {
  constructor(name, description, points, numRequired) {
    super(name, description, points, findCardIndicesByType(CardType.BRIGHT), numRequired)
  }

  check(collection, context) {
    if (collection.size < this.numRequired) return 0
    const progress = this.find(collection)
    if (progress.length < this.numRequired) return 0
    return this.points
  }
}

// Usage:
const GOKOU = new BrightYaku("gokou", ["Five Brights"], 15, 5)
```

Characteristics:

1. Focuses on implementation details and steps
2. Requires understanding class inheritance
3. Mixes yaku definition with checking logic
4. Makes requirements less immediately clear

### Declarative Approach (Configuration-Based)

The declarative approach focuses on WHAT makes a valid yaku, separating the definition from the implementation:

```javascript
const GOKOU = defineYaku({
  name: "gokou",
  description: ["Five Brights"],
  points: 15,
  pattern: {
    cards: [{ type: CardType.BRIGHT, count: 5 }],
  },
})
```

For more complex yaku like viewing combinations that depend on rules:

```javascript
const HANAMI = defineYaku({
  name: "hanami-zake",
  description: ["Flower Viewing"],
  points: 3,
  pattern: {
    cards: [{ id: "cherry-curtain" }, { id: "chrysanthemum-sake" }],
    rules: {
      weatherDependent: {
        condition: "sunny",
        multiplier: 2,
      },
    },
  },
})
```

Benefits of Declarative Approach:

1. **Self-Documenting**: Requirements are clear from the definition
2. **Separation of Concerns**: Definition separate from checking logic
3. **Easier Testing**: Can test definitions and logic separately
4. **Better Validation**: Can validate definitions at creation time
5. **Enhanced Tooling**: Easier to build supporting tools
6. **Rule Integration**: Rules become part of the definition
7. **Serialization**: Easier to save/load yaku definitions

## Implementation Considerations

When implementing the declarative approach:

1. **Factory Functions**: Use factory functions to create yaku with validation
2. **Type Safety**: Define strict types for yaku configurations
3. **Pattern Matching**: Implement generic pattern matching logic
4. **Rule Integration**: Make rules composable with yaku definitions
5. **Testing**: Include property-based testing for combinations

## Next Steps

Consider implementing:

1. A yaku definition schema/type system
2. Generic pattern matching utilities
3. Rule composition system
4. Testing utilities for yaku validation
