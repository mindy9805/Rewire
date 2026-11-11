# Rewire｜重塑大腦的可能

> 理解神經可塑性，重新練習思考、情緒與行為。

以 Nicole Vignola《Rewire》為學習主軸的繁體中文互動式學習網站。結合互動電子書、知識筆記、視覺化學習、個人反思與行為練習；不需登入、沒有後端，所有個人資料只存在使用者的瀏覽器（LocalStorage）。

- 正式網址（部署後）：`https://mindy9805.github.io/rewire/`
- 技術：React 18、TypeScript、Vite 5、Tailwind CSS 3、React Router（HashRouter）、Lucide Icons、Recharts、PWA（manifest + Service Worker）

## 導覽結構與名稱對照表

全站分成三個入口（側邊欄分組與手機底部導覽相同；手機底部另外放出最常用的「每日練習」）：

| 入口 | 包含 | 總覽頁 |
| --- | --- | --- |
| **今天** | 今天（首頁）、輕鬆探索 | `#/` |
| **學習** | 深度導讀、每日心智練習、打破慣性、7 Habits 高效能生活、知識實驗室、我的計畫、研究來源 | `#/learning` |
| **我的** | 反思日誌、學習儀表板、心智花園、成長收藏冊、時光膠囊、資料與隱私 | `#/me` |

每個功能只用一個中文名稱（英文只當小標）。名稱定義在 `src/components/layout/nav.ts` 與 `src/content/systems.ts`，改名時請一併檢查頁面標題：

| 統一名稱 | 英文小標 | 以前也叫做 |
| --- | --- | --- |
| 今天 | Today | 首頁 |
| 深度導讀 | Learn / Neuroscience | 導讀、神經科學深度導讀、神經可塑性 |
| 每日心智練習 | Daily Rewire | 每日七句心智練習 |
| 打破慣性 | Break the Pattern | 七個隱形消耗習慣 |
| 7 Habits 高效能生活 | 7 Habits | 高效能人士的七個習慣 |
| 知識實驗室 | Brain Lab | 互動式知識實驗室 |
| 我的計畫 | My Plans | 挑戰與探索計畫（底部導覽原本的「14 天練習」） |
| 學習儀表板 | Dashboard | 學習進度儀表板、成長儀表板 |

## 功能總覽

| 頁面 | 路徑 | 內容 |
| --- | --- | --- |
| 今天（首頁） | `#/` | 「繼續上次」（有進行中的計畫或看到一半的章節時才出現）、「今天，你想怎麼探索自己？」三個入口（小驚喜／小遊戲／安靜一下）、成長夥伴、心智花園預覽、今日推薦、最近收藏；可自訂顯示區塊（「自由探索」已移到「學習」頁，預設收起） |
| 學習（總覽） | `#/learning` | 四大學習系統，加上知識實驗室、我的計畫、研究來源 |
| 我的（總覽） | `#/me` | 反思日誌、學習儀表板、心智花園、成長收藏冊、時光膠囊、資料與隱私 |
| 我的計畫 | `#/plans` | 三個多天計畫集中一頁：只突顯一個進行中的計畫（「繼續第 N 天」），其他計畫列在下方；進度仍各自保存 |
| 輕鬆探索 Playful Growth | `#/play`、`#/play/<quest\|surprise\|wheel\|stories\|garden\|collection\|capsule>` | 今日輕冒險、心情盲盒、隨機探索轉盤、人際情境小劇場、心智花園、成長收藏冊、時光膠囊、成長夥伴「小芽」。沒有排行榜、連續天數或失敗懲罰；已解鎖的收藏永久保留 |
| 每日心智練習 | `#/daily`、`#/daily/read` | 七句卡片（展開／收藏／複製）、沉浸式朗讀模式（上一句／下一句／重新開始／語音朗讀）、今日紀錄、歷史回顧與統計 |
| 深度導讀 Learn | `#/learn`、`#/learn/ch1`…`ch9` | 頂部黏著「段落進度列」（目前第幾段、可直接跳段；打破慣性與 7 Habits 的學習頁也有）。9 章：學習目標、核心概念、深入解釋、生活案例、示意圖、應用、互動練習、反思、3–5 題測驗、摘要、研究來源、對應心智語句、本章筆記 |
| 知識實驗室 Brain Lab | `#/lab`、`#/lab/<id>` | 神經道路模擬器、認知濾鏡實驗、身份敘事改寫器、自我對話轉換、習慣偵探、習慣養成模擬器、If-Then 產生器、證據檢視卡、七大實踐工具 |
| 14 天練習（屬於我的計畫） | `#/challenge?day=N` | 進度條、補做／重做、完成勾選、每日紀錄、今日心智語句五步驟、總結、JSON／Markdown 匯出 |
| 打破慣性 Break the Pattern | `#/pattern`、`#/pattern/<習慣>`、`#/pattern/assessment`、`#/pattern/workshop` | 7 個隱形消耗習慣：每個習慣 10 段學習內容＋專屬互動工具（認可依賴覺察器、舒適圈探索地圖、消費動機檢視器、安靜五分鐘、微承諾追蹤器、成長環境盤點、短期與長期選擇模擬器）、行動實驗；21 題自我覺察評估（非診斷）；七步驟習慣改變工作坊；首頁「你最想調整哪一個習慣？」；14 天打破慣性挑戰（`#/challenge?type=pattern`）；儀表板資料區；與每日七句心智練習整合（舊網址 `#/habits` 自動轉址） |
| 7 Habits｜高效能生活實踐 | `#/habits7`、`#/habits7/<習慣>`、`#/habits7/plan` | 以柯維《與成功有約》七個習慣為理論參考的原創學習系統：三階段學習地圖（個人成功→公眾成功→自我更新）；七章各含十個學習面向，並標示內容來源類型（柯維管理哲學／心理學／神經科學／本站工具）；七個互動工具（關注圈與影響圈、人生羅盤與願景宣言、四象限優先矩陣＋本週三件要事、雙贏協商工作坊、同理溝通模擬器、團隊合作思考板〔個人工作坊，可匯出匯入〕、四維成長儀表板）；章節測驗與自我評估；與 Break the Pattern 的公開推薦規則；21 天七習慣探索計畫；儀表板資料區 |
| 反思日誌 | `#/journal`、`#/journal?tab=notes` | 日誌新增／編輯／刪除／搜尋／標籤；章節筆記依章節、類型、標籤篩選與匯出 |
| 學習儀表板 | `#/dashboard` | 章節、測驗、挑戰、Daily Rewire、練習頻率圖、情緒趨勢、最近反思、If-Then 計畫、里程碑（皆依真實資料計算） |
| 研究來源 | `#/references` | 科學證據檢視卡、完整文獻（附 DOI，無法確認者標示「待查證」） |
| 資料與隱私 | `#/data` | 本地儲存說明、完整備份（JSON）、Markdown 匯出、匯入驗證與還原、清除所有紀錄 |

其他：全站搜尋（`/` 或 `Ctrl/⌘ + K`）、淺色／深色／跟隨系統、四段字級、右側可收合筆記面板、手機抽屜選單與底部導覽、支援減少動畫偏好，也可在頂部列或「資料與隱私 → 外觀與動畫」直接關閉站內動畫。

## 專案結構

```
rewire/
├── docs/                      # ★ 建置好的網站（GitHub Pages 直接提供這個資料夾）
├── index.html                 # HTML 入口（預先套用主題、字級與動畫設定，避免閃爍）
├── public/                    # PWA：manifest、Service Worker、圖示
├── src/
│   ├── content/               # ★ 學習內容（與程式邏輯分離，修改文字只需改這裡）
│   │   ├── chapters-a/b/c.ts  #   九個章節
│   │   ├── dailyRewire.ts     #   七句每日心智語句（原文請勿修改）
│   │   ├── challenge.ts       #   14 天計畫
│   │   ├── references.ts      #   研究來源與證據檢視卡
│   │   ├── tools.ts           #   情緒詞彙、口袋句、情境題
│   │   ├── play.ts            #   輕鬆探索：卡片、冒險、小劇場、轉盤、徽章、植物
│   │   ├── systems.ts         #   四大學習系統與產品理念
│   │   ├── habits7.ts         #   7 Habits：七個習慣、推薦規則、21 天計畫、工具內容
│   │   ├── breakPattern.ts    #   打破慣性：七個習慣、21 題評估、工作坊、14 天挑戰任務
│   │   └── legacyHabits.ts    #   舊版自我檢視名稱（僅顯示已保存的舊資料）
│   ├── index.css              # 樣式入口：只負責匯入 styles/ 與 Tailwind
│   ├── styles/                # ★ 樣式（依用途拆分）
│   │   ├── tokens.css         #   品牌色（淺色／深色）與字級變數：改色只改這裡
│   │   ├── base.css           #   基礎排版、標題斷行、焦點樣式
│   │   ├── components.css     #   共用 class：.btn、.icon-btn、.field、.chip、.card-hover
│   │   ├── motion.css         #   減少動畫／站內關閉動畫
│   │   └── print.css          #   列印
│   ├── store/                 # LocalStorage 資料層（版本、容錯讀取、匯入驗證）
│   ├── lib/                   # 統計、搜尋、匯出、日期、改寫規則、語音、動畫偏好、小慶祝事件、計畫與「繼續上次」
│   ├── components/
│   │   ├── layout/            #   頂部列、側邊欄、右側面板、手機導覽、搜尋
│   │   ├── interactive/       #   章節互動元件、測驗
│   │   ├── tools/             #   七大實踐工具
│   │   ├── daily/             #   Daily Rewire 卡片、朗讀模式、紀錄表單
│   │   ├── diagrams/          #   各章 SVG 示意圖
│   │   ├── habits7/           #   7 Habits：七個工具、學習地圖、儀表板資料區
│   │   ├── pattern/           #   打破慣性：七個工具、挑戰、儀表板資料區
│   │   ├── notes/             #   筆記編輯與清單
│   │   ├── play/              #   輕鬆探索：小芽、花園、轉盤、盲盒、飄葉慶祝
│   │   ├── home/              #   首頁主視覺與三個入口
│   │   └── ui/                #   共用 UI（Toast、確認視窗、表單欄位、依標點斷行的標題 Phrased）
│   └── pages/                 # 各頁面
├── e2e/smoke.cjs              # 端對端測試（Playwright）
└── scripts/make-icons.cjs     # 由 icon.svg 產生 PNG 圖示
```

### 維護慣例

- **改文字**：只改 `src/content/`；元件不寫死內容。
- **改顏色或字級**：改 `src/styles/tokens.css`，深色模式在同一個檔案。
- **動畫**：keyframes 統一寫在 `tailwind.config.js`，元件用 `motion-safe:animate-*`；需要用 JS 判斷時呼叫 `src/lib/motion.ts` 的 `prefersReducedMotion()`，系統偏好與站內「關閉動畫」都會生效。
- **小慶祝**：呼叫 `src/lib/celebrate.ts` 的 `celebrate()`，`LeafBurst` 會播放飄葉，關閉動畫時自動略過。
- **標題**：較長的中文標題用 `<Phrased text={...} />`，只在標點後換行，手機上不會出現單字落行。
- **響應式**：以手機為基準撰寫，再用 `sm:`（640px）、`md:`（768px）、`lg:`（1024px，顯示側邊欄）、`xl:`（1280px，顯示右側面板）往上加。

### 彩蛋

- 點一下成長夥伴「小芽」會跳一下並換一句話；連續點 7 次會說出悄悄話並飄下葉子。
- 在任何頁面（不在輸入框時）用鍵盤打出 `rewire`。
- 解鎖新的徽章、植物或景觀時，會飄下葉子小小慶祝一下。

## 本機開發

需要 Node.js 20 以上。

```bash
npm install
npm run dev          # 開發伺服器 http://localhost:5173
```

## 檢查與測試

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript 型別檢查
npm test             # 單元測試（資料層、統計、改寫規則、打破慣性計算）
npm run build        # 建置，輸出到 docs/
npm run check        # 以上全部

# 端對端測試（需要 Playwright 與 Chromium）
npx vite preview --port 4173 &
npm run e2e
```

## 部署到 GitHub Pages

網站的建置結果放在 `docs/` 資料夾，GitHub Pages 可以直接提供，不需要 GitHub Actions。

**第一次設定（只需要做一次）**
1. 到 GitHub 儲存庫 **Settings → Pages**。
2. **Build and deployment → Source** 選擇 **Deploy from a branch**。
3. **Branch** 選 **main**，資料夾選 **/docs**，按 **Save**。
4. 等 1～3 分鐘，網站會出現在 `https://mindy9805.github.io/rewire/`。

**之後修改內容時**
1. 修改 `src/` 中的檔案（例如 `src/content/` 的文字）。
2. 在本機執行 `npm run build`，`docs/` 會自動更新。
3. 把修改的檔案與更新後的 `docs/` 一起提交（commit）並推送（push）。

**自動檢查**：`.github/workflows/check.yml` 會在每次推送時執行程式碼檢查、型別檢查、單元測試與建置，並確認提交的 `docs/` 與原始碼一致。它只做檢查、不會部署，所以不需要更改 Pages 的設定。

**路徑說明**：Vite 使用相對路徑 `base: './'`，搭配 HashRouter（網址形如 `/rewire/#/learn/ch1`），因此放在任何子路徑都能正確載入，重新整理或分享深層連結也不會出現 404。

## 資料與隱私

- 資料結構帶有修訂號（`revision`，目前為 4）。
- **共用活動紀錄**（`src/lib/activity.ts`）：每一筆實際保存的練習或紀錄以「來源＋紀錄 id」計算一次，同一筆編輯不重複計算；瀏覽、抽卡、轉轉盤本身不計入。心智花園的成長點、收藏徽章與儀表板「自願參與」統計都使用這份定義。已解鎖的徽章與植物另存於 `unlocks`，不會因中斷或刪除紀錄而收回。讀取舊版資料或舊備份時，會自動補齊新模組的預設值，不會刪除既有紀錄。

- 所有筆記、情緒紀錄、練習內容與行動計畫只存在瀏覽器 LocalStorage（鍵名 `rewire:v1`），不會傳送到任何第三方服務。
- 網站只從 Google Fonts 下載字型檔。語音朗讀使用瀏覽器內建的 SpeechSynthesis。
- 清除網站資料、更換裝置或使用無痕模式可能導致紀錄遺失，請在「資料與隱私」頁定期匯出備份。

## 內容與研究原則

- 學習解說皆為重新組織的原創文字，不複製書籍或影片中的長篇內容。
- 研究來源列出作者、年份、期刊與 DOI；開發環境無法即時連線 doi.org 比對，建議維護者點擊連結再次確認。無法確認的欄位（例如《Rewire》各版本的出版社與年份）標示「待查證」。
- 模擬器與曲線圖皆標示「概念示意／概念模型」，不代表真實神經變化數據。
- 本站練習不能取代專業心理或醫療協助（台灣 1925 安心專線，24 小時）。
