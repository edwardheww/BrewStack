import { NylonScraper } from "./src/scraper/scrapers/NylonScraper.js";
import { Roaster } from './src/scraper/types/index.js';

const roaster = new Roaster('nyl', 'Nylon', 'https://nylon.coffee/collections/coffee');
const scraper = new NylonScraper(roaster);
const result = await scraper.run();
console.log(result);