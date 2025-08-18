// 匯入自定義命令
import './commands';
import 'cypress-mochawesome-reporter/register';

// Register or ensure test user exists before tests
before(() => {
  const apiUrl = Cypress.env('API_URL') || Cypress.env('CYPRESS_API_URL') || 'http://backend:9181';
  const username = Cypress.env('E2E_USERNAME') || 'john_doe';
  const password = Cypress.env('E2E_PASSWORD') || 'password123';
  const email = `${username}@example.com`;

  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/register`,
    body: { username, email, password },
    failOnStatusCode: false,
  });
});


