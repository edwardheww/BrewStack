import * as cron from 'node-cron';
import { HomegroundScraper } from './scrapers/HomegroundScraper.js';
import { Roaster } from './types/index.js';
import { upsertScrapedBeans } from '../db/upsert.js';
import { error } from 'node:console';

export function registerScraperCron() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily scraping.');
        const roaster = new Roaster('hg', 'HomeGround', 'https://homegroundcoffeeroasters.com/collections/coffees-specialty');
        const hgscraper = new HomegroundScraper(roaster);

        try { await upsertScrapedBeans((await hgscraper.run()).beans); }
        catch (error: unknown) { console.log(error); }
    });
}