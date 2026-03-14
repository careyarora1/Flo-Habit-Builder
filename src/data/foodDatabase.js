// Junk Food Scoring System
// Sugary items: 1g added sugar = 0.1 junkfoods
// Fast food: Spicy McChicken = 1.0 reference, others scored relative by unhealthiness
//
// Items with `variants` ask the user "what size?" before quantity.
// The `score` on the parent is the default / most common size (used in search results preview).

const foodDatabase = [
  // ── Fast Food ──────────────────────────────────────────
  { id: 'ff-mcchicken', name: 'McChicken (Spicy)', category: 'Fast Food', score: 1.0, icon: '🍔', note: 'per sandwich' },
  { id: 'ff-bigmac', name: 'Big Mac', category: 'Fast Food', score: 1.3, icon: '🍔', note: 'per sandwich' },
  { id: 'ff-qp-cheese', name: 'Quarter Pounder w/ Cheese', category: 'Fast Food', score: 1.3, icon: '🍔', note: 'per sandwich' },
  {
    id: 'ff-mcnuggets', name: 'Chicken McNuggets', category: 'Fast Food', score: 0.8, icon: '🍗', note: 'pick a size',
    variants: [
      { label: '4 piece', score: 0.5, note: '4 nuggets' },
      { label: '6 piece', score: 0.8, note: '6 nuggets' },
      { label: '10 piece', score: 1.2, note: '10 nuggets' },
      { label: '20 piece', score: 2.2, note: '20 nuggets' },
    ],
  },
  { id: 'ff-whopper', name: 'Whopper', category: 'Fast Food', score: 1.4, icon: '🍔', note: 'per sandwich' },
  { id: 'ff-whopper-jr', name: 'Whopper Jr.', category: 'Fast Food', score: 0.9, icon: '🍔', note: 'per sandwich' },
  { id: 'ff-chickfila', name: 'Chick-fil-A Sandwich', category: 'Fast Food', score: 1.0, icon: '🍔', note: 'per sandwich' },
  {
    id: 'ff-chickfila-nuggets', name: 'Chick-fil-A Nuggets', category: 'Fast Food', score: 0.8, icon: '🍗', note: 'pick a size',
    variants: [
      { label: '5 count', score: 0.5, note: '5 nuggets' },
      { label: '8 count', score: 0.8, note: '8 nuggets' },
      { label: '12 count', score: 1.2, note: '12 nuggets' },
    ],
  },
  { id: 'ff-taco-bell-burrito', name: 'Taco Bell Burrito', category: 'Fast Food', score: 0.9, icon: '🌯', note: 'per burrito' },
  { id: 'ff-taco-bell-taco', name: 'Taco Bell Crunchy Taco', category: 'Fast Food', score: 0.5, icon: '🌮', note: 'per taco' },
  {
    id: 'ff-dominos', name: "Domino's Pizza", category: 'Fast Food', score: 0.7, icon: '🍕', note: 'pick a size',
    variants: [
      { label: '1 slice', score: 0.7, note: 'per slice' },
      { label: '2 slices', score: 1.4, note: '2 slices' },
      { label: '3 slices', score: 2.1, note: '3 slices' },
      { label: 'Half pizza', score: 2.8, note: '4 slices' },
      { label: 'Whole pizza', score: 5.6, note: '8 slices' },
    ],
  },
  {
    id: 'ff-lc', name: 'Little Caesars Pizza', category: 'Fast Food', score: 0.6, icon: '🍕', note: 'pick a type',
    variants: [
      { label: 'Cheese slice', score: 0.6, note: 'per slice' },
      { label: 'Veggie slice', score: 0.5, note: 'per slice' },
      { label: 'Pepperoni slice', score: 0.7, note: 'per slice' },
      { label: 'Half pizza', score: 2.6, note: '4 slices' },
      { label: 'Whole pizza', score: 5.2, note: '8 slices' },
    ],
  },
  { id: 'ff-papa-slice', name: "Papa John's Slice", category: 'Fast Food', score: 0.7, icon: '🍕', note: 'per slice' },
  { id: 'ff-chipotle-bowl', name: 'Chipotle Bowl', category: 'Fast Food', score: 0.3, icon: '🥗', note: 'per bowl' },
  { id: 'ff-chipotle-burrito', name: 'Chipotle Burrito', category: 'Fast Food', score: 0.5, icon: '🌯', note: 'per burrito' },
  {
    id: 'ff-subway', name: 'Subway Sub', category: 'Fast Food', score: 0.4, icon: '🥖', note: 'pick a size',
    variants: [
      { label: '6 inch', score: 0.4, note: 'half sub' },
      { label: 'Footlong', score: 0.7, note: 'whole sub' },
    ],
  },
  {
    id: 'ff-fries', name: 'French Fries', category: 'Fast Food', score: 0.6, icon: '🍟', note: 'pick a size',
    variants: [
      { label: 'Small', score: 0.4, note: 'small order' },
      { label: 'Medium', score: 0.6, note: 'medium order' },
      { label: 'Large', score: 0.8, note: 'large order' },
    ],
  },
  { id: 'ff-hotdog', name: 'Hot Dog', category: 'Fast Food', score: 0.7, icon: '🌭', note: 'per hot dog' },
  { id: 'ff-popeyes', name: 'Popeyes Chicken Sandwich', category: 'Fast Food', score: 1.1, icon: '🍔', note: 'per sandwich' },
  {
    id: 'ff-wendys-burger', name: "Wendy's Burger", category: 'Fast Food', score: 0.9, icon: '🍔', note: 'pick a size',
    variants: [
      { label: 'Jr. Cheeseburger', score: 0.7, note: 'junior' },
      { label: 'Dave\'s Single', score: 0.9, note: 'single patty' },
      { label: 'Dave\'s Double', score: 1.2, note: 'double patty' },
      { label: 'Baconator', score: 1.6, note: 'double + bacon' },
    ],
  },
  { id: 'ff-kfc-2pc', name: 'KFC Fried Chicken', category: 'Fast Food', score: 1.0, icon: '🍗', note: 'per 2 pieces' },
  { id: 'ff-five-guys', name: 'Five Guys Cheeseburger', category: 'Fast Food', score: 1.5, icon: '🍔', note: 'per burger' },

  // ── Sugary Drinks ──────────────────────────────────────
  {
    id: 'sd-coke', name: 'Coca-Cola', category: 'Sugary Drinks', score: 3.9, icon: '🥤', note: 'pick a size',
    variants: [
      { label: 'Can (12oz)', score: 3.9, note: '39g sugar' },
      { label: 'Bottle (20oz)', score: 6.5, note: '65g sugar' },
      { label: 'Mini can (7.5oz)', score: 2.5, note: '25g sugar' },
      { label: 'Large fountain (32oz)', score: 8.6, note: '~86g sugar' },
    ],
  },
  {
    id: 'sd-pepsi', name: 'Pepsi', category: 'Sugary Drinks', score: 4.1, icon: '🥤', note: 'pick a size',
    variants: [
      { label: 'Can (12oz)', score: 4.1, note: '41g sugar' },
      { label: 'Bottle (20oz)', score: 6.9, note: '69g sugar' },
      { label: 'Mini can (7.5oz)', score: 2.6, note: '26g sugar' },
    ],
  },
  {
    id: 'sd-sprite', name: 'Sprite', category: 'Sugary Drinks', score: 3.8, icon: '🥤', note: 'pick a size',
    variants: [
      { label: 'Can (12oz)', score: 3.8, note: '38g sugar' },
      { label: 'Bottle (20oz)', score: 6.4, note: '64g sugar' },
    ],
  },
  {
    id: 'sd-mtn-dew', name: 'Mountain Dew', category: 'Sugary Drinks', score: 4.6, icon: '🥤', note: 'pick a size',
    variants: [
      { label: 'Can (12oz)', score: 4.6, note: '46g sugar' },
      { label: 'Bottle (20oz)', score: 7.7, note: '77g sugar' },
    ],
  },
  { id: 'sd-monster', name: 'Monster Energy', category: 'Sugary Drinks', score: 5.4, icon: '⚡', note: '16oz / 54g sugar' },
  {
    id: 'sd-redbull', name: 'Red Bull', category: 'Sugary Drinks', score: 2.7, icon: '⚡', note: 'pick a size',
    variants: [
      { label: 'Regular (8.4oz)', score: 2.7, note: '27g sugar' },
      { label: 'Large (12oz)', score: 3.7, note: '37g sugar' },
      { label: 'Big (16oz)', score: 4.9, note: '49g sugar' },
    ],
  },
  {
    id: 'sd-starbucks-frap', name: 'Starbucks Frappuccino', category: 'Sugary Drinks', score: 5.0, icon: '☕', note: 'pick a size',
    variants: [
      { label: 'Tall', score: 3.6, note: '~36g sugar' },
      { label: 'Grande', score: 5.0, note: '~50g sugar' },
      { label: 'Venti', score: 6.9, note: '~69g sugar' },
    ],
  },
  { id: 'sd-sweet-tea', name: 'Sweet Tea', category: 'Sugary Drinks', score: 3.3, icon: '🧋', note: '~33g sugar' },
  { id: 'sd-gatorade', name: 'Gatorade', category: 'Sugary Drinks', score: 3.4, icon: '🧃', note: '20oz / 34g sugar' },
  { id: 'sd-lemonade', name: 'Lemonade', category: 'Sugary Drinks', score: 2.8, icon: '🍋', note: 'per glass / ~28g sugar' },
  { id: 'sd-juice-box', name: 'Juice Box', category: 'Sugary Drinks', score: 2.0, icon: '🧃', note: '~20g sugar' },
  { id: 'sd-chocolate-milk', name: 'Chocolate Milk', category: 'Sugary Drinks', score: 2.5, icon: '🥛', note: 'per glass / ~25g sugar' },

  // ── Sugary Snacks ──────────────────────────────────────
  { id: 'ss-oreos', name: 'Oreos (3 cookies)', category: 'Sugary Snacks', score: 1.4, icon: '🍪', note: '14g sugar' },
  { id: 'ss-pop-tart', name: 'Pop-Tart (1 pastry)', category: 'Sugary Snacks', score: 1.7, icon: '🥐', note: '17g sugar' },
  { id: 'ss-granola-bar', name: 'Granola Bar', category: 'Sugary Snacks', score: 0.8, icon: '🥜', note: '~8g sugar' },
  { id: 'ss-trail-mix', name: 'Trail Mix (sweet)', category: 'Sugary Snacks', score: 0.9, icon: '🥜', note: 'per handful / ~9g sugar' },
  { id: 'ss-rice-krispy', name: 'Rice Krispies Treat', category: 'Sugary Snacks', score: 0.9, icon: '🍚', note: '9g sugar' },
  { id: 'ss-nature-valley', name: 'Nature Valley Bar', category: 'Sugary Snacks', score: 1.1, icon: '🥜', note: '11g sugar' },
  { id: 'ss-little-debbie', name: 'Little Debbie Snack Cake', category: 'Sugary Snacks', score: 2.2, icon: '🧁', note: '~22g sugar' },
  { id: 'ss-animal-crackers', name: 'Animal Crackers (serving)', category: 'Sugary Snacks', score: 0.7, icon: '🍪', note: '~7g sugar' },

  // ── Candy ──────────────────────────────────────────────
  {
    id: 'ca-snickers', name: 'Snickers', category: 'Candy', score: 2.0, icon: '🍫', note: 'pick a size',
    variants: [
      { label: 'Mini / bite-size', score: 0.5, note: '~5g sugar' },
      { label: 'Fun size', score: 1.0, note: '~10g sugar' },
      { label: 'Regular bar', score: 2.0, note: '20g sugar' },
      { label: 'King size', score: 3.7, note: '37g sugar' },
    ],
  },
  {
    id: 'ca-reeses', name: "Reese's Peanut Butter Cups", category: 'Candy', score: 2.1, icon: '🍫', note: 'pick a size',
    variants: [
      { label: 'Mini (1 cup)', score: 0.4, note: '~4g sugar' },
      { label: 'Regular (2 cups)', score: 2.1, note: '21g sugar' },
      { label: 'King size (4 cups)', score: 4.2, note: '42g sugar' },
      { label: 'Big Cup', score: 2.5, note: '25g sugar' },
    ],
  },
  {
    id: 'ca-skittles', name: 'Skittles', category: 'Candy', score: 4.7, icon: '🍬', note: 'pick a size',
    variants: [
      { label: 'Fun size', score: 1.5, note: '~15g sugar' },
      { label: 'Regular pack', score: 4.7, note: '47g sugar' },
      { label: 'Share size', score: 7.0, note: '~70g sugar' },
    ],
  },
  {
    id: 'ca-mm', name: "M&M's", category: 'Candy', score: 3.1, icon: '🍬', note: 'pick a size',
    variants: [
      { label: 'Fun size', score: 1.1, note: '~11g sugar' },
      { label: 'Regular pack', score: 3.1, note: '31g sugar' },
      { label: 'Share size', score: 5.0, note: '~50g sugar' },
    ],
  },
  {
    id: 'ca-sour-patch', name: 'Sour Patch Kids', category: 'Candy', score: 3.0, icon: '🍬', note: 'pick a size',
    variants: [
      { label: 'Fun size', score: 1.0, note: '~10g sugar' },
      { label: 'Regular pack', score: 3.0, note: '30g sugar' },
      { label: 'Big bag', score: 6.5, note: '~65g sugar' },
    ],
  },
  { id: 'ca-gummy-bears', name: 'Gummy Bears (handful)', category: 'Candy', score: 2.5, icon: '🐻', note: '~25g sugar' },
  {
    id: 'ca-twix', name: 'Twix', category: 'Candy', score: 2.4, icon: '🍫', note: 'pick a size',
    variants: [
      { label: 'Mini / bite-size', score: 0.5, note: '~5g sugar' },
      { label: 'Fun size (1 bar)', score: 1.0, note: '~10g sugar' },
      { label: 'Regular (2 bars)', score: 2.4, note: '24g sugar' },
      { label: 'King size', score: 4.0, note: '~40g sugar' },
    ],
  },
  {
    id: 'ca-kit-kat', name: 'Kit Kat', category: 'Candy', score: 2.2, icon: '🍫', note: 'pick a size',
    variants: [
      { label: 'Mini (2 fingers)', score: 0.6, note: '~6g sugar' },
      { label: 'Regular (4 fingers)', score: 2.2, note: '22g sugar' },
      { label: 'King size', score: 3.5, note: '~35g sugar' },
    ],
  },
  {
    id: 'ca-hershey', name: "Hershey's Chocolate Bar", category: 'Candy', score: 2.4, icon: '🍫', note: 'pick a size',
    variants: [
      { label: 'Miniature', score: 0.5, note: '~5g sugar' },
      { label: 'Snack size', score: 1.0, note: '~10g sugar' },
      { label: 'Regular bar', score: 2.4, note: '24g sugar' },
      { label: 'King size', score: 4.4, note: '~44g sugar' },
    ],
  },
  { id: 'ca-jolly-rancher', name: 'Jolly Rancher (3 pieces)', category: 'Candy', score: 0.7, icon: '🍬', note: '7g sugar' },

  // ── Desserts ───────────────────────────────────────────
  { id: 'de-cake-slice', name: 'Cake Slice', category: 'Desserts', score: 3.5, icon: '🍰', note: '~35g sugar' },
  {
    id: 'de-brownie', name: 'Brownie', category: 'Desserts', score: 2.0, icon: '🟫', note: 'pick a size',
    variants: [
      { label: 'Mini / bite-size', score: 0.7, note: '~7g sugar' },
      { label: 'Regular', score: 2.0, note: '~20g sugar' },
      { label: 'Large / bakery-size', score: 3.2, note: '~32g sugar' },
    ],
  },
  {
    id: 'de-donut', name: 'Donut', category: 'Desserts', score: 2.2, icon: '🍩', note: 'pick a type',
    variants: [
      { label: 'Donut hole', score: 0.4, note: '~4g sugar' },
      { label: 'Glazed', score: 2.0, note: '~20g sugar' },
      { label: 'Frosted / filled', score: 2.6, note: '~26g sugar' },
      { label: 'Specialty / cream-filled', score: 3.2, note: '~32g sugar' },
    ],
  },
  {
    id: 'de-ice-cream', name: 'Ice Cream', category: 'Desserts', score: 1.4, icon: '🍨', note: 'pick a size',
    variants: [
      { label: 'Kids scoop', score: 0.8, note: '~8g sugar' },
      { label: '1 scoop', score: 1.4, note: '~14g sugar' },
      { label: '2 scoops', score: 2.8, note: '~28g sugar' },
      { label: '3 scoops', score: 4.2, note: '~42g sugar' },
    ],
  },
  { id: 'de-cookies-homemade', name: 'Homemade Cookie', category: 'Desserts', score: 1.0, icon: '🍪', note: '~10g sugar' },
  { id: 'de-pie-slice', name: 'Pie Slice', category: 'Desserts', score: 3.0, icon: '🥧', note: '~30g sugar' },
  { id: 'de-cheesecake', name: 'Cheesecake Slice', category: 'Desserts', score: 2.6, icon: '🍰', note: '~26g sugar' },
  { id: 'de-cinnamon-roll', name: 'Cinnamon Roll', category: 'Desserts', score: 4.0, icon: '🍥', note: '~40g sugar' },
  {
    id: 'de-mcflurry', name: 'McFlurry', category: 'Desserts', score: 6.3, icon: '🍦', note: 'pick a size',
    variants: [
      { label: 'Snack size', score: 3.4, note: '~34g sugar' },
      { label: 'Regular', score: 6.3, note: '~63g sugar' },
    ],
  },

  // ── Fried Snacks ───────────────────────────────────────
  {
    id: 'fs-chips', name: 'Potato Chips', category: 'Fried Snacks', score: 1.5, icon: '🥔', note: 'pick a size',
    variants: [
      { label: 'Snack bag (1oz)', score: 0.7, note: 'vending machine size' },
      { label: 'Regular bag (2.75oz)', score: 1.5, note: 'single-serve' },
      { label: 'Grab bag (5oz)', score: 2.5, note: 'share size' },
      { label: 'Party size / lots', score: 4.0, note: 'lost count' },
    ],
  },
  { id: 'fs-mozz-sticks', name: 'Mozzarella Sticks (4pc)', category: 'Fried Snacks', score: 1.0, icon: '🧀', note: '4 pieces' },
  { id: 'fs-onion-rings', name: 'Onion Rings', category: 'Fried Snacks', score: 0.8, icon: '🧅', note: 'per order' },
  { id: 'fs-jalapeno-poppers', name: 'Jalapeño Poppers (4pc)', category: 'Fried Snacks', score: 0.9, icon: '🌶️', note: '4 pieces' },
  { id: 'fs-corn-dog', name: 'Corn Dog', category: 'Fried Snacks', score: 0.8, icon: '🌽', note: 'per corn dog' },
  {
    id: 'fs-doritos', name: 'Doritos', category: 'Fried Snacks', score: 1.3, icon: '🔺', note: 'pick a size',
    variants: [
      { label: 'Snack bag (1oz)', score: 0.6, note: 'vending machine size' },
      { label: 'Regular bag (2.75oz)', score: 1.3, note: 'single-serve' },
      { label: 'Grab bag (5oz)', score: 2.2, note: 'share size' },
    ],
  },
  {
    id: 'fs-cheetos', name: 'Cheetos', category: 'Fried Snacks', score: 1.2, icon: '🟠', note: 'pick a size',
    variants: [
      { label: 'Snack bag (1oz)', score: 0.5, note: 'vending machine size' },
      { label: 'Regular bag (3.25oz)', score: 1.2, note: 'single-serve' },
      { label: 'Grab bag (5oz)', score: 2.0, note: 'share size' },
    ],
  },

  // ── Breakfast ──────────────────────────────────────────
  { id: 'br-sugary-cereal', name: 'Sugary Cereal (bowl)', category: 'Breakfast', score: 1.2, icon: '🥣', note: '~12g sugar' },
  { id: 'br-pancakes-syrup', name: 'Pancakes w/ Syrup', category: 'Breakfast', score: 2.0, icon: '🥞', note: '~20g sugar' },
  { id: 'br-waffles-syrup', name: 'Waffles w/ Syrup', category: 'Breakfast', score: 2.0, icon: '🧇', note: '~20g sugar' },
  { id: 'br-mcmuffin', name: 'Egg McMuffin', category: 'Breakfast', score: 0.5, icon: '🍳', note: 'per sandwich' },
  { id: 'br-sausage-biscuit', name: 'Sausage Biscuit', category: 'Breakfast', score: 0.8, icon: '🍳', note: 'per sandwich' },
  { id: 'br-french-toast', name: 'French Toast w/ Syrup', category: 'Breakfast', score: 2.2, icon: '🍞', note: '~22g sugar' },
]

// Build category groups
const categoryOrder = ['Fast Food', 'Sugary Drinks', 'Sugary Snacks', 'Candy', 'Desserts', 'Fried Snacks', 'Breakfast']
const categoryIcons = {
  'Fast Food': '🍔',
  'Sugary Drinks': '🥤',
  'Sugary Snacks': '🍪',
  'Candy': '🍬',
  'Desserts': '🍰',
  'Fried Snacks': '🥔',
  'Breakfast': '🥞',
}

export const foodCategories = categoryOrder.map(name => ({
  name,
  icon: categoryIcons[name],
  items: foodDatabase.filter(f => f.category === name),
}))

export function searchFoods(query) {
  if (!query || query.trim().length === 0) return []
  const q = query.toLowerCase().trim()
  return foodDatabase.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  ).slice(0, 20)
}

export default foodDatabase
