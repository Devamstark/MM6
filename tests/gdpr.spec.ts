import { test, expect } from '@playwright/test';

test.describe('GDPR & Privacy (Module 🛡️)', () => {

    test('User Data Portability (SAR) - Feature 59 [NEW]', async ({ page }) => {
        // 1. Log in as a user with orders/addresses
        await page.goto('/login');
        await page.fill('input[name="email"]', 'gdpr_test@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');

        // 2. Head to profile
        await page.goto('/profile');
        await page.click('button:has-text("Security & Privacy")');

        // 3. Request Data Export
        const exportBtn = page.locator('button:has-text("Export My Data")');
        await expect(exportBtn).toBeVisible();
        await exportBtn.click();

        // 4. Expect either a download or a success message
        // If it's a JSON download:
        const downloadPromise = page.waitForEvent('download');
        const download = await downloadPromise;
        await expect(download.suggestedFilename()).toContain('smartshop_data_export');
        await expect(download.suggestedFilename()).toContain('.json');
    });

    test('Right to Erasure (Account Deletion) - Feature 60 [NEW]', async ({ page }) => {
        // Note: This is an irreversible test, we'll stop before final confirmation 
        // to avoid deleting the test account in every run.

        await page.goto('/profile');
        await page.click('button:has-text("Security & Privacy")');

        const deleteBtn = page.locator('button:has-text("Delete Account")');
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        // Check for the "Danger Zone" modal and its confirmation text
        const modal = page.locator('.modal-danger');
        await expect(modal).toBeVisible();
        await expect(modal.locator('text=Permanently delete your profile and data')).toBeVisible();

        // Final check for the delete password confirm input
        const passwordConfirm = modal.locator('input[name="confirmPassword"]');
        await expect(passwordConfirm).toBeVisible();

        // Close modal out of caution
        await page.click('button:has-text("Cancel")');
    });

});
