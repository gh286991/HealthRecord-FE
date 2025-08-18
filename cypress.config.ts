import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    retries: 1,
    defaultCommandTimeout: 10000,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports/html',
      charts: true,
      reportPageTitle: 'Cypress E2E 測試報告',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      json: true,
    },
    setupNodeEvents(on, config) {
      // 啟用 cypress-mochawesome-reporter 插件，將失敗截圖自動附加到報告
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});


