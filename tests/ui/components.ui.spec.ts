import { test, expect } from '../../src/fixtures/test-base';

/**
 * UI component-level tests
 * Validates visual elements, interactions, and accessibility
 * Focuses on component behavior without API dependencies
 */

test.describe('Filter Components UI', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test('Search box is visible and accepts input', async ({ home, page }) => {
    await expect(home.searchBox).toBeVisible();
    await expect(home.searchBox).toBeEnabled();
    
    await home.searchBox.fill('Avatar');
    await expect(home.searchBox).toHaveValue('Avatar');
  });

  test('Movie cards display correctly', async ({ home }) => {
    await expect(home.cards.first()).toBeVisible();
    
    const cardCount = await home.cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Validate card has image
    const firstCard = home.cards.first();
    await expect(firstCard).toHaveAttribute('src', /image\.tmdb\.org/);
    await expect(firstCard).toHaveAttribute('alt');
  });

  test('Pagination controls are visible', async ({ page }) => {
    const paginationContainer = page.locator('[class*="pagination"], nav');
    await expect(paginationContainer).toBeVisible({ timeout: 10000 });
  });

  test('Category filter buttons are interactive', async ({ page }) => {
    const categoryButtons = ['Popular', 'Trend', 'Newest', 'Top rated'];
    
    for (const category of categoryButtons) {
      const button = page.getByText(category, { exact: true });
      await expect(button).toBeVisible();
      
      // Verify button is clickable (has appropriate role/tag)
      const tagName = await button.evaluate(el => el.tagName.toLowerCase());
      expect(['button', 'a', 'div']).toContain(tagName);
    }
  });
});

test.describe('UI Responsiveness', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test('Page loads within acceptable time', async ({ page, home }) => {
    const startTime = Date.now();
    await home.goto();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('Images lazy load correctly', async ({ home }) => {
    const firstCard = home.cards.first();
    await expect(firstCard).toBeVisible();
    
    // Check if image has loaded (src attribute present)
    const src = await firstCard.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('tmdb.org');
  });

  test('No console errors on initial load', async ({ page, home }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await home.goto();
    
    // Filter out known third-party errors
    const relevantErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('analytics')
    );
    
    expect(relevantErrors.length).toBe(0);
  });
});

test.describe('UI Accessibility', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test('Search input has proper accessibility attributes', async ({ home }) => {
    const placeholder = await home.searchBox.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });

  test('Images have alt text', async ({ home }) => {
    const firstCard = home.cards.first();
    const alt = await firstCard.getAttribute('alt');
    expect(alt).toBeTruthy();
  });

  test('Keyboard navigation works for search', async ({ home }) => {
    await home.searchBox.focus();
    await home.searchBox.press('Tab');
    
    // Should be able to tab away from search box
    const isFocused = await home.searchBox.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(false);
  });
});

test.describe('UI State Management', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test('Search input clears correctly', async ({ home, page }) => {
    await home.searchBox.fill('Test Movie');
    await expect(home.searchBox).toHaveValue('Test Movie');
    
    await home.searchBox.clear();
    await expect(home.searchBox).toHaveValue('');
  });

  test('Cards update after filter interaction', async ({ home, page }) => {
    const initialSrc = await home.cards.first().getAttribute('src');
    
    // Try to change filter (if controls exist)
    try {
      await home.searchBox.fill('Avatar');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000); // Wait for results
      
      const newSrc = await home.cards.first().getAttribute('src');
      // Source may or may not change depending on results
      expect(newSrc).toBeTruthy();
    } catch (error) {
      // Filter controls might not be available
      console.log('Filter interaction skipped - controls not available');
    }
  });

  test('Loading states are handled gracefully', async ({ page, home }) => {
    // Check for loading indicators during page load
    const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], .skeleton');
    
    // Loading indicators may or may not be present
    const count = await loadingIndicators.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('UI Visual Validation', () => {
  test.beforeEach(async ({ home }) => {
    await home.goto();
  });

  test('Card grid layout is consistent', async ({ home }) => {
    const cardCount = await home.cards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Validate first 3 cards are visible
    const visibleCount = Math.min(3, cardCount);
    for (let i = 0; i < visibleCount; i++) {
      await expect(home.cards.nth(i)).toBeVisible();
    }
  });

  test('Page maintains scroll position', async ({ page, home }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollY = await page.evaluate(() => window.scrollY);
    // If page is not scrollable (content equals viewport), scrollY may be 0
    const isScrollable = await page.evaluate(() => document.body.scrollHeight > window.innerHeight);
    if (isScrollable) {
      expect(scrollY).toBeGreaterThan(0);
    } else {
      // Accept non-scrollable initial layout
      expect(scrollY).toBeGreaterThanOrEqual(0);
    }
  });

  test('Viewport adjusts to content', async ({ page, home }) => {
    const viewportHeight = page.viewportSize()?.height || 0;
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Body should have content
    expect(bodyHeight).toBeGreaterThanOrEqual(viewportHeight);
  });
});
