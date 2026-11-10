import { test, expect } from '@playwright/test';

test.describe('ZapTrail Playground & Catalog E2E', () => {
  test('extracts WhatsApp conversation in Playground and navigates to extractions', async ({ page }) => {
    await page.goto('/settings/playground');

    // Page title
    await expect(page.locator('h1')).toContainText('Playground de Extração');

    // Button disabled initially
    const extractBtn = page.getByRole('button', { name: /extrair dados/i });
    await expect(extractBtn).toBeDisabled();

    // Input test conversation
    const textarea = page.getByPlaceholder(/cole uma conversa de exemplo/i);
    await textarea.fill('Cliente: Busco apartamento com 2 quartos em Moema por R$ 850.000');

    await expect(extractBtn).toBeEnabled();
    await extractBtn.click();

    // Result card appears with processing time and opportunities
    await expect(page.getByText(/concluído em/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Participantes')).toBeVisible();
    await expect(page.getByText('Oportunidades')).toBeVisible();

    // Navigate to Extrações
    await page.getByRole('link', { name: 'Extrações' }).click();
    await expect(page).toHaveURL(/.*\/extractions/);
    await expect(page.locator('h1')).toContainText('Extrações Semânticas');
  });
});
