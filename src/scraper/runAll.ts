import { HomegroundScraper } from './scrapers/HomegroundScraper.js';
import { NylonScraper } from './scrapers/NylonScraper.js';
import { TiongHoeScraper } from './scrapers/TiongHoeScraper.js';
import { AlchemistScraper } from './scrapers/AlchemistScraper.js';
import { CommunityCoffeeScraper } from './scrapers/CommunityCoffeeScraper.js';
import { KyuukeiScraper } from './scrapers/KyuukeiScraper.js';
import { Roaster } from './types/index.js';
import { upsertScrapedBeans } from '../db/upsert.js';

const scrapers = [
    new HomegroundScraper(new Roaster('hg', 'HomeGround', 'https://homegroundcoffeeroasters.com/collections/coffees-specialty')),
    new NylonScraper(new Roaster('nyl', 'Nylon', 'https://nylon.coffee/collections/coffee')),
    new TiongHoeScraper(new Roaster('th', 'Tiong Hoe', 'https://tionghoe.com/collections/roasted-beans')),
    new AlchemistScraper(new Roaster('alc', 'Alchemist', 'https://alchemist.global/collections/coffee-beans')),
    new CommunityCoffeeScraper(new Roaster('cc', 'Community Coffee', 'https://thecommunitycoffee.com/collections/coffee-beans')),
    new KyuukeiScraper(new Roaster('kyu', 'Kyuukei Coffee', 'https://kyuukeicoffee.com/collections/coffee-beans')),
]

export async function runAllScrapers() {
    for (const scraper of scrapers) {
        try {
            const result = await scraper.run();
            console.log(`${scraper.roaster.name}: ${result.beans.length} beans`);
            await upsertScrapedBeans(result.beans);
        }
        catch (error: unknown) { console.log(error); }
    }
}
