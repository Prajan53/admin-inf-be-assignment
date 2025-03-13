"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const client_1 = require("@prisma/client");
exports.client = globalThis.prisma || new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = exports.client;
//# sourceMappingURL=prisma.js.map