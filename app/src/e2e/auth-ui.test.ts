import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

test.describe('Auth UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Visit /tasks while logged out - redirected to /login', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page).toHaveURL('/login');
  });

  test('2. Visit /login while logged in - redirected to /tasks', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
    
    await page.goto('/login');
    await expect(page).toHaveURL('/tasks');
  });

  test('3. Visit /register while logged in - redirected to /tasks', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
    
    await page.goto('/register');
    await expect(page).toHaveURL('/tasks');
  });

  test('4. Login with valid credentials - redirected to /tasks, header shows user name', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('header')).toContainText(TEST_USER.name);
  });

  test('5. Login with invalid credentials - stays on /login, error message shown inline', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('6. Register with valid data - auto-logged in, redirected to /tasks', async ({ page }) => {
    const uniqueEmail = `newuser${Date.now()}@example.com`;
    await page.goto('/register');
    await page.fill('#name', 'New User');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('header')).toContainText('New User');
  });

  test('7. Register with duplicate email - error shown under email field', async ({ page }) => {
    await page.goto('/register');
    await page.fill('#name', 'Test User');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('8. Register with invalid fields - per-field errors shown inline', async ({ page }) => {
    await page.goto('/register');
    await page.fill('#name', '');
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'short');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Invalid email format')).toBeVisible();
    await expect(page.locator('text=at least 8 characters')).toBeVisible();
  });

  test('9. Click "Register" link - navigates to /register', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Register >> nth=0');
    
    await expect(page).toHaveURL('/register');
  });

  test('10. Click "Already have an account?" link - navigates to /login', async ({ page }) => {
    await page.goto('/register');
    await page.click('text=Log in');
    
    await expect(page).toHaveURL('/login');
  });

  test('11. Click logout button - session ended, redirected to /login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/tasks');
    
    await page.click('text=Logout');
    
    await expect(page).toHaveURL('/login');
  });
});
