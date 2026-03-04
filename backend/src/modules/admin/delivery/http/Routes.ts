// import { requireRole } from "../../../../shared/auth/Authz.js";
// import { importUsersFromExcel } from "../../application/importUsersFromExcel.js";

// export async function adminRoutes(app) {
//     app.post(
//         "/admin/users/import",
//         { preHandler: [app.auth.verify, requireRole("admin")] },
//         async (req, reply) => {
//             const file = await req.file();
//             if (!file) return reply.code(400).send({ error: "MissingFile" });

//             const buf = await file.toBuffer();

//             const result = await importUsersFromExcel({
//                 prisma: app.prisma,
//                 buffer: buf,
//             });

//             return result;
//         }
//     );
// }
