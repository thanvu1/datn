import type { Result } from "../../../shared/Result.js";
import { normalizeEmail, isAllowedEmail, isRoleConsistentWithEmail } from "../../../shared/auth/EmailPolicy.js";
import { AdminError, type AdminErrorReason } from "../domain/AdminErrors.js";
import type { AdminUserRepo, PasswordHasher, SpreadsheetReader } from "../domain/AdminPorts.js";
import type { ImportMode, ParsedUserRow } from "../domain/AdminTypes.js";

export type ImportUsersOk = {
    created: number;
    updated: number;
    skipped: number;
    warnings: string[];
    errors: Array<{ row: number; reason: string; message: string }>;
};

export type ImportUsersFromExcelDeps = {
    userRepo: AdminUserRepo;
    spreadsheetReader: SpreadsheetReader;
    passwordHasher: PasswordHasher;
    adminEmail: string;
};

export async function importUsersFromExcelUseCase(
    deps: ImportUsersFromExcelDeps,
    cmd: { buffer: Buffer; mode: ImportMode }
): Promise<Result<ImportUsersOk, AdminErrorReason>> {
    const parsed = await deps.spreadsheetReader.parseUsersFromExcel(new Uint8Array(cmd.buffer));

    if (parsed.invalidFormat) return { ok: false, reason: AdminError.ExcelInvalidFormat };
    if (parsed.isEmpty || parsed.rows.length === 0) return { ok: false, reason: AdminError.ExcelEmpty };

    let created = 0;
    let updated = 0;
    let skipped = 0;

    const errors: ImportUsersOk["errors"] = [];

    for (const row of parsed.rows) {
        const rowErr = validateRow(row, deps.adminEmail);
        if (rowErr) {
            errors.push(rowErr);
            skipped++;
            continue;
        }

        const email = normalizeEmail(row.email!);
        const role = row.role!;

        try {
            const existing = await deps.userRepo.getUserByEmail(email);

            const passwordRaw = row.password && row.password.trim().length > 0 ? row.password : null;
            const passwordHash = passwordRaw ? await deps.passwordHasher.hash(passwordRaw) : null;

            if (!existing) {
                await deps.userRepo.createUser(
                    {
                        email,
                        role,
                        password: null,
                        isActive: true,
                        mustChangePassword: true,
                        student: row.student ?? null,
                        teacher: row.teacher ?? null,
                    },
                    passwordHash
                );
                created++;
            } else if (cmd.mode === "upsert") {
                await deps.userRepo.updateUser(
                    {
                        id: existing.id,
                        email,
                        role,
                        student: row.student ?? null,
                        teacher: row.teacher ?? null,
                    },
                    passwordHash
                );
                updated++;
            } else {
                skipped++;
            }
        } catch (e: any) {
            errors.push({
                row: row.row,
                reason: AdminError.ExcelRowInvalid,
                message: e?.message ?? "Không import được dòng này do dữ liệu không hợp lệ.",
            });
            skipped++;
        }
    }

    return { ok: true, data: { created, updated, skipped, warnings: parsed.warnings, errors } };
}

function validateRow(row: ParsedUserRow, adminEmail: string): { row: number; reason: string; message: string } | null {
    if (!row.email || row.email.trim().length === 0) {
        return { row: row.row, reason: AdminError.ExcelRowInvalid, message: "Thiếu email." };
    }
    if (!row.role) {
        return { row: row.row, reason: AdminError.ExcelRowInvalid, message: "Thiếu hoặc sai role." };
    }

    const email = normalizeEmail(row.email);

    if (!isAllowedEmail(email, adminEmail)) {
        return { row: row.row, reason: AdminError.EmailNotAllowed, message: "Email không thuộc phạm vi cho phép." };
    }

    if (!isRoleConsistentWithEmail(email, row.role, adminEmail)) {
        return { row: row.row, reason: AdminError.RoleMismatch, message: "Role không khớp email." };
    }

    return null;
}