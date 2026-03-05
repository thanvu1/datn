import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../domain/AdminPorts.js";

export class PasswordHasherBcrypt implements PasswordHasher {
    constructor(private readonly rounds: number = 10) { }

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.rounds);
    }
}