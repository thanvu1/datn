// src/modules/auth/domain/AuthErrors.ts
export const AuthError = {
    InvalidEmailFormat: "InvalidEmailFormat",
    EmailNotAllowed: "EmailNotAllowed",
    UserNotFound: "UserNotFound",
    UserInactive: "UserInactive",
    InvalidToken: "InvalidToken",
    WrongPassword: "WrongPassword",
} as const;

export type AuthErrorReason = (typeof AuthError)[keyof typeof AuthError];