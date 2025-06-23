# 健康管理系統前端

這是一個基於 Next.js 的現代化健康管理系統前端應用程式，提供用戶註冊、登入和個人資料管理功能。

## 功能特色

- 🔐 **用戶認證系統**
  - 用戶註冊
  - 用戶登入
  - JWT 令牌驗證
  - 自動登出處理

- 👤 **個人資料管理**
  - 查看個人資料
  - 編輯個人資料
  - 支援多種個人資訊欄位（姓名、性別、生日、個人簡介等）

- 🎨 **現代化介面**
  - 響應式設計
  - 基於 Tailwind CSS
  - 直觀的用戶體驗
  - 完整的錯誤處理和載入狀態

## 技術架構

- **框架**: Next.js 15.3.4 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS 4
- **HTTP 客戶端**: Axios
- **表單處理**: React Hook Form + Zod
- **狀態管理**: React Hooks
- **認證**: JWT 令牌

## API 端點

應用程式連接到以下 API 端點：

- `POST /auth/register` - 用戶註冊
- `POST /auth/login` - 用戶登入
- `GET /auth/profile` - 獲取用戶資料
- `PATCH /auth/profile` - 更新用戶資料

**API 基礎網址**: `https://1e05-118-163-26-2.ngrok-free.app`

## 快速開始

### 安裝依賴

```bash
yarn install
```

### 啟動開發服務器

```bash
yarn dev
```

應用程式將在 [http://localhost:3000](http://localhost:3000) 啟動。

### 構建生產版本

```bash
yarn build
yarn start
```

## 專案結構

```
src/
├── app/                    # Next.js App Router 頁面
│   ├── layout.tsx         # 根佈局
│   ├── page.tsx           # 首頁
│   ├── login/             # 登入頁面
│   ├── register/          # 註冊頁面
│   └── profile/           # 個人資料頁面
├── components/            # 可重用組件
│   └── Navigation.tsx     # 導航組件
└── lib/                   # 工具函數和 API
    └── api.ts            # API 服務層
```

## 使用說明

### 1. 註冊新帳戶

1. 點擊導航欄的「註冊」按鈕
2. 填寫必要資訊（用戶名、信箱、密碼）
3. 可選填寫其他個人資訊
4. 點擊「註冊」完成註冊

### 2. 登入系統

1. 點擊導航欄的「登入」按鈕
2. 輸入用戶名和密碼
3. 點擊「登入」進入系統

### 3. 管理個人資料

1. 登入後點擊「個人資料」
2. 查看現有資料
3. 點擊「編輯資料」修改資訊
4. 點擊「儲存」保存變更

## 測試帳戶

您可以使用以下測試帳戶進行測試：

- **用戶名**: `test_user`
- **密碼**: `password123`

## 開發說明

### 環境要求

- Node.js 18+
- Yarn 包管理器

### 代碼規範

- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 規則
- 使用 Prettier 格式化代碼

### API 整合

所有 API 請求都通過 `src/lib/api.ts` 中的服務層處理，包括：

- 自動添加認證標頭
- 錯誤處理
- 響應攔截
- 類型安全

## 部署

應用程式可以部署到任何支援 Next.js 的平台，如：

- Vercel
- Netlify
- AWS
- 自托管服務器

## 許可證

此專案僅供學習和演示用途。
