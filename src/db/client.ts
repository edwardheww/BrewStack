import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient(); // Exporting a single instance of PrismaClient for use throughout the application