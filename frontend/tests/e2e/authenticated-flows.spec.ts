import { test, expect } from '@playwright/test';

const fakeUser = {
  id: 1,
  email: 'demo@example.com',
  full_name: 'Demo User',
  is_active: true,
  is_admin: true,
  created_at: new Date().toISOString(),
};

const fakeEvent = {
  id: 101,
  title: 'Jenkins agent upgrade',
  description: 'Upgraded agent image to v2.3.1',
  timestamp: new Date().toISOString(),
  severity: 'info',
  event_type: 'update',
  source: 'jenkins',
  agents: [{ id: 7, name: 'agent-01', status: 'online' }],
  tools: [{ id: 3, name: 'node', version: '20.10.0' }],
  tags: [{ id: 5, name: 'rollout' }],
};

// Mock backend responses needed for auth + events flows
async function mockApi(page) {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'test-token', token_type: 'bearer' }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakeUser),
    });
  });

  await page.route('**/api/events*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([fakeEvent]),
    });
  });

  await page.route('**/api/agents*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakeEvent.agents),
    });
  });

  await page.route('**/api/tools*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakeEvent.tools),
    });
  });

  await page.route('**/api/tags*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakeEvent.tags),
    });
  });
}

test.describe('Authenticated flows', () => {
  test('logs in and shows dashboard', async ({ page }) => {
    await mockApi(page);

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(fakeUser.email);
    await page.getByLabel(/password/i).fill('password123!');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(`Welcome, ${fakeUser.full_name}!`)).toBeVisible();
    await expect(page.getByText(fakeUser.email)).toBeVisible();
  });

  test('views events with mocked API data', async ({ page }) => {
    await mockApi(page);

    // Seed auth in localStorage before app loads
    await page.addInitScript(({ user }) => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify(user));
    }, { user: fakeUser });

    await page.goto('/events');

    await expect(page.getByRole('heading', { name: 'Change Events' })).toBeVisible();
    await expect(page.getByText(fakeEvent.title)).toBeVisible();
    await expect(page.locator('.data-table tbody tr')).toHaveCount(1);
  });
});
