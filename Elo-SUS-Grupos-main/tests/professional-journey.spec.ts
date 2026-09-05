import { expect, test } from '@playwright/test';
import { createGoogleMockResponse } from './mocks/ai-responses';

test.describe('Professional Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/generativelanguage.googleapis.com/**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createGoogleMockResponse('Texto humanizado pelo EloSUS.'))
            });
        });

        await page.goto('/login');
        await page.waitForTimeout(4000);
        await page.locator('button').filter({ hasText: /^Profissional$/ }).first().click();
        await page.fill('input[name="email"]', 'prof@elosus.gov.br');
        await page.fill('input[name="password"]', 'prof123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 30000 });
    });

    test('Admission form is available for professional workflow', async ({ page }) => {
        await page.goto('/patients/new');
        await page.getByTestId('input-patient-name').fill('Carlos Eduardo Silva');
        await page.fill('input[name="birthDate"]', '1990-05-15');
        await page.selectOption('select[name="sexo"]', 'M');
        await page.fill('input[name="cns"]', '700000000000000');
        await page.fill('input[name="motherName"]', 'Maria Silva');
        await page.fill('input[name="phone"]', '(11)99999-9999');
        await expect(page.getByTestId('btn-save-patient')).toBeEnabled();
    });

    test('Professional dashboard shows main management widgets', async ({ page }) => {
        await expect(page.getByText(/Pacientes Ativos/i)).toBeVisible();
        await expect(page.getByText(/Grupos Terap[eê]uticos/i)).toBeVisible();
    });

    test('Patient list screen loads for management', async ({ page }) => {
        await page.goto('/patients');
        await expect(page.getByRole('heading', { name: /Pacientes|Nenhum paciente encontrado/i }).first()).toBeVisible();
    });
});
