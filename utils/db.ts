import path from "path";
import { PrismaClient } from "@prisma/client"; 

const resolveDatabaseUrl = (databaseUrl: string) => {
    if (!databaseUrl.startsWith('file:')) return databaseUrl;

    const relativePath = databaseUrl.slice('file:'.length);
    if (path.isAbsolute(relativePath)) {
        return databaseUrl;
    }

    const absolutePath = path.resolve(process.cwd(), relativePath);
    return `file:${absolutePath}`;
};

const prismaClientSingleton = () => {
    // Validate that DATABASE_URL is present
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }

    const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);
    process.env.DATABASE_URL = databaseUrl;
    const url = new URL(databaseUrl);
    
    // Log SSL configuration for debugging
    if (process.env.NODE_ENV === "development") {
        console.log(` Database connection: ${url.protocol}//${url.hostname}:${url.port || '3306'}`);
        console.log(`🔒 SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
        if (databaseUrl.startsWith('file:')) {
            console.log(`📁 Resolved SQLite path: ${databaseUrl.slice('file:'.length)}`);
        }
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
        // Add logging for debugging
        log: process.env.NODE_ENV === "development" 
            ? ['query', 'info', 'warn', 'error']
            : ['error', 'warn'],
    });
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;