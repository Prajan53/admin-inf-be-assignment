import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET_USER = process.env.JWT_SECRET_USER || "TGFI*EAVBG8YWO!Ad%@#ladjsvahb#!&^ka1237474@kv";

// Extend Request type to include userId
interface AuthRequest extends Request {
    userId?: string;
}

const userMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.body.token;
        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({ message: "Access denied. No token provided." });
        // }

        // const token = authHeader.split(" ")[1]; // Extract token after 'Bearer '
        const decoded = jwt.verify(authHeader, JWT_SECRET_USER) as { id: string };

        req.userId = decoded.id; // Attach userId to request object
        next(); // Move to next middleware/controller
    } catch (error) {
        console.log(error);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

export default userMiddleware;
