import { describe, expect, it } from 'vitest';
import { money, recommendBean, scoreBean, splitNotes } from './FindMyCoffee.js';
import { type Bean } from '../types/index.js';

// fake data for testing
const testRoaster = {
    id: 'roaster-1',
    name: 'Test Roaster',
    website: 'https://example.com',
    beans: [],
};

const fruityFilterBean: Bean = {
    id: 'bean-1',
    name: 'Fruity Filter Coffee',
    price: 22,
    url: 'https://example.com/coffee',
    imageUrl: 'https://example.com/image.jpg',
    region: 'Ethiopia',
    roastLevel: 'Filter',
    varietal: 'Heirloom',
    flavourNotes: 'Berry, Citrus, Floral',
    processingMethod: 'Washed',
    updatedAt: new Date(),
    roasterId: testRoaster.id,
    roaster: testRoaster,
};

const chocolateEspressoBean: Bean = {
    id: 'bean-2',
    name: 'Chocolate Espresso Coffee',
    price: 18,
    url: 'https://example.com/espresso',
    imageUrl: undefined,
    region: 'Brazil',
    roastLevel: 'Espresso',
    varietal: 'Bourbon',
    flavourNotes: 'Chocolate, Nutty, Caramel',
    processingMethod: 'Natural',
    updatedAt: new Date(),
    roasterId: testRoaster.id,
    roaster: testRoaster,
};

describe('FindMyCoffee helper functions', () => {
    it('splits tasting notes into separate notes', () => {
        expect(splitNotes('Berry, Citrus; Floral')).toEqual([
            'Berry',
            'Citrus',
            'Floral',
        ]);
    });

    it('only returns the first three tasting notes', () => {
        expect(splitNotes('Berry, Citrus, Floral, Chocolate')).toEqual([
            'Berry',
            'Citrus',
            'Floral',
        ]);
    });

    it('formats prices as Singapore dollars', () => {
        expect(money(22)).toBe('S$22.00');
    });

    it('shows N/A when price is missing', () => {
        expect(money(undefined)).toBe('N/A');
    });

    it('scores a matching fruity filter coffee above zero', () => {
        const result = scoreBean(fruityFilterBean, {
            brew: 'Filter coffee',
            flavour: 'Fruity',
        });

        expect(result.score).toBeGreaterThan(0);
        expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('ranks the best matching coffee first', () => {
        const results = recommendBean(
            [chocolateEspressoBean, fruityFilterBean],
            {
                brew: 'Filter coffee',
                flavour: 'Fruity',
            },
        );

        expect(results[0].bean.id).toBe('bean-1');
    });
});