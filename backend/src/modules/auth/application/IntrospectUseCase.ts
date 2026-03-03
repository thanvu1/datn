import type { Result } from "../../../shared/Result.js";
import type { AuthErrorReason } from "../domain/AuthErrors.js";
import type { TokenService } from "../domain/AuthPorts.js";

export type IntrospectDeps = { tokenService: TokenService };
export type IntrospectCommand = { token: string };

/**
 * Introspect: luôn trả ok=true để client biết valid hay không.
 * (Không trả 401 vì đây là endpoint kiểm tra token.)
 */
export async function introspectUseCase(
    deps: IntrospectDeps,
    cmd: IntrospectCommand
): Promise<Result<{ valid: boolean }, AuthErrorReason>> {
    const claims = await deps.tokenService.verifyAccessToken(cmd.token);
    return { ok: true, data: { valid: claims !== null } };
}