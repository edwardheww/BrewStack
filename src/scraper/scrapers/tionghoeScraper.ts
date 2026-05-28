import { Scraper } from './BaseScraper.js';
import { Roaster, Bean } from '../types/index.js';

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

    console.log('Product URLs:', productUrls);

    for (const url of productUrls) {
      try {
        console.log('Opening product:', url);

        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        console.log('Status:', response?.status());
        console.log('Final URL:', page.url());
        console.log('Title:', await page.title());

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

        const flavourNotes = await page
          .$eval('.feature-chart__value', el => el.textContent?.trim() ?? '')
          .catch(() => '');

        const descriptionLines = await page
            .$eval('.shopify-section--specification-table .prose p', el =>
            Array.from(el.childNodes)
            .map(node => node.textContent?.trim() ?? '')
            .filter(text => text.length > 0)
                )
            .catch(() => []);

        const varietal =
                descriptionLines
                .find(line => line.toLowerCase().startsWith('varietal:'))
                ?.replace(/Varietal:\s*/i, '')
                .trim() ?? '';

        const processingMethod =
                descriptionLines
                .find(line => line.toLowerCase().startsWith('process:'))
                ?.replace(/Process:\s*/i, '')
                .trim() ?? '';

        const roastLevel =
          url.toLowerCase().includes('espresso-blend') ||
          name.toLowerCase().includes('espresso blend')
            ? 'Espresso'
            : 'Filter';

        const b = new Bean(
          name,
          price,
          url,
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