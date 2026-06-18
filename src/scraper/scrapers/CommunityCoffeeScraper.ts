import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function stripHtml(str: string) {
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map((word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function decodeHtmlEntities(str: string) {
    return str.replace(/&amp;/g, '&');
}

function pickPrice(product: any): number { // pick the first shopify variant price
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variant  = variants[0] || null;

    return Number(variant?.price ?? 0) / 100; // Convert cents to dollars
}

function extractDescription(html: string): string { // Extract the product description from the HTML, default to empty string if not found
    return html.match(/<div[^>]*class="[^"]*product__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '';
}

function extractField(descriptionHtml: string, label: string): string { 
    const regex = new RegExp(`<strong>\\s*${label}\\s*:?\\s*<\\/strong>\\s*([\\s\\S]*?)(?=<br|<\\/p|<strong>)`, 'i');
    return decodeHtmlEntities(stripHtml(descriptionHtml.match(regex)?.[1] ?? '')).replace(/^["']|["']$/g, '').trim();
}

function extractVarietal(descriptionHtml: string): string {
    const strongValues = [...descriptionHtml.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/gi)]
    .map(match => stripHtml(match[1] ?? ''));

     const varietyProcessLine = strongValues.find(value => value.includes('|')) ?? ''; // extract the line that contains the varietal and processing method
      return varietyProcessLine.split('|')[0]?.trim() ?? '';
}

export class CommunityCoffeeScraper extends Scraper {
    constructor(roaster: Roaster) {
        super(roaster);
    }

    override async scrape(): Promise<Bean[]> {
        const beans: Bean[] = [];
        const catalogPage = await this.openCatalogPage();
        await catalogPage.waitForLoadState('networkidle');

        const productUrls = await catalogPage.$$eval('a[href*="/products/"]', links => // get unique product URLs, default to empty array if none found
            [...new Set(
                links
                    .map(link => link.getAttribute('href'))
                    .filter((href): href is string => href !== null)
                    .map(href =>  href.startsWith('http') ? href : `https://thecommunitycoffee.com${href}`)
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
                const rawImageUrl = product.featured_image || product.images?.[0] || '';
                const imageUrl = rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
                const pageHtml = await (await fetch(url)).text();
                const descriptionHtml = extractDescription(pageHtml);
                const flavourNotes = toTitleCase(extractField(descriptionHtml, 'CUPPING NOTES'));
                const region = extractField(descriptionHtml, 'ORIGIN');
                const varietal = extractVarietal(descriptionHtml);
                const recommendedFor = extractField(descriptionHtml, 'RECOMMENDED FOR'); // Gets recommended for part and store it as roast level
                const roastLevel = recommendedFor;
                const processingMethod = extractField(descriptionHtml, 'PROCESSING');

                const b = new Bean(
                    name,
                    price,
                    url,
                    imageUrl,
                    region,
                    roastLevel,
                    varietal,
                    flavourNotes,
                    processingMethod,
                    this.roaster.id,
                    this.roaster
                );
                beans.push(b);
            } catch (error) {
                console.error(`Error scraping product at ${url}:`, error);
            }
        }
        return beans;
    }
}



        
    

