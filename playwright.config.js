// playwright.config.js — tuned for a 4 GB RAM laptop ("lite" mode).
//
// Design goals:
//   • Zero browser download — drive the system Google Chrome via `channel: 'chrome'`.
//   • Only ONE worker, no traces / videos / screenshots, tiny viewport.
//   • Chrome launch flags that slash RAM per tab (single renderer, small JS heap, no GPU, no images).
//   • Fail fast, no retries, dot reporter (minimal stdout pressure).
//
// Run:   npx playwright test            (or: playwright test, since it is installed globally)
// UI:    npx playwright test --ui       (avoid on 4 GB if possible)
// Headed: npx playwright test --headed  (rarely — costs more RAM)

import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
    // E2E specs live here (kept separate from PHP tests in tests/Feature and tests/Unit).
    testDir: './tests/e2e',

    // Never run files in parallel — one browser tab at a time.
    fullyParallel: false,
    workers: 1,

    // Fail fast on a small machine.
    retries: 0,
    forbidOnly: isCI,
    reporter: [['dot'], ['list', { printSteps: false }]],

    // Timeouts kept generous enough for a cold artisan serve, but not infinite.
    // Override on a heavily loaded machine, e.g.: PW_TIMEOUT=90000 PW_NAV_TIMEOUT=60000
    timeout: Number(process.env.PW_TIMEOUT || 30_000),
    expect: { timeout: Number(process.env.PW_EXPECT_TIMEOUT || 5_000) },

    use: {
        // Point this at your running Laravel dev server:  `php artisan serve`
        baseURL: process.env.APP_URL || 'http://127.0.0.1:8000',

        // Always headless — headed Chrome eats ~300 MB extra per instance.
        headless: true,

        // Small viewport keeps the compositor & paint buffers tiny.
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,

        // Store nothing — these artefacts are the biggest hidden RAM/disk cost.
        trace: 'off',
        video: 'off',
        screenshot: 'off',
        contextOptions: {
            reducedMotion: 'reduce',
        },

        // Down-load nothing extra during the run.
        offline: false,

        // Faster failure signal on a slow machine.
        actionTimeout: Number(process.env.PW_ACTION_TIMEOUT || 10_000),
        navigationTimeout: Number(process.env.PW_NAV_TIMEOUT || 20_000),
    },

    projects: [
        {
            name: 'chromium-lite',
            use: {
                ...devices['Desktop Chrome'],

                // Use the SYSTEM Google Chrome (channel: 'chrome').
                // This skips Playwright's bundled Chromium download (403-blocked CDN here)
                // AND keeps the install footprint at ~0 MB.
                channel: 'chrome',

                launchOptions: {
                    executablePath: process.env.PLAYWRIGHT_CHROME_PATH || undefined,
                    args: [
                        // --- stability + memory savers that are known-safe with system Chrome ---
                        '--no-sandbox',                    // required on many Linux user setups
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',         // avoid /dev/shm exhaustion on small VMs
                        '--disable-gpu',                   // no GPU process
                        '--disable-extensions',            // no extension processes
                        '--disable-background-networking',
                        '--disable-component-update',
                        '--disable-default-apps',
                        '--disable-sync',
                        '--disable-translate',
                        '--no-first-run',
                        '--no-default-browser-check',
                        '--metrics-recording-only',
                        '--mute-audio',
                        // V8 heap cap keeps the JS engine from ballooning on 4 GB machines.
                        '--js-flags=--max-old-space-size=384',
                    ],
                },
            },
        },
        {
            // Firefox option for the 4 GB machine. Uses Playwright's bundled
            // Firefox (no system channel). Headless / 1 worker / no artefacts are
            // inherited from the top-level `use`. Run only when explicitly chosen:
            //   npx playwright test --project=firefox-lite --workers=1
            name: 'firefox-lite',
            use: {
                ...devices['Desktop Firefox'],
            },
        },
    ],
});
