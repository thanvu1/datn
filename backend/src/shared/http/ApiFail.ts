export type ApiFail<E extends string> = {
    ok: false;
    reason: E;
    message: string;
};