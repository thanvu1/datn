import * as XLSX from "xlsx";
import type { SpreadsheetReader } from "../domain/AdminPorts.js";
import type { ParsedSpreadsheet, ParsedUserRow } from "../domain/AdminTypes.js";
import type { UserRole } from "../../../shared/auth/UserRole.js";

function asStringOrNull(value: unknown): string | null {
    const s = String(value ?? "").trim();
    return s.length ? s : null;
}

function parseRole(value: unknown): UserRole | null {
    const s = asStringOrNull(value);
    if (!s) return null;
    const v = s.toLowerCase();
    if (v === "admin" || v === "student" || v === "teacher") return v;
    return null;
}

/**
 * Helper lấy value theo nhiều key (hỗ trợ header Email/email/EMAIL...)
 * Ưu tiên key nào có data trước.
 */
function cell(raw: Record<string, unknown>, ...keys: string[]) {
    for (const k of keys) {
        const v = raw[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return null;
}

export class XlsxSpreadsheetReader implements SpreadsheetReader {
    async parseUsersFromExcel(fileBytes: Uint8Array): Promise<ParsedSpreadsheet> {
        let workbook: XLSX.WorkBook;

        try {
            // Uint8Array => type "array"
            workbook = XLSX.read(fileBytes, { type: "array" });
        } catch {
            return { rows: [], warnings: [], invalidFormat: true, isEmpty: true };
        }

        const sheetName = workbook.SheetNames?.[0];
        if (!sheetName) return { rows: [], warnings: [], invalidFormat: false, isEmpty: true };

        const sheet = workbook.Sheets?.[sheetName];
        if (!sheet) return { rows: [], warnings: [], invalidFormat: true, isEmpty: true };

        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: null,
            raw: false,
            range: 0,
        });

        if (!json || json.length === 0) {
            return { rows: [], warnings: [], invalidFormat: false, isEmpty: true };
        }

        const warnings: string[] = [];
        const rows: ParsedUserRow[] = [];

        for (let i = 0; i < json.length; i++) {
            const raw = json[i] ?? {};
            const rowNumber = i + 2; // row1 header

            const email = asStringOrNull(cell(raw, "email", "Email", "EMAIL"));
            const role = parseRole(cell(raw, "role", "Role", "ROLE"));
            const password = asStringOrNull(cell(raw, "password", "Password", "PASSWORD"));

            const student =
                role === "student"
                    ? {
                        studentCode: asStringOrNull(cell(raw, "studentCode", "StudentCode")),
                        fullName: asStringOrNull(cell(raw, "studentFullName", "StudentFullName", "fullName", "FullName")),
                        className: asStringOrNull(cell(raw, "className", "ClassName")),
                        faculty: asStringOrNull(cell(raw, "faculty", "Faculty")),
                        phone: asStringOrNull(cell(raw, "studentPhone", "StudentPhone", "phone", "Phone")),
                    }
                    : null;

            const teacher =
                role === "teacher"
                    ? {
                        teacherCode: asStringOrNull(cell(raw, "teacherCode", "TeacherCode")),
                        fullName: asStringOrNull(cell(raw, "teacherFullName", "TeacherFullName", "fullName", "FullName")),
                        department: asStringOrNull(cell(raw, "department", "Department")),
                        phone: asStringOrNull(cell(raw, "teacherPhone", "TeacherPhone", "phone", "Phone")),
                    }
                    : null;

            rows.push({
                row: rowNumber,
                email,
                role,
                password,
                student,
                teacher,
            });
        }

        return {
            rows,
            warnings,
            invalidFormat: false,
            isEmpty: rows.length === 0,
        };
    }
}