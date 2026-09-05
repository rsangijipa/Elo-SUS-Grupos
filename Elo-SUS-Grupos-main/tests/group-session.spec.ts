import { expect, test } from '@playwright/test';

test.describe('Group session flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(4000);
    await page.getByRole('button', { name: 'Profissional' }).click();
    await page.fill('input[name="email"]', 'prof@elosus.gov.br');
    await page.fill('input[name="password"]', 'prof123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('professional accesses group management and session save flow', async ({ page }) => {
    await page.goto('/groups');
    await expect(page.locator('body')).toContainText(/Grupos|Grupo/);

    const firstManage = page.locator('a[href*="/groups/"][href*="/manage"], button:has-text("Gerenciar")').first();
    if (await firstManage.count()) {
      await firstManage.click();
      await expect(page).toHaveURL(/\/groups\/.*\/manage/);
    }

    const startSessionLink = page.locator('a[href*="/session/"], button:has-text("Iniciar Sessao"), button:has-text("Iniciar Sessão")').first();
    if (await startSessionLink.count()) {
      await startSessionLink.click();
      await expect(page).toHaveURL(/\/session\//);
      const attendanceButton = page.locator('button[aria-label*="presente"]').first();
      if (await attendanceButton.count()) {
        await attendanceButton.click();
      }
      await page.locator('textarea').fill('Sessao registrada pelo Playwright.');
      await page.getByRole('button', { name: /Finalizar sessao|Finalizar sessão/i }).click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });
});
