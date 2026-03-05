// src/modules/auth/domain/AuthPorts.ts
import type { UserRole } from "../../../shared/auth/UserRole.js";

export type UserRecord = {
    id: string;
    email: string;
    role: UserRole;
    passwordHash: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
};

export interface UserRepo {
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
    updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
}

export interface PasswordHasher {
    compare(plain: string, hash: string): Promise<boolean>;
    hash(plain: string): Promise<string>;
}

export type JwtClaims = {
    sub: string;
    email: string;
    role: UserRole;
    // bạn có thể mở rộng thêm iat/exp/jti tuỳ plugin jwt.ts
    jti: string;
    exp?: number;
    iat?: number;
};

export interface TokenService {
    signAccessToken(claims: Omit<JwtClaims, "jti" | "exp" | "iat">): Promise<string>;
    verifyAccessToken(token: string): Promise<JwtClaims | null>;
}

export interface InvalidTokenRepo {
    revoke(token: { jti: string; userId?: string; expiresAt: Date }): Promise<void>;
}