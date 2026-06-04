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

function extractFeatureChart(html: string): string[] {
  return [...html.matchAll(/<div[^>]*class="[^"]*feature-chart__value[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map(m => stripHtml(m[1] ?? ''));
}

function pickPrice(product: any): number {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const variant = variants.find((v: any) => String(v.title ?? '').includes('250')) ?? variants[0];
  return Number(variant?.price ?? 0);
}

export class TiongHoeScraper extends Scraper {
  constructor(roaster: Roaster) {
    super(roaster);
  }

  override async scrape(): Promise<Bean[]> {
    const beans: Bean[] = [];
    const catalogPage = await this.openCatalogPage();
    await catalogPage.waitForLoadState('networkidle');
    const handles = await catalogPage.$$eval('product-card', cards =>
      cards.map(card => card.getAttribute('handle')).filter((h): h is string => h !== null)
    );
    const productUrls = [...new Set(handles)].map(h => `https://tionghoe.com/products/${h}`);

    for (const url of productUrls) {
      try {
        const jsRes = await fetch(`${url}.js`);
        if (!jsRes.ok) throw new Error(`JS endpoint returned ${jsRes.status}`);
        const product = await jsRes.json();

        const name = product.title ?? '';
        const price = pickPrice(product);
        const rawImageUrl = product.images?.[0]?.src ?? product.featured_image ?? '';
        const imageUrl = rawImageUrl.startsWith('//') ? `https:${rawImageUrl}` : rawImageUrl;
        const roastLevel = product.template_suffix === 'roasted-beans-espresso' ? 'Espresso' : 'Filter';

        const htmlRes = await fetch(url);
        const pageHtml = await htmlRes.text();
        const chartValues = extractFeatureChart(pageHtml);

        const flavourNotes = toTitleCase(chartValues[1] ?? '');
        const region = chartValues[2] ?? '';
        const varietal = chartValues[3] ?? '';
        const processingMethod = chartValues[4] ?? '';

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
        console.log(`Failed to scrape ${url}:`, error);
      }
    }
    return beans;
  }
}