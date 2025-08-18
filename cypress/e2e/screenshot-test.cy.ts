describe('Screenshot Test (故意失敗)', () => {
  it('should take screenshot on failure', () => {
    cy.visit('/');
    
    // 故意失敗的斷言，用來測試截圖功能
    cy.contains('這個文字不存在').should('be.visible');
  });
});
