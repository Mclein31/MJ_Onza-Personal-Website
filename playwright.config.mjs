import { defineConfig, devices } from '@playwright/test';

// The site is static: serve the folder (tests/serve.mjs) and test it in desktop Chrome, a Pixel and an iPhone (WebKit).
// Chromium projects use the installed Google Chrome (`channel: 'chrome'`), so only WebKit is downloaded.
const PORT = 4173;

const targets = {
  'desktop-chrome': { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
  'pixel-7': { ...devices['Pixel 7'], channel: 'chrome' },
  'iphone-14': { ...devices['iPhone 14'] },
};

// Redesign v5 layout audit (tests/v5-audit.spec.mjs): one project per viewport, matched only to that spec.
// Phones/tablet (<= 768px wide) are touch contexts, the rest are desktop Chrome. Own outputDir, so a v5 run only cleans
// test-results/v5-audit/_pw and never wipes the default test-results output (or earlier audits of other pages).
const v5Viewports = [[320, 568], [390, 844], [430, 932], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]];
const v5Projects = [
  ...v5Viewports.map(([width, height]) => {
    const touch = width <= 768;
    const viewport = { width, height };
    const use = touch
      ? { ...devices['Pixel 7'], channel: 'chrome', viewport, screen: viewport, deviceScaleFactor: 1 }
      : { ...devices['Desktop Chrome'], channel: 'chrome', viewport, deviceScaleFactor: 1 };
    return { name: `v5-${width}x${height}`, use, testMatch: /v5-audit\.spec/, outputDir: 'test-results/v5-audit/_pw', metadata: { viewportName: `${width}x${height}`, touch } };
  }),
  { name: 'v5-webkit-iphone14', use: { ...devices['iPhone 14'] }, testMatch: /v5-audit\.spec/, outputDir: 'test-results/v5-audit/_pw', metadata: { viewportName: 'webkit-iphone14-390x844', touch: true } },
  // Owner's foldable iPhone Duo (WebKit, touch, DPR 3): folded, unfolded portrait, unfolded landscape.
  ...[['folded', 466, 678], ['portrait', 626, 890], ['landscape', 890, 626]].map(([posture, width, height]) => ({
    name: `v5-duo-${posture}`,
    use: { ...devices['iPhone 16 Pro Max'], viewport: { width, height }, screen: { width, height }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    testMatch: /v5-audit\.spec/,
    outputDir: 'test-results/v5-audit/_pw',
    metadata: { viewportName: `duo-${posture}-${width}x${height}`, touch: true },
  })),
];

// Redesign v5 behaviour suite (tests/v5-behaviour.spec.mjs): desktop Chrome, WebKit iPhone 14, WebKit iPhone Duo folded.
const v5BehaviourProjects = [
  {
    name: 'v5b-desktop',
    use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    testMatch: /v5-behaviour\.spec/,
    outputDir: 'test-results/v5-behaviour',
  },
  {
    name: 'v5b-iphone14',
    use: { ...devices['iPhone 14'] },
    testMatch: /v5-behaviour\.spec/,
    outputDir: 'test-results/v5-behaviour',
  },
  {
    name: 'v5b-duo-folded',
    use: {
      ...devices['iPhone 16 Pro Max'],
      viewport: { width: 466, height: 678 },
      screen: { width: 466, height: 678 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      defaultBrowserType: 'webkit',
    },
    testMatch: /v5-behaviour\.spec/,
    outputDir: 'test-results/v5-behaviour',
  },
];

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
    ...Object.entries(targets).map(([name, use]) => ({ name, use, testIgnore: [/v5-audit\.spec/, /v5-behaviour\.spec/] })),
    ...v5Projects,
    ...v5BehaviourProjects,
  ],
});
