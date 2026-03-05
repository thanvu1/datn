import type { Result } from "../../../shared/Result.js";
import { isAllowedEmail, isRoleConsistentWithEmail, normalizeEmail } from "../../../shared/auth/EmailPolicy.js";
import { AdminError, type AdminErrorReason } from "../domain/AdminErrors.js";
import type { AdminUserRepo, PasswordHasher } from "../domain/AdminPorts.js";
import type { CreateUserInput, UserView } from "../domain/AdminTypes.js";

export type CreateUserDeps = {
    userRepo: AdminUserRepo;
    passwordHasher: PasswordHasher;
    adminEmail: string;
};

export async function createUserUseCase(
    deps: CreateUserDeps,
    cmd: CreateUserInput
): Promise<Result<UserView, AdminErrorReason>> {
    const email = normalizeEmail(cmd.email);

    // (1) email allowed
    if (!isAllowedEmail(email, deps.adminEmail)) {
        return { ok: false, reason: AdminError.EmailNotAllowed };
    }

    // (2) role match email
    if (!isRoleConsistentWithEmail(email, cmd.role, deps.adminEmail)) {
        return { ok: false, reason: AdminError.RoleMismatch };
    }

    const existing = await deps.userRepo.getUserByEmail(email);
    if (existing) return { ok: false, reason: AdminError.EmailAlreadyExists };

    const passwordHash =
        cmd.password && cmd.password.trim().length > 0
            ? await deps.passwordHasher.hash(cmd.password)
            : null;

    const user = await deps.userRepo.createUser({ ...cmd, email }, passwordHash);
    return { ok: true, data: user };
}