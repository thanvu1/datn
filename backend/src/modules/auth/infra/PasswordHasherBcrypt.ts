// src/modules/auth/infra/PasswordHasherBcrypt.ts
import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../domain/AuthPorts.js";

export function createPasswordHasherBcrypt(rounds = 10): PasswordHasher {
    return {
        async compare(plain: string, hash: string) {
            return bcrypt.compare(plain, hash);
        },
        async hash(plain: string) {
            return bcrypt.hash(plain, rounds);
        },
    };
}