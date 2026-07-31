import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { 
  prisma?: PrismaClient;
  pgPool?: Pool;
  prismaAdapter?: PrismaPg;
};

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/thelondonshakes';

// Security tripwire: Prevent starting in production on cloud platforms with default local database credentials
if (process.env.NODE_ENV === 'production' && process.env.VERCEL && databaseUrl.includes('postgres:postgres@localhost')) {
  console.error("CRITICAL SECURITY ERROR: You are attempting to start the production server using the default unsecured local database credentials ('postgres:postgres@localhost').");
  console.error("Please set a secure, production DATABASE_URL in your environment variables (.env.local) to continue.");
  process.exit(1);
}

const pool = globalForPrisma.pgPool || new Pool({
  connectionString: databaseUrl,
  max: 10, // Limit pool size to prevent connection starvation
  idleTimeoutMillis: 30000,
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.pgPool = pool;

const adapter = globalForPrisma.prismaAdapter || new PrismaPg(pool);
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaAdapter = adapter;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
