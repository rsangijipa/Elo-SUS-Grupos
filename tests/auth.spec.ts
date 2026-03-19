import { expect, test } from '@playwright/test';

const login = async (page: import('@playwright/test').Page, email: string, password: string, role: 'patient' | 'professional' = 'patient') => {
  await page.goto('/login');
  await page.waitForTimeout(4000);
  await page.getByRole('button', { name: role === 'professional' ? 'Profissional' : 'Paciente' }).click();
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
};

test.describe('Auth critical flow', () => {
  test('login with valid credentials navigates to dashboard', async ({ page }) => {
    await login(page, 'prof@elosus.gov.br', 'prof123', 'professional');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await login(page, 'prof@elosus.gov.br', 'senha-invalida', 'professional');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout redirects to login', async ({ page }) => {
    await login(page, 'prof@elosus.gov.br', 'prof123', 'professional');
    await expect(page).toHaveURL(/\/dashboard/);
    const userMenuButton = page.getByLabel('Abrir menu do usuario').first();
    await userMenuButton.click();
    await page.getByRole('button', { name: /^Sair$/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('direct access to patients without auth redirects to login', async ({ page }) => {
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/login/);
  });
});
