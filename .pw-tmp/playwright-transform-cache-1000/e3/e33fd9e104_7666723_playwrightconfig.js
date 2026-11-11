// cd1ed484cb0b6ce0db44bca25875709319973fe8
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
  reporter: [['dot'], ['list', {
    printSteps: false
  }]],
  // Timeouts kept generous enough for a cold artisan serve, but not infinite.
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    // Point this at your running Laravel dev server:  `php artisan serve`
    baseURL: process.env.APP_URL || 'http://127.0.0.1:8000',
    // Always headless — headed Chrome eats ~300 MB extra per instance.
    headless: true,
    // Small viewport keeps the compositor & paint buffers tiny.
    viewport: {
      width: 1280,
      height: 720
    },
    deviceScaleFactor: 1,
    // Store nothing — these artefacts are the biggest hidden RAM/disk cost.
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    contextOptions: {
      reducedMotion: 'reduce'
    },
    // Down-load nothing extra during the run.
    offline: false,
    // Faster failure signal on a slow machine.
    actionTimeout: 10_000,
    navigationTimeout: 20_000
  },
  projects: [{
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
        '--no-sandbox',
        // required on many Linux user setups
        '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        // avoid /dev/shm exhaustion on small VMs
        '--disable-gpu',
        // no GPU process
        '--disable-extensions',
        // no extension processes
        '--disable-background-networking', '--disable-component-update', '--disable-default-apps', '--disable-sync', '--disable-translate', '--no-first-run', '--no-default-browser-check', '--metrics-recording-only', '--mute-audio',
        // V8 heap cap keeps the JS engine from ballooning on 4 GB machines.
        '--js-flags=--max-old-space-size=384']
      }
    }
  }]
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZpbmVDb25maWciLCJkZXZpY2VzIiwiaXNDSSIsInByb2Nlc3MiLCJlbnYiLCJDSSIsInRlc3REaXIiLCJmdWxseVBhcmFsbGVsIiwid29ya2VycyIsInJldHJpZXMiLCJmb3JiaWRPbmx5IiwicmVwb3J0ZXIiLCJwcmludFN0ZXBzIiwidGltZW91dCIsImV4cGVjdCIsInVzZSIsImJhc2VVUkwiLCJBUFBfVVJMIiwiaGVhZGxlc3MiLCJ2aWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0IiwiZGV2aWNlU2NhbGVGYWN0b3IiLCJ0cmFjZSIsInZpZGVvIiwic2NyZWVuc2hvdCIsImNvbnRleHRPcHRpb25zIiwicmVkdWNlZE1vdGlvbiIsIm9mZmxpbmUiLCJhY3Rpb25UaW1lb3V0IiwibmF2aWdhdGlvblRpbWVvdXQiLCJwcm9qZWN0cyIsIm5hbWUiLCJjaGFubmVsIiwibGF1bmNoT3B0aW9ucyIsImV4ZWN1dGFibGVQYXRoIiwiUExBWVdSSUdIVF9DSFJPTUVfUEFUSCIsInVuZGVmaW5lZCIsImFyZ3MiXSwic291cmNlcyI6WyJwbGF5d3JpZ2h0LmNvbmZpZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwbGF5d3JpZ2h0LmNvbmZpZy5qcyDigJQgdHVuZWQgZm9yIGEgNCBHQiBSQU0gbGFwdG9wIChcImxpdGVcIiBtb2RlKS5cbi8vXG4vLyBEZXNpZ24gZ29hbHM6XG4vLyAgIOKAoiBaZXJvIGJyb3dzZXIgZG93bmxvYWQg4oCUIGRyaXZlIHRoZSBzeXN0ZW0gR29vZ2xlIENocm9tZSB2aWEgYGNoYW5uZWw6ICdjaHJvbWUnYC5cbi8vICAg4oCiIE9ubHkgT05FIHdvcmtlciwgbm8gdHJhY2VzIC8gdmlkZW9zIC8gc2NyZWVuc2hvdHMsIHRpbnkgdmlld3BvcnQuXG4vLyAgIOKAoiBDaHJvbWUgbGF1bmNoIGZsYWdzIHRoYXQgc2xhc2ggUkFNIHBlciB0YWIgKHNpbmdsZSByZW5kZXJlciwgc21hbGwgSlMgaGVhcCwgbm8gR1BVLCBubyBpbWFnZXMpLlxuLy8gICDigKIgRmFpbCBmYXN0LCBubyByZXRyaWVzLCBkb3QgcmVwb3J0ZXIgKG1pbmltYWwgc3Rkb3V0IHByZXNzdXJlKS5cbi8vXG4vLyBSdW46ICAgbnB4IHBsYXl3cmlnaHQgdGVzdCAgICAgICAgICAgIChvcjogcGxheXdyaWdodCB0ZXN0LCBzaW5jZSBpdCBpcyBpbnN0YWxsZWQgZ2xvYmFsbHkpXG4vLyBVSTogICAgbnB4IHBsYXl3cmlnaHQgdGVzdCAtLXVpICAgICAgIChhdm9pZCBvbiA0IEdCIGlmIHBvc3NpYmxlKVxuLy8gSGVhZGVkOiBucHggcGxheXdyaWdodCB0ZXN0IC0taGVhZGVkICAocmFyZWx5IOKAlCBjb3N0cyBtb3JlIFJBTSlcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBkZXZpY2VzIH0gZnJvbSAnQHBsYXl3cmlnaHQvdGVzdCc7XG5cbmNvbnN0IGlzQ0kgPSAhIXByb2Nlc3MuZW52LkNJO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIC8vIEUyRSBzcGVjcyBsaXZlIGhlcmUgKGtlcHQgc2VwYXJhdGUgZnJvbSBQSFAgdGVzdHMgaW4gdGVzdHMvRmVhdHVyZSBhbmQgdGVzdHMvVW5pdCkuXG4gICAgdGVzdERpcjogJy4vdGVzdHMvZTJlJyxcblxuICAgIC8vIE5ldmVyIHJ1biBmaWxlcyBpbiBwYXJhbGxlbCDigJQgb25lIGJyb3dzZXIgdGFiIGF0IGEgdGltZS5cbiAgICBmdWxseVBhcmFsbGVsOiBmYWxzZSxcbiAgICB3b3JrZXJzOiAxLFxuXG4gICAgLy8gRmFpbCBmYXN0IG9uIGEgc21hbGwgbWFjaGluZS5cbiAgICByZXRyaWVzOiAwLFxuICAgIGZvcmJpZE9ubHk6IGlzQ0ksXG4gICAgcmVwb3J0ZXI6IFtbJ2RvdCddLCBbJ2xpc3QnLCB7IHByaW50U3RlcHM6IGZhbHNlIH1dXSxcblxuICAgIC8vIFRpbWVvdXRzIGtlcHQgZ2VuZXJvdXMgZW5vdWdoIGZvciBhIGNvbGQgYXJ0aXNhbiBzZXJ2ZSwgYnV0IG5vdCBpbmZpbml0ZS5cbiAgICB0aW1lb3V0OiAzMF8wMDAsXG4gICAgZXhwZWN0OiB7IHRpbWVvdXQ6IDVfMDAwIH0sXG5cbiAgICB1c2U6IHtcbiAgICAgICAgLy8gUG9pbnQgdGhpcyBhdCB5b3VyIHJ1bm5pbmcgTGFyYXZlbCBkZXYgc2VydmVyOiAgYHBocCBhcnRpc2FuIHNlcnZlYFxuICAgICAgICBiYXNlVVJMOiBwcm9jZXNzLmVudi5BUFBfVVJMIHx8ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnLFxuXG4gICAgICAgIC8vIEFsd2F5cyBoZWFkbGVzcyDigJQgaGVhZGVkIENocm9tZSBlYXRzIH4zMDAgTUIgZXh0cmEgcGVyIGluc3RhbmNlLlxuICAgICAgICBoZWFkbGVzczogdHJ1ZSxcblxuICAgICAgICAvLyBTbWFsbCB2aWV3cG9ydCBrZWVwcyB0aGUgY29tcG9zaXRvciAmIHBhaW50IGJ1ZmZlcnMgdGlueS5cbiAgICAgICAgdmlld3BvcnQ6IHsgd2lkdGg6IDEyODAsIGhlaWdodDogNzIwIH0sXG4gICAgICAgIGRldmljZVNjYWxlRmFjdG9yOiAxLFxuXG4gICAgICAgIC8vIFN0b3JlIG5vdGhpbmcg4oCUIHRoZXNlIGFydGVmYWN0cyBhcmUgdGhlIGJpZ2dlc3QgaGlkZGVuIFJBTS9kaXNrIGNvc3QuXG4gICAgICAgIHRyYWNlOiAnb2ZmJyxcbiAgICAgICAgdmlkZW86ICdvZmYnLFxuICAgICAgICBzY3JlZW5zaG90OiAnb2ZmJyxcbiAgICAgICAgY29udGV4dE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHJlZHVjZWRNb3Rpb246ICdyZWR1Y2UnLFxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIERvd24tbG9hZCBub3RoaW5nIGV4dHJhIGR1cmluZyB0aGUgcnVuLlxuICAgICAgICBvZmZsaW5lOiBmYWxzZSxcblxuICAgICAgICAvLyBGYXN0ZXIgZmFpbHVyZSBzaWduYWwgb24gYSBzbG93IG1hY2hpbmUuXG4gICAgICAgIGFjdGlvblRpbWVvdXQ6IDEwXzAwMCxcbiAgICAgICAgbmF2aWdhdGlvblRpbWVvdXQ6IDIwXzAwMCxcbiAgICB9LFxuXG4gICAgcHJvamVjdHM6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ2Nocm9taXVtLWxpdGUnLFxuICAgICAgICAgICAgdXNlOiB7XG4gICAgICAgICAgICAgICAgLi4uZGV2aWNlc1snRGVza3RvcCBDaHJvbWUnXSxcblxuICAgICAgICAgICAgICAgIC8vIFVzZSB0aGUgU1lTVEVNIEdvb2dsZSBDaHJvbWUgKGNoYW5uZWw6ICdjaHJvbWUnKS5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNraXBzIFBsYXl3cmlnaHQncyBidW5kbGVkIENocm9taXVtIGRvd25sb2FkICg0MDMtYmxvY2tlZCBDRE4gaGVyZSlcbiAgICAgICAgICAgICAgICAvLyBBTkQga2VlcHMgdGhlIGluc3RhbGwgZm9vdHByaW50IGF0IH4wIE1CLlxuICAgICAgICAgICAgICAgIGNoYW5uZWw6ICdjaHJvbWUnLFxuXG4gICAgICAgICAgICAgICAgbGF1bmNoT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBleGVjdXRhYmxlUGF0aDogcHJvY2Vzcy5lbnYuUExBWVdSSUdIVF9DSFJPTUVfUEFUSCB8fCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0tLSBzdGFiaWxpdHkgKyBtZW1vcnkgc2F2ZXJzIHRoYXQgYXJlIGtub3duLXNhZmUgd2l0aCBzeXN0ZW0gQ2hyb21lIC0tLVxuICAgICAgICAgICAgICAgICAgICAgICAgJy0tbm8tc2FuZGJveCcsICAgICAgICAgICAgICAgICAgICAvLyByZXF1aXJlZCBvbiBtYW55IExpbnV4IHVzZXIgc2V0dXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAnLS1kaXNhYmxlLXNldHVpZC1zYW5kYm94JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICctLWRpc2FibGUtZGV2LXNobS11c2FnZScsICAgICAgICAgLy8gYXZvaWQgL2Rldi9zaG0gZXhoYXVzdGlvbiBvbiBzbWFsbCBWTXNcbiAgICAgICAgICAgICAgICAgICAgICAgICctLWRpc2FibGUtZ3B1JywgICAgICAgICAgICAgICAgICAgLy8gbm8gR1BVIHByb2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICctLWRpc2FibGUtZXh0ZW5zaW9ucycsICAgICAgICAgICAgLy8gbm8gZXh0ZW5zaW9uIHByb2Nlc3Nlc1xuICAgICAgICAgICAgICAgICAgICAgICAgJy0tZGlzYWJsZS1iYWNrZ3JvdW5kLW5ldHdvcmtpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy0tZGlzYWJsZS1jb21wb25lbnQtdXBkYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICctLWRpc2FibGUtZGVmYXVsdC1hcHBzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICctLWRpc2FibGUtc3luYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLS1kaXNhYmxlLXRyYW5zbGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLS1uby1maXJzdC1ydW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy0tbm8tZGVmYXVsdC1icm93c2VyLWNoZWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICctLW1ldHJpY3MtcmVjb3JkaW5nLW9ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy0tbXV0ZS1hdWRpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBWOCBoZWFwIGNhcCBrZWVwcyB0aGUgSlMgZW5naW5lIGZyb20gYmFsbG9vbmluZyBvbiA0IEdCIG1hY2hpbmVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgJy0tanMtZmxhZ3M9LS1tYXgtb2xkLXNwYWNlLXNpemU9Mzg0JyxcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICBdLFxufSk7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsWUFBWSxFQUFFQyxPQUFPLFFBQVEsa0JBQWtCO0FBRXhELE1BQU1DLElBQUksR0FBRyxDQUFDLENBQUNDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxFQUFFO0FBRTdCLGVBQWVMLFlBQVksQ0FBQztFQUN4QjtFQUNBTSxPQUFPLEVBQUUsYUFBYTtFQUV0QjtFQUNBQyxhQUFhLEVBQUUsS0FBSztFQUNwQkMsT0FBTyxFQUFFLENBQUM7RUFFVjtFQUNBQyxPQUFPLEVBQUUsQ0FBQztFQUNWQyxVQUFVLEVBQUVSLElBQUk7RUFDaEJTLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7SUFBRUMsVUFBVSxFQUFFO0VBQU0sQ0FBQyxDQUFDLENBQUM7RUFFcEQ7RUFDQUMsT0FBTyxFQUFFLE1BQU07RUFDZkMsTUFBTSxFQUFFO0lBQUVELE9BQU8sRUFBRTtFQUFNLENBQUM7RUFFMUJFLEdBQUcsRUFBRTtJQUNEO0lBQ0FDLE9BQU8sRUFBRWIsT0FBTyxDQUFDQyxHQUFHLENBQUNhLE9BQU8sSUFBSSx1QkFBdUI7SUFFdkQ7SUFDQUMsUUFBUSxFQUFFLElBQUk7SUFFZDtJQUNBQyxRQUFRLEVBQUU7TUFBRUMsS0FBSyxFQUFFLElBQUk7TUFBRUMsTUFBTSxFQUFFO0lBQUksQ0FBQztJQUN0Q0MsaUJBQWlCLEVBQUUsQ0FBQztJQUVwQjtJQUNBQyxLQUFLLEVBQUUsS0FBSztJQUNaQyxLQUFLLEVBQUUsS0FBSztJQUNaQyxVQUFVLEVBQUUsS0FBSztJQUNqQkMsY0FBYyxFQUFFO01BQ1pDLGFBQWEsRUFBRTtJQUNuQixDQUFDO0lBRUQ7SUFDQUMsT0FBTyxFQUFFLEtBQUs7SUFFZDtJQUNBQyxhQUFhLEVBQUUsTUFBTTtJQUNyQkMsaUJBQWlCLEVBQUU7RUFDdkIsQ0FBQztFQUVEQyxRQUFRLEVBQUUsQ0FDTjtJQUNJQyxJQUFJLEVBQUUsZUFBZTtJQUNyQmpCLEdBQUcsRUFBRTtNQUNELEdBQUdkLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztNQUU1QjtNQUNBO01BQ0E7TUFDQWdDLE9BQU8sRUFBRSxRQUFRO01BRWpCQyxhQUFhLEVBQUU7UUFDWEMsY0FBYyxFQUFFaEMsT0FBTyxDQUFDQyxHQUFHLENBQUNnQyxzQkFBc0IsSUFBSUMsU0FBUztRQUMvREMsSUFBSSxFQUFFO1FBQ0Y7UUFDQSxjQUFjO1FBQXFCO1FBQ25DLDBCQUEwQixFQUMxQix5QkFBeUI7UUFBVTtRQUNuQyxlQUFlO1FBQW9CO1FBQ25DLHNCQUFzQjtRQUFhO1FBQ25DLGlDQUFpQyxFQUNqQyw0QkFBNEIsRUFDNUIsd0JBQXdCLEVBQ3hCLGdCQUFnQixFQUNoQixxQkFBcUIsRUFDckIsZ0JBQWdCLEVBQ2hCLDRCQUE0QixFQUM1QiwwQkFBMEIsRUFDMUIsY0FBYztRQUNkO1FBQ0EscUNBQXFDO01BRTdDO0lBQ0o7RUFDSixDQUFDO0FBRVQsQ0FBQyxDQUFDIiwiaWdub3JlTGlzdCI6W119