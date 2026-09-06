import type { MenuItem, Staff } from './types';

export const menuItems: MenuItem[] = [
  // ===== FOOD =====
  {
    id: 'jollof-rice',
    name: 'Smoky Party Jollof Rice',
    description:
      'Long-grain rice simmered in rich tomato-pepper base with smoked spices. Served with grilled chicken and plantain.',
    price: 4500,
    prepTime: 25,
    image:
      'https://images.pexels.com/photos/13915043/pexels-photo-13915043.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Mains',
    popular: true,
  },
  {
    id: 'jollof-chicken',
    name: 'Jollof Rice & Chicken Bowl',
    description:
      'Fluffy jollof rice topped with grilled chicken, boiled egg, and coleslaw. A complete meal in one bowl.',
    price: 5200,
    prepTime: 25,
    image:
      'https://images.pexels.com/photos/18805640/pexels-photo-18805640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Mains',
    popular: true,
  },
  {
    id: 'fried-rice',
    name: 'Nigerian Fried Rice',
    description:
      'Fragrant stir-fried rice with diced vegetables, liver, and prawns. Seasoned with curry and thyme.',
    price: 4800,
    prepTime: 30,
    image:
      'https://images.pexels.com/photos/8864543/pexels-photo-8864543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Mains',
    popular: false,
  },
  {
    id: 'egusi-soup',
    name: 'Egusi Soup & Pounded Yam',
    description:
      'Rich melon-seed soup with assorted meat and stockfish. Served with smooth pounded yam.',
    price: 5500,
    prepTime: 30,
    image:
      'https://images.pexels.com/photos/37648018/pexels-photo-37648018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Soups',
    popular: true,
  },
  {
    id: 'efo-riro',
    name: 'Efo Riro with Assorted Meat',
    description:
      'Spinach stew loaded with palm oil, locust beans, assorted meat, and dried fish.',
    price: 5000,
    prepTime: 30,
    image:
      'https://images.pexels.com/photos/34822475/pexels-photo-34822475.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Soups',
    popular: false,
  },
  {
    id: 'pepper-soup',
    name: 'Catfish Pepper Soup',
    description:
      'Light aromatic pepper soup with fresh catfish, utazi leaves, and traditional spices.',
    price: 6000,
    prepTime: 20,
    image:
      'https://allnigerianfoods.com/wp-content/uploads/catfish-pepper-soup-recipe.jpg',
    type: 'food',
    category: 'Soups',
    popular: false,
  },
  {
    id: 'suya-skewers',
    name: 'Beef Suya Skewers',
    description:
      'Charcoal-grilled beef coated in fiery yaji spice. Served with fresh onions and tomatoes.',
    price: 3500,
    prepTime: 15,
    image:
      'https://images.pexels.com/photos/11989697/pexels-photo-11989697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Grills',
    popular: true,
  },
  {
    id: 'grilled-chicken',
    name: 'Yaji Grilled Chicken',
    description:
      'Half chicken marinated in suya spice and grilled over open flame. Juicy and crispy.',
    price: 6500,
    prepTime: 25,
    image:
      'https://images.pexels.com/photos/8707683/pexels-photo-8707683.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Grills',
    popular: false,
  },
  {
    id: 'asun',
    name: 'Peppered Goat Asun',
    description:
      'Smoky diced goat meat tossed in scotch bonnet peppers and onions. Fiery and tender.',
    price: 7000,
    prepTime: 20,
    image:
      'https://images.pexels.com/photos/18719656/pexels-photo-18719656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Grills',
    popular: false,
  },
  {
    id: 'dodo',
    name: 'Fried Plantain (Dodo)',
    description:
      'Sweet caramelized plantain fried golden. Crisp edges, soft center.',
    price: 1500,
    prepTime: 10,
    image:
      'https://images.pexels.com/photos/12362298/pexels-photo-12362298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Sides',
    popular: true,
  },
  {
    id: 'akara',
    name: 'Akara & Pap',
    description:
      'Golden bean cakes served with smooth warm akamu (pap). Classic breakfast.',
    price: 2000,
    prepTime: 15,
    image:
      'https://images.pexels.com/photos/34943603/pexels-photo-34943603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Sides',
    popular: false,
  },
  {
    id: 'puff-puff',
    name: 'Puff Puff (6 pieces)',
    description:
      'Soft pillowy fried dough balls with a hint of nutmeg. Golden and fluffy.',
    price: 1800,
    prepTime: 10,
    image:
      'https://images.pexels.com/photos/5949005/pexels-photo-5949005.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Desserts',
    popular: true,
  },
  {
    id: 'chin-chin',
    name: 'Chin Chin (Family Pack)',
    description:
      'Crunchy fried pastry bites with nutmeg and vanilla. Dangerously moreish.',
    price: 2200,
    prepTime: 5,
    image:
      'https://images.pexels.com/photos/36038590/pexels-photo-36038590.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'food',
    category: 'Desserts',
    popular: false,
  },

  // ===== DRINKS =====
  {
    id: 'zobo',
    name: 'Chilled Zobo Drink',
    description:
      'Refreshing hibiscus tea infused with ginger, pineapple, and cucumber. Served ice-cold.',
    price: 1000,
    prepTime: 5,
    image:
      'https://images.pexels.com/photos/34567239/pexels-photo-34567239.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Non-Alcoholic',
    popular: true,
  },
  {
    id: 'chapman',
    name: 'Chapman Cocktail',
    description:
      "Nigeria's favourite party cocktail — fruit juices, grenadine, cucumber, and citrus. Non-alcoholic.",
    price: 1500,
    prepTime: 5,
    image:
      'https://images.pexels.com/photos/33284162/pexels-photo-33284162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Non-Alcoholic',
    popular: false,
  },
  {
    id: 'palm-wine',
    name: 'Fresh Palm Wine',
    description:
      'Tapped fresh from the palm tree. Sweet, slightly tart, and naturally effervescent.',
    price: 2000,
    prepTime: 3,
    image:
      'https://images.pexels.com/photos/34599382/pexels-photo-34599382.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Traditional',
    popular: true,
  },
  {
    id: 'coconut-water',
    name: 'Fresh Coconut Water',
    description:
      'Chilled coconut water served straight from the shell. Pure hydration.',
    price: 1200,
    prepTime: 3,
    image:
      'https://images.pexels.com/photos/11398730/pexels-photo-11398730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Non-Alcoholic',
    popular: false,
  },
  {
    id: 'iced-coffee',
    name: 'Iced Caramel Macchiato',
    description:
      'Espresso over ice with milk and caramel drizzle. Smooth and refreshing.',
    price: 1800,
    prepTime: 7,
    image:
      'https://images.pexels.com/photos/2813281/pexels-photo-2813281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Coffee & Tea',
    popular: true,
  },
  {
    id: 'beer',
    name: 'Chilled Bottle Beer',
    description:
      'Your favourite lager, served ice-cold. Perfect with suya.',
    price: 1500,
    prepTime: 2,
    image:
      'https://images.pexels.com/photos/12089506/pexels-photo-12089506.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    type: 'drinks',
    category: 'Alcoholic',
    popular: false,
  },
];

export const staff: Staff[] = [
  {
    id: 'chef-1',
    name: 'Chef Tunde',
    role: 'chef',
  },
  {
    id: 'chef-2',
    name: 'Chef Amaka',
    role: 'chef',
  },
  {
    id: 'chef-3',
    name: 'Chef Bola',
    role: 'chef',
  },
  {
    id: 'bartender-1',
    name: 'Bartender Emeka',
    role: 'bartender',
  },
  {
    id: 'bartender-2',
    name: 'Bartender Ngozi',
    role: 'bartender',
  },
  {
    id: 'waiter-1',
    name: 'Waiter Chidi',
    role: 'waiter',
  },
  {
    id: 'waiter-2',
    name: 'Waiter Funmi',
    role: 'waiter',
  },
];

export function formatPrice(kobo: number): string {
  return '\u20A6' + kobo.toLocaleString('en-NG');
}

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return secs > 0
    ? `${mins}m ${secs}s`
    : `${mins}m`;
}

export function formatPrepTime(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return m > 0
    ? `${h}h ${m}m`
    : `${h}h`;
}

export function generateOrderId(): string {
  return (
    'ORD-' +
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()
  );
}
