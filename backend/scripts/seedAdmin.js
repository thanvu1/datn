import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeEmail } from "../src/shared/auth/emailPolicy.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const email = normalizeEmail(process.env.ADMIN_EMAIL || "admin@tlu.edu.vn");
const password = process.env.ADMIN_PASSWORD || "Admin123!";

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET missing in .env");
    process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

await prisma.user.upsert({
    where: { email },
    update: {
        passwordHash,
        role: "admin",
        isActive: true,
        mustChangePassword: false,
    },
    create: {
        email,
        passwordHash,
        role: "admin",
        isActive: true,
        mustChangePassword: false,
    },
});

console.log("✅ Seeded admin:", email);
await prisma.$disconnect();
await pool.end();
