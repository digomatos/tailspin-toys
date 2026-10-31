import { describe, it, expect } from 'vitest';
import { cardMatchesFilters } from './filters';

const card = { categoryId: '1', publisherId: '2' };

/** Unit tests for the client-side filter matching logic. */
describe('cardMatchesFilters', () => {
    it('matches everything with no filters', () => {
        expect(cardMatchesFilters(card, { categoryIds: [], publisherId: '' })).toBe(true);
        expect(cardMatchesFilters({}, { categoryIds: [], publisherId: '' })).toBe(true);
    });

    it('matches any selected category', () => {
        expect(cardMatchesFilters(card, { categoryIds: ['1', '3'], publisherId: '' })).toBe(true);
        expect(cardMatchesFilters(card, { categoryIds: ['3'], publisherId: '' })).toBe(false);
        expect(cardMatchesFilters({}, { categoryIds: ['1'], publisherId: '' })).toBe(false);
    });

    it('filters by publisher', () => {
        expect(cardMatchesFilters(card, { categoryIds: [], publisherId: '2' })).toBe(true);
        expect(cardMatchesFilters(card, { categoryIds: [], publisherId: '9' })).toBe(false);
    });

    it('combines category and publisher', () => {
        expect(cardMatchesFilters(card, { categoryIds: ['1'], publisherId: '2' })).toBe(true);
        expect(cardMatchesFilters(card, { categoryIds: ['1'], publisherId: '9' })).toBe(false);
    });
});
