import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).optional().default("development"),

    API_PORT: z.coerce.number().int().positive().optional().default(3000),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 chars"),

    // optional
    JWT_EXPIRES_IN: z.string().optional().default("7d"),

    ADMIN_EMAIL: z.string().email().optional().default("admin@tlu.edu.vn"),
    ADMIN_PASSWORD: z.string().optional().default("Admin123!"),

    // optional swagger
    SWAGGER_ENABLED: z
        .string()
        .optional()
        .transform((v) => (v ? v.toLowerCase() : undefined))
        .pipe(z.enum(["true", "false"]).optional())
        .default("true"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    // in rõ lỗi để sửa env
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

const env = parsed.data;

export const config = {
    env: env.NODE_ENV,
    isProd: env.NODE_ENV === "production",

    api: {
        port: env.API_PORT,
    },

    db: {
        url: env.DATABASE_URL,
    },

    auth: {
        jwtSecret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        adminEmail: env.ADMIN_EMAIL.toLowerCase(),
        adminPassword: env.ADMIN_PASSWORD,
    },

    swagger: {
        enabled: env.SWAGGER_ENABLED === "true" && env.NODE_ENV !== "production",
        routePrefix: "/docs",
    },
};
