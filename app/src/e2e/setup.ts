import { test as setup, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: 'testui@example.com',
  password: 'password123',
};

setup('create test user', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/auth/register', {
    data: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password,
    },
  });
  
  if (response.status() !== 200) {
    const data = await response.json();
    if (!data.errors?.email?.includes('already exists')) {
      throw new Error('Failed to create test user');
    }
  }
});
