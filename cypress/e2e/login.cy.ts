describe('Login flow', () => {
  it('should login with valid credentials and redirect to profile', () => {
    const username = Cypress.env('E2E_USERNAME') || 'john_doe';
    const password = Cypress.env('E2E_PASSWORD') || 'password123';

    cy.visit('/login');
    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.contains('button', '登入').click();

    cy.location('pathname', { timeout: 15000 }).should('match', /\/profile$/);
  });
});


