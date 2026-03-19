import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for EloSUS Grupos
 *
 * Usage:
 *   npx playwright test                  // Run all tests
 *   npx playwright test --headed         // Run with browser visible
 *   npx playwright test --ui             // Open interactive UI mode
 *   npx playwright test e2e/login.spec   // Run specific test file
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list']
    ],
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['Pixel 5'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
