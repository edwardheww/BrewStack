import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function toTitleCase(str: string) {
  return str.toLowerCase().split(' ').map((word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function parsePrice(text: string) { // Convert price string to number, default to 0 if parsing fails
  return Number(text.replace(/[^0-9.]/g, '')) || 0;
}

function splitRegionAndProcess(text: string) {  // Split region and processing method since website displays them together, default to empty string if not found
  const [region = '', process = ''] = text.split('-').map(part => part.trim());
  return { region, processingMethod: process };
}

function extractRoastLevel(html: string) { 
  const checkedInputMatch = html.match(
    /<input[^>]*name="product-option-Roast"[^>]*value="([^"]+)"/i
  );

  if (checkedInputMatch?.[1]) {
    return checkedInputMatch[1];
  }

  const activeLabelMatch = html.match(
    /<label[^>]*product-option-Roast[^>]*active[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i
  );

  return activeLabelMatch?.[1]?.trim() ?? '';
}

function extractVarietal(html: string) {
  const match = html.match(
    /<dt[^>]*>\s*Varietal\s*<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/i
  );

  return match?.[1]?.trim() ?? '';
}

export class AlchemistScraper extends Scraper {
  constructor(roaster: Roaster) {
    super(roaster);
  }

  override async scrape(): Promise<Bean[]> {
    const beans: Bean[] = [];
    const catalogPage = await this.openCatalogPage();
    await catalogPage.waitForLoadState('networkidle');

    const products = await catalogPage.$$eval('.product-card-wrapper', cards =>
      cards.map(card => {
        const link = card.querySelector('a.h5.latin-char') as HTMLAnchorElement | null;
        const originProcess = card.querySelector('p.p4')?.textContent?.trim() ?? '';
        const priceText = card.querySelector('.applied-price')?.textContent?.trim() ?? '';
        const tastingNotes = [...card.querySelectorAll('.tasting-notes span.p3')]
          .map(note => note.textContent?.trim())
          .filter(Boolean)
          .join(', ');

        const image = card.querySelector('.image-con img.image') as HTMLImageElement | null;
        const rawImageUrl = image?.getAttribute('data-srcset')?.split(',').pop()?.trim().split(/\s+/)[0] ||'';
        const imageUrl = rawImageUrl.startsWith('//')
            ? `https:${rawImageUrl}`
            : rawImageUrl;
        
        return {
          name: link?.textContent?.trim() ?? '',
          url: link?.href ?? '',
          originProcess,
          priceText,
          tastingNotes,
          imageUrl,
        };
      }).filter(product => product.name && product.url)
    );

    for (const product of products) {
      try {
        const { region, processingMethod } = splitRegionAndProcess(product.originProcess);
        const pageHtml = await (await fetch(product.url)).text();
        const roastLevel = extractRoastLevel(pageHtml);
        const extractedVarietal = extractVarietal(pageHtml);
        const varietal = !extractedVarietal && roastLevel === 'Espresso' // for beans marked as espresso roast without varietal info, set varietal to 'Blend' since they are likely blends
            ? 'Blend'
            : extractedVarietal;

        const b = new Bean(
          product.name,
          parsePrice(product.priceText),
          product.url,
          product.imageUrl,
          region,
          roastLevel,
          varietal,
          toTitleCase(product.tastingNotes),
          processingMethod,
          this.roaster.id,
          this.roaster
        );

        beans.push(b);
      } catch (error) {
        console.log(`Failed to scrape ${product.url}:`, error);
      }
    }

    return beans;
  }
}