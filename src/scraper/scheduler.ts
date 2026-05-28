import * as cron from 'node-cron';
import { HomegroundScraper } from './scrapers/HomegroundScraper.js';
import { NylonScraper } from './scrapers/NylonScraper.js';
import { Roaster } from './types/index.js';
import { upsertScrapedBeans } from '../db/upsert.js';

const scrapers = [
    new HomegroundScraper(new Roaster('hg', 'HomeGround', 'https://homegroundcoffeeroasters.com/collections/coffees-specialty')),
    new NylonScraper(new Roaster('nyl', 'Nylon', 'https://nylon.coffee/collections/coffee')),
]

async function runAllScrapers() {
    for (const scraper of scrapers) {
        try {
            console.log((await scraper.run()).beans);
            await upsertScrapedBeans((await scraper.run()).beans);
        }
        catch (error: unknown) { console.log(error); }
    }
}

export function registerScraperCron() {
    cron.schedule('* * * * *', async () => {
        console.log('Running daily scraping.');
        await runAllScrapers();
        console.log('Daily scraping complete.');
    });
}