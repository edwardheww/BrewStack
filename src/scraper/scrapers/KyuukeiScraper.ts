import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function stripHtml(str: string) { // remove html tags
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(str: string) { // convert html entities to normal characters
    return str.replace(/&amp;/g, '&');
}

function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map((word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function pickPrice(product: any): number { // convert shopify cents to dollars and pick the lowest price from variants
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const prices = variants
        .map((variant: any) => Number(variant?.price ?? 0) / 100)
        .filter((price: number) => price > 0);

    return prices.length ? Math.min(...prices) : 0;
}

function normaliseImageUrl(rawImageUrl: string) {
    if (!rawImageUrl) return '';
    return rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
}

function extractDescription(html: string): string {
    return html.match(/<div[^>]*class="[^"]*product__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '';
}

function extractField(descriptionHtml: string, label: string): string {
    const regex = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?=<\\/span>|<\\/p>|<br|<span|<p|$)`, 'i');
    return decodeHtmlEntities(stripHtml(descriptionHtml.match(regex)?.[1] ?? '')).trim();
}

export class KyuukeiScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const catalogPage = await this.openCatalogPage();
        await catalogPage.waitForLoadState('networkidle');

        const productUrls = await catalogPage.$$eval('a[href*="/products/"]', links =>
            [...new Set(
                links
                    .map(link => link.getAttribute('href'))
                    .filter((href): href is string => href !== null)
                    .map(href => href.startsWith('http') ? href : `https://kyuukeicoffee.com${href}`)
          
            )]
        );

        for (const url of productUrls) {
            try {
                const response = await fetch(`${url}.js`);
                if (!response.ok) {
                    throw new Error(`Product JSON returned ${response.status}`);
                }

                const product = await response.json();
                const name = product.title ?? '';
                const price = pickPrice(product);
                const rawImageUrl = product.featured_image || product.images?.[0]?.src || product.images?.[0] || '';
                const imageUrl = normaliseImageUrl(rawImageUrl);
                const pageHtml = await (await fetch(url)).text();
                const descriptionHtml = extractDescription(pageHtml);
                const region = extractField(descriptionHtml, 'Region');
                const varietal = extractField(descriptionHtml, 'Varietal');
                const processingMethod = extractField(descriptionHtml, 'Process') || extractField(descriptionHtml, 'Processing');
                const flavourNotes = toTitleCase(extractField(descriptionHtml, 'Tasting Notes'));
                if (!region && !varietal && !processingMethod && !flavourNotes) {
                    continue;
                }

                const b = new Bean(
                    name,
                    price,
                    url,
                    imageUrl,
                    region,
                    'Filter',
                    varietal,
                    flavourNotes,
                    processingMethod,
                    this.roaster.id,
                    this.roaster
                );

                beans.push(b);
            }
            catch (error) {
                console.error(`Error scraping product at ${url}:`, error);
            }
        }
        return beans;
    }
}



         