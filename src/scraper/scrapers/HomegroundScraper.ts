import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map((word: any) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

function stripHtml(str: string) {
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractH4List(html: string) { // farm | region/country | varietal | processing | roast
    return [...html.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)].map(match => stripHtml(match[1] ?? ''));
}

function extractNotes(html: string) {
    const emText = stripHtml(html.match(/<em[^>]*>([\s\S]*?)<\/em>/i)?.[1] ?? '');
    const notesOnly = emText.replace(/Tasting\s*Notes\s*:?\s*/i, '').trim();
     return toTitleCase(notesOnly);
}

function pickPrice(product: any) { // prefer and scrape the 250g variant, otherwise default to the first variant 
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variant = variants.find((v: any) => String(v.title ?? '').includes('250')) ?? variants[0];
    return Number(variant?.price ?? 0) / 100;
}

export class HomegroundScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const catalogPage = await this.openCatalogPage();
        await catalogPage.waitForLoadState('networkidle');
        const productUrls = await catalogPage.$$eval('product-card', cards => cards.map(card => card.getAttribute('handle')).filter(url => url != null));
        for (let i = 0; i < productUrls.length; i++) {
            productUrls[i] = 'https://homegroundcoffeeroasters.com/products/' + productUrls[i];
        }

        for (const url of productUrls) {
            try {
                const response = await fetch(`${url}.js`);
                if (!response.ok) {
                    throw new Error(`Product JSON returned ${response.status}`);
                }

                const product = await response.json();
                const name = product.title ?? '';
                const price = pickPrice(product);
                const description = product.description ?? '';
                const pageHtml = await (await fetch(url)).text();
                const pageText = stripHtml(pageHtml);

                const h4list = extractH4List(pageHtml); // farm | region/country | varietal | processing | roast
                const roastedFor = /Roasted\s*For\s*Filter/i.test(pageText) // scrape from the :roasted for: field in the description, otherwise try to infer from the page text
                    ? 'Filter'
                    : /Roasted\s*For\s*Espresso/i.test(pageText)
                        ? 'Espresso'
                        : '';
                const notes = extractNotes(description);
                const b = new Bean(name ?? '',
                    price,
                    url,
                    h4list[4] || roastedFor || '', // roast level is either explicitly stated in the description or can be inferred from the roasted for field
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
