import { expect, test } from '@playwright/test';

test.describe('Patient flow', () => {
  const clickRole = async (page: import('@playwright/test').Page, role: 'Paciente' | 'Profissional') => {
    await page.locator('button').filter({ hasText: new RegExp(`^${role}$`) }).first().click();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(4000);
    await clickRole(page, 'Profissional');
    await page.fill('input[name="email"]', 'prof@elosus.gov.br');
    await page.fill('input[name="password"]', 'prof123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('professional can open patient form and fill required fields', async ({ page }) => {
    await page.goto('/patients/new');
    await page.getByTestId('input-patient-name').fill('Paciente Playwright');
    await page.fill('input[name="birthDate"]', '1990-05-15');
    await page.selectOption('select[name="sexo"]', 'M');
    await page.fill('input[name="cns"]', '700000000000123');
    await page.fill('input[name="motherName"]', 'Maria Teste');
    await page.fill('input[name="phone"]', '(11)99999-1111');
    await expect(page.getByTestId('btn-save-patient')).toBeEnabled();
  });

  test('patient role cannot access /patients', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/login');
    await page.waitForTimeout(4000);
    await clickRole(page, 'Paciente');
    await page.fill('input[name="email"]', 'paciente@elosus.gov.br');
    await page.fill('input[name="password"]', 'paciente123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/patients');
    await expect(page).toHaveURL(/\/dashboard/);
    await context.close();
  });
});
