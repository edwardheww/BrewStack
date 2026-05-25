import { type Page, chromium } from 'playwright'

abstract class Scraper {
    constructor(public roaster: Roaster) { }

    abstract scrape(): Promise<Bean[]>;

    run(): Promise<ScrapeResult> {
        async () => 
    }

    openCatalogPage(): Promise<Page> {
        async () => {
            const browser = await chromium.launch();
            const page = browser.newPage();
            (await page).goto(this.roaster.website);
            return page;
        }
    }
}