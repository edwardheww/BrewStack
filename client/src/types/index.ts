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
    region: string | undefined,
    roastLevel: string | undefined,
    varietal: string | undefined,
    flavourNotes: string | undefined,
    processingMethod: string | undefined,
    updatedAt: Date,

    roasterId: string,
    roaster: Roaster,
}
export type SavedBeanStatus = 'want_to_try' | 'tried' | 'loved' | 'not_for_me';

export interface SavedBean {
    id: string;
    beanId?: string | null;

    name: string;
    price?: number;
    url?: string;
    imageUrl?: string;
    region?: string;
    roastLevel?: string;
    varietal?: string;
    flavourNotes?: string;
    processingMethod?: string;
    createdAt: string;

    status?: SavedBeanStatus;
    notes?: string;
    rating?: number;

    roaster: {
        name: string;
    };

    isUnavailable?: boolean;
}

export interface Outlet {
    id: string;
    name: string;
    branch: string;
    lat: number;
    long: number;
    address: string;
    colour: string;
}