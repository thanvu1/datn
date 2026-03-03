// src/modules/auth/application/LogoutUseCase.ts
import type { Result } from "../../../shared/Result.js";
import type { AuthErrorReason } from "../domain/AuthErrors.js";
import type { InvalidTokenRepo } from "../domain/AuthPorts.js";

export async function logoutUseCase(
    deps: { invalidTokenRepo: InvalidTokenRepo },
    cmd: { jti: string; userId?: string; expiresAt: Date }
): Promise<Result<{ loggedOut: true }, AuthErrorReason>> {
    await deps.invalidTokenRepo.revoke(cmd);
    return { ok: true, data: { loggedOut: true } };
}