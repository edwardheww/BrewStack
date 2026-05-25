import { HomegroundScraper } from "./src/scraper/scrapers/HomegroundScraper.js";
import { Roaster } from './src/scraper/types/index.js';

const roaster = new Roaster('hg', 'HomeGround', 'https://homegroundcoffeeroasters.com/collections/coffees-specialty');
const hgscraper = new HomegroundScraper(roaster);
const result = await hgscraper.run();
console.log(result);

process.exit();