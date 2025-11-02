import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'path';

const userDataDir = path.resolve('./playwright-persistent-profile');

export const test = base.extend<{ context: BrowserContext; page: Page }>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chrome',
      headless: false,
      args: [
        '--enable-features=AIPromptAPI:langs/%2A,AIPromptAPIMultimodalInput,AIProofreadingAPI,AIRewriterAPI:langs/%2A,AISummarizationAPI:langs/%2A,AIWriterAPI:langs/%2A,AllowLegacyMV2Extensions,UnexpireFlagsM139',
      ],
    });

    await use(context);

    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
