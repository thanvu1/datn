// src/modules/auth/domain/AuthErrors.ts
export const AuthError = {
    InvalidCredentials: "InvalidCredentials",
    UserNotFound: "UserNotFound",
    UserInactive: "UserInactive",
    InvalidToken: "InvalidToken",
    WrongPassword: "WrongPassword",
    ValidationError: "ValidationError",
} as const;

export type AuthErrorReason = (typeof AuthError)[keyof typeof AuthError];