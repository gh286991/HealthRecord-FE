describe('Smoke - Home page', () => {
  it('visits home and sees headline', () => {
    cy.visit('/')
    cy.contains('h1', '健康生活').should('be.visible')
    cy.contains('span', '從今天開始').should('be.visible')
  })
})
