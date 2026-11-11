/**
 * 端對端冒煙測試（Playwright）
 * 執行前先 `npm run build && npx vite preview --port 4173`，再執行：node e2e/smoke.cjs
 * 會逐一檢查主要互動是否真的可用、LocalStorage 是否保存、手機版是否沒有橫向捲動。
 */
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const results = [];
const ok = (name) => { results.push(['✓', name]); };
const fail = (name, e) => { results.push(['✗', `${name} — ${e.message.split('\n')[0]}`]); };
async function step(name, fn) { try { await fn(); ok(name); } catch (e) { fail(name, e); } }
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('rewire:v1') || '{}'));
const AFF = ['我現在是安全的', '我的大腦可以改變', '我已經足夠好了', '犯錯是我成長的方式', '我的想法不等於事實', '我的存在很重要', '今天是新的機會'];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on('dialog', (d) => d.accept());

  await step('首頁載入：主要入口與三個大按鈕', async () => {
    await page.goto(BASE);
    await page.getByRole('heading', { name: '今天，你想怎麼探索自己？' }).waitFor();
    for (const n of [/給我一個小驚喜/, /今天想玩個小遊戲/, /我想安靜一下/]) await page.getByRole('button', { name: n }).waitFor();
  });
  await step('Daily Rewire 七句原文與順序完全一致', async () => {
    await page.goto(BASE + '#/daily');
    const texts = await page.locator('#daily-title').locator('..').locator('article h3').allTextContents();
    if (JSON.stringify(texts) !== JSON.stringify(AFF)) throw new Error(JSON.stringify(texts));
  });
  await step('語句卡片展開、收藏、複製', async () => {
    const card = page.locator('article').filter({ hasText: '我的想法不等於事實' }).first();
    await card.getByRole('button', { name: '反思與行動' }).click();
    await card.getByText('今天有哪些讓我感到焦慮的想法').waitFor();
    await card.getByRole('button', { name: /收藏「我的想法不等於事實」/ }).click();
    if (!(await store(page)).dailyFavorites.includes(5)) throw new Error('未收藏');
    await card.getByRole('button', { name: /複製「我的想法不等於事實」/ }).click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    if (clip !== '我的想法不等於事實') throw new Error(clip);
    await page.getByRole('button', { name: '複製全部七句' }).first().click();
    const all = await page.evaluate(() => navigator.clipboard.readText());
    if (!AFF.every((a) => all.includes(a))) throw new Error('複製全部缺句');
  });
  await step('朗讀模式：下一句／上一句／重新開始／進度', async () => {
    await page.getByRole('link', { name: '開始今日練習' }).first().click();
    await page.getByText('1／7').waitFor();
    await page.getByRole('button', { name: '下一句' }).click();
    await page.getByRole('button', { name: '下一句' }).click();
    await page.getByText('3／7').waitFor();
    await page.getByRole('heading', { name: '我已經足夠好了' }).waitFor();
    await page.getByRole('button', { name: '上一句' }).click();
    await page.getByText('2／7').waitFor();
    await page.getByRole('button', { name: '重新開始' }).click();
    await page.getByText('1／7').waitFor();
    await page.keyboard.press('ArrowRight');
    await page.getByText('2／7').waitFor();
  });
  await step('朗讀完成 → 今日反思表單 → 儲存', async () => {
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: '下一句' }).click();
    await page.getByRole('button', { name: '完成' }).click();
    await page.getByText('今天的七句話完成了').waitFor();
    // 寫入 LocalStorage 在 React effect 中進行，稍等寫入完成
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('rewire:v1') || '{}').dailyLogs?.[0]?.completedReading === true, null, { timeout: 3000 });
    let s;
    await page.getByLabel('我的想法不等於事實').check();
    await page.getByLabel('為什麼這句話對我有意義？').fill('提醒我先看事實');
    await page.getByLabel('今天準備採取什麼小行動？').fill('寫下三個事實');
    await page.getByRole('button', { name: /還不錯/ }).click();
    await page.getByRole('button', { name: '儲存今日練習' }).click();
    s = await store(page);
    const l = s.dailyLogs[0];
    if (l.favoriteId !== 5 || l.mood !== 4 || l.why !== '提醒我先看事實' || !l.completedReading) throw new Error(JSON.stringify(l));
    await page.getByRole('button', { name: '結束練習' }).click();
    await page.waitForURL(/#\/daily$/);
  });
  await step('Daily 頁：紀錄回顧、編輯、最常選擇語句', async () => {
    await page.getByText('「我的想法不等於事實」（1 次）').waitFor();
    await page.getByRole('button', { name: /^編輯 .* 的紀錄$/ }).first().click();
    const edit = page.locator('li').filter({ has: page.getByRole('button', { name: /^刪除 .* 的紀錄$/ }) }).first();
    await edit.getByLabel('今天準備採取什麼小行動？').fill('散步五分鐘');
    await edit.getByRole('button', { name: '儲存今日練習' }).click();
    if ((await store(page)).dailyLogs[0].action !== '散步五分鐘') throw new Error('編輯失敗');
  });
  await step('章節頁：神經道路模擬器、收藏段落、反思', async () => {
    await page.goto(BASE + '#/learn/ch1');
    await page.getByRole('heading', { name: '神經可塑性的底層原理', level: 1 }).waitFor();
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: '執行一次新習慣' }).click();
    if ((await store(page)).neuralReps !== 3) throw new Error('reps');
    await page.getByText('概念示意動畫').waitFor();
    await page.getByRole('button', { name: /收藏「3\. Hebbian Learning/ }).click();
    await page.getByLabel('寫下你的反思').fill('我想少走滑手機大道');
    await page.getByRole('button', { name: '儲存反思' }).click();
    const notes = (await store(page)).notes;
    if (notes.length !== 2) throw new Error(`notes=${notes.length}`);
  });
  await step('章節測驗作答、評分、重新作答', async () => {
    const quiz = page.locator('#quiz');
    for (const q of await quiz.locator('fieldset').all()) await q.locator('input[type=radio]').nth(1).check();
    await quiz.getByRole('button', { name: '送出答案' }).click();
    await quiz.getByText(/得分：4\/4/).waitFor();
    const s = await store(page);
    if (s.quizzes.ch1.score !== 4) throw new Error('score');
    await quiz.getByRole('button', { name: '重新作答' }).click();
    await quiz.getByRole('button', { name: '送出答案' }).waitFor();
  });
  await step('標記章節完成並在側欄顯示', async () => {
    await page.getByRole('button', { name: '標記本章為已完成' }).click();
    if (!(await store(page)).chapters.ch1.completed) throw new Error('未完成');
    await page.locator('aside').first().getByLabel('已完成').first().waitFor();
  });
  await step('章節底部顯示對應心智語句', async () => {
    await page.locator('#daily').getByText('我的大腦可以改變').first().waitFor();
  });
  await step('所有 9 章節頁面可開啟且內容完整', async () => {
    for (let i = 1; i <= 9; i++) {
      await page.goto(BASE + `#/learn/ch${i}`);
      for (const h of ['學習目標', '核心概念', '深入解釋', '生活案例', '實際應用方式', '反思問題', '本章重點摘要', '研究來源', '對應的每日心智語句']) {
        await page.getByRole('heading', { name: h, exact: false }).first().waitFor({ timeout: 3000 });
      }
      const qs = await page.locator('#quiz fieldset').count();
      if (qs < 3 || qs > 5) throw new Error(`ch${i} quiz=${qs}`);
      await page.locator('figure svg[role=img]').first().waitFor();
    }
  });
  await step('第 2 章認知濾鏡：選擇解讀並存入筆記', async () => {
    await page.goto(BASE + '#/learn/ch2');
    await page.getByRole('button', { name: /他可能在忙/ }).click();
    await page.getByText('後來發現他當時戴著耳機').waitFor();
    await page.getByLabel('我觀察到哪些客觀事實？').fill('他沒有回應');
    await page.getByRole('button', { name: '存入筆記' }).click();
  });
  await step('第 3 章身份敘事改寫器（本地規則）', async () => {
    await page.goto(BASE + '#/learn/ch3');
    await page.getByLabel('3. 具體來說，你想學會的技能是？').fill('如何主動開啟並延續對話');
    await page.getByRole('button', { name: '產生改寫建議' }).click();
    await page.getByText('我正在學習如何主動開啟並延續對話。').first().waitFor();
    await page.getByRole('button', { name: '儲存改寫' }).click();
    if ((await store(page)).identityRewrites.length !== 1) throw new Error('未儲存');
  });
  await step('第 4 章自我對話五步驟', async () => {
    await page.goto(BASE + '#/learn/ch4');
    await page.getByLabel('寫下一個讓你不舒服的負面想法').fill('我每次都搞砸，大家一定覺得我很沒用');
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByText('規則偵測到').waitFor();
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: /下一步|查看整理/ }).click();
    await page.getByRole('button', { name: '儲存練習' }).click();
    if ((await store(page)).selfTalk.length !== 1) throw new Error('未儲存');
  });
  await step('第 5 章習慣偵探：新增、編輯、刪除（確認視窗）', async () => {
    await page.goto(BASE + '#/learn/ch5');
    await page.getByLabel('我做了什麼？').fill('睡前滑手機');
    await page.getByLabel('觸發提示').fill('躺上床');
    await page.getByRole('button', { name: '新增紀錄' }).click();
    await page.getByRole('button', { name: '編輯這筆紀錄' }).click();
    await page.getByLabel('我做了什麼？').fill('睡前滑手機 40 分鐘');
    await page.getByRole('button', { name: '儲存修改' }).click();
    if ((await store(page)).habitLogs[0].behavior !== '睡前滑手機 40 分鐘') throw new Error('編輯');
    await page.getByRole('button', { name: '刪除這筆紀錄' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '刪除' }).click();
    if ((await store(page)).habitLogs.length !== 0) throw new Error('刪除');
    await page.getByLabel('我做了什麼？').fill('下午吃零食');
    await page.getByRole('button', { name: '新增紀錄' }).click();
  });
  await step('第 6 章習慣模擬器標註概念模型', async () => {
    await page.goto(BASE + '#/learn/ch6');
    await page.getByText('【概念模型】假設性的自動化程度曲線').waitFor();
    await page.getByLabel('習慣難度').selectOption('hard');
    await page.locator('.recharts-line').first().waitFor();
  });
  await step('第 7 章七張工具卡：呼吸、情緒命名、口袋句、睡眠、微行動、預演、暫停', async () => {
    await page.goto(BASE + '#/learn/ch7');
    const open = (n) => page.getByRole('button', { name: new RegExp(`^Tool \\d · .*${n}`) }).click();
    await open('生理性嘆息');
    await page.getByRole('button', { name: '開始練習' }).click();
    await page.waitForTimeout(11500);
    await page.getByRole('button', { name: '結束' }).click();
    if ((await store(page)).sessions.length !== 1) throw new Error('呼吸未記錄');
    await open('情緒命名');
    await page.getByRole('button', { name: '害怕', exact: true }).click();
    await page.getByRole('button', { name: '緊張', exact: true }).click();
    await page.getByRole('button', { name: '儲存情緒紀錄' }).click();
    if ((await store(page)).emotionLogs[0].word !== '緊張') throw new Error('情緒');
    await open('刺激與反應之間的空間');
    await page.getByRole('button', { name: /先放下手機/ }).click();
    await page.getByText('你在暫停後覺察了身體與情緒').waitFor();
    await open('完整心智預演');
    await page.getByLabel('要預演的情境').fill('向主管提出需求');
    await page.getByRole('button', { name: '儲存預演' }).click();
    await open('微小行動');
    await page.getByLabel('大目標').fill('完成報告');
    await page.getByLabel('第 1 步').fill('打開檔案');
    await page.getByRole('button', { name: '建立清單' }).click();
    await page.getByLabel('打開檔案').check();
    if (!(await store(page)).smallSteps[0].steps[0].done) throw new Error('勾選');
    await open('口袋句');
    await page.getByRole('button', { name: /複製句子：這個問題我想好好想一下/ }).click();
    await open('睡眠與記憶鞏固');
    await page.getByRole('button', { name: '儲存紀錄' }).click();
    if ((await store(page)).sleepLogs.length !== 1) throw new Error('睡眠');
    await page.getByText('不是醫療診斷工具').first().waitFor();
  });
  await step('第 8 章 If-Then：建立、複製、編輯', async () => {
    await page.goto(BASE + '#/learn/ch8');
    await page.getByLabel(/我的目標/).fill('每週運動三次');
    await page.getByLabel(/可能出現的情境/).fill('週一晚上吃完飯');
    await page.getByLabel(/準備執行的行動/).fill('走路 20 分鐘');
    await page.getByRole('button', { name: '儲存計畫' }).click();
    await page.getByRole('button', { name: '編輯這份計畫' }).click();
    await page.getByLabel('備用方案', { exact: true }).fill('在家伸展');
    await page.getByRole('button', { name: '儲存修改' }).click();
    if ((await store(page)).plans[0].backup !== '在家伸展') throw new Error('編輯');
  });
  await step('第 9 章證據檢視卡含 DOI 連結', async () => {
    await page.goto(BASE + '#/learn/ch9');
    await page.locator('a[href^="https://doi.org/"]').first().waitFor();
    await page.getByText('可能過度簡化的說法').first().waitFor();
  });
  await step('打破慣性：焦點卡片（選 1–3 項）', async () => {
    await page.goto(BASE + '#/pattern');
    await page.getByRole('heading', { name: '你最想調整哪一個習慣？' }).waitFor();
    for (const n of ['過度尋求認可', '反覆違背承諾', '缺少獨處思考', '過度依賴便利']) await page.getByRole('button', { name: `選擇「${n}」` }).click();
    const f = (await store(page)).patternFocus;
    if (JSON.stringify(f) !== JSON.stringify(['approval', 'promises', 'solitude'])) throw new Error('焦點：' + JSON.stringify(f));
    await page.getByText('每個微小的選擇，都在塑造未來的自己。').first().waitFor();
    await page.goto(BASE + '#/habits');
    await page.waitForURL(/#\/pattern$/);
  });
  await step('打破慣性：七個學習頁都有 10 個段落與互動工具', async () => {
    for (const id of ['approval', 'convenience', 'impress', 'solitude', 'promises', 'environment', 'shortterm']) {
      await page.goto(BASE + `#/pattern/${id}`);
      for (const h of ['行為定義', '常見生活情境', '可能的心理機制', '可能產生的長期影響', '健康行為與過度行為的界線', '與神經可塑性的關聯', '可執行的替代行動', '自我反思問題', '行動實驗', '研究證據與適用限制']) {
        await page.getByRole('heading', { name: h }).first().waitFor({ timeout: 3000 });
      }
      await page.locator('#tool').waitFor();
      await page.locator('a[href^="https://doi.org/"]').first().waitFor();
    }
  });
  await step('Habit 01 認可依賴覺察器：儲存後顯示心智語句並可設為今日練習句', async () => {
    await page.goto(BASE + '#/pattern/approval');
    await page.getByLabel('最近的一個決策').fill('答應週末代班');
    await page.getByLabel('1. 我原本真正想做什麼？').fill('休息');
    await page.getByRole('button', { name: '儲存覺察紀錄' }).click();
    await page.getByText('練習完成！帶著這句話繼續今天').waitFor();
    await page.getByRole('button', { name: '設為今日練習句' }).first().click();
    const s = await store(page);
    if (s.patternEntries[0].kind !== 'validation') throw new Error('未儲存');
    const today = s.dailyLogs.find((l) => l.practiceId === 3);
    if (!today || today.why !== '提醒我先看事實') throw new Error('今日練習句覆蓋了紀錄 ' + JSON.stringify(s.dailyLogs));
    await page.getByLabel('完成實驗後，記錄你的觀察與結果').fill('第三天開始比較敢說不');
    await page.getByRole('button', { name: '記錄完成的行動實驗' }).click();
    if ((await store(page)).counterChoices.length !== 1) throw new Error('實驗');
  });
  await step('Habit 02 舒適圈探索地圖：建立、新增、調整難度、勾選', async () => {
    await page.goto(BASE + '#/pattern/convenience');
    await page.getByLabel('一件想嘗試、但一直逃避的事').fill('開始學游泳');
    await page.getByRole('button', { name: '建立探索地圖' }).click();
    await page.getByLabel('新增步驟').first().fill('查詢附近泳池');
    await page.getByRole('button', { name: '加入步驟' }).first().click();
    await page.getByRole('button', { name: '調整為較困難的階段' }).first().click();
    await page.getByLabel('完成：查詢附近泳池').check();
    const m = (await store(page)).patternEntries.find((e) => e.kind === 'comfort');
    if (m.steps.length !== 4 || !m.steps.find((x) => x.text === '查詢附近泳池').done || m.steps[0].level !== 2) throw new Error(JSON.stringify(m.steps));
  });
  await step('Habit 03 消費動機檢視器：反思結果、冷靜期、決定', async () => {
    await page.goto(BASE + '#/pattern/impress');
    await page.getByLabel('想購買的物品').fill('新款耳機');
    await page.getByLabel('預估價格（元）').fill('3600');
    await page.getByLabel('預估每月使用次數').fill('20');
    await page.getByRole('button', { name: '想被看見或留下好印象' }).click();
    await page.getByRole('button', { name: '產生反思結果' }).click();
    await page.getByText('每次使用成本約 15 元').waitFor();
    await page.getByLabel('自訂冷靜期').selectOption('7');
    await page.getByRole('button', { name: '儲存檢視紀錄' }).click();
    await page.getByText('冷靜期中').waitFor();
    await page.getByRole('button', { name: '決定不買' }).click();
    const e = (await store(page)).patternEntries.find((x) => x.kind === 'spending');
    if (e.decision !== 'skipped' || e.coolingDays !== 7) throw new Error(JSON.stringify(e));
  });
  await step('Habit 04 安靜五分鐘：自訂時間、關閉動畫、反思儲存', async () => {
    await page.goto(BASE + '#/pattern/solitude');
    await page.getByLabel('練習時間（分鐘）').fill('1');
    await page.getByLabel('顯示呼吸動畫').uncheck();
    await page.getByRole('button', { name: '開始安靜' }).click();
    await page.waitForTimeout(2200);
    await page.getByRole('button', { name: '結束並反思' }).click();
    await page.getByLabel('我現在真正需要什麼？').fill('早點睡');
    await page.getByRole('button', { name: '儲存這次安靜練習' }).click();
    const q = (await store(page)).patternEntries.find((x) => x.kind === 'quiet');
    if (!q || q.seconds < 1 || q.need !== '早點睡') throw new Error(JSON.stringify(q));
  });
  await step('Habit 05 微承諾追蹤器：建立、完成、中斷原因、暫停、七天回顧', async () => {
    await page.goto(BASE + '#/pattern/promises');
    await page.getByLabel(/每日微承諾/).fill('早餐後閱讀兩頁書。');
    await page.getByLabel('具體執行情境').fill('吃完早餐');
    await page.getByLabel('備用方案').fill('只讀一段');
    await page.getByRole('button', { name: '建立微承諾' }).click();
    await page.getByRole('button', { name: '今天完成了' }).click();
    if ((await store(page)).commitmentLogs[0]?.status !== 'done') throw new Error('完成');
    await page.getByRole('button', { name: '記錄中斷原因' }).click();
    await page.getByLabel('中斷原因').fill('加班');
    await page.getByRole('button', { name: '儲存', exact: true }).click();
    const logs = (await store(page)).commitmentLogs;
    if (logs.length !== 1 || logs[0].status !== 'missed' || logs[0].reason !== '加班') throw new Error('同日應只有一筆 ' + JSON.stringify(logs));
    await page.getByRole('button', { name: '今天完成了' }).click();
    await page.getByLabel('最近七天執行情況').waitFor();
    await page.getByRole('button', { name: '暫停這個微承諾' }).click();
    if ((await store(page)).microCommitments[0].active) throw new Error('暫停');
    await page.getByRole('button', { name: '恢復這個微承諾' }).click();
  });
  await step('Habit 06 成長環境盤點：反思為主、不替使用者決定', async () => {
    await page.goto(BASE + '#/pattern/environment');
    await page.getByLabel('想盤點的環境或關係（可用代稱）').fill('工作團隊');
    const sets = await page.locator('#tool fieldset').all();
    const picks = ['非常符合', '大致符合', '不太符合', '大致符合', '一半一半', '非常不符合'];
    for (let i = 0; i < 6; i++) await sets[i].getByRole('button', { name: picks[i], exact: true }).click();
    await page.getByText('不會替你決定是否調整或結束任何關係').waitFor();
    await page.getByRole('button', { name: '儲存盤點' }).click();
    if (!(await store(page)).patternEntries.some((x) => x.kind === 'environment' && x.label === '工作團隊')) throw new Error('未儲存');
  });
  await step('Habit 07 短期與長期選擇模擬器：比較表', async () => {
    await page.goto(BASE + '#/pattern/shortterm');
    await page.getByLabel('當下想做的事').fill('繼續看影片一小時');
    await page.getByLabel('長期希望達成的目標').fill('每天睡滿 7 小時');
    await page.getByLabel('是否有折衷方案？').fill('先完成睡前準備再看一集');
    await page.getByRole('button', { name: '產生比較表' }).click();
    if ((await page.locator('table tbody tr').count()) !== 3) throw new Error('比較表');
    await page.getByRole('button', { name: '儲存這次比較' }).click();
  });
  await step('21 題自我評估：作答、優先項目、結果與建議工具', async () => {
    await page.goto(BASE + '#/pattern/assessment');
    if ((await page.locator('form fieldset input[type=radio]').count()) !== 105) throw new Error('題數');
    const qs = await page.locator('form section fieldset').all();
    if (qs.length !== 21) throw new Error('fieldset ' + qs.length);
    for (let i = 0; i < 21; i++) await qs[i].locator('label').nth(i % 5).click();
    await page.getByRole('button', { name: '過度依賴便利' }).click();
    await page.getByRole('button', { name: '查看結果並儲存' }).click();
    await page.getByRole('heading', { name: '評估結果' }).waitFor();
    await page.getByText('建議練習工具').waitFor();
    const s = await store(page);
    if (s.patternAssessments.length !== 1 || JSON.stringify(s.patternFocus) !== '["convenience"]') throw new Error('評估');
    await page.getByText('不是醫學或心理診斷').first().waitFor();
  });
  await step('習慣改變工作坊：七步驟、建立 If-Then 與微承諾、回顧', async () => {
    await page.goto(BASE + '#/pattern/workshop');
    await page.getByLabel('想處理的習慣').selectOption('shortterm');
    await page.getByRole('button', { name: '開始新的工作坊' }).click();
    await page.getByLabel(/我最常重複的行為/).fill('睡前看影片到兩點');
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByLabel('通常發生的時間').fill('晚上 11 點');
    await page.getByLabel('當時的情緒').fill('疲倦');
    await page.getByLabel('環境提示').fill('躺上床');
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByLabel('舊行為帶來的短期好處').fill('放鬆');
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByLabel(/我的替代行動/).fill('關閉自動播放');
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByLabel('如果（情境）').fill('晚上 11 點躺上床');
    await page.getByLabel('我就（行動）').fill('把手機放到書桌');
    await page.getByRole('button', { name: '建立 If-Then 計畫' }).click();
    await page.getByRole('button', { name: '同時加入每日微承諾' }).click();
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByRole('link', { name: '開始今日練習' }).waitFor();
    await page.getByRole('button', { name: '下一步' }).click();
    await page.getByLabel(/這一週，我觀察到什麼/).fill('前兩天有做到');
    await page.getByRole('button', { name: '降低難度' }).click();
    await page.getByRole('button', { name: '完成本次回顧' }).click();
    const s = await store(page);
    const w = s.workshops[0];
    if (w.step !== 7 || !w.reviewedAt || w.cue !== '躺上床' || !w.planId) throw new Error(JSON.stringify(w));
    if (!s.plans.some((p) => p.id === w.planId) || s.microCommitments.length !== 2) throw new Error('If-Then / 微承諾');
    await page.getByRole('button', { name: '回到工作坊列表' }).click();
    await page.getByRole('button', { name: '繼續' }).waitFor();
  });
  await step('14 天打破慣性挑戰：開始、完成、切換、暫停、保留進度、與原挑戰分開', async () => {
    await page.goto(BASE + '#/challenge?type=pattern');
    await page.getByLabel('習慣', { exact: true }).selectOption('promises');
    await page.getByRole('button', { name: '開始挑戰' }).click();
    await page.getByText('Break the Pattern · Day 1 / 14').waitFor();
    await page.getByRole('heading', { name: '今日行動' }).waitFor();
    await page.getByText('今日心智語句').waitFor();
    await page.getByRole('button', { name: '出現一次' }).click();
    await page.getByLabel('完成紀錄').fill('建立了第一個微承諾');
    await page.getByRole('button', { name: '儲存並標記完成' }).click();
    await page.getByRole('button', { name: '輕量版' }).click();
    await page.getByText(/輕量版：/).first().waitFor();
    await page.getByLabel('習慣', { exact: true }).selectOption('solitude');
    await page.getByRole('button', { name: '切換到這個挑戰' }).click();
    await page.getByRole('button', { name: '暫停挑戰' }).click();
    let s = await store(page);
    if (s.patternChallenge.status !== 'paused' || s.patternChallenge.activeHabitId !== 'solitude' || s.patternChallenge.level !== 'gentle') throw new Error(JSON.stringify(s.patternChallenge));
    if (!s.patternChallenge.progress.promises['1'].completed || s.patternChallenge.progress.promises['1'].oldPattern !== 'once') throw new Error('進度遺失');
    if (s.challenge['1']) throw new Error('影響了原本的 14 天挑戰');
    await page.reload();
    await page.getByRole('button', { name: '恢復挑戰' }).first().click();
    await page.getByLabel('習慣', { exact: true }).selectOption('promises');
    await page.getByRole('button', { name: '切換到這個挑戰' }).click();
    await page.getByRole('button', { name: '第 1 天（已完成）' }).waitFor();
    await page.getByRole('tab', { name: '神經可塑性練習' }).click();
    await page.getByRole('heading', { name: '找出最想改變的習慣' }).waitFor();
  });
  await step('Daily：自由選擇今日練習句、卡片顯示相關習慣', async () => {
    await page.goto(BASE + '#/daily');
    await page.locator('section[aria-labelledby="pick-h"]').getByRole('button', { name: /今天是新的機會/ }).click();
    const l = (await store(page)).dailyLogs[0];
    if (l.practiceId !== 7 || l.why !== '提醒我先看事實') throw new Error(JSON.stringify(l));
    const card = page.locator('article').filter({ hasText: '今天是新的機會' }).first();
    await card.getByRole('button', { name: '反思與行動' }).click();
    await card.getByRole('link', { name: '打破慣性：反覆違背承諾' }).waitFor();
  });
  await step('7 Habits：總覽、三階段地圖、來源標示、推薦規則', async () => {
    await page.goto(BASE + '#/habits7');
    await page.getByRole('heading', { name: '從管理自己，到與世界建立更好的關係' }).waitFor();
    const map = page.getByRole('group', { name: '三階段學習地圖' });
    for (const t of ['個人成功', '公眾成功', '習慣七：不斷更新']) await map.getByText(t).first().waitFor();
    if ((await page.locator('ul li a[href^="#/habits7/"]').count()) < 7) throw new Error('課程卡片');
    await page.getByText('柯維管理哲學').first().waitFor();
    // 焦點習慣為「過度依賴便利」→ 推薦 要事第一、不斷更新
    await page.getByText('因為你選擇了「過度依賴便利」').waitFor();
    await page.getByText('查看完整推薦規則').click();
    await page.getByRole('table', { name: '跨模組推薦規則' }).waitFor();
  });
  await step('7 Habits：七個章節都有 10 個面向、工具與完成區塊', async () => {
    for (const id of ['proactive', 'end', 'first', 'winwin', 'understand', 'synergize', 'renew']) {
      await page.goto(BASE + `#/habits7/${id}`);
      for (const h of ['習慣定義與核心觀念', '生活與職場情境', '常見認知誤區', '與神經可塑性的可能關聯', '心理學或管理學延伸概念', '實際行動策略', '互動工具', '反思問題', '自我評估', '與 Rewire 其他模組的連結', '完成本章']) {
        await page.getByRole('heading', { name: h }).first().waitFor({ timeout: 3000 });
      }
      const q = await page.locator('#finish-h ~ div fieldset, section[aria-labelledby="finish-h"] fieldset').count();
      if (q < 3 || q > 5) throw new Error(`${id} quiz=${q}`);
    }
  });
  await step('習慣一 關注圈與影響圈：新增、拖曳分類、建立微承諾', async () => {
    await page.goto(BASE + '#/habits7/proactive');
    await page.getByRole('button', { name: '開始學習' }).click();
    await page.getByLabel('目前遇到的困難').fill('找工作沒有好消息');
    await page.getByRole('button', { name: '開始整理' }).click();
    for (const t of ['練習自我介紹', '面試官的偏好', '請學長姐幫忙看履歷']) { await page.getByLabel('新增相關事項').fill(t); await page.getByRole('button', { name: '新增', exact: true }).click(); }
    await page.locator('li[draggable=true]', { hasText: '練習自我介紹' }).locator('.drag-handle').dragTo(page.getByLabel('我能直接控制的事情', { exact: true }));
    await page.getByLabel('移動「面試官的偏好」到').selectOption('outside');
    let c = (await store(page)).circles[0];
    const zone = (t) => c.items.find((i) => i.text === t).zone;
    if (zone('練習自我介紹') !== 'control' || zone('面試官的偏好') !== 'outside' || zone('請學長姐幫忙看履歷') !== 'influence') throw new Error(JSON.stringify(c.items));
    await page.locator('li', { hasText: '練習自我介紹' }).getByRole('button', { name: '選為行動並建立微承諾' }).click();
    const s = await store(page);
    if (!s.circles[0].commitmentId || !s.microCommitments.some((m) => m.text === '練習自我介紹')) throw new Error('微承諾');
    if (s.h7Progress.proactive?.status !== 'learning') throw new Error('狀態');
  });
  await step('習慣二 人生羅盤：領域、願景宣言（建立與修改）、年度目標', async () => {
    await page.goto(BASE + '#/habits7/end');
    await page.getByRole('button', { name: '健康' }).click();
    await page.getByLabel('1. 我重視什麼？').fill('有體力陪家人');
    await page.getByLabel('5. 下一個可以執行的小行動').fill('每週運動兩次');
    await page.getByRole('button', { name: '儲存這個領域' }).click();
    await page.getByLabel('我的願景').fill('成為健康、持續學習的人');
    await page.getByLabel('年度關鍵字').fill('穩定');
    await page.getByRole('button', { name: '儲存願景' }).click();
    await page.getByLabel('我的願景').fill('成為健康、持續學習、支持他人的人');
    await page.getByRole('button', { name: '儲存願景' }).click();
    await page.getByLabel('新增年度目標').fill('完成一門課');
    await page.getByRole('button', { name: '新增', exact: true }).click();
    await page.getByLabel('行動計畫（離開欄位時自動儲存）').fill('每週二晚上上課');
    await page.getByLabel('完成：完成一門課').check();
    const lc = (await store(page)).lifeCompass;
    if (lc.vision !== '成為健康、持續學習、支持他人的人' || lc.keyword !== '穩定' || lc.areas.health.next !== '每週運動兩次' || lc.goals[0].plan !== '每週二晚上上課' || !lc.goals[0].done) throw new Error(JSON.stringify(lc));
  });
  await step('習慣三 四象限：新增、拖曳、編輯、完成、刪除、本週三件要事', async () => {
    await page.goto(BASE + '#/habits7/first');
    const add = async (t, q) => { await page.getByLabel('新增任務').fill(t); await page.getByLabel('象限', { exact: true }).selectOption(String(q)); await page.getByRole('button', { name: '新增任務' }).click(); };
    await add('預約健康檢查', 2); await add('回覆廠商信件', 3); await add('滑社群', 4);
    await page.locator('li[draggable=true]', { hasText: '回覆廠商信件' }).locator('.drag-handle').dragTo(page.getByRole('region', { name: '第一象限：重要且緊急' }));
    let tasks = (await store(page)).quadrantTasks;
    if (tasks.find((t) => t.title === '回覆廠商信件').quadrant !== 1) throw new Error('拖曳');
    await page.getByRole('button', { name: '編輯任務：預約健康檢查' }).click();
    await page.getByRole('textbox', { name: /^編輯任務/ }).fill('預約年度健康檢查');
    await page.getByLabel('截止日期（選填）').fill('2026-11-12');
    await page.getByRole('button', { name: '儲存修改' }).click();
    await page.getByLabel('完成：預約年度健康檢查').check();
    await page.getByRole('button', { name: '刪除任務：滑社群' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '刪除' }).click();
    tasks = (await store(page)).quadrantTasks;
    if (tasks.length !== 2 || !tasks.find((t) => t.title === '預約年度健康檢查').done) throw new Error(JSON.stringify(tasks));
    await page.getByLabel('第 1 件要事').fill('完成提案初稿');
    await page.getByLabel('執行時間').fill('週三上午');
    await page.getByRole('button', { name: '加入', exact: true }).click();
    if ((await store(page)).big3Weeks[0].items[0].when !== '週三上午') throw new Error('三件要事');
  });
  await step('習慣四 雙贏協商：方案比較表與編輯', async () => {
    await page.goto(BASE + '#/habits7/winwin');
    await page.getByLabel('衝突或協商情境').fill('家人希望週末回家，我要準備考試');
    await page.getByLabel('我的需求').fill('完整讀書時間');
    for (const o of ['週六午餐回家', '完全不回家']) { await page.getByLabel('新增方案').fill(o); await page.getByRole('button', { name: '新增', exact: true }).click(); }
    const row = page.locator('tr', { hasText: '完全不回家' });
    await row.getByLabel('對方').selectOption('1');
    await page.locator('tr', { hasText: '週六午餐回家' }).getByLabel('對方').selectOption('4');
    await page.locator('tr', { hasText: '週六午餐回家' }).getByLabel('我', { exact: true }).selectOption('4');
    await page.getByText('目前最互利').waitFor();
    if (!(await page.locator('tr', { hasText: '目前最互利' }).textContent()).includes('週六午餐回家')) throw new Error('排序');
    await page.locator('#tool').getByText('拒絕合作、暫停協商').waitFor();
    await page.getByRole('button', { name: '儲存協商紀錄' }).click();
    await page.getByRole('button', { name: '編輯協商紀錄' }).click();
    await page.getByLabel('雙方共同目標').fill('維持家庭關係');
    await page.getByRole('button', { name: '儲存修改' }).click();
    if ((await store(page)).negotiations[0].commonGoal !== '維持家庭關係') throw new Error('編輯');
  });
  await step('習慣五 同理溝通模擬器：分析、複製與收藏句型', async () => {
    await page.goto(BASE + '#/habits7/understand');
    await page.getByRole('button', { name: /聽起來這個月真的很累/ }).click();
    await page.getByText('回應分析').first().waitFor();
    await page.getByRole('button', { name: '收藏句型：聽起來這件事讓你感到很有壓力。' }).click();
    await page.getByRole('button', { name: '複製句型：我想確認一下，你最在意的是哪個部分？' }).click();
    if ((await page.evaluate(() => navigator.clipboard.readText())) !== '我想確認一下，你最在意的是哪個部分？') throw new Error('複製');
    const s = await store(page);
    if (s.empathyLogs.length !== 1 || s.empathyFavorites[0] !== '聽起來這件事讓你感到很有壓力。') throw new Error('紀錄');
  });
  await step('習慣六 團隊思考板：便利貼、拖曳、匯出、匯入', async () => {
    await page.goto(BASE + '#/habits7/synergize');
    await page.getByText('不會即時同步給其他人').waitFor();
    await page.getByLabel('專案挑戰').fill('迎新活動人數偏低');
    await page.getByRole('button', { name: '建立思考板' }).click();
    await page.getByLabel('在「1. 問題定義」新增便利貼').fill('報名人數只有去年一半');
    await page.getByRole('button', { name: '加入「1. 問題定義」' }).click();
    await page.getByLabel('在「4. 不同觀點」新增便利貼').fill('改成線上活動');
    await page.getByRole('button', { name: '加入「4. 不同觀點」' }).click();
    // 目標區塊在可視範圍外時，模擬滑鼠拖曳會因捲動而中斷；改為直接派發 HTML5 拖曳事件，驗證放下處理邏輯
    const dt = await page.evaluateHandle(() => new DataTransfer());
    const card = page.locator('li[draggable=true]').filter({ has: page.locator('textarea') }).nth(1);
    const target = page.getByRole('region', { name: '7. 解決方案' });
    await card.dispatchEvent('dragstart', { dataTransfer: dt });
    await target.dispatchEvent('dragover', { dataTransfer: dt });
    await target.dispatchEvent('drop', { dataTransfer: dt });
    const b = (await store(page)).teamBoards[0];
    if (b.cards.find((c) => c.text === '改成線上活動').zone !== 'solutions') throw new Error(JSON.stringify(b.cards));
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '匯出 JSON' }).click()]);
    require('fs').copyFileSync(await dl.path(), '/tmp/claude-0/board.json');
    await page.getByRole('button', { name: '所有思考板' }).click();
    await page.locator('#board-import').setInputFiles('/tmp/claude-0/board.json');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('rewire:v1')).teamBoards.length === 2);
  });
  await step('習慣七 四維成長：權重、自評雷達圖、習慣追蹤、休息紀錄', async () => {
    await page.goto(BASE + '#/habits7/renew');
    await page.getByLabel('重視程度：3／5').first().fill('5');
    await page.getByLabel('自訂這個面向的名稱（可依信仰或非宗教價值觀）').fill('人生意義');
    await page.getByLabel('自訂這個面向的名稱（可依信仰或非宗教價值觀）').blur();
    await page.getByLabel(/每週反思/).fill('睡眠變好了');
    await page.getByRole('button', { name: '儲存本週自評' }).click();
    await page.locator('.recharts-radar').first().waitFor();
    await page.getByLabel('習慣', { exact: true }).fill('睡前讀 10 頁書');
    await page.getByRole('button', { name: '新增', exact: true }).click();
    await page.getByRole('button', { name: '今天完成', exact: true }).click();
    await page.getByRole('button', { name: '記錄', exact: true }).click();
    const s = await store(page);
    if (s.renewalSettings.weights.physical !== 5 || s.renewalSettings.spiritualLabel !== '人生意義') throw new Error(JSON.stringify(s.renewalSettings));
    if (s.renewalChecks.length !== 1 || s.renewalHabitLogs.length !== 1 || s.restLogs.length !== 1) throw new Error('紀錄');
  });
  await step('7 Habits 章節完成：測驗、自我評估、反思、狀態', async () => {
    await page.goto(BASE + '#/habits7/first');
    const fin = page.locator('section[aria-labelledby="finish-h"]');
    for (const f of await fin.locator('fieldset').all()) await f.locator('input[type=radio]').nth(1).check();
    await fin.getByRole('button', { name: '送出答案' }).click();
    await fin.getByText(/得分：/).waitFor();
    const sc = page.locator('#selfcheck');
    for (const f of await sc.locator('fieldset').all()) await f.locator('label').nth(3).click();
    await sc.getByRole('button', { name: '儲存自我評估' }).click();
    await fin.getByLabel(/寫下你的反思/).fill('第二象限要先排');
    await fin.getByRole('button', { name: '儲存反思' }).click();
    await page.getByRole('button', { name: '標記本章為已完成' }).click();
    const s = await store(page);
    if (!s.h7Quizzes.first || s.h7SelfChecks.length !== 1 || s.h7Progress.first?.status !== 'done' || !s.notes.some((n) => n.tags.includes('7 Habits'))) throw new Error('完成');
    if (s.quizzes.first) throw new Error('寫錯測驗儲存位置');
  });
  await step('21 天七習慣探索計畫：每日任務、反思、行動計畫、完成、回顧', async () => {
    await page.goto(BASE + '#/habits7/plan');
    await page.getByText('不代表完成後就能養成永久的習慣').waitFor();
    if ((await page.getByRole('navigation', { name: '選擇天數' }).getByRole('button').count()) !== 21) throw new Error('天數');
    await page.getByLabel('我的反思').fill('我常把注意力放在無法控制的事');
    await page.getByLabel(/我的行動計畫/).fill('每天寫一件能控制的事');
    await page.getByRole('button', { name: '儲存並標記完成' }).click();
    await page.reload();
    await page.getByRole('button', { name: '第 1 天：理解概念：主動積極（已完成）' }).waitFor();
    await page.getByText('Day 2 / 21').waitFor();
    await page.getByLabel(/這 21 天，我最想帶走/).fill('影響圈');
    await page.getByRole('button', { name: '儲存回顧' }).click();
    const p = (await store(page)).h7Plan;
    if (!p.days['1'].completed || p.days['1'].actionPlan !== '每天寫一件能控制的事' || p.finalReview !== '影響圈' || !p.startedAt) throw new Error(JSON.stringify(p));
  });
  await step('首頁：小驚喜盲盒（開盒、收藏、再抽、跳過）', async () => {
    await page.goto(BASE + '#/');
    await page.getByRole('button', { name: /給我一個小驚喜/ }).click();
    await page.getByRole('button', { name: '打開盲盒，抽一張卡' }).click();
    await page.getByRole('button', { name: '收藏這張卡' }).click();
    if ((await store(page)).savedCards.length !== 1) throw new Error('收藏');
    await page.getByRole('button', { name: '再抽一次' }).click();
    await page.getByRole('button', { name: '收藏這張卡' }).waitFor();
    await page.getByRole('button', { name: '先跳過' }).click();
    if (await page.locator('#hero-panel').count()) throw new Error('未關閉');
  });
  await step('首頁：小遊戲與安靜一下入口、自訂首頁', async () => {
    await page.getByRole('button', { name: /今天想玩個小遊戲/ }).click();
    await page.locator('#hero-panel').getByRole('link', { name: /今日輕冒險/ }).waitFor();
    await page.getByRole('button', { name: /我想安靜一下/ }).click();
    await page.locator('#hero-panel').getByRole('link', { name: /安靜五分鐘/ }).waitFor();
    await page.getByText('自訂首頁').click();
    await page.getByLabel('九個神經可塑性章節').check();
    await page.getByRole('heading', { name: '九個章節' }).waitFor();
    await page.getByLabel('在所有頁面顯示成長夥伴「小芽」').uncheck();
    const st = (await store(page)).settings;
    if (!st.homeSections.chapters || st.buddyVisible) throw new Error(JSON.stringify(st));
    await page.getByLabel('在所有頁面顯示成長夥伴「小芽」').check();
    await page.getByLabel('九個神經可塑性章節').uncheck();
  });
  await step('今日輕冒險：分類、深度、換一個、完成', async () => {
    await page.goto(BASE + '#/play/quest');
    await page.getByRole('button', { name: /勇敢探索/ }).click();
    await page.getByRole('radio', { name: /2 分鐘/ }).click();
    await page.getByRole('button', { name: '換一個冒險' }).click();
    await page.getByLabel('想留一句心得嗎？（選填）').fill('問了同事一個問題');
    await page.getByRole('button', { name: '我完成了這次小冒險' }).click();
    await page.getByRole('button', { name: '再來一個' }).waitFor();
    const q = (await store(page)).questLogs[0];
    if (!q || q.depth !== 'medium' || q.note !== '問了同事一個問題') throw new Error(JSON.stringify(q));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('rewire:v1')).unlocks['badge:question']);
  });
  await step('隨機探索轉盤：取消類別、旋轉、結果不空白', async () => {
    await page.goto(BASE + '#/play/wheel');
    await page.getByRole('button', { name: '價值探索', exact: true }).click();
    if (!(await store(page)).wheelExcluded.includes('values')) throw new Error('排除');
    await page.getByRole('button', { name: '轉轉看' }).click();
    await page.getByText('轉到了：').waitFor({ timeout: 6000 });
    const label = ((await page.getByText('轉到了：').locator('xpath=following-sibling::p[1]').textContent()) || '').trim();
    if (!label || label === '價值探索') throw new Error('結果：' + label);
    await page.getByRole('button', { name: '再轉一次' }).click();
    await page.getByText('轉到了：').waitFor({ timeout: 6000 });
  });
  await step('人際情境小劇場：選擇、不同發展、重玩、全部看過後顯示反思', async () => {
    await page.goto(BASE + '#/play/stories');
    await page.getByRole('button', { name: /週五晚上的加班請求/ }).click();
    const n = await page.locator('article button[aria-pressed]').count();
    if (n < 2) throw new Error('選項');
    for (let i = 0; i < n; i++) {
      await page.locator('article button[aria-pressed]').nth(i).click();
      await page.getByText('這個選擇的優點').waitFor();
    }
    await page.getByText('反思一下').waitFor();
    if ((await store(page)).storyPlays.length !== n) throw new Error('紀錄');
  });
  await step('時光膠囊：草稿編輯、封存、到期開啟', async () => {
    await page.goto(BASE + '#/play/capsule');
    await page.getByLabel('寫一句話給未來的自己').fill('希望你有好好睡覺');
    await page.getByRole('button', { name: '先存草稿' }).click();
    await page.getByRole('button', { name: '編輯膠囊' }).click();
    await page.getByLabel('編輯膠囊（封存前可修改）').fill('希望你有好好睡覺，也常常散步');
    await page.getByRole('button', { name: '1 個月後' }).click();
    await page.getByRole('button', { name: '封存膠囊' }).click();
    const c = (await store(page)).capsules;
    if (c.length !== 1 || !c[0].sealed || c[0].message !== '希望你有好好睡覺，也常常散步') throw new Error(JSON.stringify(c));
    await page.getByText(/封存中，還有 \d+ 天/).waitFor();
    // 模擬膠囊到期：把開啟日改成過去
    await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('rewire:v1')); d.capsules[0].openOn = '2020-01-01'; localStorage.setItem('rewire:v1', JSON.stringify(d)); });
    await page.goto(BASE + '#/');
    await page.reload();
    await page.getByText('你有 1 個時光膠囊可以打開了。').click();
    await page.getByRole('button', { name: '打開', exact: true }).click();
    await page.getByText('希望你有好好睡覺，也常常散步').waitFor();
    if (!(await store(page)).capsules[0].openedAt) throw new Error('開啟');
  });
  await step('心智花園：種下、收回、景觀；收藏冊顯示徽章日期', async () => {
    await page.goto(BASE + '#/play/garden');
    await page.getByText(/成長點：/).waitFor();
    await page.getByRole('gridcell', { name: /第 1 格：空地/ }).click();
    await page.getByRole('gridcell', { name: /第 2 格：空地/ }).click();
    let g = (await store(page)).garden;
    if (g.plants.length !== 2) throw new Error('種下');
    await page.getByRole('gridcell', { name: /第 1 格：.*（點擊收回）/ }).click();
    g = (await store(page)).garden;
    if (g.plants.length !== 1) throw new Error('收回');
    await page.getByRole('button', { name: '夏日午後' }).click();
    if ((await store(page)).garden.theme !== 'summer') throw new Error('景觀');
    await page.goto(BASE + '#/play/collection');
    await page.getByText('勇敢提問者').waitFor();
    await page.getByText(/取得於/).first().waitFor();
  });
  await step('解鎖不會被收回：刪除紀錄後徽章仍保留', async () => {
    await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('rewire:v1')); d.questLogs = []; localStorage.setItem('rewire:v1', JSON.stringify(d)); });
    await page.reload();
    await page.getByText('勇敢提問者').waitFor();
    if (!(await store(page)).unlocks['badge:question']) throw new Error('被收回了');
  });
  await step('14 天挑戰：完成、取消、紀錄保留於重新整理後', async () => {
    await page.goto(BASE + '#/challenge?day=3');
    await page.getByLabel('我的紀錄與反思').fill('我發現是焦慮');
    await page.getByLabel('我的回答').fill('我在家很安全');
    await page.getByRole('button', { name: '儲存並標記完成' }).click();
    await page.getByRole('status').filter({ hasText: '🌱' }).waitFor();
    await page.reload();
    await page.getByRole('button', { name: '已完成（點擊取消）' }).waitFor();
    if ((await page.getByLabel('我的紀錄與反思').inputValue()) !== '我發現是焦慮') throw new Error('未保留');
    const s = await store(page);
    if (s.challenge['3'].affirmationReflection !== '我在家很安全') throw new Error('語句反思');
    if (s.dailyLogs.length !== 1 || s.dailyLogs[0].why !== '提醒我先看事實') throw new Error('挑戰覆蓋了每日紀錄 ' + JSON.stringify(s.dailyLogs));
    await page.getByRole('button', { name: '已完成（點擊取消）' }).click();
    if ((await store(page)).challenge['3'].completed) throw new Error('取消失敗');
    await page.getByRole('button', { name: '儲存並標記完成' }).click();
  });
  await step('反思日誌：新增、搜尋、編輯、刪除', async () => {
    await page.goto(BASE + '#/journal');
    await page.getByRole('button', { name: '寫一篇日誌' }).click();
    await page.getByLabel('標題（選填）').fill('第一次拒絕');
    await page.getByLabel(/^內容/).fill('今天我說了不');
    await page.getByRole('button', { name: /很好/ }).click();
    await page.getByLabel('自訂標籤').fill('界線');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: '儲存日誌' }).click();
    await page.getByLabel('搜尋日誌').fill('拒絕');
    await page.getByText('今天我說了不').waitFor();
    await page.getByRole('button', { name: '編輯日誌' }).click();
    await page.getByLabel(/^內容/).fill('今天我溫和地說了不');
    await page.getByRole('button', { name: '儲存修改' }).click();
    await page.getByText('今天我溫和地說了不').waitFor();
    const s = await store(page);
    if (s.journal[0].tags[0] !== '界線') throw new Error('標籤');
  });
  await step('章節筆記：依章節篩選、編輯、刪除', async () => {
    await page.goto(BASE + '#/journal?tab=notes');
    await page.getByLabel('依章節篩選').selectOption('ch1');
    await page.getByText('共 2 則').waitFor();
    await page.getByRole('button', { name: '刪除筆記' }).first().click();
    await page.getByRole('dialog').getByRole('button', { name: '刪除' }).click();
    await page.getByText('共 1 則').waitFor();
  });
  await step('全站搜尋（快捷鍵 /）', async () => {
    await page.goto(BASE + '#/');
    await page.keyboard.press('/');
    await page.getByLabel('搜尋關鍵字').fill('66 天');
    await page.getByRole('option').first().waitFor();
    await page.keyboard.press('Enter');
    await page.waitForURL(/learn|challenge/);
  });
  await step('儀表板顯示真實資料', async () => {
    await page.goto(BASE + '#/dashboard');
    await page.getByText('1/9', { exact: true }).first().waitFor();
    await page.getByText('「我的想法不等於事實」· 1 次').waitFor();
    await page.locator('.recharts-bar').first().waitFor();
    if ((await page.locator('.recharts-bar-rectangle path').count()) < 1) throw new Error('長條圖沒有資料');
    await page.getByText('踏出第一步').waitFor();
    await page.getByText('看見自己的模式').waitFor();
    await page.getByRole('heading', { name: '自願參與與輕鬆探索' }).waitFor();
    await page.getByRole('button', { name: '隱藏「自願參與與輕鬆探索」' }).click();
    await page.getByText('已隱藏「自願參與與輕鬆探索」').waitFor();
    if (!(await store(page)).settings.hiddenStats.includes('play')) throw new Error('隱藏');
    await page.getByRole('button', { name: '顯示「自願參與與輕鬆探索」' }).click();
    await page.getByRole('heading', { name: 'Break the Pattern｜打破慣性' }).waitFor();
    await page.getByText('七大習慣自我評估變化').waitFor();
    await page.getByText('晚上 11 點').first().waitFor();
    await page.getByText('關閉自動播放').first().waitFor();
    for (const t of ['7 Habits｜高效能生活實踐', '成為健康、持續學習、支持他人的人', '完成提案初稿']) {
      if (!(await page.getByText(t).count())) throw new Error('儀表板找不到：' + t);
    }
  });
  await step('主題切換與字體大小', async () => {
    await page.getByRole('button', { name: /^主題：/ }).click();
    await page.getByRole('button', { name: /^主題：/ }).click();
    if (!(await page.evaluate(() => document.documentElement.classList.contains('dark')))) throw new Error('非深色');
    await page.getByRole('button', { name: /^字體大小/ }).click();
    if ((await page.evaluate(() => document.documentElement.dataset.font)) !== 'lg') throw new Error('字體');
    if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/dashboard-dark.png` });
    await page.getByRole('button', { name: /^主題：/ }).click();
    await page.getByRole('button', { name: /^字體大小/ }).click();
    await page.getByRole('button', { name: /^字體大小/ }).click();
    await page.getByRole('button', { name: /^字體大小/ }).click();
  });
  await step('資料匯出（JSON）與錯誤格式匯入驗證', async () => {
    await page.goto(BASE + '#/data');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /下載完整備份/ }).click()]);
    const p = await dl.path();
    const json = JSON.parse(require('fs').readFileSync(p, 'utf8'));
    if (json.app !== 'rewire' || json.data.journal.length !== 1) throw new Error('備份內容');
    require('fs').writeFileSync('/tmp/claude-0/backup.json', JSON.stringify(json));
    require('fs').writeFileSync('/tmp/claude-0/bad.json', '{"foo":1}');
    await page.locator('#import-file').setInputFiles('/tmp/claude-0/bad.json');
    await page.getByRole('alert').filter({ hasText: '找不到 Rewire 備份標記' }).waitFor();
  });
  await step('清除所有紀錄（確認）後再從備份還原', async () => {
    await page.getByRole('button', { name: '清除所有紀錄' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '我了解，清除全部' }).click();
    if ((await store(page)).journal.length !== 0) throw new Error('未清除');
    await page.locator('#import-file').setInputFiles('/tmp/claude-0/backup.json');
    await page.getByRole('dialog').getByRole('button', { name: '確認還原' }).click();
    await page.getByRole('alert').filter({ hasText: '還原成功' }).waitFor();
    if ((await store(page)).journal.length !== 1) throw new Error('未還原');
  });
  await step('研究來源頁與 404 頁', async () => {
    await page.goto(BASE + '#/references');
    await page.getByText('待查證').first().waitFor();
    await page.goto(BASE + '#/nope');
    await page.getByText('這條小徑還沒有被走出來').waitFor();
  });
  await step('無資料空狀態（新的瀏覽器）', async () => {
    const c2 = await browser.newContext();
    const p2 = await c2.newPage();
    await p2.goto(BASE + '#/dashboard');
    await p2.getByText('還沒有練習紀錄').first().waitFor();
    await p2.getByText('0/9').first().waitFor();
    await c2.close();
  });

  // ===== 手機版 =====
  const mctx = await browser.newContext({ ...devices['iPhone 13'] });
  const m = await mctx.newPage();
  m.on('pageerror', (e) => errors.push('mobile: ' + e.message));
  await step('手機版：所有頁面無橫向捲動', async () => {
    const routes = ['', 'daily', 'learn', 'learn/ch1', 'learn/ch2', 'learn/ch6', 'learn/ch7', 'learn/ch9', 'lab', 'lab/habit-curve', 'challenge', 'journal', 'journal?tab=notes', 'dashboard', 'references', 'data', 'daily/read', 'pattern', 'pattern/approval', 'pattern/impress', 'pattern/promises', 'pattern/shortterm', 'pattern/assessment', 'pattern/workshop', 'challenge?type=pattern', 'habits7', 'habits7/proactive', 'habits7/end', 'habits7/first', 'habits7/winwin', 'habits7/understand', 'habits7/synergize', 'habits7/renew', 'habits7/plan', 'play', 'play/quest', 'play/surprise', 'play/wheel', 'play/stories', 'play/garden', 'play/collection', 'play/capsule'];
    const bad = [];
    for (const r of routes) {
      await m.goto(BASE + '#/' + r);
      await m.waitForTimeout(250);
      const w = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (w > 1) bad.push(`${r}:${w}px`);
    }
    if (bad.length) throw new Error(bad.join(', '));
  });
  await step('手機版：底部導覽與抽屜選單', async () => {
    await m.goto(BASE + '#/');
    await m.getByRole('navigation', { name: '主要功能' }).waitFor();
    await m.getByRole('button', { name: '開啟章節與功能選單' }).click();
    await m.getByRole('dialog', { name: '網站選單' }).getByRole('link', { name: /66 天習慣養成/ }).click();
    await m.getByRole('heading', { name: '66 天習慣養成與非線性改變', level: 1 }).waitFor();
    await m.getByRole('navigation', { name: '主要功能' }).getByRole('link', { name: '14 天練習' }).click();
    await m.waitForURL(/challenge/);
  });
  if (process.env.SHOT_DIR) {
    for (const [r, n] of [['', 'm-home2'], ['play/garden', 'm-garden'], ['play/stories?story=decline', 'm-story'], ['habits7', 'm-h7'], ['habits7/first', 'm-h7first'], ['habits7/renew', 'm-h7renew'], ['habits7/synergize', 'm-h7board'], ['pattern', 'm-pattern'], ['pattern/promises', 'm-promises'], ['challenge?type=pattern', 'm-pchallenge'], ['dashboard', 'm-dash'], ['', 'm-home'], ['daily/read', 'm-read'], ['learn/ch1', 'm-ch1'], ['challenge', 'm-challenge']]) {
      await m.goto(BASE + '#/' + r); await m.waitForTimeout(400);
      await m.screenshot({ path: `${process.env.SHOT_DIR}/${n}.png` });
    }
    await page.goto(BASE + '#/'); await page.waitForTimeout(400);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/d-home.png` });
    await page.goto(BASE + '#/learn/ch1'); await page.waitForTimeout(400);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/d-ch1.png` });
  }

  await browser.close();
  for (const [s, n] of results) console.log(s, n);
  console.log(errors.length ? `\nConsole errors:\n${[...new Set(errors)].join('\n')}` : '\nNo console errors');
  const failed = results.filter((r) => r[0] === '✗').length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();
