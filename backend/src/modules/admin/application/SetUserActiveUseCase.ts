import type { Result } from "../../../shared/Result.js";
import { AdminError, type AdminErrorReason } from "../domain/AdminErrors.js";
import type { AdminUserRepo } from "../domain/AdminPorts.js";
import type { UserView } from "../domain/AdminTypes.js";

export type SetUserActiveDeps = { userRepo: AdminUserRepo };

export async function setUserActiveUseCase(
    deps: SetUserActiveDeps,
    userId: string,
    isActive: boolean
): Promise<Result<UserView, AdminErrorReason>> {
    const existing = await deps.userRepo.getUserById(userId);
    if (!existing) return { ok: false, reason: AdminError.UserNotFound };

    const user = await deps.userRepo.setUserActive(userId, isActive);
    return { ok: true, data: user };
}