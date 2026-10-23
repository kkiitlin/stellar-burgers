import { test, expect } from '@playwright/test';

const INGREDIENTS_API = '**/api/ingredients';
const USER_API = '**/api/auth/user';
const INGREDIENTS_FIXTURE = 'tests/fixtures/ingredients.mock.json';
const FIRST_INGREDIENT_NAME = 'Краторная булка';
const FILLING_NAME = 'Биф из говядины';

async function mockIngredientRoutes(page: Parameters<typeof test>[0]['page']): Promise<void> {
  await page.route(INGREDIENTS_API, async (route) => {
    await route.fulfill({ path: INGREDIENTS_FIXTURE });
  });

  await page.route(USER_API, async (route) => {
    await route.fulfill({
      status: 401,
      body: JSON.stringify({ success: false }),
      contentType: 'application/json',
    });
  });
}

test.describe('Constructor page (mocked ingredients)', () => {
  test('renders mocked ingredients from JSON fixture', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();
    await expect(page.getByText('Биф из говядины')).toBeVisible();
    await expect(page.getByText('Сырный соус')).toBeVisible();
    await expect(page.locator('img[alt="картинка ингредиента."]')).toHaveCount(3);
  });
});

test.describe('Ingredient details modal', () => {
  test('opens when clicking on an ingredient card', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page.getByRole('link', { name: FIRST_INGREDIENT_NAME }).first().click();

    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
    await expect(page.locator('img[alt="изображение ингредиента."]')).toBeVisible();
  });

  test('closes when clicking the close button (крестик)', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page.getByRole('link', { name: FIRST_INGREDIENT_NAME }).first().click();
    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

    await page.getByRole('button', { name: 'Закрыть' }).click();

    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).not.toBeVisible();
  });

  test('closes when clicking the outer overlay', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page.getByRole('link', { name: FIRST_INGREDIENT_NAME }).first().click();
    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

    await page.mouse.click(100, 100);

    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).not.toBeVisible();
  });
});

test.describe('Constructor (adding ingredients)', () => {
  test('adds one bun and one filling to the constructor zone', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page
      .locator('li', { hasText: FIRST_INGREDIENT_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await expect(page.getByText('Краторная булка (верх)')).toBeVisible();
    await expect(page.getByText('Краторная булка (низ)')).toBeVisible();

    await page
      .locator('li', { hasText: FILLING_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await expect(page.getByText(FILLING_NAME).last()).toBeVisible();
  });
});

test.describe('Order placement (full cycle)', () => {
  const ORDER_API = '**/api/orders';
  const MOCK_ORDER_NUMBER = 42;

  async function setupAuthAndOrderRoutes(page: Parameters<typeof test>[0]['page']): Promise<void> {
    await page.route(USER_API, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { email: 'user@test.com', name: 'Test User' },
        }),
        contentType: 'application/json',
      });
    });

    await page.route(ORDER_API, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          order: {
            _id: 'mock-order-id',
            status: 'done',
            name: 'Ультимативный бургер',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            number: MOCK_ORDER_NUMBER,
            ingredients: [],
          },
          name: 'Ультимативный бургер',
        }),
        contentType: 'application/json',
      });
    });
  }

  async function setAuthTokens(page: Parameters<typeof test>[0]['page']): Promise<void> {
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=mock-access-token; path=/';
    });
    await page.reload();
  }

  test('оформление заказа: добавление ингредиентов → заказ → очистка конструктора → закрытие модалки', async ({
    page,
  }) => {
    await mockIngredientRoutes(page);
    await setupAuthAndOrderRoutes(page);

    await page.goto('/');

    await setAuthTokens(page);
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page
      .locator('li', { hasText: FIRST_INGREDIENT_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await expect(page.getByText('Краторная булка (верх)')).toBeVisible();
    await expect(page.getByText('Краторная булка (низ)')).toBeVisible();

    await page
      .locator('li', { hasText: FILLING_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await expect(page.getByText(FILLING_NAME).last()).toBeVisible();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(page.getByRole('heading', { name: String(MOCK_ORDER_NUMBER) })).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page.getByRole('heading', { name: String(MOCK_ORDER_NUMBER) })).not.toBeVisible();
  });
});