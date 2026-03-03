// src/modules/auth/application/ChangePasswordUseCase.ts
import type { Result } from "../../../shared/Result.js";
import { AuthError, type AuthErrorReason } from "../domain/AuthErrors.js";
import type { PasswordHasher, UserRepo } from "../domain/AuthPorts.js";

export type ChangePasswordDeps = {
    userRepo: UserRepo;
    passwordHasher: PasswordHasher;
};

export type ChangePasswordCommand = {
    userId: string;
    oldPassword: string;
    newPassword: string;
};

export async function changePasswordUseCase(
    deps: ChangePasswordDeps,
    cmd: ChangePasswordCommand
): Promise<Result<{ changed: true }, AuthErrorReason>> {
    const user = await deps.userRepo.findById(cmd.userId);
    if (!user) return { ok: false, reason: AuthError.UserNotFound };
    if (!user.isActive) return { ok: false, reason: AuthError.UserInactive };

    const okOld = await deps.passwordHasher.compare(cmd.oldPassword, user.passwordHash);
    if (!okOld) return { ok: false, reason: AuthError.WrongPassword };

    const newHash = await deps.passwordHasher.hash(cmd.newPassword);
    await deps.userRepo.updatePasswordHash(user.id, newHash);

    return { ok: true, data: { changed: true } };
}