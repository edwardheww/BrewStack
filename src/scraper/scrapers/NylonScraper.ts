import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';
import { profileEnd } from 'node:console';

export class NylonScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const page = await this.openCatalogPage();
        await page.waitForLoadState('networkidle');
        let productUrls = await page.$$eval('product-card', cards => cards.map(card => card.lastElementChild?.querySelector('a')?.getAttribute('href'))
            .filter(url => url != null)
            .map(sect => 'https://nylon.coffee' + sect));


        for (const url of productUrls) {
            await page.goto(url);
            const notes = (await page.$$eval('div.flex.flex-col', list => list.map(node => node.textContent)
                .filter(text => text.includes('Tasting Notes'))))[0]?.split('Tasting Notes\n')[1]?.trim();
            const name = await page.$eval('h1', heading => heading.getHTML());

            const priceText = await page // price from website
                .$eval('sale-price', el => el.textContent?.trim() ?? '')
                .catch(() => '');
            const price = Number(priceText.replace(/[^0-9.]/g, '')) || 0; // price to be stored in database, default to 0 if price is not found or cannot be parsed

            const others = await page.$$eval('div.feature-chart__value.prose', ls => ls.map(info => info.textContent));

            const b = new Bean(
                name,
                price,
                url,
                others[7] ?? '',
                others[2] ?? '',
                notes ?? '',
                others[5] ?? '',
                this.roaster.id,
                this.roaster,
            );
            beans.push(b);
        }
        return beans;
    }
}