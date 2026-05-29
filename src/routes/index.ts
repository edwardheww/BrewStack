import { Router } from "express";
import { prisma } from "../db/client.js";
import { HomegroundScraper } from "../scraper/scrapers/HomegroundScraper.js";
import { Roaster } from "../scraper/types/index.js";
import { upsertScrapedBeans } from "../db/upsert.js";
import { NylonScraper } from "../scraper/scrapers/NylonScraper.js";
import { TiongHoeScraper } from "../scraper/scrapers/TiongHoeScraper.js";

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
