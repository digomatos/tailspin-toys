/** Filter-related data attributes read from a rendered game card. */
export interface CardAttributes {
    /** The card's category id, if the game has a category. */
    categoryId?: string;
    /** The card's publisher id, if the game has a publisher. */
    publisherId?: string;
}

/** The filter selections currently active in the UI. */
export interface ActiveFilters {
    /** Selected category ids; empty means no category filter. */
    categoryIds: string[];
    /** Selected publisher id; an empty string means no publisher filter. */
    publisherId: string;
}

/**
 * Determines whether a game card passes the active filters.
 *
 * Categories match any-of, the publisher matches exactly, and the two are combined with AND.
 *
 * @param card - The card's category and publisher attributes.
 * @param filters - The active category and publisher selections.
 * @returns `true` when the card should be shown.
 */
export function cardMatchesFilters(card: CardAttributes, filters: ActiveFilters): boolean {
    const categoryOk =
        filters.categoryIds.length === 0 ||
        (card.categoryId !== undefined && filters.categoryIds.includes(card.categoryId));
    const publisherOk = filters.publisherId === '' || card.publisherId === filters.publisherId;
    return categoryOk && publisherOk;
}
