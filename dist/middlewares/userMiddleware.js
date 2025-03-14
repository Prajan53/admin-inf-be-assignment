"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET_USER = process.env.JWT_SECRET_USER || "TGFI*EAVBG8YWO!Ad%@#ladjsvahb#!&^ka1237474@kv";
const userMiddleware = (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.body.token;
        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({ message: "Access denied. No token provided." });
        // }
        // const token = authHeader.split(" ")[1]; // Extract token after 'Bearer '
        const decoded = jsonwebtoken_1.default.verify(authHeader, JWT_SECRET_USER);
        req.userId = decoded.id; // Attach userId to request object
        next(); // Move to next middleware/controller
    }
    catch (error) {
        console.log(error);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};
exports.default = userMiddleware;
//# sourceMappingURL=userMiddleware.js.map