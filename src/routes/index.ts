import { Router } from "express";
import { prisma } from "../db/client.js";
import type { Prisma } from "@prisma/client";
import { HomegroundScraper } from "../scraper/scrapers/HomegroundScraper.js";
import { Roaster } from "../scraper/types/index.js";
import { type Response } from "express";
import { upsertScrapedBeans } from "../db/upsert.js";
import { NylonScraper } from "../scraper/scrapers/NylonScraper.js";
import { TiongHoeScraper } from "../scraper/scrapers/TiongHoeScraper.js";
import { AlchemistScraper } from "../scraper/scrapers/AlchemistScraper.js";
import { getUserFromRequest } from "../auth/getUser.js";

export const routes = Router();

//  route to check whether the backend is running.
routes.get("/health", (_req, res) => {
    res.json({ ok: true });
});

// Return all coffee beans and their roaster details from the database.
// Optional query params let the frontend ask the backend for filtered results.
routes.get("/beans", async (req, res) => {
    try {
        const { search, roaster, origin, roastLevel, process } = req.query; // Read optional filters from the URL
        const where: Prisma.BeanWhereInput = {};
        
        if (roaster) {
            where.roaster = {
                name: String(roaster),
                
            }
        }

        if (origin) {
            where.region = {
                contains: String(origin),
                mode: "insensitive",
            };
        }

        if (roastLevel) {
            where.roastLevel = {
                contains: String(roastLevel),
                mode: "insensitive",
            };
        }

        if (process) {
            where.processingMethod = {
                contains: String(process),
                mode: "insensitive",
            };
        }
            
        if (search) {
            const query = String(search);

            where.OR = [ // return bean if any of the fields matches
                { name: { contains: query, mode: "insensitive" } },
                { region: { contains: query, mode: "insensitive" } },
                { roastLevel: { contains: query, mode: "insensitive" } },
                { varietal: { contains: query, mode: "insensitive" } },
                { flavourNotes: { contains: query, mode: "insensitive" } },
                { processingMethod: { contains: query, mode: "insensitive" } },
                {
                    roaster: {
                        name: { contains: query, mode: "insensitive" },
                    },
                }
            ];
        }

        const beans = await prisma.bean.findMany({
            where,
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

// SSE Endpoint that notifies frontend to re-fetch should backend be updated.
const clients: Response[] = [];

routes.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    clients.push(res);

    const keepAlive = setInterval(() => res.write(': ping\n\n'), 15000);
    req.on('close', () => {
        clearInterval(keepAlive);
        clients.splice(clients.indexOf(res), 1);
    });
})

export function notifyClients() {
    console.log(`Notifying ${clients.length} clients`);
    clients.forEach(res => res.write('data: update\n\n'));
}

routes.get("/me/saved-beans", async (req, res) => { // Return all beans saved by the currently logged-in user.
    try {
        const user = await getUserFromRequest(req);
        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const savedBeans = await prisma.savedBean.findMany({
            where: {
                userId: user.id,
            },
            include: {
                bean: {
                    include: {
                        roaster: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(savedBeans.map(saved => ({
            id: saved.id,
            beanId: saved.beanId,

            name: saved.beanName,
            price: saved.price,
            url: saved.url,
            imageUrl: saved.imageUrl,
            region: saved.region,
            roastLevel: saved.roastLevel,
            varietal: saved.varietal,
            flavourNotes: saved.flavourNotes,
            processingMethod: saved.processingMethod,
            createdAt: saved.createdAt,

            status: saved.status,
            notes: saved.notes,
            rating: saved.rating,

            roaster: {
                name: saved.roasterName,
            },

            isUnavailable: saved.beanId === null,
        })));
    } catch(error) {
        console.error("Error fetching saved beans:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

routes.post("/me/saved-beans", async (req, res) => { // Save one bean for the current user.
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { beanId } = req.body;

        const bean = await prisma.bean.findUnique({
            where: {
                id: beanId,
            },
            include: {
                roaster: true,
            },
        });

        if (!bean) {
            res.status(400).json({ error: "Bean not found" });
            return;
        }

        await prisma.user.upsert({
            where: {
                id: user.id,
            },
            update: {
                email: user.email,
            },
            create: {
                id: user.id,
                email: user.email,
            },
        });

        const savedBean = await prisma.savedBean.upsert({
            where: {
                userId_beanId: {
                    userId: user.id,
                    beanId,
                },
            },
            update: {},
            create: {
                userId: user.id,
                beanId: bean.id,

                beanName: bean.name,
                roasterName: bean.roaster.name,
                price: bean.price,
                url: bean.url,
                imageUrl: bean.imageUrl,
                region: bean.region,
                roastLevel: bean.roastLevel,
                varietal: bean.varietal,
                flavourNotes: bean.flavourNotes,
                processingMethod: bean.processingMethod,
            },
        });
        res.json(savedBean);
    } catch(error) {
        console.error("Error saving bean:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

routes.delete("/me/saved-beans/:savedBeanId", async (req, res) => { // Remove one saved bean for the current user.
    try {
        const user = await getUserFromRequest(req);

        if (!user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { savedBeanId } = req.params;
        await prisma.savedBean.deleteMany({
            where: {
                userId: user.id,
                id: savedBeanId,
            },
        });

        res.json({ ok: true });
    } catch(error) {
        console.error("Error unsaving bean:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Temporary testing route: manually runs the scraper until the automatic scraper is finalized.
routes.post("/scrape/homeground", async (_req, res) => {
    try {
        const roaster = new Roaster("hg",
            "Homeground Coffee Roasters",
            "https://homegroundcoffeeroasters.com/collections/coffees-specialty"
        );

        const hgscraper = new HomegroundScraper(roaster);
        const result = await hgscraper.run();
        const savedBeans = await upsertScrapedBeans(result.beans);

        res.json({
            message: "Scraping completed successfully",
            scrapedCount: result.beans.length,
            savedCount: savedBeans.length,
            errors: result.errors,
        });

    } catch (error) {
        console.error("Error running hgScraper:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


routes.post("/scrape/tionghoe", async (_req, res) => {
    try {
        const roaster = new Roaster(
            "th",
            "Tiong Hoe",
            "https://tionghoe.com/collections/roasted-beans"
        );

        const scraper = new TiongHoeScraper(roaster);
        const result = await scraper.run();

        console.log(result);

        const savedBeans = await upsertScrapedBeans(result.beans);

        res.json({
            message: "Tiong Hoe scraping completed successfully",
            scrapedCount: result.beans.length,
            savedCount: savedBeans.length,
            errors: result.errors,
        });
    } catch (error) {
        console.error("Error running TiongHoeScraper:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

routes.post("/scrape/nylon", async (_req, res) => {
    try {
        const roaster = new Roaster(
            "nyl",
            "Nylon",
            "https://nylon.coffee/collections/coffee"
        );

        const scraper = new NylonScraper(roaster);
        const result = await scraper.run();
        const savedBeans = await upsertScrapedBeans(result.beans);

        res.json({
            message: "Nylon scraping completed successfully",
            scrapedCount: result.beans.length,
            savedCount: savedBeans.length,
            errors: result.errors,
        });
    } catch (error) {
        console.error("Error running NylonScraper:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


