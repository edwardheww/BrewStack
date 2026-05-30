import { type Page, chromium } from 'playwright';
import { Roaster, Bean, ScrapeResult, type ScrapedBean } from '../types/index.js';

export abstract class Scraper {
    constructor(public roaster: Roaster) { }

    abstract scrape(): Promise<Bean[]>;

    toScraped(b: Bean): ScrapedBean {
        return {
            roasterName: b.roaster.name,
            website: b.roaster.website,

            beanName: b.name,
            price: b.price,
            url: b.url,
            imageUrl: b.imageUrl,  
            roastLevel: b.roastLevel,
            varietal: b.varietal,
            flavourNotes: b.flavourNotes,
            processingMethod: b.processingMethod,
        };
    }

    async run(): Promise<ScrapeResult> {
        const date = new Date();
        const errors: string[] = [];
        try {
            const beans = await this.scrape();
            const result = new ScrapeResult(this.roaster.name, beans.map(b => this.toScraped(b)), date, errors);
            return result;
        } catch (error: unknown) {
            errors.push(error instanceof Error ? error.message : String(error));
            return new ScrapeResult(this.roaster.name, [], date, errors);
        }

    }

    async openCatalogPage(): Promise<Page> {
        const browser = await chromium.launch({ headless: true, slowMo: 500 });
        const page = await browser.newPage();
        await page.goto(this.roaster.website);
        return page;
    }
}
