# Coffee Project 前端 AI 修改規範

> 本文件提供給 Claude Code、Codex 與其他 AI Coding Agent 使用。  
> **每次開始分析、修改、重構或產生程式碼前，必須先完整閱讀本文件。**  
> 若使用者當次指令與本文件衝突，**以使用者當次明確指令為最高優先**；否則必須遵守本文件。

---

## 1. 專案背景

本專案為「咖啡機會員系統」前端，主要技術為：

- Angular 18
- ng-zorro-antd
- SCSS
- RESTful API
- SSO
- JWT
- 後端為 .NET 8 Web API

主要功能包含：

- SSO 登入
- 會員資訊
- 點數查詢、累積、使用、轉贈
- 咖啡兌換
- 設備管理
- 權限管理
- 歷史紀錄 / Log
- 資料分析
- RWD

目前前端功能大致可正常運作，後續 AI 工作的主要目的為：

1. 改善 UX
2. 改善 RWD
3. 改善版面穩定性
4. 改善視覺一致性
5. 在使用者確認後進行 UI 視覺改版

**除非使用者明確要求，禁止因為 UI / UX 修改而更動既有功能行為。**

---

## 2. 最高優先原則

### 2.1 功能不可被 UI 修改破壞

除非使用者明確要求，禁止修改：

- API endpoint
- API request / response 結構
- Service 行為
- Model / Interface 資料結構
- Routing
- SSO 流程
- JWT 流程
- 權限判斷
- Role 判斷
- Login / Logout 流程
- Angular event binding
- `*ngIf`
- `*ngFor`
- `@if`
- `@for`
- Form model
- Reactive Form / ngModel 綁定
- Table datasource
- Pagination 邏輯
- Search / Filter 邏輯
- Modal 開關邏輯
- CRUD 行為
- Coffee machine 相關操作流程

### 2.2 HTML 可安全修改範圍

UI 修改時，優先只做：

- 新增 / 修改 class
- 新增必要 wrapper
- 調整 DOM 排版結構
- 調整 flex / grid 容器
- 調整顯示順序（但不得改變操作流程）
- 加入純視覺元素

若需要刪除既有 HTML 元素，必須先確認該元素：

- 沒有事件
- 沒有 Angular binding
- 沒有 directive
- 沒有權限判斷
- 沒有功能用途

否則不得刪除。

---

## 3. AI 工作流程

任何跨檔案或較大的修改都必須依照以下流程。

### Step 1：先閱讀，不修改

先分析：

- 相關 HTML
- SCSS
- TypeScript
- 共用元件
- 父層 Layout
- ng-zorro DOM 結構
- RWD breakpoint
- 相關 Git diff

先找 **Root Cause**，不要直接猜 CSS。

### Step 2：回報分析結果

修改前應先說明：

1. 問題發生在哪裡
2. Root Cause
3. 預計修改哪些檔案
4. 預計怎麼修改
5. 是否會影響其他頁面
6. 是否涉及功能邏輯

若使用者要求「先分析」，則禁止修改檔案。

### Step 3：最小修改

優先原則：

> 能改 3 行，不改 30 行。  
> 能改 SCSS，不改 TS。  
> 能修 Root Cause，不加 workaround。

禁止為了解決小問題而：

- 大幅重寫 Component
- 重構整個專案
- 換 UI library
- 新增不必要 npm package
- 改變資料流
- 改變 API contract

### Step 4：實際驗證

修改完成後，至少做：

- Angular build / dev server 驗證
- Browser 實際渲染
- Sidebar 展開 / 收合
- Desktop
- Tablet
- Mobile

若問題與 layout / overflow / sizing 有關，優先使用實際 DOM 幾何確認：

- `getBoundingClientRect()`
- `scrollWidth`
- `clientWidth`
- `offsetWidth`
- `computedStyle`

不要只靠肉眼推測。

### Step 5：回報修改結果

每次修改後至少回報：

- 修改檔案
- 每個檔案改了什麼
- 為什麼這樣改
- Root Cause 是否已解決
- 哪些功能完全沒動
- Desktop / Tablet / Mobile 是否驗證
- 是否存在潛在副作用

---

## 4. UX 修改規則

### 4.1 優先解決 Layout Root Cause

遇到：

- 按鈕被壓扁
- Sidebar 展開後版面跑掉
- Input 變形
- Table 撐爆
- 元件尺寸突然改變

優先檢查：

```text
display
flex
flex-grow
flex-shrink
flex-basis
flex-wrap
min-width
max-width
width
overflow
gap
box-sizing
padding
margin
grid
white-space
```

不要第一時間直接硬塞：

```scss
width: 120px !important;
```

### 4.2 Sidebar

Sidebar 必須符合：

#### 展開
- icon 正常
- 文字正常
- submenu 箭頭正常
- 不造成主內容異常 overflow

#### 收合
- 主選單 icon 必須保留
- submenu icon 必須保留
- 文字應隱藏
- submenu arrow 可隱藏
- 不可因隱藏文字仍佔空間而撐寬
- 不可把整個 `li[nz-submenu]` 隱藏

一般 menu item 與 submenu 必須分開處理，不能假設 DOM 結構相同。

### 4.3 Search / Filter / Toolbar

優先採用：

```scss
display: flex;
flex-wrap: wrap;
gap: ...;
```

讓排版依「容器實際可用寬度」調整。

不要過度依賴 viewport breakpoint grid，因為 sidebar 展開 / 收合會改變 content 寬度，但不會改變 viewport。

#### Button

搜尋、清除、篩選等按鈕：

```scss
flex: 0 0 auto;
```

避免被壓縮。

按鈕寬度應優先採用：

```text
文字自然寬度 + padding + 合理 min-width
```

避免所有短文字按鈕都硬設過大的固定寬度。

### 4.4 Input / Select / Button 高度

同一 toolbar 中：

- Input
- Select
- Search button
- Clear button
- Filter button

應盡量視覺等高。

目前專案常用：

```text
40px
```

除非使用者要求，不要任意改成不同高度。

### 4.5 Table

內容不足時，優先：

- horizontal scroll
- 合理 min-width
- action column 保持可操作

不要：

- 把所有 column 壓到極窄
- 讓操作文字換行成兩三行
- 讓 button 被壓扁

Action button 應考慮：

```scss
white-space: nowrap;
flex-shrink: 0;
```

但要先確認實際 DOM 結構。

---

## 5. RWD 規則

至少考慮：

```text
Desktop
較窄 Desktop / Laptop
Tablet
Mobile
```

推薦實測寬度：

```text
1440px
1200px
1024px
820px
768px
375px
```

### 原則

#### Desktop
- 優先一列顯示
- Sidebar 展開不應導致元件異常壓縮

#### Tablet
- 允許 toolbar 自然換行
- Table 可水平捲動

#### Mobile
- 可以改為單欄
- 重要 action 保持容易點擊
- 避免水平裁切
- 避免超大固定寬度

不要為了「統一 breakpoint」而強迫不同頁面使用完全一樣的數字。

應統一的是行為：

```text
空間足夠 → 同列
空間不足 → wrap
非常窄 → 單欄
```

---

## 6. UI 視覺改版規則

當使用者開始要求「變漂亮」「換風格」「UI redesign」時，仍必須遵守功能保護規則。

### 6.1 改版順序

推薦：

1. Design Tokens
2. Typography
3. Spacing
4. Sidebar
5. Header
6. Button / Input / Select
7. Card
8. Table
9. Modal
10. Empty / Loading State
11. 各頁面微調
12. RWD consistency review

### 6.2 不要直接全站重寫

禁止：

> 「一次把整個專案全部重新設計」

優先選一個代表頁面做樣板，例如：

```text
equipment
```

因為設備管理通常包含：

- Sidebar
- Header
- Search
- Filter
- Button
- Table
- Modal
- RWD

確認使用者接受風格後，再套用到其他頁面。

---

## 7. SCSS 規範

### 優先

- component SCSS
- 共用 variables
- 共用 mixin
- 清楚 selector

### 避免

- 大量 `!important`
- 過深 selector
- 大量 inline style
- 為了小問題加 global CSS
- 魔法數字
- 同一個 selector 前後互相覆蓋

### `::ng-deep`

只有在確實需要修改 ng-zorro 內部產生的 DOM 時才使用。

使用前必須確認：

- Angular View Encapsulation 無法直接選到該節點
- 該 class 是 ng-zorro 內部節點
- 沒有更乾淨的 API / class 可使用

若使用：

```scss
::ng-deep
```

應把 selector 範圍限制在目前 component 內，避免污染全站。

---

## 8. ng-zorro 注意事項

不要假設 ng-zorro DOM 結構。

修改前應實際確認：

- `.ant-input`
- `.ant-input-affix-wrapper`
- `.ant-menu-title-content`
- `.ant-menu-submenu-arrow`
- `.ant-table-*`
- `.ant-select-*`

若 style 沒生效，先確認：

```text
View Encapsulation
Specificity
ng-zorro component template
Computed Style
```

不要立即加 `!important`。

---

## 9. Git 安全規則

修改前先看：

```bash
git status
git diff
```

大修改前建議：

```bash
git checkout -b ui-redesign
```

每完成一個階段 commit 一次。

例如：

```bash
git add .
git commit -m "style: improve sidebar layout"
```

```bash
git commit -m "style: refine search toolbar"
```

```bash
git commit -m "style: improve table responsiveness"
```

不要在未確認的情況下執行：

```bash
git reset --hard
git clean -fd
```

---

## 10. package-lock.json

本專案曾因 `package-lock.json` 被改動導致不同電腦安裝出不同結果。

因此：

- 不要任意刪除 `package-lock.json`
- 不要為 UI 修改更新 dependency
- 不要執行 `npm audit fix --force`
- 不要因 UI 問題升級 Angular / ng-zorro

若只是安裝：

```bash
npm ci
```

優先於：

```bash
npm install
```

---

## 11. 開發環境

目前已驗證可使用：

```text
Node.js v24.13.0
npm 11.6.2
```

若遇到：

```text
另一台可以跑，這台不能跑
```

先比對：

```bash
node -v
npm -v
git rev-parse HEAD
git status
```

再考慮修改程式碼。

---

## 12. 目前已完成的 UX 修改

AI 在後續工作前應知道目前已有以下修改，不要無故回退。

### Sidebar

已改善：

- sidebar 展開 / 收合 transition
- 中等螢幕 sidebar width
- main content `min-width: 0`
- icon / text 對齊
- collapsed menu text width
- submenu 收合時 icon 消失 bug

目前 collapsed submenu：

- icon 保留
- title 隱藏
- arrow 隱藏
- submenu 本體不可 `display:none`

### Search / Filter

已改善：

#### equipment
原本：

```text
nz-row / nz-col breakpoint grid
```

目前：

```text
flex + flex-wrap
```

結構：

```text
.search-filter-bar
├─ .search-section
│  ├─ .search-input
│  ├─ .search-btn
│  ├─ .filter-dropdown
│  └─ .clear-btn
└─ .action-group
   └─ .create-device-btn
```

#### historical-record
搜尋區已調整 flex 行為。

#### permission-management
搜尋區已調整 flex 行為。

### Button

目前 Search / Clear：

```text
height: 40px
min-width: 約 80px
flex: 0 0 auto
```

Filter：

```text
height: 40px
min-width: 約 140px
flex: 0 0 auto
```

不要無故恢復成原本 110px / 160px 的大尺寸。

### Equipment Search Input

曾發生：

```text
.ant-input-affix-wrapper
與
.ant-input
同時 height:40px
```

造成內部 input 超出 wrapper 約 5px。

目前應維持概念：

```scss
.ant-input-affix-wrapper {
  height: 40px;

  .ant-input {
    height: 100%;
  }
}
```

不要重新把兩者都設定成獨立固定 40px。

---

## 13. AI 禁止事項

除非使用者明確要求，禁止：

- 隨意改功能
- 隨意改 API
- 隨意升級套件
- 隨意刪除 component
- 隨意移除 route
- 隨意改資料 model
- 為 UI 新增大型 dependency
- 自動執行 destructive git command
- 為了「統一」而重構沒有問題的頁面
- 把所有 CSS 都移到 global
- 大量使用 `!important`
- 用 `overflow:hidden` 掩蓋真正 overflow bug
- 用 absolute positioning 硬修正常 flex 可以解決的 layout
- 未實測就宣稱問題已修復

---

## 14. AI 回報格式

完成分析時：

```text
## Root Cause
...

## 影響範圍
...

## 建議修改
...

## 預計修改檔案
...

## 可能副作用
...
```

完成修改時：

```text
## 修改檔案
...

## 修改內容
...

## 為什麼這樣修改
...

## 未修改的功能
...

## 驗證結果
Desktop:
Tablet:
Mobile:
Sidebar expanded:
Sidebar collapsed:

## 可能風險
...
```

---

## 15. 最重要的一句話

> **這個專案的 AI 修改原則是：「先理解、找 Root Cause、最小修改、實際驗證，再繼續下一個問題。」**

UI / UX 改版的目的是讓系統：

- 更好看
- 更一致
- 更容易操作
- 更穩定

而不是為了重構而重構。

**若現有功能已正常，視覺修改不得改變其行為。**
