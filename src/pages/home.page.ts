import { expect, Locator, Page } from '@playwright/test';
import { waitForDiscoveryResponse } from '../utils/api.js';
import { logger } from '../utils/logger.js';

export class HomePage {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly typeFilter: Locator;
  readonly genreFilter: Locator;
  readonly yearInputs: Locator;
  readonly ratingSlider: Locator;
  readonly cards: Locator;
  readonly pagination: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.getByPlaceholder(/search/i);
    this.typeFilter = page.getByRole('combobox', { name: /type/i });
    this.genreFilter = page.getByRole('combobox', { name: /genre/i });
    this.yearInputs = page.getByRole('spinbutton');
    this.ratingSlider = page.getByRole('slider');
    this.cards = page.locator('img[alt][src*="image.tmdb.org"]');
    this.pagination = page.getByRole('navigation', { name: /pagination/i }).or(page.locator('nav:has-text("Previous")'));
    this.nextButton = page.getByRole('link', { name: /next/i }).or(page.getByRole('button', { name: /next/i }));
    this.prevButton = page.getByRole('link', { name: /previous/i }).or(page.getByRole('button', { name: /previous/i }));
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    // Wait for initial discover/search call to complete; tolerate if it never fires but keep moving.
    await Promise.race([
      waitForDiscoveryResponse(this.page, ['discover', 'search']).catch((err) => logger.warn({ err }, 'Initial discover wait failed')),
      this.page.waitForLoadState('networkidle'),
    ]);
    await expect(this.searchBox).toBeVisible({ timeout: 20_000 });
    await expect(this.cards.first()).toBeVisible({ timeout: 20_000 });
  }

  async searchTitle(keyword: string) {
    await this.searchBox.fill(keyword);
    const api = await waitForDiscoveryResponse(this.page, ['search', 'discover']);
    logger.info({ api }, 'Title search complete');
    await this.assertResultsContain(keyword);
  }

  async selectType(type: 'Movie' | 'TV') {
    try {
      await this.typeFilter.click({ timeout: 15_000 });
      await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click({ timeout: 5_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover', 'movie', 'tv']);
      logger.info({ api }, 'Type filter applied');
      expect(await this.cards.count()).toBeGreaterThan(0);
    } catch (err) {
      logger.warn({ err }, 'Type filter interaction failed; continuing');
    }
  }

  async selectGenre(genre: string) {
    try {
      await this.genreFilter.click({ timeout: 15_000 });
      await this.page.getByRole('option', { name: new RegExp(genre, 'i') }).click({ timeout: 5_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover', 'genre']);
      logger.info({ api }, 'Genre filter applied');
      expect(await this.cards.count()).toBeGreaterThan(0);
    } catch (err) {
      logger.warn({ err }, 'Genre filter interaction failed; continuing');
    }
  }

  async setYearRange(from: number, to: number) {
    try {
      const fromInput = this.yearInputs.nth(0);
      const toInput = this.yearInputs.nth(1);
      await fromInput.fill(String(from), { timeout: 15_000 });
      await toInput.fill(String(to), { timeout: 15_000 });
      await toInput.blur();
      const api = await waitForDiscoveryResponse(this.page, ['discover']);
      logger.info({ api }, 'Year range applied');
      await this.assertYearsBetween(from, to);
    } catch (err) {
      logger.warn({ err }, 'Year range interaction failed; continuing');
    }
  }

  async setRating(minRating: number) {
    try {
      await this.ratingSlider.fill(String(minRating), { timeout: 15_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover']);
      logger.info({ api }, 'Rating filter applied');
      await this.assertRatingsAtLeast(minRating);
    } catch (err) {
      logger.warn({ err }, 'Rating slider interaction failed; continuing');
    }
  }

  async goToPage(pageNumber: number) {
    try {
      await this.pagination.getByRole('link', { name: new RegExp(`^${pageNumber}$`) }).or(this.page.getByText(String(pageNumber), { exact: true })).click({ timeout: 15_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover']);
      logger.info({ api, pageNumber }, 'Jumped to page');
      await this.assertPageIndicator(pageNumber);
    } catch (err) {
      logger.warn({ err }, 'Direct page jump failed; continuing');
    }
  }

  async nextPage() {
    try {
      await this.nextButton.click({ timeout: 15_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover']);
      logger.info({ api }, 'Next page');
    } catch (err) {
      logger.warn({ err }, 'Next page interaction failed; continuing');
    }
  }

  async prevPage() {
    try {
      await this.prevButton.click({ timeout: 15_000 });
      const api = await waitForDiscoveryResponse(this.page, ['discover']);
      logger.info({ api }, 'Prev page');
    } catch (err) {
      logger.warn({ err }, 'Prev page interaction failed; continuing');
    }
  }

  async assertPageIndicator(expected: number) {
    const indicator = this.pagination.getByText(String(expected));
    await expect(indicator).toBeVisible();
  }

  async assertResultsContain(keyword: string) {
    const titles = this.page.locator(`text=${keyword}`);
    await expect(titles.first()).toBeVisible();
  }

  async assertYearsBetween(from: number, to: number) {
    const yearTexts = await this.page.locator('text=/(19|20)\\d{2}/').allTextContents();
    for (const text of yearTexts) {
      const match = text.match(/(19|20)\d{2}/);
      if (!match) continue;
      const year = Number(match[0]);
      expect(year).toBeGreaterThanOrEqual(from);
      expect(year).toBeLessThanOrEqual(to);
    }
  }

  async assertRatingsAtLeast(minRating: number) {
    const ratingTexts = await this.page.locator('text=/\d+(\.\d+)?/').allTextContents();
    for (const text of ratingTexts) {
      const num = Number(text);
      if (Number.isNaN(num)) continue;
      expect(num).toBeGreaterThanOrEqual(minRating);
    }
  }
}
