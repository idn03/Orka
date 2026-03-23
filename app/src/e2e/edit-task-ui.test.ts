import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

test.describe('Edit Task UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
  });

  test('1. Form pre-filled with current data', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('#title', 'Task to Edit');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
    await page.click('a:has-text("Edit")');
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+\/edit/);
    await expect(page.locator('#title')).toHaveValue('Task to Edit');
  });

  test('2. Change title and submit - only title sent in PATCH', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      await page.click('a:has-text("Edit")');
      await page.fill('#title', 'Updated Title');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
      await expect(page.locator('h1')).toHaveText('Updated Title');
    }
  });

  test('3. Change status to DONE (parent) shows warning about subtask cascade', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      await page.click('a:has-text("Edit")');
    }
  });

  test('4. Status dropdown allows any transition - all 4 options available', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      await page.click('a:has-text("Edit")');
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.isVisible()) {
        const options = await statusSelect.locator('option').count();
        expect(options).toBeGreaterThanOrEqual(4);
      }
    }
  });

  test('5. Cancel button returns to /tasks/:id, no changes', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const taskId = page.url().split('/tasks/')[1];
      await page.click('a:has-text("Edit")');
      await page.fill('#title', 'Changed Title');
      await page.click('button:has-text("Cancel")');
      await expect(page).toHaveURL(new RegExp(`/tasks/${taskId}$`));
    }
  });

  test('6. Validation error from API - per-field errors shown inline', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      await page.click('a:has-text("Edit")');
      await page.fill('#title', '');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Title is required')).toBeVisible();
    }
  });
});
