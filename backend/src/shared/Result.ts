// src/shared/Result.ts
export type ResultOk<T> = { ok: true; data: T };
export type ResultFail<E extends string> = { ok: false; reason: E };
export type Result<T, E extends string> = ResultOk<T> | ResultFail<E>;