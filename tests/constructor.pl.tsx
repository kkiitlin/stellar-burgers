import path from 'node:path';

import { test, expect, type Locator, type Page } from '@playwright/test';

const HARS_DIR = path.resolve(import.meta.dirname, 'hars');
const harPath = (name: string): string => path.join(HARS_DIR, name);

const INGREDIENTS_API = '**/api/ingredients';
const USER_API = '**/api/auth/user';
const ORDER_API = '**/api/orders';

const FIRST_INGREDIENT_NAME = 'Краторная булка';
const FILLING_NAME = 'Биф из говядины';
const MOCK_ORDER_NUMBER = 42;

/**
 * Ответы сервера подставляются из HAR-файлов в `tests/hars`.
 * `url` ограничивает перехват конкретным эндпоинтом, а `notFound: 'abort'`
 * не даёт запросу уйти в реальную сеть, если в HAR нет подходящей записи
 * (например, если тело POST-запроса отличается от записанного).
 */
async function routeFromHar(page: Page, har: string, url: string): Promise<void> {
  await page.routeFromHAR(harPath(har), { url, notFound: 'abort' });
}

async function mockIngredientRoutes(page: Page): Promise<void> {
  await routeFromHar(page, 'ingredients.har', INGREDIENTS_API);
  await routeFromHar(page, 'user-unauthorized.har', USER_API);
}

async function mockAuthorizedOrderRoutes(page: Page): Promise<void> {
  await routeFromHar(page, 'ingredients.har', INGREDIENTS_API);
  await routeFromHar(page, 'user-authorized.har', USER_API);
  await routeFromHar(page, 'order.har', ORDER_API);
}

/* На странице две навигации: меню в шапке и табы ингредиентов,
   поэтому ищем навигацию именно внутри шапки. */
const headerNavigation = (page: Page): Locator =>
  page.getByRole('banner').getByRole('navigation');

test.describe('Constructor page (mocked ingredients)', () => {
  test('renders mocked ingredients from HAR', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(headerNavigation(page)).toBeVisible();
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();
    await expect(page.getByText(FILLING_NAME)).toBeVisible();
    await expect(page.getByText('Сырный соус')).toBeVisible();
    await expect(page.locator('img[alt="картинка ингредиента."]')).toHaveCount(3);
  });
});

test.describe('Ingredient details modal', () => {
  test('opens when clicking on an ingredient card', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(headerNavigation(page)).toBeVisible();
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

    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();
  });

  test('closes when clicking the outer overlay', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(page.getByText(FIRST_INGREDIENT_NAME)).toBeVisible();

    await page.getByRole('link', { name: FIRST_INGREDIENT_NAME }).first().click();
    await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();

    await page.mouse.click(100, 100);

    await expect(
      page.getByRole('heading', { name: 'Детали ингредиента' })
    ).not.toBeVisible();
  });
});

test.describe('Constructor (adding ingredients)', () => {
  test('adds one bun and one filling to the constructor zone', async ({ page }) => {
    await mockIngredientRoutes(page);

    await page.goto('/');
    await expect(headerNavigation(page)).toBeVisible();
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
  async function setAuthTokens(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=mock-access-token; path=/';
    });
    await page.reload();
  }

  test('оформление заказа: добавление ингредиентов → заказ → очистка конструктора → закрытие модалки', async ({
    page,
  }) => {
    await mockAuthorizedOrderRoutes(page);

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

    await expect(
      page.getByRole('heading', { name: String(MOCK_ORDER_NUMBER) })
    ).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(
      page.getByRole('heading', { name: String(MOCK_ORDER_NUMBER) })
    ).not.toBeVisible();
  });
});
