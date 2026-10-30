import { runAllScrapers } from './runAll.js';
import { prisma } from '../db/client.js';

// Entry point for the nightly GitHub Actions job: scrape every roaster once, then exit.
console.log('Running scrapers.');
try {
    await runAllScrapers();
    console.log('Scraping complete.');
} finally {
    await prisma.$disconnect();
}
process.exit(0);
