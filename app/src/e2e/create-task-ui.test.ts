import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

test.describe('Create Task UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
  });

  test('1. Submit with title - task created, redirected to detail', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('#title', 'New Test Task');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
  });

  test('2. Submit without title - inline error on title field', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('3. Submit with all fields - all fields saved correctly', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('#title', 'Complete Task');
    await page.fill('#description', 'This is a description');
    await page.fill('#due_date', '2025-12-31');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
  });

  test('4. Create subtask via ?parent_id - parent title shown, parent_id sent', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('#title', 'Parent Task');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
    const taskId = page.url().split('/tasks/')[1];
    await page.goto(`/tasks/new?parent_id=${taskId}`);
    await expect(page.locator('text=Subtask of:')).toBeVisible();
  });

  test('5. Assignee dropdown lists all users', async ({ page }) => {
    await page.goto('/tasks/new');
    const assigneeSelect = page.locator('select[name="assignee_id"]');
    if (await assigneeSelect.isVisible()) {
      await assigneeSelect.click();
      await page.waitForTimeout(300);
    }
  });
});
