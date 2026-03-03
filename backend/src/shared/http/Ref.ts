// src/shared/http/ref.js
export function ajvRef(id: string) {
    return { $ref: `${id}#` }; // ✅ Ajv resolve theo $id
}