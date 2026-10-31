import { test, expect } from '@playwright/test';

/** E2E tests for the home page category and publisher filters. */
test.describe('Game filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters by category and can be cleared', async ({ page }) => {
    const cards = page.getByTestId('game-card');
    const total = await cards.count();
    const firstCategory = page.locator('[data-testid^="filter-category-"]').first();

    await firstCategory.check();
    const filtered = await cards.locator('visible=true').count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);

    await page.getByTestId('filter-clear').click();
    await expect(cards.locator('visible=true')).toHaveCount(total);
  });

  test('filters by publisher', async ({ page }) => {
    const cards = page.getByTestId('game-card');
    const total = await cards.count();
    await page.getByTestId('filter-publisher').selectOption({ index: 1 });
    const filtered = await cards.locator('visible=true').count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);
  });

  test('combines category and publisher filters', async ({ page }) => {
    const cards = page.getByTestId('game-card');
    await page.getByTestId('filter-publisher').selectOption({ index: 1 });
    const publisherOnly = await cards.locator('visible=true').count();

    const categories = page.locator('[data-testid^="filter-category-"]');
    const count = await categories.count();
    for (let i = 0; i < count; i++) {
      await categories.nth(i).check();
      const combined = await cards.locator('visible=true').count();
      expect(combined).toBeLessThanOrEqual(publisherOnly);
      await categories.nth(i).uncheck();
    }
  });

  test('shows an empty state when nothing matches', async ({ page }) => {
    const categories = page.locator('[data-testid^="filter-category-"]');
    const options = page.getByTestId('filter-publisher').locator('option');
    const cards = page.getByTestId('game-card');
    // Find a category/publisher pair with no games.
    for (let c = 0; c < (await categories.count()); c++) {
      await categories.nth(c).check();
      for (let p = 1; p < (await options.count()); p++) {
        await page.getByTestId('filter-publisher').selectOption({ index: p });
        if ((await cards.locator('visible=true').count()) === 0) {
          await expect(page.getByTestId('filter-empty')).toBeVisible();
          return;
        }
      }
      await categories.nth(c).uncheck();
    }
    test.skip(true, 'Every category/publisher pair has games in the seed data');
  });

  test('filter controls are keyboard accessible', async ({ page }) => {
    const first = page.locator('[data-testid^="filter-category-"]').first();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toBeChecked();
  });
});
