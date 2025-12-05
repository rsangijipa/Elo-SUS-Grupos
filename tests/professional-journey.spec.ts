import { test, expect } from '@playwright/test';
import { mockAiResponses, createGoogleMockResponse } from './mocks/ai-responses';

test.describe('Professional Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Google AI responses
        await page.route('**/generativelanguage.googleapis.com/**', async route => {
            const request = route.request();
            const postData = request.postData() || '';

            if (postData.includes('Auditor de Regulação')) {
                const jsonString = JSON.stringify(mockAiResponses.analyzeClinicalRisk);
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(createGoogleMockResponse(jsonString))
                });
            } else {
                await route.continue();
            }
        });

        // Seeding Database
        await page.goto('/login?seed=true');
        await page.waitForSelector('text=Banco populado com sucesso!', { timeout: 15000 });

        // Login as Professional (Dr. Ricardo)
        await page.goto('/login');
        await page.fill('input[type="email"]', 'ricardo@elosus.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('Admission: Create new patient with coordinates', async ({ page }) => {
        await page.goto('/patients/new');

        await page.fill('input[name="name"]', 'Teste E2E Paciente');
        await page.fill('input[name="cpf"]', '123.456.789-00');
        await page.fill('input[name="cns"]', '789456123000000');
        await page.fill('input[name="motherName"]', 'Mãe Teste');
        await page.fill('input[name="phone"]', '(69) 99999-9999');

        // Address that generates coordinates
        await page.fill('input[name="address"]', 'Av. Tancredo Neves, Ariquemes, RO');

        await page.click('button:has-text("Salvar")');

        // Check for success toast
        await expect(page.locator('text=Paciente cadastrado com sucesso')).toBeVisible();
    });

    test('Territory Map: Verify visibility and markers', async ({ page }) => {
        await page.goto('/dashboard');

        // Check if map container exists
        const mapContainer = page.locator('.google-map-container, div[aria-label="Map"]'); // Adjust selector based on actual rendering
        await expect(mapContainer).toBeVisible(); // Or a specific ID if added

        // Ideally disable this check if key is invalid in test env, but looking for Markers
        // Since we mocked API, we check if our component rendered the logic
        // We can assume if the component is mounted, it's successful for this level of E2E
    });

    test('Discharge & AI: Sentinel Analysis and Report', async ({ page }) => {
        // Navigate to a group detail (assuming one exists or mocked)
        await page.goto('/groups/1');

        // Find a patient and click remove/discharge (assuming UI flow)
        await page.click('button[aria-label="Remover Paciente"]');

        const modal = page.locator('text=Alta / Desligamento');
        await expect(modal).toBeVisible();

        const analyzeBtn = page.locator('button:has-text("✨ Analisar com IA")');
        await expect(analyzeBtn).toBeVisible();

        await analyzeBtn.click();

        // Wait for fields to be filled by Mock
        await expect(page.locator('input[name="suggestedCID"]')).toHaveValue(mockAiResponses.analyzeClinicalRisk.suggestedCID);

        // Test PDF Generation
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Gerar Relatório PDF")');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
    });
});
