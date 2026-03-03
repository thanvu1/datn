export function ajvRef(schemaId: string) {
    return { $ref: `${schemaId}#` };
}