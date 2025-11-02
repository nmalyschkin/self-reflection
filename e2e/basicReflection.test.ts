import { expect, chromium, type Page } from '@playwright/test';
import path from 'path';
import { test } from './context';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getAvailability = async (page: Page) => {
  return await page.evaluate(async () => {
    const w = window as any;
    return await Promise.all([
      w.LanguageModel.availability(),
      w.Summarizer.availability(),
      w.Rewriter.availability(),
    ]);
  });
};

const waitUntilAvailable = async (page: Page) => {
  let available = false;
  while (!available) {
    const availability = await getAvailability(page);
    console.log(availability);
    available = availability.every((a) => a === 'available');
    await sleep(1000);
  }
};

test.beforeAll(async ({ page }) => {
  await page.goto('localhost:5173');

  await waitUntilAvailable(page);

  // click on download model button
  await page.getByRole('button', { name: 'Download model' }).click();

  // wait for reflection button to be visible
  await page.getByRole('button', { name: 'Start reflecting' }).waitFor({ state: 'visible' });
});

test('has title', async ({ page }) => {
  await page.goto('localhost:5173');

  await waitUntilAvailable(page);

  // check if
  // click on download model button
  await page.getByRole('button', { name: 'Download model' }).click();

  // wait for reflection button to be visible
  await page.getByRole('button', { name: 'Start reflecting' }).waitFor({ state: 'visible' });
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});
