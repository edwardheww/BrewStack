export class Roaster {
    id: string;
    name: string;
    website: string;

    public constructor(id: string, name: string, website: string) {
        this.id = id;
        this.name = name;
        this.website = website;
    }
}

export class Bean {
    name: string;
    price?: number;
    url?: string;
    imageUrl?: string
    roastLevel?: string;
    varietal?: string;
    flavourNotes?: string;
    processingMethod?: string;

    roasterId: string;
    roaster: Roaster;

    public constructor(name: string, price: number, url: string, imageUrl: string, roastLevel: string, varietal: string,
        flavourNotes: string, processingMethod: string, roasterId: string, roaster: Roaster) {
        this.name = name; //d
        this.price = price;
        this.url = url; //d 
        this.imageUrl = imageUrl; //d
        this.roastLevel = roastLevel; //d
        this.varietal = varietal; //d
        this.flavourNotes = flavourNotes; //d
        this.processingMethod = processingMethod; //d
        this.roasterId = roasterId; //d
        this.roaster = roaster; //d
    }
}

export class ScrapeResult {
    name: string;
    beans: ScrapedBean[];
    scrapedAt: Date;
    errors: string[];

    public constructor(name: string, beans: ScrapedBean[], scrapedAt: Date, errors: string[]) {
        this.name = name;
        this.beans = beans;
        this.scrapedAt = scrapedAt;
        this.errors = errors;
    }
}

export type ScrapedBean = {
    //Roaster info
    roasterName: string;
    website: string;

    //Bean info
    beanName: string;
    price?: number;
    url?: string;
    imageUrl?: string
    roastLevel?: string;
    varietal?: string;
    flavourNotes?: string;
    processingMethod?: string;
}