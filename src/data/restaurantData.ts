// Centralized data for The London Shakes - Milkshakes, Waffles & Quick Bites

export interface PortionConfig {
  available: boolean;
  price: number;
}

export interface MenuItemPortions {
  small: PortionConfig;
  medium: PortionConfig;
  large: PortionConfig;
}

export interface MenuItem {
  id: string;
  category: string;
  course: string;
  name: string;
  description: string;
  price: number;
  badge?: string | null;
  dietary: string[]; // 'gf', 'v', 'vg', 'df'
  allergens: string[];
  gradient: string; // Background gradient class for food photo simulation
  image?: string | null;
  portions?: MenuItemPortions;
  active?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: string;
  desc: string;
  gutterImageLeftTop?: string | null;
  gutterImageLeftBottom?: string | null;
  gutterImageRightTop?: string | null;
  gutterImageRightBottom?: string | null;
  bannerImage?: string | null;
}



export interface UpcomingEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  price: string;
  capacity: string;
  gradient: string;
  type: string;
  image?: string | null;
}

export interface PrivateEventType {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  capacity: string;
  rooms: string[];
  includes: string[];
  icon: string;
  image?: string | null;
}

export const restaurantInfo = {
  name: "The London Shakes",
  tagline: "Bold Flavours, Editorial Craft, Refined Grace",
  description: "An exquisite milkshake bar and cozy eatery in Silchar. The London Shakes offers a rich menu of premium milkshakes, thick waffles, loaded burgers, creamy pastas, and crispy snacks in a warm, premium setting.",
  founded: "2021",
  location: {
    address: "T-22, 3rd Floor, near Goldighi Mall Office, Premtala",
    city: "Silchar",
    postcode: "788001",
    fullAddress: "T-22, 3rd Floor, near Goldighi Mall Office, Premtala, Silchar — 788001",
    latitude: "24.8208",
    longitude: "92.8005",
    googleMapsEmbedUrl: "",
    googleMapsUrl: "https://maps.app.goo.gl/1JdFt5kDFpdefg3j9"
  },
  contact: {
    phone: "+91 97063 88102",
    email: "contact@thelondonshakessilchar.com",
    instagram: "@thelondonshakes_silchar",
  },
  paymentInfo: {
    upiId: "9706388102@ybl",
    accountHolder: "The London Shakes Silchar",
    qrCodeImage: "" as string | null,
    bankName: "State Bank of India",
    accountNumber: "38920192839",
    ifscCode: "SBIN0000182",
    instructions: "Scan the QR code or use the UPI ID above to complete your transaction, then enter your UTR / Transaction ID below to verify your payment."
  },
  hours: [
    { days: "Monday — Sunday", lunch: "11:00 — 16:00", dinner: "16:00 — 22:00" }
  ],
  aboutImage: null as string | null,
  awards: [
    { year: "2025", award: "Best Milkshake Brand", org: "Silchar Food Awards" },
    { year: "2024", award: "Most Popular Hangout Spot", org: "Local Diner Rankings" },
    { year: "2024", award: "Excellent Service Award", org: "Local Food Reviewers" }
  ],
  instagram: [
    { id: 1, caption: "Signature KitKat Shake topped with chocolate wafers", gradient: "linear-gradient(135deg, #120c08, #2a1b10, #120c08)", image: null as string | null },
    { id: 2, caption: "Freshly baked Ice Cream Waffles served hot", gradient: "linear-gradient(135deg, #1c180d, #2e2417, #1c180d)", image: null as string | null },
    { id: 3, caption: "Double Cheese Burgers, toasted to perfection", gradient: "linear-gradient(135deg, #1c0a0c, #301416, #1c0a0c)", image: null as string | null },
    { id: 4, caption: "Cozy interior corners for friends & families", gradient: "linear-gradient(135deg, #0d0d0d, #1a1a1a, #0d0d0d)", image: null as string | null },
    { id: 5, caption: "Creamy White Sauce Pasta loaded with herbs", gradient: "linear-gradient(135deg, #080512, #130a21, #080512)", image: null as string | null },
    { id: 6, caption: "Refreshing Green Apple and Red Melon Mojitos", gradient: "linear-gradient(135deg, #050b12, #0e1a26, #050b12)", image: null as string | null }
  ]
};

export const chef = {
  name: "Abhik",
  title: "Founder And CEO",
  image: null as string | null,
  bio: "With a deep passion for fine desserts and European café culture, Abhik set out to redefine local dining in Silchar. Having studied hospitality and culinary arts in London and worked with leading pastry chefs and café directors, he brought back global standards of service and recipe craft. In 2021, Abhik merged his love for premium thick shakes, gourmet burgers, and freshly baked waffles to launch The London Shakes Silchar, securing high local praise within eighteen months.",
  philosophy: "\"Dessert and café experiences shouldn't lose their soul. We craft every shake with premium real ingredients, fresh dairy, and artisan toppings. It's comfort food, elevated to its absolute limit.\"",
  education: [
    "Le Cordon Bleu London — Grand Diplôme, 2012",
    "Masterclass in Modern Dessert & Beverage Formulation, 2015",
    "Operations Lead, Premium UK Dessert Franchise, 2017"
  ],
  media: ["Vogue British", "The Times", "Local Gastronomy Editorial", "Chef's Table UK", "BBC Good Food"],
  signature: [
    "Strawberry Monster Shake",
    "Ice Cream Waffle with Chocolate Drizzle",
    "Creamy White Sauce Pasta"
  ]
};

export const menuCategories: MenuCategory[] = [
  { id: "shakes", label: "Shakes & Coolers", icon: "✦", desc: "Premium thick shakes and cooling mocktails", bannerImage: "/event-shake.png" },
  { id: "burgers", label: "Burgers & Sandwiches", icon: "◈", desc: "Toasted buns with juicy patties", bannerImage: "/menu-burger.png" },
  { id: "pastas", label: "Pasta & Noodles", icon: "◉", desc: "Creamy white sauce and Italian herbs", bannerImage: "/menu-pasta.png" },
  { id: "snacks", label: "Snacks & Sides", icon: "▣", desc: "Crispy chicken delights and golden fries", bannerImage: "/menu-fries.png" },
  { id: "waffles", label: "Waffles & Desserts", icon: "◇", desc: "Fresh bubble waffles and sweet treats", bannerImage: "/event-waffle.png" },
  { id: "drinks", label: "Hot & Cold Drinks", icon: "○", desc: "Classic masala tea and daily brews", bannerImage: "/menu-coffee.png" }
];

export const menuItems: MenuItem[] = [
  // SHAKES
  {
    id: "s1", category: "shakes", course: "Thick Shakes",
    name: "Strawberry Monster",
    description: "A rich and creamy strawberry shake loaded with bold, fruity flavor.",
    price: 200, badge: "Bestseller",
    dietary: ["v"], allergens: ["Dairy"],
    gradient: "food-photo-cocktail",
    createdAt: "2026-07-15T12:00:00.000Z"
  },
  {
    id: "s2", category: "shakes", course: "Thick Shakes",
    name: "Oreo Shake",
    description: "Creamy milkshake blended with Oreo cookies and chocolate syrup, topped with cookie crumbs.",
    price: 180, badge: "Popular",
    dietary: ["v"], allergens: ["Dairy", "Gluten"],
    gradient: "food-photo-cocktail",
    createdAt: "2026-07-16T12:00:00.000Z"
  },
  {
    id: "s3", category: "shakes", course: "Thick Shakes",
    name: "KitKat Shake",
    description: "Decadent milkshake loaded with KitKat chunks and whipped cream.",
    price: 190, badge: null,
    dietary: ["v"], allergens: ["Dairy", "Gluten"],
    gradient: "food-photo-cocktail"
  },
  {
    id: "s4", category: "shakes", course: "Thick Shakes",
    name: "Mango Mania Shake",
    description: "Rich and fruity shake made with fresh Alphonso mango pulp.",
    price: 190, badge: "Seasonal",
    dietary: ["v"], allergens: ["Dairy"],
    gradient: "food-photo-cocktail"
  },
  {
    id: "s5", category: "shakes", course: "Mojitos & Coolers",
    name: "Red Melon Mojito",
    description: "A refreshing blend of sweet red melon, mint, and lime with a fizzy twist.",
    price: 250, badge: "Trending",
    dietary: ["v", "vg", "gf"], allergens: [],
    gradient: "food-photo-cocktail"
  },
  {
    id: "s6", category: "shakes", course: "Mojitos & Coolers",
    name: "Green Apple Mojito",
    description: "A zesty mix of green apple, mint, and lemon for a crisp, cooling drink.",
    price: 250, badge: null,
    dietary: ["v", "vg", "gf"], allergens: [],
    gradient: "food-photo-cocktail"
  },

  // BURGERS
  {
    id: "bg1", category: "burgers", course: "Burgers",
    name: "Cheese Burger",
    description: "A juicy grilled patty layered with melted cheese, fresh veggies, and soft toasted buns.",
    price: 80, badge: "Classic",
    dietary: ["v"], allergens: ["Dairy", "Gluten"],
    gradient: "food-photo-lunch"
  },
  {
    id: "bg2", category: "burgers", course: "Burgers",
    name: "Chicken Cheese Burger",
    description: "Juicy chicken patty topped with melted cheese, lettuce, and custom house sauce.",
    price: 150, badge: "Premium Pick",
    dietary: [], allergens: ["Gluten", "Dairy"],
    gradient: "food-photo-lunch"
  },
  {
    id: "bg3", category: "burgers", course: "Sandwiches",
    name: "Veggie Cheese Sandwich",
    description: "Grilled sandwich filled with crunchy vegetables, spices, and gooey cheese.",
    price: 120, badge: null,
    dietary: ["v"], allergens: ["Dairy", "Gluten"],
    gradient: "food-photo-lunch"
  },

  // PASTAS
  {
    id: "p1", category: "pastas", course: "Pasta",
    name: "White Sauce Pasta",
    description: "Creamy white sauce pasta tossed with herbs, veggies, and perfectly cooked pasta.",
    price: 100, badge: "Bestseller",
    dietary: ["v"], allergens: ["Gluten", "Dairy"],
    gradient: "food-photo-dinner",
    createdAt: "2026-07-17T12:00:00.000Z"
  },
  {
    id: "p2", category: "pastas", course: "Pasta",
    name: "Spaghetti",
    description: "Perfectly cooked spaghetti coated in a flavorful Italian sauce with herbs and cheese.",
    price: 200, badge: null,
    dietary: ["v"], allergens: ["Gluten", "Dairy"],
    gradient: "food-photo-dinner"
  },
  {
    id: "p3", category: "pastas", course: "Noodles",
    name: "Veg Maggi",
    description: "Classic Maggi noodles cooked with fresh veggies and flavorful spices.",
    price: 100, badge: "Comfort Food",
    dietary: ["v", "vg"], allergens: ["Gluten"],
    gradient: "food-photo-dinner"
  },

  // SNACKS
  {
    id: "sn1", category: "snacks", course: "Chicken Delights",
    name: "Chicken Finger",
    description: "Crispy golden chicken fingers, crunchy outside and juicy inside.",
    price: 150, badge: "Hot Seller",
    dietary: [], allergens: ["Gluten"],
    gradient: "food-photo-brunch"
  },
  {
    id: "sn2", category: "snacks", course: "Fries",
    name: "Classic Salted Fries",
    description: "Crispy, golden French fries lightly seasoned with sea salt.",
    price: 90, badge: null,
    dietary: ["v", "vg", "gf"], allergens: [],
    gradient: "food-photo-brunch"
  },
  {
    id: "sn3", category: "snacks", course: "Fries",
    name: "Peri Peri Fries",
    description: "Spicy fries tossed in bold Peri Peri seasoning.",
    price: 110, badge: "Spicy",
    dietary: ["v", "vg", "gf"], allergens: [],
    gradient: "food-photo-brunch"
  },

  // WAFFLES
  {
    id: "wf1", category: "waffles", course: "Bubble Waffles",
    name: "Ice Cream Waffle",
    description: "Crispy golden waffle topped with creamy, velvety ice cream and drizzled with rich chocolate or caramel sauce for the perfect sweet treat 🍨🧇",
    price: 80, badge: "Must Try",
    dietary: ["v"], allergens: ["Gluten", "Dairy"],
    gradient: "food-photo-dessert"
  },
  {
    id: "wf2", category: "waffles", course: "Bubble Waffles",
    name: "Choco Lava Waffle",
    description: "Warm waffle served with a molten chocolate center and chocolate drizzle.",
    price: 120, badge: "Premium",
    dietary: ["v"], allergens: ["Gluten", "Dairy"],
    gradient: "food-photo-dessert"
  },

  // DRINKS
  {
    id: "dk1", category: "drinks", course: "Hot Brews",
    name: "Masala Tea",
    description: "Masala tea brewed with fresh milk and local spices.",
    price: 40, badge: "Daily Favorite",
    dietary: ["v"], allergens: ["Dairy"],
    gradient: "food-photo-beverage"
  },
  {
    id: "dk2", category: "drinks", course: "Chilled Coffees",
    name: "Cold Coffee Classic",
    description: "Rich, chilled coffee blended smooth with milk and vanilla ice cream.",
    price: 100, badge: "Popular",
    dietary: ["v"], allergens: ["Dairy"],
    gradient: "food-photo-beverage"
  }
];



export const upcomingEvents: UpcomingEvent[] = [
  {
    id: "ev1",
    title: "Waffle Wednesday Special",
    subtitle: "Freshly Brewed Shakes & Waffles Combo",
    description: "Join us every Wednesday for a custom selection of our premium bubble waffles paired with signature thick milkshakes at a special bundled price.",
    date: "Every Wednesday",
    time: "11:00 AM — 10:00 PM",
    price: "₹199 onwards",
    capacity: "Walk-ins welcome",
    gradient: "linear-gradient(135deg, #0e0514, #190924, #0e0514)",
    type: "waffles",
    image: "/event-waffle.png"
  },
  {
    id: "ev2",
    title: "Summer Shake Fest",
    subtitle: "Cool Off with Exotic Fruity Mocktails",
    description: "A week-long celebration of tropical fruits. Featuring our limited edition Red Melon Mojito, Mango Mania Shake, and Green Apple Mojito.",
    date: "15 June — 22 June 2026",
    time: "All Day",
    price: "À la carte",
    capacity: "All are welcome",
    gradient: "linear-gradient(135deg, #1c0507, #300c11, #1c0507)",
    type: "shakes",
    image: "/event-shake.png"
  },
  {
    id: "ev3",
    title: "Acoustic Lounge Nights",
    subtitle: "Live Music & Shake Grazing",
    description: "Unwind on Friday evenings with soft live acoustic sets by local artists while sipping our signature shakes and snacking on chicken fingers.",
    date: "Every Friday Evening",
    time: "7:00 PM — 9:30 PM",
    price: "Free Entry",
    capacity: "Res. recommended",
    gradient: "linear-gradient(135deg, #060a12, #0d1526, #060a12)",
    type: "music",
    image: "/event-acoustic.png"
  }
];

export const privateEventTypes: PrivateEventType[] = [
  {
    id: "corporate",
    title: "Group Get-Togethers",
    subtitle: "Celebrate Milestones",
    description: "Host mini birthdays, anniversary celebrations, or project group meetups in our cozy dining zones.",
    capacity: "10 — 40 guests",
    rooms: ["Main Lounge Area (30 guests)", "Reserved Corner Zone (15 guests)"],
    includes: ["Dedicated host", "Custom shake-and-bite menus", "Lively music setup", "Balloon decorations if requested"],
    icon: "◈"
  },
  {
    id: "wedding",
    title: "Birthday Bashes",
    subtitle: "A Perfect Party Setting",
    description: "Transform our chic waffle & shakes lounge into your perfect celebration backdrop. Custom dessert platters and hot waffles.",
    capacity: "15 — 50 guests",
    rooms: ["Full Lounge Buyout (50 guests)", "Party Zone (30 guests)"],
    includes: ["Decorative lighting", "Custom message waffle platters", "Welcome mojitos for all guests", "Special playlist hosting"],
    icon: "◇"
  },
  {
    id: "private",
    title: "Kitty Parties & Meetups",
    subtitle: "Midday Chitchat Refined",
    description: "Mark your weekly or monthly get-together with an array of premium mocktails, hot Maggi, and loaded cheese burgers.",
    capacity: "6 — 25 guests",
    rooms: ["Window Lounge (12 guests)", "Chic Dome Corner (20 guests)"],
    includes: ["Custom mocktail punches", "Assorted finger foods", "Reserved seating comfort", "Premium service priority"],
    icon: "✦"
  }
];



export interface HomepageData {
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleItalic: string;
  heroTagline: string;
  heroBgImage: string | null;
  illustrationImage: string | null;
  illustrationEyebrow: string;
  illustrationTitleRegular: string;
  illustrationTitleItalic: string;
  illustrationDescription: string;
  aboutEyebrow: string;
  aboutQuote: string;
  aboutBgImage: string | null;
}

export const initialHomepageData: HomepageData = {
  heroEyebrow: "Silchar · Est. 2021",
  heroTitleLine1: "The",
  heroTitleLine2: "London",
  heroTitleItalic: "Shakes",
  heroTagline: "Premium Thick Shakes, Gourmet Burgers & Artisan Café Experiences",
  heroBgImage: "/cafe-interior-3.jpg",
  illustrationImage: "/illustration.png",
  illustrationEyebrow: "✦ Silchar's Finest ✦",
  illustrationTitleRegular: "Crafted with",
  illustrationTitleItalic: "magic",
  illustrationDescription: "Every shake, burger & dessert made from scratch with love, seasonal ingredients, and a touch of London flair.",
  aboutEyebrow: "About the space",
  aboutQuote: "We built a café that honours British heritage while celebrating the bold spirit of Silchar's food culture.",
  aboutBgImage: "/cafe-interior-4.jpg",
};
