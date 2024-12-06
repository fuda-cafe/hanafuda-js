import { assertEquals, assertArrayIncludes } from "@std/assert"
import { createRuleConfig, validateRuleConfig, DEFAULT_RULES } from "../src/scoring/rules.js"

Deno.test("RuleConfig - default rules", () => {
  const rules = createRuleConfig()
  assertEquals(rules, DEFAULT_RULES)
})

Deno.test("RuleConfig - custom rules", () => {
  const customRules = {
    viewingYakuMode: "WEATHER_DEPENDENT",
    sakeCupMode: "ANIMAL_ONLY",
  }
  const rules = createRuleConfig(customRules)

  // Custom rules should override defaults
  assertEquals(rules.viewingYakuMode, "WEATHER_DEPENDENT")
  assertEquals(rules.sakeCupMode, "ANIMAL_ONLY")

  // Unspecified rules should use defaults
  assertEquals(rules.allowMultipleAnimalYaku, DEFAULT_RULES.allowMultipleAnimalYaku)
  assertEquals(rules.allowMultipleRibbonYaku, DEFAULT_RULES.allowMultipleRibbonYaku)
})

Deno.test("RuleConfig - validation - valid rules", () => {
  const validRules = {
    viewingYakuMode: "WEATHER_DEPENDENT",
    sakeCupMode: "ANIMAL_ONLY",
    allowMultipleAnimalYaku: true,
    allowMultipleRibbonYaku: false,
  }
  const errors = validateRuleConfig(validRules)
  assertEquals(errors.length, 0)
})

Deno.test("RuleConfig - validation - missing properties", () => {
  const invalidRules = {
    viewingYakuMode: "ENABLED",
    // Missing other required properties
  }
  const errors = validateRuleConfig(invalidRules)
  assertArrayIncludes(errors, ["Missing required property: sakeCupMode"])
  assertArrayIncludes(errors, ["Missing required property: allowMultipleAnimalYaku"])
  assertArrayIncludes(errors, ["Missing required property: allowMultipleRibbonYaku"])
})

Deno.test("RuleConfig - validation - invalid values", () => {
  const invalidRules = {
    viewingYakuMode: "INVALID_MODE",
    sakeCupMode: "INVALID_MODE",
    allowMultipleAnimalYaku: "not a boolean",
    allowMultipleRibbonYaku: "not a boolean",
  }
  const errors = validateRuleConfig(invalidRules)
  assertArrayIncludes(errors, [
    "viewingYakuMode must be one of: DISABLED, ENABLED, REQUIRES_OTHER_YAKU, WEATHER_DEPENDENT",
  ])
  assertArrayIncludes(errors, ["sakeCupMode must be one of: BOTH, ANIMAL_ONLY, CHAFF_ONLY"])
  assertArrayIncludes(errors, ["allowMultipleAnimalYaku must be a boolean"])
  assertArrayIncludes(errors, ["allowMultipleRibbonYaku must be a boolean"])
})
