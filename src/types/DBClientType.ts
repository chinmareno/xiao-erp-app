import { Prisma, PrismaClient } from "@prisma/client";

export type DBClientType = PrismaClient | Prisma.TransactionClient;
