import express, { Request, Response } from 'express'
import { z } from 'zod'
import { client } from './lib/prisma'
const bcrypt = require ("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express()
const port = process.env.PORT || 8080
app.use(cors());


app.get('/', (_req: Request, res: Response) => {
	return res.send('Express Typescript on Vercel')
})

app.get('/ping', (_req: Request, res: Response) => {
	return res.send('pong 🏓')
})

const JWT_SECRET_USER = "TGFI*EAVBG8YWO!Ad%@#ladjsvahb#!&^ka1237474@kv";

// Extend Request type for authenticated admin
interface AuthRequest extends Request {
    userId?: string;
}

// Schema for admin registration and login
const authSchema = z.object({
    name: z.string()
        .min(3, "Name is too short")
        .max(14, "Name is too long")
        .regex(/^[a-zA-Z]+$/, "You can enter only alphabets")
        .optional(),
    email: z.string()
        .email("Invalid email format")
        .min(15, "Email is too short")
        .max(26, "Email is too long"),
    password: z.string()
        .min(6, "Password is too short")
        .max(32, "Password is too long")
        .regex(/[A-Z]/, "Password must contain one uppercase letter")
        .regex(/[./<>\?+*@;:\"^`#()_-]/, "Password must contain at least one special character")
        .regex(/[0-9]/, "Password must contain at least one number")
});

// ✅ Admin Registration
// @ts-ignore
app.post("/register", async (req: Request, res: Response) => {
    try {
        const parsedBody = authSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }

        const { name, email, password } = parsedBody.data;

        const existingUser = await client.admin.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await client.admin.create({
            // @ts-ignore
            data: { name, email, password: hashedPassword },
        });

        return res.status(201).json({ message: "You have registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});

// ✅ Admin Login
// @ts-ignore
app.post("/login", async (req: Request, res: Response) => {
    try {
        const parsedBody = authSchema.omit({ name: true }).safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }

        const { email, password } = parsedBody.data;
        const user = await client.admin.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect credentials" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET_USER, { expiresIn: "1h" });

        return res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});

// ✅ Job Posting (Protected Route)
// @ts-ignore
app.post("/jobs", async (req: AuthRequest, res: Response) => {
    try {
        const jobSchema = z.object({
            title: z.string().min(3, "Title must be at least 3 characters long"),
            companyName: z.string().min(2, "Company name is too short"),
            location: z.string().min(2, "Location is too short"),
            jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
            salaryRange: z.string().min(2, "Salary range is required"),
            jobDescription: z.string().min(10, "Job description is too short"),
            requirements: z.string().min(5, "Requirements should be more detailed"),
            responsibilities: z.string().min(5, "Responsibilities should be more detailed"),
            applicationDeadline: z.string().refine(
                (val) => !isNaN(Date.parse(val)), 
                { message: "Invalid date format" }
            ),
        });

        const parsedBody = jobSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ message: parsedBody.error.format() });
        }

        // if (!req.userId) {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }

        const newJob = await client.job.create({
            //@ts-ignore
            data: {
                ...parsedBody.data,
                adminId: "6aa51f07-55af-443c-8fe4-e6276f0f0cc0", // Assign job to authenticated admin
            },
        });

        return res.status(201).json({ message: "Job created successfully", job: newJob });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error", error });
    }
});

// ✅ Fetch All Jobs
// @ts-ignore
app.get("/jobs", async (req: Request, res: Response) => {
    try {
        const jobs = await client.job.findMany({ orderBy: { createdAt: "desc" } });
        return res.status(200).json({ jobs });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error });
    }
});


app.listen(port, () => {
	return console.log(`Server is listening on ${port}`)
})
