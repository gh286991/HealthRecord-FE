describe('Workout Record - Add New Workout', () => {
  beforeEach(() => {
    // 確保測試用戶已登入
    const username = Cypress.env('E2E_USERNAME') || 'john_doe';
    const password = Cypress.env('E2E_PASSWORD') || 'password123';
    
    cy.visit('/login');
    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.contains('button', '登入').click();
    
    // 等待登入成功並轉到 profile
    cy.location('pathname', { timeout: 10000 }).should('match', /\/profile$/);
  });

  it('should successfully add a new workout record', () => {
    // 前往運動頁面
    cy.visit('/workout');
    
    // 點擊新增運動按鈕
    cy.contains('button', '新增運動').should('be.visible').click();
    
    // 應該進入 FocusMode（訓練模式）
    cy.contains('開始運動').should('be.visible');
    
    // 點擊新增運動項目
    cy.contains('button', '新增運動').click();
    
    // 選擇部位 - 假設有胸部選項
    cy.get('select').first().select('胸部');
    
    // 等待運動選項載入並選擇第一個
    cy.get('[class*="grid"] button').first().should('be.visible').click();
    
    // 確認運動已新增
    cy.contains('已加入').should('be.visible');
    
    // 調整重量到 50kg
    cy.contains('重量').parent().within(() => {
      // 點擊增加重量按鈕多次
      for (let i = 0; i < 5; i++) {
        cy.get('button').contains('+').click();
      }
    });
    
    // 調整次數到 10次
    cy.contains('次數').parent().within(() => {
      // 點擊增加次數按鈕
      cy.get('button').contains('+').click();
      cy.get('button').contains('+').click();
    });
    
    // 完成這組
    cy.contains('button', '完成這組').click();
    
    // 繼續下一組
    cy.contains('button', '繼續下一組').should('be.visible').click();
    
    // 完成第二組
    cy.contains('button', '完成這組').click();
    
    // 結束訓練並儲存
    cy.contains('button', '結束訓練').should('be.visible').click();
    
    // 確認儲存成功的提示
    cy.contains('訓練已儲存').should('be.visible');
    
    // 返回列表頁面，確認記錄已新增
    cy.contains('健身紀錄').should('be.visible');
    cy.get('[class*="card"], [class*="Card"]').should('exist');
  });

  it('should show validation error for empty workout', () => {
    cy.visit('/workout');
    
    // 點擊新增運動按鈕
    cy.contains('button', '新增運動').should('be.visible').click();
    
    // 直接嘗試結束訓練（沒有新增任何運動）
    cy.contains('button', '結束訓練').should('be.visible').click();
    
    // 應該顯示錯誤提示
    cy.contains('請至少新增一個運動').should('be.visible');
  });
});
