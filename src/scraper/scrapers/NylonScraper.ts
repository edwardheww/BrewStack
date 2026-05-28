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
        console.log(productUrls);


        for (const url of productUrls) {
            await page.goto(url);
            const notes = (await page.$$eval('div.flex.flex-col', list => list.map(node => node.textContent)
                .filter(text => text.includes('Tasting Notes'))))[0]?.split('Tasting Notes\n')[1]?.trim();
            const name = await page.$eval('h1', heading => heading.getHTML());
            const others = await page.$$eval('div.feature-chart__value.prose', ls => ls.map(info => info.textContent));

            const b = new Bean(
                name,
                0,
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