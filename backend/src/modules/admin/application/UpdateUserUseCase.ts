import type { Result } from "../../../shared/Result.js";
import {
    normalizeEmail,
    isAllowedEmail,
    isEmailFormatValid,
    isRoleConsistentWithEmail,
} from "../../../shared/auth/EmailPolicy.js";

import { AdminError, type AdminErrorReason } from "../domain/AdminErrors.js";
import type { AdminUserRepo, PasswordHasher } from "../domain/AdminPorts.js";
import type { UpdateUserInput, UserView } from "../domain/AdminTypes.js";

export type UpdateUserDeps = {
    userRepo: AdminUserRepo;
    passwordHasher: PasswordHasher;
    adminEmail: string;
};

export type UpdateUserCommand = UpdateUserInput & {
    password?: string | null;
};

export async function updateUserUseCase(
    deps: UpdateUserDeps,
    cmd: UpdateUserCommand
): Promise<Result<UserView, AdminErrorReason>> {
    const existing = await deps.userRepo.getUserById(cmd.id);
    if (!existing) return { ok: false, reason: AdminError.UserNotFound };

    const nextEmail = cmd.email !== undefined ? normalizeEmail(cmd.email) : existing.email;
    const nextRole = cmd.role !== undefined ? cmd.role : existing.role;

    // validate email format/allowed
    if (!isEmailFormatValid(nextEmail, deps.adminEmail)) {
        return { ok: false, reason: AdminError.EmailInvalidFormat };
    }
    if (!isAllowedEmail(nextEmail, deps.adminEmail)) {
        return { ok: false, reason: AdminError.EmailNotAllowed };
    }

    // validate role match email (admin email exception)
    if (!isRoleConsistentWithEmail(nextEmail, nextRole, deps.adminEmail)) {
        return { ok: false, reason: AdminError.RoleMismatch };
    }

    // email uniqueness if email changed
    if (nextEmail !== existing.email) {
        const dup = await deps.userRepo.getUserByEmail(nextEmail);
        if (dup) return { ok: false, reason: AdminError.EmailAlreadyExists };
    }

    const passwordHash =
        cmd.password && cmd.password.trim().length > 0
            ? await deps.passwordHasher.hash(cmd.password)
            : null;

    const updated = await deps.userRepo.updateUser(
        {
            ...cmd,
            email: nextEmail,
            role: nextRole,
        },
        passwordHash
    );

    return { ok: true, data: updated };
}