import { test, expect, log } from '../../src/fixtures/test-base.js';
import { waitForDiscoveryResponse } from '../../src/utils/api.js';

const genreOption = process.env.GENRE ?? 'Action';
const titleKeyword = process.env.TITLE_KEYWORD ?? 'Avatar';

test.beforeEach(async ({ home }) => {
  await home.goto();
});

test('Type filter toggles between Movie and TV', async ({ home }) => {
  await home.selectType('Movie');
  await home.selectType('TV');
});

test('Genre filter limits results', async ({ home }) => {
  await home.selectGenre(genreOption);
});

test('Year range narrows results', async ({ home }) => {
  await home.setYearRange(2020, 2025);
});

test('Rating threshold enforces minimum rating', async ({ home }) => {
  await home.setRating(7);
});

test('Title search returns matching items', async ({ home }) => {
  await home.searchTitle(titleKeyword);
});

test('Category quick links trigger correct API', async ({ home, page }) => {
  const categories = ['Popular', 'Trend', 'Newest', 'Top rated'];
  for (const category of categories) {
    log.info({ category }, 'Applying category filter');
    await page.getByRole('link', { name: new RegExp(category, 'i') }).click();
    const api = await waitForDiscoveryResponse(page, ['popular', 'trend', 'new', 'top']);
    expect(api.status).toBe(200);
    expect(await home.cards.count()).toBeGreaterThan(0);
  }
});
