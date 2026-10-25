import { defineConfig, devices } from '@playwright/test';

// The site is static: serve the folder (tests/serve.mjs) and test it in desktop Chrome, a Pixel and an iPhone (WebKit).
// Chromium projects use the installed Google Chrome (`channel: 'chrome'`), so only WebKit is downloaded.
const PORT = 4173;

const targets = {
  'desktop-chrome': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
  'pixel-7': { ...devices['Pixel 7'], channel: 'chrome' },
  'iphone-14': { ...devices['iPhone 14'] },
};

export default defineConfig({
  testDir: 'tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `node tests/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'ignore',
  },
  projects: [
    ...Object.entries(targets).map(([name, use]) => ({ name, use, testIgnore: /timing\.spec/ })),
    // The first-visit stopwatch runs as its own stage once everything else is done, so parallel
    // tests don't skew it. If any earlier test fails, this stage is skipped ("did not run").
    ...Object.entries(targets).map(([name, use]) => ({ name: `${name}-timing`, use, testMatch: /timing\.spec/, dependencies: Object.keys(targets) })),
  ],
});
