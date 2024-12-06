import { BaseYaku } from "./base.js"
import { RibbonYaku, AnimalYaku, Teyaku, BrightYaku, DynamicYaku, ChaffYaku } from "./types.js"
import {
  findCardsByMonth,
  findCardsByType,
  CardType,
  POETRY_RIBBONS,
  BLUE_RIBBONS,
  ANIMAL_CARDS,
  CURTAIN,
  MOON,
  SAKE_CUP,
} from "../../cards.js"

// Bright yaku
const GOKOU = new BrightYaku("gokou", ["Five Brights"], 15, 5)
const SHIKOU = new BrightYaku("shikou", ["Four Brights"], 8, 4)
const AME_SHIKOU = new BrightYaku("ame-shikou", ["Rain Man Four"], 7, 4)
const SANKOU = new BrightYaku("sankou", ["Three Brights"], 6, 3)

// Animal yaku
const INO_SHIKA_CHOU = new AnimalYaku(
  "ino-shika-chou",
  ["Boar-Deer-Butterfly"],
  5,
  findCardsByType(CardType.ANIMAL),
  3,
  true
)

const TANE = new AnimalYaku("tane-zaku", ["Animals"], 1, ANIMAL_CARDS, 5, false)

// Ribbon yaku
const AKA_TAN = new RibbonYaku("aka-tan", ["Poetry Ribbons"], 6, POETRY_RIBBONS, 3)

const AO_TAN = new RibbonYaku("ao-tan", ["Blue Ribbons"], 6, BLUE_RIBBONS, 3)

const TAN = new RibbonYaku("tan-zaku", ["Ribbons"], 1, findCardsByType(CardType.RIBBON), 5)

// Viewing yaku
const HANAMI = new DynamicYaku(
  "hanami-zake",
  ["Flower Viewing"],
  3,
  (context) => [CURTAIN, SAKE_CUP],
  2
)

const TSUKIMI = new DynamicYaku(
  "tsukimi-zake",
  ["Moon Viewing"],
  3,
  (context) => [MOON, SAKE_CUP],
  2
)

// Month-based yaku
const TSUKI = new DynamicYaku(
  "tsuki-fuda",
  ["Cards of the Month"],
  4,
  (context) => findCardsByMonth(context?.currentMonth ?? 1),
  4
)

// Hand yaku (teyaku)
const TESHI = new Teyaku("teshi", ["Four of a Kind"], 6)
const KUTTSUKI = new Teyaku("kuttsuki", ["Four Pairs"], 6)

// Chaff yaku (kasu)
const KASU = new ChaffYaku("kasu", ["Chaff"], 1, findCardsByType(CardType.CHAFF), 10)

/** @type {Teyaku[]} */
export const TEYAKU = [
  // Hand yaku (only checked on initial hand)
  TESHI,
  KUTTSUKI,
]

/** @type {BaseYaku[]} */
export const ALL_YAKU = [
  // Bright yaku (in order of precedence)
  GOKOU,
  SHIKOU,
  AME_SHIKOU,
  SANKOU,

  // Animal yaku
  INO_SHIKA_CHOU,
  TANE,

  // Ribbon yaku
  AKA_TAN,
  AO_TAN,
  TAN,

  // Viewing yaku
  HANAMI,
  TSUKIMI,

  // Month-based yaku
  TSUKI,

  // Basic yaku
  KASU,
]

/**
 * Get all complete yaku in a collection
 * @param {import('../../collection.js').CardCollection} collection
 * @param {import('./base.js').YakuContext} [context]
 * @returns {Array<{name: import('./base.js').YakuName, points: number}>}
 */
export function getCompleteYaku(collection, context = null) {
  if (context?.checkTeyaku) {
    return TEYAKU.map((yaku) => ({
      name: yaku.name,
      points: yaku.check(collection, context),
    })).filter((result) => result.points > 0)
  }
  return ALL_YAKU.map((yaku) => ({
    name: yaku.name,
    points: yaku.check(collection, context),
  })).filter((result) => result.points > 0)
}
