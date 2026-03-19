import { expect, test } from '@playwright/test';
import { createGoogleMockResponse } from './mocks/ai-responses';

test.describe('Patient Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createGoogleMockResponse('Ola Joao, espero que seu dia seja otimo.'))
            });
        });

        await page.goto('/login');
        await page.waitForTimeout(4000);
        await page.locator('button').filter({ hasText: /^Paciente$/ }).first().click();
        await page.fill('input[name="email"]', 'paciente@elosus.gov.br');
        await page.fill('input[name="password"]', 'paciente123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 30000 });
    });

    test('Welcome Experience renders patient dashboard widgets', async ({ page }) => {
        await expect(page.getByTestId('btn-mood-1')).toBeVisible();
        await expect(page.getByRole('button', { name: /Fazer Check-in Emocional/i })).toBeVisible();
    });

    test('Mood Tracking: Selection Feedback', async ({ page }) => {
        const sadMoodBtn = page.getByTestId('btn-mood-2');
        await sadMoodBtn.click();
        await expect(sadMoodBtn).toHaveClass(/scale-125/);
    });

    test('Patient can start emotional check-in quiz flow', async ({ page }) => {
        await page.getByRole('button', { name: /Fazer Check-in Emocional/i }).click();
        await expect(page.getByText(/Avaliacao de Saude Mental|Avaliação de Saúde Mental/i)).toBeVisible();
    });
});
