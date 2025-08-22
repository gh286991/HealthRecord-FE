// 匯入自定義命令
import './commands';
import 'cypress-mochawesome-reporter/register';

// Register or ensure test user exists before tests
before(() => {
  const apiUrl = Cypress.env('NEXT_PUBLIC_API_BASE_URL') || 'http://localhost:9181';
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


