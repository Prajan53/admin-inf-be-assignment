"use strict";
// import { PrismaClient } from '@prisma/client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
// declare global {
//     // eslint-disable-next-line no-var
//     var prisma: PrismaClient | undefined
// }
// export const client = globalThis.prisma || new PrismaClient()
// if (process.env.NODE_ENV !== 'production') globalThis.prisma = client
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
exports.client = client;
//# sourceMappingURL=prisma.js.map