import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance to avoid exhausting DB connections
const prisma = new PrismaClient();

export default prisma;
