import { prisma } from "./client.js";

import { type ScrapedBean } from "../scraper/types/index.js";

export function clearDb() {
    prisma.bean.deleteMany({});
}

export async function upsertScrapedBeans(scrapedBeans: ScrapedBean[]) {
    const upsertedBeans = [];

    for (const scrapedBean of scrapedBeans) {

        const { roasterName, website, ...beanData } = scrapedBean; // Save the roaster info and bean info separately

        // Upsert the roaster first
        const roaster = await prisma.roaster.upsert({
            where: { name: roasterName },
            update: { website },
            create: { name: roasterName, website }
        });

        const upsertedBean = await prisma.bean.upsert({
            where: {
                url: beanData.url, // Use unique URL to identify the bean
            },
            update: {
                name: beanData.beanName,
                price: beanData.price,
                imageUrl: beanData.imageUrl,
                region: beanData.region,
                roastLevel: beanData.roastLevel,
                varietal: beanData.varietal,
                flavourNotes: beanData.flavourNotes,
                processingMethod: beanData.processingMethod,
                roasterId: roaster.id,
            },
            create: {
                name: beanData.beanName,
                price: beanData.price,
                url: beanData.url,
                imageUrl: beanData.imageUrl,
                region: beanData.region,
                roastLevel: beanData.roastLevel,
                varietal: beanData.varietal,
                flavourNotes: beanData.flavourNotes,
                processingMethod: beanData.processingMethod,
                roasterId: roaster.id,
            }
        });

        upsertedBeans.push(upsertedBean);
    }
    return upsertedBeans;
};
