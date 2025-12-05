import { test, expect } from '@playwright/test';
import { mockAiResponses, createGoogleMockResponse } from './mocks/ai-responses';

test.describe('Patient Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Google AI responses
        await page.route('**/generativelanguage.googleapis.com/**', async route => {
            const request = route.request();
            const postData = request.postData() || '';

            if (postData.includes('linguagem simples')) {
                // Humanizer
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(createGoogleMockResponse(mockAiResponses.humanizeReport.simplifiedText))
                });
            } else if (postData.includes('psicólogo especialista')) {
                // Welcomer
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(createGoogleMockResponse(mockAiResponses.generateDailySupportMessage.text))
                });
            } else {
                await route.continue();
            }
        });

        // Seeding
        await page.goto('/login?seed=true');
        await page.waitForSelector('text=Banco populado com sucesso!', { timeout: 15000 });

        // Login as Patient (João Silva)
        await page.goto('/login');
        await page.fill('input[type="email"]', 'joao.silva@email.com');
        await page.fill('input[type="password"]', 'password123'); // Valid mock credential
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('Welcome Experience: Daily Welcomer and AI Message', async ({ page }) => {
        // Verify Welcomer Card is visible
        const welcomer = page.locator('text=Olá,'); // Adjust based on actual text pattern
        await expect(welcomer).toBeVisible();

        // Verify AI Message content (from Mock)
        // Adjust selector to target the message body specifically
        const messageBody = page.locator(`text=${mockAiResponses.generateDailySupportMessage.text}`);
        await expect(messageBody).toBeVisible();
    });

    test('Mood Tracking: Selection Feedback', async ({ page }) => {
        // Locate Mood Tracker section
        // Click on "Mal" (Value 2) - using title attribute
        const sadMoodBtn = page.locator('button[title="Mal"]');
        await sadMoodBtn.click();

        // Verify visual feedback (wrapper or button scale/grayscale change)
        await expect(sadMoodBtn).toHaveClass(/scale-125/); // Based on MoodTracker logic
    });

    test('Report Simplification: Toggle and Badge', async ({ page }) => {
        // Navigate to Patient Detail (Assuming they can view themselves)
        await page.goto('/patients/paciente_joao');

        // Locate Toggle
        const toggleBtn = page.locator('button:has-text("Simplificar Termos")');
        await expect(toggleBtn).toBeVisible();

        await toggleBtn.click();

        // Verify Badge appearance
        const badge = page.locator('text=Tradução gerada por IA'); // Disclaimer text
        await expect(badge).toBeVisible();

        // Verify Humanized Text content (from Mock)
        const simplifiedText = page.locator(`text=${mockAiResponses.humanizeReport.simplifiedText.substring(0, 20)}`); // Check start of text
        await expect(simplifiedText).toBeVisible();
    });
});
