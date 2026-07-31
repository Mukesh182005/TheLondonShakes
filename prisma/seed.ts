
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thelondonshakes';
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing records to ensure clean seed
  await prisma.upcomingEvent.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});

  // Seed Menu Categories
  const categories = [
    { id: "shakes", label: "Shakes & Coolers", name: "Shakes & Coolers", slug: "shakes", icon: "✦", desc: "Premium thick shakes and cooling mocktails", bannerImage: "/event-shake.png", sortOrder: 1 },
    { id: "burgers", label: "Burgers & Sandwiches", name: "Burgers & Sandwiches", slug: "burgers", icon: "◈", desc: "Toasted buns with juicy patties", bannerImage: "/menu-burger.png", sortOrder: 2 },
    { id: "pastas", label: "Pasta & Noodles", name: "Pasta & Noodles", slug: "pastas", icon: "◉", desc: "Creamy white sauce and Italian herbs", bannerImage: "/menu-pasta.png", sortOrder: 3 },
    { id: "snacks", label: "Snacks & Sides", name: "Snacks & Sides", slug: "snacks", icon: "▣", desc: "Crispy chicken delights and golden fries", bannerImage: "/menu-fries.png", sortOrder: 4 },
    { id: "waffles", label: "Waffles & Desserts", name: "Waffles & Desserts", slug: "waffles", icon: "◇", desc: "Fresh bubble waffles and sweet treats", bannerImage: "/event-waffle.png", sortOrder: 5 },
    { id: "drinks", label: "Hot & Cold Drinks", name: "Hot & Cold Drinks", slug: "drinks", icon: "○", desc: "Classic masala tea and daily brews", bannerImage: "/menu-coffee.png", sortOrder: 6 }
  ];

  for (const cat of categories) {
    await prisma.menuCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  // Seed Menu Items
  const menuItems = [
    {
      name: "Strawberry Monster",
      description: "A rich and creamy strawberry shake loaded with bold, fruity flavor.",
      price: 200,
      category: "shakes",
    },
    {
      name: "Oreo Shake",
      description: "Creamy milkshake blended with Oreo cookies and chocolate syrup, topped with cookie crumbs.",
      price: 180,
      category: "shakes",
    },
    {
      name: "KitKat Shake",
      description: "Decadent milkshake loaded with KitKat chunks and whipped cream.",
      price: 190,
      category: "shakes",
    },
    {
      name: "Mango Mania Shake",
      description: "Rich and fruity shake made with fresh Alphonso mango pulp.",
      price: 190,
      category: "shakes",
    },
    {
      name: "Red Melon Mojito",
      description: "A refreshing blend of sweet red melon, mint, and lime with a fizzy twist.",
      price: 250,
      category: "shakes",
    },
    {
      name: "Green Apple Mojito",
      description: "A zesty mix of green apple, mint, and lemon for a crisp, cooling drink.",
      price: 250,
      category: "shakes",
    },
    {
      name: "Cheese Burger",
      description: "A juicy grilled patty layered with melted cheese, fresh veggies, and soft toasted buns.",
      price: 80,
      category: "burgers",
    },
    {
      name: "Chicken Cheese Burger",
      description: "Juicy chicken patty topped with melted cheese, lettuce, and custom house sauce.",
      price: 150,
      category: "burgers",
    },
    {
      name: "Veggie Cheese Sandwich",
      description: "Grilled sandwich filled with crunchy vegetables, spices, and gooey cheese.",
      price: 120,
      category: "burgers",
    },
    {
      name: "White Sauce Pasta",
      description: "Creamy white sauce pasta tossed with herbs, veggies, and perfectly cooked pasta.",
      price: 100,
      category: "pastas",
    },
    {
      name: "Spaghetti",
      description: "Perfectly cooked spaghetti coated in a flavorful Italian sauce with herbs and cheese.",
      price: 200,
      category: "pastas",
    },
    {
      name: "Veg Maggi",
      description: "Classic Maggi noodles cooked with fresh veggies and flavorful spices.",
      price: 100,
      category: "pastas",
    },
    {
      name: "Chicken Finger",
      description: "Crispy golden chicken fingers, crunchy outside and juicy inside.",
      price: 150,
      category: "snacks",
    },
    {
      name: "Classic Salted Fries",
      description: "Crispy, golden French fries lightly seasoned with sea salt.",
      price: 90,
      category: "snacks",
    },
    {
      name: "Peri Peri Fries",
      description: "Spicy fries tossed in bold Peri Peri seasoning.",
      price: 110,
      category: "snacks",
    },
    {
      name: "Ice Cream Waffle",
      description: "Crispy golden waffle topped with creamy, velvety ice cream and drizzled with rich chocolate or caramel sauce for the perfect sweet treat 🍨🧇",
      price: 80,
      category: "waffles",
    },
    {
      name: "Choco Lava Waffle",
      description: "Warm waffle served with a molten chocolate center and chocolate drizzle.",
      price: 120,
      category: "waffles",
    },
    {
      name: "Masala Tea",
      description: "Masala tea brewed with fresh milk and local spices.",
      price: 40,
      category: "drinks",
    },
    {
      name: "Cold Coffee Classic",
      description: "Rich, chilled coffee blended smooth with milk and vanilla ice cream.",
      price: 100,
      category: "drinks",
    }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
  }

  // Seed Events
  const events = [
    {
      title: "Waffle Wednesday Special",
      description: "Join us every Wednesday for a custom selection of our premium bubble waffles paired with signature thick milkshakes at a special bundled price.",
      date: "Every Wednesday",
      imageUrl: "/event-waffle.png"
    },
    {
      title: "Summer Shake Fest",
      description: "A week-long celebration of tropical fruits. Featuring our limited edition Red Melon Mojito, Mango Mania Shake, and Green Apple Mojito.",
      date: "15 June — 22 June 2026",
      imageUrl: "/event-shake.png"
    },
    {
      title: "Acoustic Lounge Nights",
      description: "Unwind on Friday evenings with soft live acoustic sets by local artists while sipping our signature shakes and snacking on chicken fingers.",
      date: "Every Friday Evening",
      imageUrl: "/event-acoustic.png"
    }
  ];

  for (const event of events) {
    await prisma.upcomingEvent.create({
      data: event,
    });
  }

  // Seed Staff
  const staffMembers = [
    { name: "Abhik", role: "Head Chef", email: "abhik@tls.co", phone: "+91 98100 12345", shift: "10:00–22:00", attendance: 98.0, rating: 4.9 },
    { name: "Meena Sharma", role: "Waiter", email: "meena@tls.co", phone: "+91 97200 23456", shift: "16:00–22:00", attendance: 92.0, rating: 4.7 },
    { name: "Rahul Das", role: "Cashier", email: "rahul@tls.co", phone: "+91 96300 34567", shift: "11:00–17:00", attendance: 85.0, rating: 4.5 },
  ];

  for (const member of staffMembers) {
    await prisma.staff.create({
      data: member,
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
