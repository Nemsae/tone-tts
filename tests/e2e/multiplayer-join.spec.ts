import { test, expect } from '@playwright/test';

test.describe('Join Room Page', () => {
  test('should display join room form', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await expect(page.locator('h1')).toContainText('Join Multiplayer Game');
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
    await expect(page.getByPlaceholder('ABCD')).toBeVisible();
  });

  test('should have back button that navigates to home', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await page.locator('button:has-text("Back")').click();

    await expect(page).toHaveURL('/');
  });

  test('should show error when trying to join without name', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await page.locator('button:has-text("Join Room")').click();

    await expect(page.locator('[class*="error"]')).toContainText('Please enter your name');
  });

  test('should show error when trying to join without room code', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await page.getByPlaceholder('Enter your name').fill('TestPlayer');

    await page.locator('button:has-text("Join Room")').click();

    await expect(page.locator('[class*="error"]')).toContainText('Please enter the room code');
  });

  test('should show error for invalid room code length', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await page.getByPlaceholder('Enter your name').fill('TestPlayer');
    await page.getByPlaceholder('ABCD').fill('AB');

    await page.locator('button:has-text("Join Room")').click();

    await expect(page.locator('[class*="error"]')).toContainText('Room code must be 4 characters');
  });

  test('should convert room code to uppercase', async ({ page }) => {
    await page.goto('/multiplayer-join');

    await page.getByPlaceholder('ABCD').fill('abcd');

    await expect(page.getByPlaceholder('ABCD')).toHaveValue('ABCD');
  });
});
