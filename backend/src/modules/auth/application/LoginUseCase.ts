import type { Result } from "../../../shared/Result.js";
import { AuthError, type AuthErrorReason } from "../domain/AuthErrors.js";
import type { PasswordHasher, TokenService, UserRepo } from "../domain/AuthPorts.js";
import { isAllowedEmail, normalizeEmail } from "../domain/EmailPolicy.js";

export type LoginDeps = {
    userRepo: UserRepo;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    adminEmail: string;
};

export type LoginCommand = {
    email: string;
    password: string;
};

export type LoginOk = {
    accessToken: string;
    role: "admin" | "student" | "teacher";
    mustChangePassword: boolean;
};

export async function loginUseCase(
    deps: LoginDeps,
    cmd: LoginCommand
): Promise<Result<LoginOk, AuthErrorReason>> {
    const email = normalizeEmail(cmd.email);

    if (!isAllowedEmail(email, deps.adminEmail)) {
        return { ok: false, reason: AuthError.ValidationError };
    }

    const user = await deps.userRepo.findByEmail(email);
    if (!user) return { ok: false, reason: AuthError.UserNotFound };
    if (!user.isActive) return { ok: false, reason: AuthError.UserInactive };

    const ok = await deps.passwordHasher.compare(cmd.password, user.passwordHash);
    if (!ok) return { ok: false, reason: AuthError.InvalidCredentials };

    const accessToken = await deps.tokenService.signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        ok: true,
        data: {
            accessToken,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
        },
    };
}