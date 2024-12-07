# Viewing Yaku Fixes

## Issue Description

A logical inconsistency was discovered in the viewing yaku implementation where yaku that were cancelled by weather conditions were still being reported as completed with zero points.

### Original Implementation

```javascript
// Previous behavior
if (hanamiPoints > 0) {
  const points = applyViewingRules("hanami-zake", hanamiPoints, context, rules)
  completed.push({ name: HANAMI.name, points }) // Added even when points = 0
}
```

This led to:

1. Misleading yaku completion status
2. Inconsistent representation of weather cancellation
3. Potential issues with rule interaction and scoring

## Fix Implementation

### 1. Viewing Rules Changes

```javascript
if (hanamiPoints > 0) {
  const points = applyViewingRules("hanami-zake", hanamiPoints, context, rules)
  if (points > 0) {
    // Added check
    completed.push({ name: HANAMI.name, points }) // Only add if points remain
  }
}
```

Key changes:

- Additional points check after applying rules
- Only add yaku to completed list if points remain positive
- Consistent handling for both Hanami and Tsukimi

### 2. Test Updates

Previous test:

```javascript
result = viewingChecker(collection, { weather: "rainy" })
assertEquals(result[0].points, 0, "Should cancel hanami in rainy weather")
```

Updated test:

```javascript
result = viewingChecker(collection, { weather: "rainy" })
assertEquals(result.length, 0, "Should not complete yaku in rainy weather")
```

Additional test cases:

- Explicit weather cancellation tests
- Selective cancellation verification
- Multiple yaku interaction tests

## Implications

### Game Logic

1. Weather cancellation now properly prevents yaku formation
2. More accurate representation of viewing rules
3. Better alignment with game mechanics

### Rule Interaction

1. Clearer precedence between weather and seasonal effects
2. More predictable behavior with multiple yaku
3. Better foundation for future rule variations

### Testing

1. More comprehensive test coverage
2. Clearer test assertions
3. Better documentation of expected behavior

## Design Principles

The fix reinforces several key design principles:

1. **Completeness**: A yaku should only be considered complete if it can score points
2. **Consistency**: Weather effects should prevent yaku formation rather than nullify points
3. **Clarity**: Test cases should verify behavior, not just point values

## Future Considerations

1. Consider similar patterns in other yaku implementations
2. Review other rule effects that might cancel yaku
3. Consider adding validation for rule combinations
4. Document weather/season interactions in rule configuration

## Related Changes

- Updated viewing rules documentation
- Added explicit weather cancellation test suite
- Improved test descriptions and assertions
