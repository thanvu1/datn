// src/plugins/jwt.ts
import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";

export const jwtPlugin = fp(async function jwtPlugin(app) {
  const secret = app.config.auth.jwtSecret;

  await app.register(fastifyJwt, { secret });

  app.decorate("auth", {
    verify: async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch {
        return reply.code(401).send({ message: "UNAUTHENTICATED" });
      }

      const jti = req.user?.jti;
      if (!jti) return reply.code(401).send({ message: "TOKEN_MISSING_JTI" });

      const revoked = await app.prisma.invalidToken.findUnique({
        where: { jti },
        select: { jti: true },
      });

      if (revoked) return reply.code(401).send({ message: "TOKEN_REVOKED" });
    },
  });
});

export default jwtPlugin;