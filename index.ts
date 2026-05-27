import express from "express";
import { prisma } from "./src/db/client.js";
import { registerScraperCron } from "./src/scraper/scheduler.js";

// Create the Express app and choose the port it should run on.
const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to read JSON request
app.use(express.json());

// Simple route to check whether the backend is running.
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

// Return all coffee beans and roasters from the database
app.get("/beans", async (_req, res) => {
    try {
        const beans = await prisma.bean.findMany({
            include: {
                roaster: true,
            },
        });

        res.json(beans);
    } catch (error) {
        console.error("Error fetching beans:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Return all roasters and beans from the database
app.get("/roasters", async (_req, res) => {
    try {
        const roasters = await prisma.roaster.findMany({
            include: {
                beans: true,
            },
        });
        res.json(roasters);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the scheduled scraper job while the backend is running.
registerScraperCron();

// Start listening for incoming requests.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
