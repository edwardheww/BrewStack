import { type Page, chromium } from 'playwright';

abstract class Scraper {
    constructor(public roaster: Roaster) { }

    abstract scrape(): Promise<Bean[]>;

    async run(): Promise<ScrapeResult> {
        const date = new Date();
        const errors: string[] = [];
        try {
            const beans = await this.scrape();
            const result = new ScrapeResult(this.roaster.name, beans, date, errors);
            return result;
        } catch (error: unknown) {
            errors.push(error instanceof Error ? error.message : String(error));
            return new ScrapeResult(this.roaster.name, [], date, errors);
        }

    }

    async openCatalogPage(): Promise<Page> {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(this.roaster.website);
        return page;
    }
}