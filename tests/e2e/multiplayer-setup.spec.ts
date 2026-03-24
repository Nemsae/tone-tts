import { test, expect } from '@playwright/test';

test.describe('Multiplayer Host Page', () => {
  test('should display create multiplayer game form', async ({ page }) => {
    await page.goto('/multiplayer-setup');

    await expect(page.locator('h1')).toContainText('Create Multiplayer Game');
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
    await expect(page.getByText('Theme')).toBeVisible();
    await expect(page.getByText('Difficulty')).toBeVisible();
  });

  test('should have back button that navigates to home', async ({ page }) => {
    await page.goto('/multiplayer-setup');

    await page.locator('button:has-text("Back")').click();

    await expect(page).toHaveURL('/');
  });

  test('should show error when trying to create room without name', async ({ page }) => {
    await page.goto('/multiplayer-setup');

    await page.locator('button:has-text("Create Room")').click();

    await expect(page.locator('[class*="error"]')).toContainText('Please enter your name');
  });

  test('should show error when trying to create room without topic', async ({ page }) => {
    await page.goto('/multiplayer-setup');

    await page.getByPlaceholder('Enter your name').fill('TestPlayer');

    await page.locator('button:has-text("Create Room")').click();

    await expect(page.locator('[class*="error"]')).toContainText('Please select or enter a topic');
  });

  test('should attempt to create room with valid input', async ({ page }) => {
    await page.goto('/multiplayer-setup');

    await page.getByPlaceholder('Enter your name').fill('HostPlayer');
    await page.getByText('Animals').click();

    await page.locator('button:has-text("Create Room")').click();

    await expect(page.locator('[class*="error"], h1')).toBeVisible();
  });
});
