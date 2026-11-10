import { test, expect } from '@playwright/test';

test.describe('ZapTrail Review Flow & AppShell E2E', () => {
  test('loads review inbox and displays page header and navigation', async ({ page }) => {
    await page.goto('/review');

    // Check page title
    await expect(page.locator('h1')).toContainText('Fila de Revisão');

    // Check sidebar navigation links
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Extrações' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Conversas' })).toBeVisible();
  });

  test('opens command palette with keyboard shortcut and filters navigation', async ({ page }) => {
    await page.goto('/review');

    // Trigger Cmd+K / Ctrl+K
    await page.keyboard.press('Control+KeyK');

    // Verify command palette dialog opens
    const searchInput = page.getByLabel('Buscar comando');
    await expect(searchInput).toBeVisible();

    // Type query to filter
    await searchInput.fill('Dashboard');
    const dashboardBtn = page.getByRole('button', { name: /ir para dashboard/i });
    await expect(dashboardBtn).toBeVisible();

    // Navigate using Enter key
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
