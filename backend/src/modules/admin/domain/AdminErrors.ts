export const AdminError = {
    Forbidden: "Forbidden",
    ValidationFailed: "ValidationFailed",

    // create/update
    EmailInvalidFormat: "EmailInvalidFormat",
    EmailNotAllowed: "EmailNotAllowed",
    RoleMismatch: "RoleMismatch",
    EmailAlreadyExists: "EmailAlreadyExists",
    UserNotFound: "UserNotFound",

    // excel import
    ExcelInvalidFormat: "ExcelInvalidFormat",
    ExcelEmpty: "ExcelEmpty",
    ExcelRowInvalid: "ExcelRowInvalid",
} as const;

export type AdminErrorReason = (typeof AdminError)[keyof typeof AdminError];