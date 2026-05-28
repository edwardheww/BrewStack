import { prisma } from "./client.js";

import { type ScrapedBean } from "../scraper/types/index.js";

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

        await prisma.bean.deleteMany({
            where: { roasterId: roaster.id }
        });

        const upsertedBean = await prisma.bean.upsert({
            where: {
                url: beanData.url, // Use unique URL to identify the bean
            },
            update: {
                name: beanData.beanName,
                price: beanData.price,
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
                roastLevel: beanData.roastLevel,
                varietal: beanData.varietal,
                flavourNotes: beanData.flavourNotes,
                processingMethod: beanData.processingMethod,
                roasterId: roaster.id,
            }
        });

        console.log(beanData.url);
        upsertedBeans.push(upsertedBean);
    }
    return upsertedBeans;
};