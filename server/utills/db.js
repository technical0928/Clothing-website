const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const rootEnvPath = path.join(__dirname, '..', '..', '.env');
const serverEnvPath = path.join(__dirname, '..', '.env');

// Load root-level .env first, then override with server/.env when running within the server
const rootEnvResult = dotenv.config({ path: rootEnvPath, override: true });
const serverEnvResult = dotenv.config({ path: serverEnvPath, override: true });

// Prefer the root-level Prisma Client (generated from ../prisma/schema.prisma),
// which includes bulk upload models. Fallback to local if not available.
let PrismaClient;
try {
    // When running server/* scripts, this resolves to project root node_modules
    ({ PrismaClient } = require("../../node_modules/@prisma/client"));
} catch (e) {
    ({ PrismaClient } = require("@prisma/client"));
}

function resolveSqliteUrl(databaseUrl) {
    if (!databaseUrl.startsWith('file:')) {
        return databaseUrl;
    }

    const sqlitePath = databaseUrl.slice('file:'.length);
    const envDir = serverEnvResult.parsed?.DATABASE_URL ? path.dirname(serverEnvPath) : path.dirname(rootEnvPath);

    const isAbsoluteWindowsPath = /^[A-Za-z]:[\\/]/.test(sqlitePath);
    const resolvedPath = path.isAbsolute(sqlitePath) || isAbsoluteWindowsPath
        ? sqlitePath
        : path.resolve(envDir, sqlitePath);

    return `file:${resolvedPath}`;
}

const prismaClientSingleton = () => {
    // Validate that DATABASE_URL is present
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is required');
    }

    const resolvedDatabaseUrl = resolveSqliteUrl(databaseUrl);
    const isSqlite = resolvedDatabaseUrl.startsWith('file:');

    if (process.env.NODE_ENV === "development") {
        if (isSqlite) {
            const sqlitePath = resolvedDatabaseUrl.slice('file:'.length);
            console.log(` Database connection: sqlite://${sqlitePath}`);
            console.log(`🔒 SSL Mode: not specified`);
            console.log(`📁 Resolved SQLite path: ${sqlitePath}`);
        } else {
            const url = new URL(resolvedDatabaseUrl);
            console.log(` Database connection: ${url.protocol}//${url.hostname}:${url.port || '3306'}`);
            console.log(`🔒 SSL Mode: ${url.searchParams.get('sslmode') || 'not specified'}`);
        }
    }

    return new PrismaClient({
        datasources: {
            db: {
                url: resolvedDatabaseUrl,
            },
        },
        log: process.env.NODE_ENV === "development" 
            ? ['query', 'info', 'warn', 'error']
            : ['error', 'warn'],
    });
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;