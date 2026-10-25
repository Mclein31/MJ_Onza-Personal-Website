import { defineConfig, devices } from '@playwright/test';

// The site is static: serve the folder (tests/serve.mjs) and test it in desktop Chrome, a Pixel and an iPhone (WebKit).
// Chromium projects use the installed Google Chrome (`channel: 'chrome'`), so only WebKit is downloaded.
const PORT = 4173;

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
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } } },
    { name: 'pixel-7', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'iphone-14', use: { ...devices['iPhone 14'] } },
  ],
});
