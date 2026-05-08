/**
 * src/data/commonFoods.ts
 *
 * A curated starter set of common foods with calorie estimates,
 * used for quick-add chips in the food log and onboarding examples.
 *
 * Calorie values are per standard serving as described in
 * `servingDescription`. All figures are approximate estimates
 * intended for general awareness - not precise nutritional data.
 * Actual values vary by brand, preparation method, and serving size.
 *
 * This is a starter set only, not a nutrition database.
 * Phase 4+ may replace or augment this with a verified food data source.
 *
 * Categories:
 *   breakfast, protein, dairy, grains, fruit, vegetables,
 *   snacks, drinks, meals
 *
 * mode:
 *   'instant'  - one-tap log; calories are predictable for this serving.
 *   'prefill'  - opens form pre-filled; user should confirm/adjust amount.
 */

import type { CommonFood } from '@/types/food'

export const COMMON_FOODS: CommonFood[] = [
  // ── Breakfast ──────────────────────────────────────────────────────────
  {
    id: 'cf-porridge',
    name: 'Porridge / Oatmeal',
    calories: 170,
    servingDescription: '1 bowl (40g oats + water, 300ml)',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'prefill',
  },
  {
    id: 'cf-porridge-milk',
    name: 'Porridge with milk',
    calories: 230,
    servingDescription: '1 bowl (40g oats + 200ml semi-skimmed milk)',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'prefill',
  },
  {
    id: 'cf-toast-butter',
    name: 'Toast with butter',
    calories: 190,
    servingDescription: '2 slices white toast + 10g butter',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-scrambled-eggs',
    name: 'Scrambled eggs',
    calories: 220,
    servingDescription: '2 large eggs scrambled with a little butter',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'prefill',
  },
  {
    id: 'cf-boiled-egg',
    name: 'Boiled egg',
    calories: 78,
    servingDescription: '1 large egg (50g)',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-granola',
    name: 'Granola with milk',
    calories: 320,
    servingDescription: '50g granola + 150ml semi-skimmed milk',
    category: 'breakfast',
    defaultMeal: 'breakfast',
    mode: 'prefill',
  },

  // ── Proteins ───────────────────────────────────────────────────────────
  {
    id: 'cf-chicken-breast',
    name: 'Chicken breast (grilled)',
    calories: 165,
    servingDescription: '1 medium breast (130g cooked)',
    category: 'protein',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },
  {
    id: 'cf-salmon',
    name: 'Salmon fillet (baked)',
    calories: 208,
    servingDescription: '1 fillet (130g cooked)',
    category: 'protein',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },
  {
    id: 'cf-tuna-tin',
    name: 'Tinned tuna (in water)',
    calories: 116,
    servingDescription: '1 drained tin (100g)',
    category: 'protein',
    defaultMeal: 'lunch',
    mode: 'instant',
  },
  {
    id: 'cf-beef-mince',
    name: 'Lean beef mince (cooked)',
    calories: 215,
    servingDescription: '100g cooked, 5% fat',
    category: 'protein',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },
  {
    id: 'cf-lentils',
    name: 'Lentils (cooked)',
    calories: 116,
    servingDescription: '100g cooked',
    category: 'protein',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-chickpeas',
    name: 'Chickpeas (tinned, drained)',
    calories: 164,
    servingDescription: '100g drained',
    category: 'protein',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-tofu',
    name: 'Firm tofu',
    calories: 144,
    servingDescription: '150g',
    category: 'protein',
    mode: 'prefill',
  },

  // ── Dairy ──────────────────────────────────────────────────────────────
  {
    id: 'cf-greek-yogurt',
    name: 'Greek yogurt (0% fat)',
    calories: 97,
    servingDescription: '170g pot, plain',
    category: 'dairy',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-greek-yogurt-full',
    name: 'Greek yogurt (full fat)',
    calories: 170,
    servingDescription: '170g pot, plain',
    category: 'dairy',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-milk-semi',
    name: 'Semi-skimmed milk',
    calories: 104,
    servingDescription: '200ml glass',
    category: 'dairy',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-cheddar',
    name: 'Cheddar cheese',
    calories: 166,
    servingDescription: '40g (matchbox-sized portion)',
    category: 'dairy',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-cottage-cheese',
    name: 'Cottage cheese',
    calories: 98,
    servingDescription: '125g pot, low-fat',
    category: 'dairy',
    defaultMeal: 'snack',
    mode: 'prefill',
  },

  // ── Grains & Carbohydrates ─────────────────────────────────────────────
  {
    id: 'cf-white-rice',
    name: 'White rice (cooked)',
    calories: 206,
    servingDescription: '150g cooked (about a mugful)',
    category: 'grains',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-brown-rice',
    name: 'Brown rice (cooked)',
    calories: 196,
    servingDescription: '150g cooked',
    category: 'grains',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-pasta-cooked',
    name: 'Pasta (cooked)',
    calories: 220,
    servingDescription: '180g cooked (dry weight ~75g)',
    category: 'grains',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },
  {
    id: 'cf-wholemeal-bread',
    name: 'Wholemeal bread',
    calories: 78,
    servingDescription: '1 medium slice (32g)',
    category: 'grains',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-potato-baked',
    name: 'Baked potato',
    calories: 217,
    servingDescription: '1 medium potato (180g), no toppings',
    category: 'grains',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-sweet-potato',
    name: 'Sweet potato (baked)',
    calories: 180,
    servingDescription: '1 medium sweet potato (150g)',
    category: 'grains',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },

  // ── Fruit ──────────────────────────────────────────────────────────────
  {
    id: 'cf-banana',
    name: 'Banana',
    calories: 105,
    servingDescription: '1 medium banana (120g)',
    category: 'fruit',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-apple',
    name: 'Apple',
    calories: 77,
    servingDescription: '1 medium apple (150g)',
    category: 'fruit',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-orange',
    name: 'Orange',
    calories: 62,
    servingDescription: '1 medium orange (150g)',
    category: 'fruit',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-grapes',
    name: 'Grapes',
    calories: 104,
    servingDescription: 'Small bunch (150g)',
    category: 'fruit',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-berries-mixed',
    name: 'Mixed berries',
    calories: 57,
    servingDescription: '100g (fresh or frozen)',
    category: 'fruit',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-avocado-half',
    name: 'Avocado (half)',
    calories: 161,
    servingDescription: 'Half a medium avocado (100g)',
    category: 'fruit',
    defaultMeal: 'breakfast',
    mode: 'prefill',
  },

  // ── Vegetables ────────────────────────────────────────────────────────
  {
    id: 'cf-broccoli',
    name: 'Broccoli (steamed)',
    calories: 34,
    servingDescription: '100g',
    category: 'vegetables',
    mode: 'instant',
  },
  {
    id: 'cf-spinach',
    name: 'Spinach (raw)',
    calories: 23,
    servingDescription: 'Large handful (100g)',
    category: 'vegetables',
    mode: 'instant',
  },
  {
    id: 'cf-mixed-salad',
    name: 'Mixed salad (plain)',
    calories: 20,
    servingDescription: 'Large bowl (100g, no dressing)',
    category: 'vegetables',
    defaultMeal: 'lunch',
    mode: 'instant',
  },
  {
    id: 'cf-carrot',
    name: 'Carrot',
    calories: 41,
    servingDescription: '1 medium carrot (80g)',
    category: 'vegetables',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-tomato',
    name: 'Tomato',
    calories: 22,
    servingDescription: '1 medium tomato (100g)',
    category: 'vegetables',
    mode: 'instant',
  },

  // ── Snacks ────────────────────────────────────────────────────────────
  {
    id: 'cf-almonds',
    name: 'Almonds',
    calories: 164,
    servingDescription: 'Small handful (28g, ~23 almonds)',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-peanut-butter',
    name: 'Peanut butter',
    calories: 188,
    servingDescription: '2 tbsp (32g)',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'prefill',
  },
  {
    id: 'cf-hummus',
    name: 'Hummus',
    calories: 70,
    servingDescription: '2 tbsp (30g)',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-dark-chocolate',
    name: 'Dark chocolate (70%+)',
    calories: 170,
    servingDescription: '30g (3 squares)',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'prefill',
  },
  {
    id: 'cf-rice-cakes',
    name: 'Rice cakes',
    calories: 70,
    servingDescription: '2 plain rice cakes',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-crisps',
    name: 'Crisps / Potato chips',
    calories: 130,
    servingDescription: 'Small bag (25g)',
    category: 'snacks',
    defaultMeal: 'snack',
    mode: 'instant',
  },

  // ── Drinks ────────────────────────────────────────────────────────────
  {
    id: 'cf-coffee-latte',
    name: 'Latte (semi-skimmed)',
    calories: 130,
    servingDescription: 'Medium (355ml)',
    category: 'drinks',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-coffee-black',
    name: 'Black coffee',
    calories: 5,
    servingDescription: 'Standard cup (240ml)',
    category: 'drinks',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-orange-juice',
    name: 'Orange juice',
    calories: 110,
    servingDescription: '250ml glass, unsweetened',
    category: 'drinks',
    defaultMeal: 'breakfast',
    mode: 'instant',
  },
  {
    id: 'cf-cola',
    name: 'Cola (regular)',
    calories: 142,
    servingDescription: '330ml can',
    category: 'drinks',
    defaultMeal: 'snack',
    mode: 'instant',
  },
  {
    id: 'cf-beer',
    name: 'Beer (lager, 4.5%)',
    calories: 182,
    servingDescription: '440ml can',
    category: 'drinks',
    defaultMeal: 'dinner',
    mode: 'instant',
  },
  {
    id: 'cf-wine-white',
    name: 'White wine',
    calories: 159,
    servingDescription: '175ml standard glass (13%)',
    category: 'drinks',
    defaultMeal: 'dinner',
    mode: 'instant',
  },

  // ── Common meals ──────────────────────────────────────────────────────
  {
    id: 'cf-sandwich-chicken',
    name: 'Chicken sandwich',
    calories: 380,
    servingDescription: '2 slices bread, chicken, lettuce, light mayo',
    category: 'meals',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-bowl-rice-veg',
    name: 'Rice and vegetable bowl',
    calories: 420,
    servingDescription: '150g rice, mixed veg, light sauce',
    category: 'meals',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-soup-veg',
    name: 'Vegetable soup',
    calories: 120,
    servingDescription: '300ml bowl, homemade or shop-bought',
    category: 'meals',
    defaultMeal: 'lunch',
    mode: 'prefill',
  },
  {
    id: 'cf-pizza-slice',
    name: 'Pizza (1 slice, cheese)',
    calories: 272,
    servingDescription: '1 slice from a 12-inch pizza (~107g)',
    category: 'meals',
    defaultMeal: 'dinner',
    mode: 'prefill',
  },
]

/**
 * Returns all common foods.
 */
export function getCommonFoods(): CommonFood[] {
  return COMMON_FOODS
}

/**
 * Returns common foods filtered by category.
 */
export function getCommonFoodsByCategory(category: string): CommonFood[] {
  return COMMON_FOODS.filter((food) => food.category === category)
}

/**
 * Returns the unique list of food categories available.
 */
export function getCommonFoodCategories(): string[] {
  return [...new Set(COMMON_FOODS.map((f) => f.category).filter(Boolean))] as string[]
}

/**
 * Searches common foods by name (case-insensitive partial match).
 * Used for the food log search input in Phase 4.
 */
export function searchCommonFoods(query: string): CommonFood[] {
  const q = query.toLowerCase().trim()
  if (!q) return COMMON_FOODS
  return COMMON_FOODS.filter((food) =>
    food.name.toLowerCase().includes(q)
  )
}
