// src/modules/admin/domain/AdminErrorReasons.ts
import { AdminError } from "./AdminErrors.js";

export const adminErrorReasons = Object.values(AdminError) as [
    (typeof AdminError)[keyof typeof AdminError],
    ...(typeof AdminError)[keyof typeof AdminError][]
];