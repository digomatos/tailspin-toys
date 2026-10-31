export interface CardAttributes {
    categoryId?: string;
    publisherId?: string;
}

export interface ActiveFilters {
    categoryIds: string[];
    publisherId: string;
}

/** Whether a card passes the active filters (category: any-of; publisher: exact; combined with AND). */
export function cardMatchesFilters(card: CardAttributes, filters: ActiveFilters): boolean {
    const categoryOk =
        filters.categoryIds.length === 0 ||
        (card.categoryId !== undefined && filters.categoryIds.includes(card.categoryId));
    const publisherOk = filters.publisherId === '' || card.publisherId === filters.publisherId;
    return categoryOk && publisherOk;
}
