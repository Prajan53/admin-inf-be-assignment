"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const prisma_1 = require("./lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(cors({
    origin: "*", // Allow only your frontend
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable if using cookies or authorization headers
}));
app.use(express_1.default.json());
//   app.options("*", (req, res) => {
// 	res.header("Access-Control-Allow-Origin", "https://full-stack-assignment-be-lumv-black.vercel.app");
// 	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
// 	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
// 	res.header("Access-Control-Allow-Credentials", "true"); // Add this
// 	res.sendStatus(200);
//   });
app.get('/', (_req, res) => {
    return res.send('Express Typescript on Vercel');
});
app.get('/ping', (_req, res) => {
    return res.send('pong 🏓');
});
const JWT_SECRET_USER = "TGFI*EAVBG8YWO!Ad%@#ladjsvahb#!&^ka1237474@kv";
// Schema for admin registration and login
const authSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, "Name is too short")
        .max(14, "Name is too long")
        .regex(/^[a-zA-Z]+$/, "You can enter only alphabets")
        .optional(),
    email: zod_1.z.string()
        .email("Invalid email format")
        .min(15, "Email is too short")
        .max(26, "Email is too long"),
    password: zod_1.z.string()
        .min(6, "Password is too short")
        .max(32, "Password is too long")
        .regex(/[A-Z]/, "Password must contain one uppercase letter")
        .regex(/[./<>\?+*@;:\"^`#()_-]/, "Password must contain at least one special character")
        .regex(/[0-9]/, "Password must contain at least one number")
});
// ✅ Admin Registration
// @ts-ignore
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = authSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }
        const { name, email, password } = parsedBody.data;
        const existingUser = yield prisma_1.client.admin.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const hashedPassword = yield bcrypt.hash(password, 10);
        yield prisma_1.client.admin.create({
            // @ts-ignore
            data: { name, email, password: hashedPassword },
        });
        return res.status(201).json({ message: "You have registered successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
// ✅ Admin Login
// @ts-ignore
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedBody = authSchema.omit({ name: true }).safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }
        const { email, password } = parsedBody.data;
        const user = yield prisma_1.client.admin.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }
        const passwordMatch = yield bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect credentials" });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET_USER, { expiresIn: "1h" });
        return res.status(200).json({ message: "Logged in successfully", token });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
// ✅ Job Posting (Protected Route)
// @ts-ignore
app.post("/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobSchema = zod_1.z.object({
            title: zod_1.z.string().min(3, "Title must be at least 3 characters long"),
            companyName: zod_1.z.string().min(2, "Company name is too short"),
            location: zod_1.z.string().min(2, "Location is too short"),
            jobType: zod_1.z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
            salaryRange: zod_1.z.string().min(2, "Salary range is required"),
            jobDescription: zod_1.z.string().min(10, "Job description is too short"),
            requirements: zod_1.z.string().min(5, "Requirements should be more detailed"),
            responsibilities: zod_1.z.string().min(5, "Responsibilities should be more detailed"),
            applicationDeadline: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
        });
        const parsedBody = jobSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }
        // if (!req.userId) {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }
        const newJob = yield prisma_1.client.job.create({
            //@ts-ignore
            data: Object.assign(Object.assign({}, parsedBody.data), { adminId: "6aa51f07-55af-443c-8fe4-e6276f0f0cc0" }),
        });
        return res.status(201).json({ message: "Job created successfully", job: newJob });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
// ✅ Fetch All Jobs
// @ts-ignore
app.get("/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = yield prisma_1.client.job.findMany({ orderBy: { createdAt: "desc" } });
        return res.status(200).json({ jobs });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
}));
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map