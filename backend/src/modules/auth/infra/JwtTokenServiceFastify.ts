// src/modules/auth/infra/JwtTokenServiceFastify.ts
import { randomUUID } from "crypto";
import type { JwtClaims, TokenService } from "../domain/AuthPorts.js";

export function createJwtTokenServiceFastify(opts: {
    jwt: { sign(payload: object, options?: object): string; verify<T = any>(token: string): T };
    expiresIn: string;
}): TokenService {
    return {
        async signAccessToken(claims: Omit<JwtClaims, "jti" | "exp" | "iat">): Promise<string> {
            const jti = randomUUID();
            return opts.jwt.sign({ ...claims, jti }, { expiresIn: opts.expiresIn });
        },

        async verifyAccessToken(token: string): Promise<JwtClaims | null> {
            try {
                const decoded = opts.jwt.verify<JwtClaims>(token);
                if (!decoded?.jti) return null;
                return decoded;
            } catch {
                return null;
            }
        },
    };
}