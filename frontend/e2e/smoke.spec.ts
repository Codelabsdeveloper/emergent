import { expect, test } from '@playwright/test';

test.describe('public website', () => {
  test('homepage shows branding and registration form', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Emergent Technologies' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Our Work' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Register with Us' })).toBeVisible();
  });

  test('registration validation blocks empty submit', async ({ page }) => {
    await page.goto('/#register');
    await page.getByRole('button', { name: 'Register Now' }).click();
    await expect(page.getByText(/at least 2 characters|required|select/i).first()).toBeVisible();
  });
});

test.describe('admin portal', () => {
  test('admin login page is available at /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
});
