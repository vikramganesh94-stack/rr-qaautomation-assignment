import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page.js';
import { logger } from '../utils/logger.js';

export type Fixtures = {
  home: HomePage;
};

export const test = base.extend<Fixtures>({
  home: async ({ page }, use) => {
    const home = new HomePage(page);
    await use(home);
  },
});

export const expect = base.expect;
export const log = logger;
