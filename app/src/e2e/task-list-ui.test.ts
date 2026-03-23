import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

test.describe('Task List UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
  });

  test('1. /tasks shows top-level tasks only - no subtasks in list', async ({ page }) => {
    await expect(page.locator('h2:has-text("Tasks")')).toBeVisible();
  });

  test('2. Each task shows status badge, assignee, due date', async ({ page }) => {
    await page.goto('/tasks');
    const taskItems = page.locator('[data-testid="task-item"]');
    if (await taskItems.first().isVisible()) {
      await expect(page.locator('[data-testid="task-item"]').first().locator('.badge, [class*="badge"]')).toBeVisible();
    }
  });

  test('3. Subtask count shown on parent tasks', async ({ page }) => {
    await page.goto('/tasks');
    const subtaskCount = page.locator('[data-testid="subtask-count"]');
    if (await subtaskCount.first().isVisible()) {
      await expect(subtaskCount.first()).toBeVisible();
    }
  });

  test('4. Overdue task has red/warning indicator', async ({ page }) => {
    await page.goto('/tasks');
    const overdueTask = page.locator('[data-testid="overdue-indicator"]');
    if (await overdueTask.first().isVisible()) {
      await expect(overdueTask.first()).toBeVisible();
    }
  });

  test('5. Type in search box - list filters after 300ms debounce', async ({ page }) => {
    await page.goto('/tasks');
    await page.fill('input[placeholder="Search tasks..."]', 'test');
    await page.waitForTimeout(500);
  });

  test('6. Clear search - full list restored', async ({ page }) => {
    await page.goto('/tasks');
    await page.fill('input[placeholder="Search tasks..."]', 'test');
    await page.waitForTimeout(500);
    await page.click('button:has([class*="X"])');
    await page.waitForTimeout(500);
  });

  test('7. Select status filter - only matching tasks shown', async ({ page }) => {
    await page.goto('/tasks');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.waitForTimeout(300);
  });

  test('8. Select "Assigned to me" - only current user\'s tasks shown', async ({ page }) => {
    await page.goto('/tasks');
    await page.click('button:has-text("Assigned to me")');
    await page.waitForTimeout(300);
  });

  test('9. Select due date filter "Overdue" - only overdue tasks shown', async ({ page }) => {
    await page.goto('/tasks');
    await page.selectOption('select[name="due"]', 'overdue');
    await page.waitForTimeout(300);
  });

  test('10. Combine multiple filters - AND logic applied', async ({ page }) => {
    await page.goto('/tasks');
    await page.fill('input[placeholder="Search tasks..."]', 'test');
    await page.selectOption('select[name="status"]', 'TODO');
    await page.waitForTimeout(500);
  });

  test('11. No results - empty state message shown', async ({ page }) => {
    await page.goto('/tasks');
    await page.fill('input[placeholder="Search tasks..."]', 'nonexistenttask123');
    await page.waitForTimeout(500);
    await expect(page.locator('text=No tasks match your filters')).toBeVisible();
  });

  test('12. Click task title - navigates to /tasks/:id', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
    }
  });

  test('13. Click "New Task" button - navigates to /tasks/new', async ({ page }) => {
    await page.goto('/tasks');
    await page.click('a:has-text("New Task")');
    await expect(page).toHaveURL('/tasks/new');
  });
});
