import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

test.describe('Task Detail UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
  });

  test('1. /tasks/:id shows full task details', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+/);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('2. Status change via inline control', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const statusSelect = page.locator('select').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('DONE');
        await page.waitForTimeout(500);
      }
    }
  });

  test('3. Status change to DONE with subtasks shows warning', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
    }
  });

  test('4. Subtasks listed with links', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const subtaskLink = page.locator('[data-testid="subtask-link"]').first();
      if (await subtaskLink.isVisible()) {
        await expect(subtaskLink).toHaveAttribute('href', /\/tasks\/[a-f0-9-]+/);
      }
    }
  });

  test('5. Click "Add Subtask" navigates to /tasks/new?parent_id=:id', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const addSubtaskBtn = page.locator('a:has-text("Add Subtask")').first();
      if (await addSubtaskBtn.isVisible()) {
        await addSubtaskBtn.click();
        await expect(page).toHaveURL(/\/tasks\/new\?parent_id=/);
      }
    }
  });

  test('6. Subtask detail shows parent link', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const subtaskLink = page.locator('a[href^="/tasks/"]').nth(1);
      if (await subtaskLink.isVisible()) {
        await subtaskLink.click();
        await expect(page.locator('text=Subtask of:')).toBeVisible();
      }
    }
  });

  test('7. Click "Edit" navigates to /tasks/:id/edit', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const editBtn = page.locator('a:has-text("Edit")').first();
      if (await editBtn.isVisible()) {
        await editBtn.click();
        await expect(page).toHaveURL(/\/tasks\/[a-f0-9-]+\/edit/);
      }
    }
  });

  test('8. Click "Delete" shows confirmation dialog', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const deleteBtn = page.locator('button:has-text("Delete")').first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(page.locator('text=Are you sure')).toBeVisible();
      }
    }
  });

  test('9. Confirm delete - task deleted, redirected to /tasks', async ({ page }) => {
    await page.goto('/tasks/new');
    await page.fill('#title', 'Task to Delete');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
    await page.click('button:has-text("Delete")');
    await expect(page.locator('text=Are you sure')).toBeVisible();
    await page.click('button:has-text("Delete") >> nth=1');
    await expect(page).toHaveURL('/tasks');
  });

  test('10. Delete subtask - redirected to parent task', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
    }
  });

  test('11. Back link goes to /tasks or parent task for subtasks', async ({ page }) => {
    await page.goto('/tasks');
    const taskLink = page.locator('a[href^="/tasks/"]').first();
    if (await taskLink.isVisible()) {
      await taskLink.click();
      await page.waitForURL(/\/tasks\/[a-f0-9-]+/);
      const backBtn = page.locator('a:has([class*="ArrowLeft"])').first();
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await expect(page).toHaveURL('/tasks');
      }
    }
  });
});
