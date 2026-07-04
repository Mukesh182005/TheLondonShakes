import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thelondonshakes';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
