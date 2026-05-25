import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

export class HomegroundScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const page = await this.openCatalogPage();
        const productUrls = await page.$$eval('product-card', cards => cards.map(card => card.getAttribute('handle')).filter(url => url != null));
        for (let i = 0; i < productUrls.length; i++) {
            productUrls[i] = 'https://homegroundcoffeeroasters.com/products/' + productUrls[i];
        }

        for (const url of productUrls) {
            await page.goto(url);
            const name = await page.$$eval('h1', h1list => h1list.map(title => title.innerText)); // name
            const h4list = await page.$$eval('h4', h4list => h4list.map(trait => trait.innerHTML)); // farm | region/country | varietal | processing | roast
            const notes = await page.$$eval('em', emlist => emlist.map(text => (text.innerText.split('\n\n')[1] ?? '').split(', '))); // tasting notes
            const b = new Bean(name[0] ?? '',
                0,
                url,
                h4list[4] ?? '',
                h4list[2] ?? '',
                (notes[0] ?? []).join(','),
                h4list[3] ?? '',
                this.roaster.id,
                this.roaster
            );
            beans.push(b);
        }
        return beans;
    }
}