import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

function extractDescriptionField(lines: string[], label: string) {
  return lines
    .find(line => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))
    ?.replace(new RegExp(`${label}:\\s*`, 'i'), '')
    .trim() ?? '';
}

export class TiongHoeScraper extends Scraper {
  constructor(roaster: Roaster) {
    super(roaster);
  }

  override async scrape(): Promise<Bean[]> {
    const beans: Bean[] = [];

    const page = await this.openCatalogPage();

    await page.waitForSelector('product-card', {
      timeout: 15000,
    });

    const productHandles = await page.$$eval('product-card', cards =>
      cards
        .map(card => card.getAttribute('handle'))
        .filter((handle): handle is string => handle !== null)
    );

    const productUrls = [...new Set(productHandles)].map(handle =>
      `https://tionghoe.com/products/${handle}`
    );

    for (const url of productUrls) {
      try {
        //console.log('Opening product:', url);

        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        //console.log('Status:', response?.status());
        //console.log('Final URL:', page.url());
        //console.log('Title:', await page.title());

        await page.waitForSelector('h1', {
          timeout: 15000,
        });

        const name = await page
          .$eval('h1', el => el.textContent?.trim() ?? '')
          .catch(() => '');

        console.log('Scraped name:', name);

        const priceText = await page
          .$eval('sale-price', el => el.textContent?.trim() ?? '')
          .catch(() => '');

        const price = Number(priceText.replace(/[^0-9.]/g, '')) || 0;

        const imageUrl = await page
          .$eval('product-gallery img', img => {
            const src = img.getAttribute('src');
            return src?.startsWith('//') ? `https:${src}` : src ?? '';
          })
          .catch(() => '');

        const flavourNotes = (await page
          .$$eval('.feature-chart__value', ls => ls.map(el => el.textContent?.trim()))
          .catch(() => ''))[1] ?? '';

        const descriptionLines = await page
          .$eval('.shopify-section--specification-table .prose p', el =>
            Array.from(el.childNodes)
              .map(node => node.textContent?.trim() ?? '')
              .filter(text => text.length > 0)
          )
          .catch(() => []);

        const region = extractDescriptionField(descriptionLines, 'Region');

        const varietal = extractDescriptionField(descriptionLines, 'Varietal');

        const processingMethod = extractDescriptionField(descriptionLines, 'Process');

        const roastLevel =
          url.toLowerCase().includes('espresso-blend') ||
            name.toLowerCase().includes('espresso blend')
            ? 'Espresso'
            : 'Filter';

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

        await page.waitForTimeout(8500);
      } catch (error) {
        console.error('Failed product:', url, error);
      }
    }

    return beans;
  }
}
