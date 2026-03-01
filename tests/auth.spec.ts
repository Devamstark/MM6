import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {

    test('New User Registration (Feature 1)', async ({ page }) => {
        await page.goto('/register');

        // Using random suffix to avoid "user exists" errors on live reload
        const timestamp = Date.now();
        const testEmail = `testuser_${timestamp}@example.com`;

        await page.fill('input[name="name"]', 'Automation Test User');
        await page.fill('input[name="email"]', testEmail);
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password123!');

        await page.click('button[type="submit"]');

        // Expect redirection to login or dashboard
        await expect(page).toHaveURL(/.*(login|home|profile)/);
    });

    test('Existing User Login (Feature 2)', async ({ page }) => {
        await page.goto('/login');

        // Note: In real CI, these should be env variables
        await page.fill('input[name="email"]', 'testuser@example.com');
        await page.fill('input[name="password"]', 'Password123!');

        await page.click('button[type="submit"]');

        // Verify successful login (presence of "Logout" or profile button)
        await expect(page.locator('text=Logout')).toBeVisible();
    });

    test('Password Reset Request (Feature 3)', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.fill('input[name="email"]', 'testuser@example.com');
        await page.click('button[type="submit"]');

        // Check for success toast or message
        await expect(page.locator('text=If an account exists, a reset code has been sent')).toBeVisible();
    });

});
