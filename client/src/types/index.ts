export interface Roaster {
    id: string,
    name: string,
    website: string,

    beans: Bean[],
}

export interface Bean {
    id: string,
    name: string,
    price: number | undefined,
    url: string,
    imageUrl: string | undefined,
    roastLevel: string | undefined,
    varietal: string | undefined,
    flavourNotes: string | undefined,
    processingMethod: string | undefined,
    updatedAt: Date,

    roasterId: string,
    roaster: Roaster,
}