import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
    getAllCategories,
    getAllPublishers,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    describe('filtering', () => {
        let catA: number, catB: number, pubX: number, pubY: number;

        beforeEach(async () => {
            [{ id: catA }, { id: catB }] = await db
                .insert(categories)
                .values([
                    { name: 'Alpha', description: 'a' },
                    { name: 'Beta', description: 'b' },
                ])
                .returning({ id: categories.id });
            [{ id: pubX }, { id: pubY }] = await db
                .insert(publishers)
                .values([
                    { name: 'Pub X', description: 'x' },
                    { name: 'Pub Y', description: 'y' },
                ])
                .returning({ id: publishers.id });
            await db.insert(games).values([
                { title: 'G1', description: 'd', categoryId: catA, publisherId: pubX },
                { title: 'G2', description: 'd', categoryId: catA, publisherId: pubY },
                { title: 'G3', description: 'd', categoryId: catB, publisherId: pubX },
            ]);
        });

        const titles = (list: { title: string }[]): string[] => list.map((g) => g.title);

        it('filters by one or more categories', async () => {
            expect(titles(await getAllGames(db, { categoryIds: [catA] }))).toEqual(['G1', 'G2']);
            expect(titles(await getAllGames(db, { categoryIds: [catA, catB] }))).toEqual(['G1', 'G2', 'G3']);
        });

        it('filters by publisher', async () => {
            expect(titles(await getAllGames(db, { publisherId: pubX }))).toEqual(['G1', 'G3']);
        });

        it('combines category and publisher filters', async () => {
            expect(titles(await getAllGames(db, { categoryIds: [catB], publisherId: pubX }))).toEqual(['G3']);
            expect(await getAllGames(db, { categoryIds: [catB], publisherId: pubY })).toEqual([]);
        });

        it('treats empty filters as no filter', async () => {
            expect(await getAllGames(db, { categoryIds: [] })).toHaveLength(3);
        });

        it('lists categories and publishers ordered by name', async () => {
            expect((await getAllCategories(db)).map((c) => c.name)).toEqual(['Alpha', 'Beta']);
            expect((await getAllPublishers(db)).map((p) => p.name)).toEqual(['Pub X', 'Pub Y']);
        });
    });
});
