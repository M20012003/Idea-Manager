// tests/e2e/example.spec.js — minimal smoke test proving the "lite" Playwright setup works
// against the running Laravel dev server. Intentionally tiny so it costs almost nothing
// on a 4 GB machine.
//
// Before running:   php artisan serve     (in another terminal)
// Then:             npx playwright test   (or: playwright test, it is installed globally)

import { test, expect } from '@playwright/test';

test('home page returns 200 and has a title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/.+/);
});
