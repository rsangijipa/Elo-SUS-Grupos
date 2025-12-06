import { test, expect } from '@playwright/test';
import { createGoogleMockResponse } from './mocks/ai-responses';

test.describe('Patient Journey', () => {

    test.beforeEach(async ({ page }) => {
        // Mock AI
        await page.route('**/generativelanguage.googleapis.com/**', async route => {
            const requestBody = route.request().postData() || '';
            const isMood = requestBody.includes('analyzeMood');

            const mockText = isMood
                ? "Dica: Tente respirar fundo."
                : "Olá João, espero que seu dia seja ótimo.";

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(createGoogleMockResponse(mockText))
            });
        });

        // Seed and Login as Patient
        await page.goto('/login?seed=true');
        await page.fill('input[type="email"]', 'joao.silva@email.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Explicit Wait for Dashboard
        await page.waitForURL('**/dashboard', { timeout: 30000 });
    });

    test('Welcome Experience: Daily Welcomer and AI Message', async ({ page }) => {
        // Verify Welcome Card appears
        await expect(page.locator('text=Olá, João')).toBeVisible();

        // Verify AI Message loads (skeleton disappears)
        await expect(page.locator('.animate-pulse')).not.toBeVisible({ timeout: 10000 });
    });

    test('Mood Tracking: Selection Feedback', async ({ page }) => {
        // Using data-testid for "Mal" (Value 2)
        const sadMoodBtn = page.getByTestId('btn-mood-2');
        await sadMoodBtn.click();

        // Verify visual feedback class "scale-125" applied
        await expect(sadMoodBtn).toHaveClass(/scale-125/);
    });

    test('Report Simplification: Toggle and Badge', async ({ page }) => {
        // Navigate to Patient Detail 
        // Assuming '/patients/me' redirect or knowing ID. 
        // Safe bet: Click "Meu Prontuário" or similar if available, or force URL if ID known (seeded ID might vary)
        // For 'joao.silva', let's assume valid ID route or navigate via UI

        // If "paciente_joao" is the ID from seed:
        await page.goto('/patients/paciente_joao');

        // Locate Toggle using TestId
        const toggleBtn = page.getByTestId('toggle-simplify-report');

        // Click to activate
        await toggleBtn.click();

        // Verify changes (Badge text changes or Content changes)
        await expect(toggleBtn).toContainText('Versão Simplificada Ativa');
        await expect(page.locator('text=✨ Termos Simplificados pela IA')).toBeVisible();
    });

});
