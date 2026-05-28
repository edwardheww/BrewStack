import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map((word: any) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

export class HomegroundScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const page = await this.openCatalogPage();
        await page.waitForLoadState('networkidle');
        const productUrls = await page.$$eval('product-card', cards => cards.map(card => card.getAttribute('handle')).filter(url => url != null));
        for (let i = 0; i < productUrls.length; i++) {
            productUrls[i] = 'https://homegroundcoffeeroasters.com/products/' + productUrls[i];
        }
        console.log(productUrls);

        for (const url of productUrls) {
            try {
                await page.goto(url);
                const name = await page.$eval('h1', heading => heading.innerText); // name
                const h4list = await page.$$eval('h4', h4list => h4list.map(trait => trait.innerHTML)); // farm | region/country | varietal | processing | roast
                const roastedFor = (await page.$$eval('div.prose', list => list.map(elems => elems.textContent)
                    .filter(text => text.includes('Roasted For'))))[0]
                    ?.split('Roasted For ')[1]
                    ?.split(name)[0]; // espresso or filter, used if no roast level provided
                let notes = '';
                if (roastedFor == 'Filter') {
                    notes = (await page.$eval('em', text => (text.innerText.split('\n\n')[1] ?? ''))); // tasting notes — filters
                } else if (roastedFor == 'Espresso') {
                    notes = (await page.$eval('div.shogun-root', x => x.querySelectorAll('p.p1')[1]?.textContent.split(' - ')[1])) ?? '';
                } else {
                    continue;
                }
                notes = toTitleCase(notes);
                const b = new Bean(name ?? '',
                    0, // price defaults to 0 for now until we settle how to implement
                    url,
                    h4list[4] ?? roastedFor ?? '',
                    h4list[2] ?? '',
                    notes,
                    h4list[3] ?? '',
                    this.roaster.id,
                    this.roaster
                );
                beans.push(b);
            } catch (error) {
                console.log(`Failed to scrape ${url}:`, error);
            }
        }
        return beans;
    }
}