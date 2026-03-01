import { test, expect } from '@playwright/test';

test.describe('Blogger Dashboard & Features (Module 5)', () => {

    test('Fashion Blog Display & Post Details (Feature 39)', async ({ page }) => {
        // 1. Visit blog section
        await page.goto('/blog');

        // 2. Expect at least one blog post card
        const postCard = page.locator('.blog-post-card').first();
        await expect(postCard).toBeVisible();

        // 3. Click read more
        await postCard.locator('text=Read More').click();

        // 4. Verify post detail page and its SEO tags (Feature 40)
        await expect(page).toHaveURL(/.*blog\/.*/);

        // Check for post title or category
        await expect(page.locator('h1.post-title')).toBeVisible();

        // Check for SEO metadata presence (Feature 38)
        const metaDesc = page.locator('meta[name="description"]');
        await expect(metaDesc).toHaveAttribute('content', /.*/);
    });

    test('Create New Blog Post as Blogger (Feature 41)', async ({ page }) => {
        // 1. Log in as blogger
        await page.goto('/login');
        await page.fill('input[name="email"]', 'blogger@smartshop1.us');
        await page.fill('input[name="password"]', 'Blogger123!');
        await page.click('button[type="submit"]');

        // 2. Head to blogger dashboard 
        await page.goto('/blogger-dashboard');
        await page.click('button:has-text("Create Post")');

        // 3. Fill post details
        await page.fill('input[name="title"]', 'New Fashion Trends 2026');
        await page.fill('textarea[name="excerpt"]', 'The definitive guide to what we wear next year.');

        // Check for rich text editor (Quill/CKEditor)
        const editor = page.locator('.ql-editor'); // Playwright interacts directly with Quill's edit area
        await editor.click();
        await editor.type('Look at these sustainable fabrics...');

        // 4. Select Category
        await page.selectOption('select[name="category"]', 'Trends');

        // 5. Publish
        await page.click('button:has-text("Publish")');
        await expect(page.locator('text=Post published successfully')).toBeVisible();
    });

});
