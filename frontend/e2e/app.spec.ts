import { test, expect } from '@playwright/test';

test.describe('Campunity App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Campunity')).toBeVisible();
  });

  test('should show Get Started button when not logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Get Started')).toBeVisible();
  });

  test('should open auth modal on Get Started click', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=Get Started').click();
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should navigate to login and register', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=Get Started').click();
    await expect(page.locator('text=Sign In')).toBeVisible();
    await page.locator('text=Sign Up').click();
    await expect(page.locator('text=Create your account')).toBeVisible();
  });

  test('should navigate to resources page', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=Feed').first().click();
    await expect(page).toHaveURL(/.*feed/);
  });
});
