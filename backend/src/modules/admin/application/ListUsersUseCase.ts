import type { Result } from "../../../shared/Result.js";
import type { AdminUserRepo } from "../domain/AdminPorts.js";
import type { AdminErrorReason } from "../domain/AdminErrors.js";
import type { PageQuery, Paged, UserListFilter, UserView } from "../domain/AdminTypes.js";

export type ListUsersDeps = { userRepo: AdminUserRepo };

export type ListUsersCommand = { filter: UserListFilter; page: PageQuery };

export async function listUsersUseCase(
    deps: ListUsersDeps,
    cmd: ListUsersCommand
): Promise<Result<Paged<UserView>, AdminErrorReason>> {
    const data = await deps.userRepo.listUsers(cmd.filter, cmd.page);
    return { ok: true, data };
}