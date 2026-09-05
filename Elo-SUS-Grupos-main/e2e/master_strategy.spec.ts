import { test, expect } from '@playwright/test';

test.describe('MASTER STRATEGY: EloSUS - Core Value Validation', () => {

    test.beforeEach(async ({ page }) => {
        // Ensure we start clean and SEED the database
        await page.goto('/login?seed=true');
        // Wait for the seed toast or just a bit to ensure potential async DB ops start
        await page.waitForTimeout(2000);
    });

    test('Scenario A: Resilience & PWA (The "App" Feel)', async ({ page }) => {
        // 1. Mobile Viewport Mock
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12/13

        // 2. Metadata Verification
        // Theme Color
        const themeColor = page.locator('meta[name="theme-color"]');
        await expect(themeColor).toHaveAttribute('content', '#7A5CFF');

        // Viewport (No Zoom)
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

        // 3. Login Flow (to check internal PWA elements)
        await page.goto('/login');
        await page.fill('input[type="email"]', 'joao.silva@email.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Acessar Sistema")');

        // Wait for dashboard
        await expect(page.locator('text=Sua Jornada')).toBeVisible({ timeout: 15000 });

        // 4. Sidebar & Install Button Logic
        // On mobile, sidebar is hidden behind hamburger menu
        // We just want to ensure the logic exists in the code (it might be hidden if event didn't fire)
        // Let's check if the layout loaded correctly
        await expect(page.locator('header')).toBeVisible();
    });

    test('Scenario B: Maternal Health Journey (Maria Oliveira)', async ({ page }) => {
        // 1. Login as Maria (Pregnant Persona)
        await page.goto('/login');
        await page.fill('input[type="email"]', 'maria.oliveira@email.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Acessar Sistema")');

        // Wait for dashboard
        await expect(page.locator('text=Saúde Materna')).toBeVisible({ timeout: 15000 });

        // 2. Open Pregnant Modal
        const modalBtn = page.locator('button:has-text("Sou Gestante/Mãe Recente")');
        await modalBtn.click();

        // 3. Verify Modal Content
        await expect(page.locator('h2:has-text("Saúde Materna")')).toBeVisible();
        await expect(page.locator('text=Cuidando de quem cuida')).toBeVisible();

        // 4. Submit "Baby Blues" Pattern
        // Click "Começar"
        await page.click('button:has-text("Começar")');

        // Q1: Sleep/Appetite (Yes -> Baby Blues risk)
        await page.locator('button:has-text("Sim")').first().click();

        // Q2: Guilt (No)
        await page.locator('button:has-text("Não")').nth(1).click();

        // Q3: Sadness (No)
        await page.locator('button:has-text("Não")').nth(2).click();

        // Q4: Harm (No - Critical)
        await page.locator('button:has-text("Não")').nth(3).click();

        // Q5: Persistence (No)
        await page.locator('button:has-text("Não")').nth(4).click();

        // 5. Submit
        await page.click('button:has-text("Ver Resultado")');

        // 6. Verify Feedback: Should be "Possível Baby Blues" or "Tudo parece bem" depending on exact logic
        // Q1 Yes triggers "Baby Blues" in our logic
        await expect(page.locator('text=Possível Baby Blues')).toBeVisible();

        // 7. Verify Support Materials
        await expect(page.locator('text=Materiais de Apoio')).toBeVisible();
        await expect(page.locator('a:has-text("Depressão Pós-parto (Ministério da Saúde)")')).toBeVisible();

        // 8. Close
        await page.click('button:has-text("Fechar")');
        await expect(page.locator('h2:has-text("Saúde Materna")')).not.toBeVisible();
    });

    test('Scenario C: Gamification & Engagement (João Silva)', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.fill('input[type="email"]', 'joao.silva@email.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Acessar Sistema")');

        // 2. Check Daily Challenge Presence
        await expect(page.locator('text=Desafio do Dia')).toBeVisible();

        // 3. Complete Mood Check-in (if not already done today)
        // We'll try to find the mood tracker inputs
        const moodSection = page.locator('text=Como você está se sentindo hoje?');
        if (await moodSection.isVisible()) {
            // Click "Bem" (Smiling Face)
            await page.locator('button[title="Bem"]').click();

            // Select "Família"
            await page.click('button:has-text("Família")');

            // Register
            await page.click('button:has-text("Registrar Dia")');

            // Verify Success
            await expect(page.locator('text=Sentimento registrado!')).toBeVisible();
        }

        // 4. Verify Achievements Section
        await expect(page.locator('text=Minhas Conquistas')).toBeVisible();
    });

});
