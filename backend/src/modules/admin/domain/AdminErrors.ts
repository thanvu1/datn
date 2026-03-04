export const AdminError = {
    Forbidden: "Forbidden",
    ValidationFailed: "ValidationFailed",
    EmailAlreadyExists: "EmailAlreadyExists",
    UserNotFound: "UserNotFound",
    ExcelInvalidFormat: "ExcelInvalidFormat",
    ExcelEmpty: "ExcelEmpty",
} as const;

export type AdminErrorReason = (typeof AdminError)[keyof typeof AdminError];