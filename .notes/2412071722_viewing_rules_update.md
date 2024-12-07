# Viewing Rules Enhancement

## Overview

Major enhancements to the viewing yaku rules system to provide more granular control over viewing yaku recognition and seasonal effects.

## Changes

### 1. Viewing Yaku Recognition Modes

Added `ViewingYakuMode` enum to control when viewing yaku are recognized:

```javascript
type ViewingYakuMode = "NEVER" | "LIMITED" | "ALWAYS"
```

- **NEVER**: Viewing yaku are never recognized
- **LIMITED**: Viewing yaku require at least one non-viewing yaku
- **ALWAYS**: Viewing yaku are always recognized (default)

Motivation: From fudawiki.org:

> "Anyone who's played Koi-Koi for any length of time will quickly pick up on how overpowered the Sake Cup is. This humble card contributes to no fewer than four different yaku! Unsurprisingly, many house rules exist with an eye to curbing its power."

### 2. Seasonal Rule Split

Split the seasonal rule into two distinct options:

```javascript
type ViewingRules = {
  seasonalBonus?: boolean, // Double points in season
  seasonalOnly?: boolean, // Only allow in season
}
```

Benefits:

- More granular control over seasonal effects
- Clear separation between scoring and validity rules
- Better support for different rule variants

### 3. Implementation Details

#### Rule Processing Order

1. Mode check (NEVER/LIMITED/ALWAYS)
2. Seasonal restriction (if enabled)
3. Weather effects
4. Seasonal bonus

#### Helper Functions

```javascript
const isInSeason = (yakuName, month) => {
  return (
    (yakuName === "hanami-zake" && month === 3) || // Cherry Blossom
    (yakuName === "tsukimi-zake" && month === 8) // Moon Viewing
  )
}

const hasNonViewingYaku = (completedYaku) => {
  return completedYaku.some((yaku) => yaku.name !== "hanami-zake" && yaku.name !== "tsukimi-zake")
}
```

## Rule Combinations

### Standard Rules

```javascript
{
  mode: "ALWAYS",
  weatherDependent: true,
  seasonalBonus: true,
  seasonalOnly: false,
}
```

### Strict Seasonal Rules

```javascript
{
  mode: "ALWAYS",
  weatherDependent: true,
  seasonalBonus: true,
  seasonalOnly: true,
}
```

### House Rules (Limited)

```javascript
{
  mode: "LIMITED",
  weatherDependent: true,
  seasonalBonus: true,
  seasonalOnly: false,
}
```

## Testing Considerations

1. **Mode Testing**

   - Verify each mode's behavior independently
   - Test mode interaction with other rules
   - Ensure proper handling of viewing vs non-viewing yaku

2. **Seasonal Rules**

   - Test bonus points calculation
   - Verify seasonal restrictions
   - Check interaction with other rules

3. **Edge Cases**
   - Multiple viewing yaku with LIMITED mode
   - Weather cancellation with seasonal bonus
   - Rule combination interactions

## Future Considerations

1. **Rule Validation**

   - Consider validating rule combinations
   - Add warnings for potentially conflicting rules

2. **Performance**

   - Early returns for common cases
   - Optimized yaku checking order

3. **Extensibility**
   - Structure allows for additional viewing yaku
   - Easy to add new rule variations

```

```
