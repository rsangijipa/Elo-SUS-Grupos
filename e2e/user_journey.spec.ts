import { test, expect } from '@playwright/test';

test.describe('Jornada do Paciente Ansioso (João Silva)', () => {

    // Setup: Seed database before tests (Mocking or calling the seed function via API/CLI)
    test.beforeAll(async () => {
        // In a real scenario, you'd call an API endpoint to trigger the seed
        // await request.post('/api/test/seed');
        console.log('Assuming database is seeded with João Silva');
    });

    test('Deve completar o fluxo feliz de verificação de humor e acesso a recursos', async ({ page }) => {

        // 1. LOGIN
        // Objetivo: Validar autenticação e redirecionamento correto para o perfil de paciente.
        await page.goto('/login');

        // Simulating Google Login (Mocking the auth provider or using a test account)
        // For this test, we assume a "Dev Login" or standard email/pass for the seeded user
        await page.fill('input[type="email"]', 'joao.silva@email.com');
        await page.fill('input[type="password"]', 'password123'); // Assuming password set in Auth or mocked
        await page.click('button:has-text("Acessar Sistema")');

        // Check redirection
        await expect(page).toHaveURL('/dashboard');
        await expect(page.locator('h1')).toContainText('Olá, João');

        // 2. DASHBOARD & MOOD WIDGET
        // Objetivo: Verificar a presença do componente crítico de engajamento diário.
        const moodWidget = page.locator('[data-testid="mood-tracker"]'); // Assuming test id
        await expect(moodWidget).toBeVisible();
        await expect(page.getByText('Como você está se sentindo?')).toBeVisible();

        // 3. INTERAÇÃO (Emoji Ansioso)
        // Objetivo: Testar a responsividade da UI ao input do usuário e feedback visual.
        const anxiousEmoji = page.locator('button[aria-label="Ansioso"]');
        await anxiousEmoji.click();

        // Check UX: Avatar change or immediate feedback
        // Waiting for visual change (e.g., toast or avatar expression update)
        await expect(page.getByText('Humor registrado')).toBeVisible();

        // 4. ACESSIBILIDADE (Modal de Ansiedade)
        // Objetivo: Garantir que recursos de acessibilidade (TTS) estão funcionais.
        await page.click('button:has-text("Avaliação de Ansiedade")'); // Opening Modal

        const ttsButton = page.locator('button[aria-label="Ouvir pergunta"]');
        await expect(ttsButton).toBeVisible();

        // Mock window.speechSynthesis
        await page.evaluate(() => {
            window.speechSynthesis.speak = (utterance) => {
                console.log('TTS Speaking:', utterance.text);
                window.dispatchEvent(new CustomEvent('tts-start'));
            };
        });

        await ttsButton.first().click();
        // Verify if the mock was called (in a real browser test, we'd listen for the event or spy on the window object)

        // 5. EMERGÊNCIA (SOS)
        // Objetivo: Validar o acesso rápido a recursos de crise.
        const sosButton = page.locator('button[aria-label="SOS"]');
        await sosButton.click();

        // Check UX: Overlay visibility
        const sosOverlay = page.locator('[data-testid="sos-overlay"]');
        await expect(sosOverlay).toBeVisible();
        await expect(page.getByText('Respire fundo')).toBeVisible(); // Breathing animation text

        // Close SOS to proceed
        await page.click('button[aria-label="Fechar SOS"]');

        // 6. RESPONSIVIDADE (Mobile View)
        // Objetivo: Garantir usabilidade em dispositivos móveis.
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

        // Check Hamburger Menu
        const menuButton = page.locator('button[aria-label="Menu"]');
        await expect(menuButton).toBeVisible();

        await menuButton.click();
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // Verify "Meu Grupo" link exists in mobile menu
        await expect(page.locator('a[href="/my-group"]')).toBeVisible();
    });
});
