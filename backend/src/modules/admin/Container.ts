import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { AdminUserRepoPrisma } from "./infra/AdminUserRepoPrisma.js";
import { XlsxSpreadsheetReader } from "./infra/XlsxSpreadsheetReader.js";
import { PasswordHasherBcrypt } from "./infra/PasswordHasherBcrypt.js";

export const adminContainerPlugin: FastifyPluginAsync = fp(async (app) => {
    if (!app.hasDecorator("container")) {
        app.decorate("container", {} as any);
    }

    app.container.admin = {
        userRepo: new AdminUserRepoPrisma(app.prisma),
        spreadsheetReader: new XlsxSpreadsheetReader(),
        passwordHasher: new PasswordHasherBcrypt(10),
    };
});