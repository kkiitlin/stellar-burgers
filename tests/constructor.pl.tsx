import path from 'node:path';

import { test, expect, type Locator, type Page } from '@playwright/test';

const HARS_DIR = path.resolve(import.meta.dirname, 'hars');
const harPath = (name: string): string => path.join(HARS_DIR, name);

const INGREDIENTS_API = '**/api/ingredients';
const USER_API = '**/api/auth/user';
const ORDER_API = '**/api/orders';

const BUN = {
  name: 'Краторная булка',
  calories: '420',
  proteins: '80',
};
const FILLING_NAME = 'Биф из говядины';
const SAUCE_NAME = 'Сырный соус';
const MOCK_ORDER_NUMBER = 42;

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

const headerNavigation = (page: Page): Locator =>
  page.getByRole('banner').getByRole('navigation');

const modals = (page: Page): Locator => page.locator('#modals');

const burgerConstructor = (page: Page): Locator =>
  page
    .locator('section')
    .filter({ has: page.getByRole('button', { name: 'Оформить заказ' }) });

const ingredientCard = (page: Page, name: string): Locator =>
  page.locator('li', { has: page.getByRole('link', { name }) });

async function openPageWithIngredients(page: Page): Promise<void> {
  await page.goto('/');
  await expect(headerNavigation(page)).toBeVisible();
  await expect(ingredientCard(page, BUN.name)).toBeVisible();
}

async function openBunDetails(page: Page): Promise<Locator> {
  await expect(modals(page)).toBeEmpty();

  await page.getByRole('link', { name: BUN.name }).click();

  const modal = modals(page);
  await expect(modal.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
  await expect(
    modal.getByRole('heading', { name: BUN.name, exact: true })
  ).toBeVisible();
  await expect(
    modal.getByRole('listitem').filter({ hasText: 'Калории, ккал' })
  ).toContainText(BUN.calories);
  await expect(
    modal.getByRole('listitem').filter({ hasText: 'Белки, г' })
  ).toContainText(BUN.proteins);

  return modal;
}

async function expectConstructorIsEmpty(page: Page): Promise<void> {
  const constructorBlock = burgerConstructor(page);

  await expect(constructorBlock.getByText('Выберите булки')).toHaveCount(2);
  await expect(constructorBlock.getByText('Выберите начинку')).toBeVisible();
  await expect(constructorBlock.getByText(BUN.name)).toHaveCount(0);
  await expect(constructorBlock.getByText(FILLING_NAME)).toHaveCount(0);
}

async function addBunAndFilling(page: Page): Promise<void> {
  const constructorBlock = burgerConstructor(page);

  await ingredientCard(page, BUN.name).getByRole('button', { name: 'Добавить' }).click();
  await expect(constructorBlock.getByText(`${BUN.name} (верх)`)).toBeVisible();
  await expect(constructorBlock.getByText(`${BUN.name} (низ)`)).toBeVisible();
  await expect(constructorBlock.getByText('Выберите булки')).toHaveCount(0);

  await ingredientCard(page, FILLING_NAME)
    .getByRole('button', { name: 'Добавить' })
    .click();
  await expect(constructorBlock.getByText(FILLING_NAME, { exact: true })).toBeVisible();
  await expect(constructorBlock.getByText('Выберите начинку')).toHaveCount(0);
}

test.describe('Constructor page (mocked ingredients)', () => {
  test('renders mocked ingredients from HAR', async ({ page }) => {
    await mockIngredientRoutes(page);

    await openPageWithIngredients(page);
    await expect(ingredientCard(page, FILLING_NAME)).toBeVisible();
    await expect(ingredientCard(page, SAUCE_NAME)).toBeVisible();
    await expect(page.locator('img[alt="картинка ингредиента."]')).toHaveCount(3);
  });
});

test.describe('Ingredient details modal', () => {
  test('opens the details of the clicked ingredient', async ({ page }) => {
    await mockIngredientRoutes(page);
    await openPageWithIngredients(page);

    const modal = await openBunDetails(page);

    await expect(modal.locator('img[alt="изображение ингредиента."]')).toBeVisible();
    await expect(modal.getByRole('heading', { name: SAUCE_NAME })).toHaveCount(0);
  });

  test('closes when clicking the close button (крестик)', async ({ page }) => {
    await mockIngredientRoutes(page);
    await openPageWithIngredients(page);

    const modal = await openBunDetails(page);

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modals(page)).toBeEmpty();
  });

  test('closes when clicking the outer overlay', async ({ page }) => {
    await mockIngredientRoutes(page);
    await openPageWithIngredients(page);

    await openBunDetails(page);

    await page.mouse.click(100, 100);

    await expect(modals(page)).toBeEmpty();
  });
});

test.describe('Constructor (adding ingredients)', () => {
  test('adds one bun and one filling to the constructor zone', async ({ page }) => {
    await mockIngredientRoutes(page);
    await openPageWithIngredients(page);

    await expectConstructorIsEmpty(page);

    await addBunAndFilling(page);
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
    await expect(ingredientCard(page, BUN.name)).toBeVisible();

    await expectConstructorIsEmpty(page);
    await addBunAndFilling(page);

    await expect(modals(page)).toBeEmpty();

    await burgerConstructor(page)
      .getByRole('button', { name: 'Оформить заказ' })
      .click();

    const modal = modals(page);
    await expect(
      modal.getByRole('heading', { name: String(MOCK_ORDER_NUMBER), exact: true })
    ).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expectConstructorIsEmpty(page);

    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modals(page)).toBeEmpty();
  });
});
