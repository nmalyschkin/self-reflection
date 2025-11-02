import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  // reporter: 'html',
  timeout: 3600_000, // 1 hour
  expect: {
    timeout: 600_000, // 10 minutes
  },
  use: {
    launchOptions: {
      channel: 'chrome',
      args: [
        '--enable-features=AIPromptAPI:langs/%2A,AIPromptAPIMultimodalInput,AIProofreadingAPI,AIRewriterAPI:langs/%2A,AISummarizationAPI:langs/%2A,AIWriterAPI:langs/%2A,AllowLegacyMV2Extensions,UnexpireFlagsM139',
      ],
    },
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
