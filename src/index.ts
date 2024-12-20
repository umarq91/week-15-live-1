import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const client = new PrismaClient();

const PORT = 3000;

// Function to ensure database connection
async function connectDB() {
    try {
        await client.$connect();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Failed to connect to the database:", error);
        process.exit(1); // Exit the process if the database connection fails
    }
}

// Handle the root GET route
app.get("/", async (req, res) => {
    try {
        const users = await client.user.findMany();
        res.json({
            message: "Healthy server",
            users,
        });
    } catch (error) {
        res.status(500).json({ error:error });
    }
});

app.post("/add", async (req: Request, res: any) => {
    const { email, name } = req.body;

    // Simple validation
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const newUser = await client.user.create({
            data: {
                email,
                name,
            },
        });

        res.status(201).json({
            message: "Done signing up!",
            user: newUser, // Return the newly created user
        });
    } catch (error) {
        console.error("Error while creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// Gracefully shut down Prisma Client when the app closes
process.on("SIGINT", async () => {
    await client.$disconnect();
    console.log("🛑 Prisma Client disconnected");
    process.exit(0);
});

// Start the server
app.listen(PORT, async () => {
    await connectDB(); // Ensure database connection before starting
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
