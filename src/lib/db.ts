import { PrismaClient } from '@prisma/client'

// Supabase PostgreSQL connection string (fallback if env not loaded)
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.vtturkgwzjhcaldpcaqf:PTFvicZ4BpjYP6q@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create PrismaClient with explicit datasource URL
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Alias for backward compatibility
export const db = prisma
