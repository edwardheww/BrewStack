import { Router } from "express";
import { prisma } from "../db/client.js";

export const routes = Router();

//  route to check whether the backend is running.
routes.get("/health", (_req, res) => {
    res.json({ ok: true });
});

// Return all coffee beans and their roaster details from the database.
routes.get("/beans", async (_req, res) => {
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

// Return all roasters and the beans linked to each roaster
routes.get("/roasters", async (_req, res) => {
    try {
        const roasters = await prisma.roaster.findMany({
            include: {
                beans: true,
            },
        });

        res.json(roasters);
    } catch (error) {
        console.error("Error fetching roasters:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
