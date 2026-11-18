import { defineConfig, devices } from '@playwright/test';

// The site is static: serve the folder (tests/serve.mjs) and test it in desktop Chrome, a Pixel and an iPhone (WebKit).
// Chromium projects use the installed Google Chrome (`channel: 'chrome'`), so only WebKit is downloaded.
const PORT = 4173;

const targets = {
  'desktop-chrome': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
  'pixel-7': { ...devices['Pixel 7'], channel: 'chrome' },
  'iphone-14': { ...devices['iPhone 14'] },
};

// Redesign QA matrix (scoped to tests/redesign.spec.mjs so legacy specs keep running only on the 3 base targets).
const redesignTargets = {
  'iphone-se': { ...devices['iPhone SE (3rd gen)'] },
  'iphone-16-pro-max': { ...devices['iPhone 16 Pro Max'], viewport: { width: 440, height: 956 } },
  'iphone-duo-folded': {
    ...devices['iPhone 16 Pro Max'],
    viewport: { width: 466, height: 678 },
    screen: { width: 466, height: 678 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iphone-duo-portrait': {
    ...devices['iPhone 16 Pro Max'],
    viewport: { width: 626, height: 890 },
    screen: { width: 626, height: 890 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'iphone-duo-landscape': {
    ...devices['iPhone 16 Pro Max'],
    viewport: { width: 890, height: 626 },
    screen: { width: 890, height: 626 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: 'webkit',
  },
  'ipad-mini': {
    ...devices['iPad Mini'],
    viewport: { width: 744, height: 1133 },
    screen: { width: 744, height: 1133 },
  },
  'ipad-pro-13': {
    ...devices['iPad Pro 11'],
    viewport: { width: 1032, height: 1376 },
    screen: { width: 1032, height: 1376 },
  },
  'desktop-1280': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 800 } },
  'desktop-1920': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1920, height: 1080 } },
  'desktop-2560': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 2560, height: 1440 } },
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
    ...Object.entries(targets).map(([name, use]) => ({ name: `${name}-timing`, use, testMatch: /timing\.spec/, dependencies: Object.keys(targets) })),
    ...Object.entries(redesignTargets).map(([name, use]) => ({ name, use, testMatch: /redesign\.spec/ })),
  ],
});
