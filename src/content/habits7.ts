/**
 * 7 Habits｜高效能生活實踐
 *
 * 理論參考：Stephen R. Covey《The 7 Habits of Highly Effective People》（繁中版《與成功有約》）。
 * 撰寫原則：
 * - 只使用七個習慣的名稱作為概念標籤；所有解說、情境、工具與題目皆為本站原創，不重製原書文字或練習表格。
 * - 每個概念標註來源類型（見 SOURCE_TYPES），明確區分：柯維的管理哲學／心理學概念／神經科學發現／本站自行設計的工具。
 * - 七個習慣是管理哲學與實踐框架，並未被神經科學逐一驗證；「神經可塑性的可能關聯」僅作為延伸思考。
 */
import type { ChapterId, H7Id, PatternHabitId, QuizQuestion, RenewDim } from '../types';

export const H7_MODULE = '7 Habits｜高效能生活實踐';
export const H7_TITLE = '從管理自己，到與世界建立更好的關係';
export const H7_SUBTITLE = '透過七個習慣，練習自主選擇、價值導向、優先管理、同理溝通、互利合作與持續更新。';
export const H7_CORE = [
  '真正的高效能，需要同時關注個人的目標、關係品質與長期可持續性。',
  '這個模組鼓勵你建立自主性、理解自己的核心價值、提升面對困難的能力，並在與他人合作時尊重差異、尋找互利的解決方案。',
];

/** 內容來源類型：在頁面上以標籤呈現 */
export type SourceType = 'covey' | 'psych' | 'neuro' | 'tool';
export const SOURCE_TYPES: Record<SourceType, { label: string; desc: string }> = {
  covey: { label: '柯維管理哲學', desc: '來自《與成功有約》的實踐框架與觀點，屬於管理哲學，而非實驗研究結論。' },
  psych: { label: '心理學概念', desc: '心理學或管理學研究中的相關概念，附可查證的研究來源。' },
  neuro: { label: '神經科學發現', desc: '有神經科學研究支持的發現；與七個習慣之間的連結屬於延伸推論。' },
  tool: { label: '本站設計工具', desc: '本網站為實踐需求自行設計的練習與工具，未經研究驗證。' },
};

/** 三階段學習路徑 */
export const H7_STAGES = [
  { id: 'private', title: '個人成功', en: 'Private Victory', from: '依賴', to: '獨立', goal: '培養個人責任感、清晰價值觀及有意識的優先順序管理。', habits: ['proactive', 'end', 'first'] as H7Id[] },
  { id: 'public', title: '公眾成功', en: 'Public Victory', from: '獨立', to: '互賴', goal: '提升同理心、溝通能力、合作品質及尊重差異的能力。', habits: ['winwin', 'understand', 'synergize'] as H7Id[] },
  { id: 'renewal', title: '自我更新', en: 'Renewal', from: '持續', to: '平衡', goal: '建立長期平衡的生活，持續照顧身體、心智、價值與人際關係。', habits: ['renew'] as H7Id[] },
];

export interface H7Habit {
  id: H7Id;
  no: number;
  stage: 'private' | 'public' | 'renewal';
  title: string;
  en: string;
  icon: 'compass' | 'target' | 'listTodo' | 'handshake' | 'messages' | 'network' | 'refresh';
  core: string;
  definition: string[];
  importantNote?: string;
  situations: { label: string; text: string }[];
  misconceptions: { myth: string; better: string }[];
  neuro: { text: string; caution: string };
  concepts: { term: string; text: string; source: SourceType }[];
  strategies: string[];
  toolTitle: string;
  toolDesc: string;
  reflections: string[];
  /** 自我評估：三題（1 很少如此 ～ 5 幾乎總是如此） */
  selfCheck: { id: string; text: string }[];
  /** 與原有 Rewire 模組的連結 */
  links: { affirmationIds: number[]; patternIds: PatternHabitId[]; chapterIds: ChapterId[]; labTools: { label: string; to: string }[] };
  quiz: QuizQuestion[];
  /** 章節完成後的學習體驗 */
  apply: string;
  quickAction: string;
  finalReflection: string;
  extension: { label: string; to: string; desc: string };
  /** 21 天探索計畫：第二天的行動實驗 */
  experiment: string;
  referenceIds: string[];
}

export const h7Habits: H7Habit[] = [
  /* ---------------- 習慣一 ---------------- */
  {
    id: 'proactive',
    no: 1,
    stage: 'private',
    title: '主動積極',
    en: 'Be Proactive',
    icon: 'compass',
    core: '將注意力放在自己能夠影響的選擇與行動上，逐步培養責任感與自主性。',
    definition: [
      '主動積極的意思不是「凡事往好處想」，而是承認：在外在事件與自己的回應之間，通常仍有一些選擇的空間。我們可能無法決定發生什麼，但可以練習決定如何回應。',
      '柯維用「關注圈」與「影響圈」來描述這件事：關注圈是我們在意的所有事情，影響圈是其中我們能做些什麼的部分。把心力投入影響圈，影響圈往往會逐漸擴大。',
    ],
    importantNote: '主動積極也需要理解個人能力、資源及外在環境的限制。經濟條件、健康、制度與他人的選擇都會影響結果，不應把所有結果完全歸咎於個人。',
    situations: [
      { label: '求職', text: '面試結果可能受到職缺數量、面試官偏好與其他應徵者等多種因素影響。但履歷準備、能力提升與面試練習，是個人可以持續投入的部分。' },
      { label: '職場', text: '專案臨時被縮減預算。與其整天抱怨決策，不如先列出：在新預算下，哪些部分仍能做好？需要向誰說明影響？' },
      { label: '生活', text: '天氣讓戶外跑步計畫取消。可以控制的是改在室內做 15 分鐘伸展，或調整這週其他天的安排。' },
    ],
    misconceptions: [
      { myth: '主動積極就是要永遠正向、不能抱怨。', better: '感到挫折是正常的。主動積極是在承認情緒後，仍找出自己能做的下一步。' },
      { myth: '只要夠積極，什麼都能改變。', better: '有些事情確實超出個人控制。分辨「能控制、能影響、無法控制」本身，就是務實的主動。' },
      { myth: '主動就是什麼都自己扛。', better: '尋求協助、表達需求、設定界線，也都是影響圈內的主動行動。' },
    ],
    neuro: {
      text: '研究發現，當人感到對壓力源「有一些控制」時，前額葉對壓力反應的調節可能較好；反覆練習在情緒出現時暫停與選擇回應，也與第 7 章「刺激與反應之間的空間」是同一條練習路徑。',
      caution: '這是延伸推論：目前沒有研究直接證明「主動積極」這個習慣會改變特定腦區。控制感的研究多來自實驗室與動物模型。',
    },
    concepts: [
      { term: '關注圈 Circle of Concern／影響圈 Circle of Influence', text: '把在意的事分成「能做些什麼」與「目前無法影響」兩部分，並把心力投入前者。', source: 'covey' },
      { term: '自我效能 Self-Efficacy', text: '相信自己能完成特定行動的信念；成功經驗是最重要的來源。', source: 'psych' },
      { term: '控制信念 Locus of Control', text: '人們傾向把結果歸因於自己的行動（內控）或外在因素（外控）；兩者在不同情境各有適應意義。', source: 'psych' },
      { term: '心理彈性 Psychological Flexibility', text: '在困難情緒與想法存在時，仍能依自己的價值調整行動的能力。', source: 'psych' },
      { term: '壓力與前額葉功能', text: '強烈壓力會暫時削弱前額葉的調控功能，使人更依賴自動反應。', source: 'neuro' },
      { term: '關注圈與影響圈分類工具', text: '把困難拆成三類並選出一個行動，建立微承諾。', source: 'tool' },
    ],
    strategies: ['遇到困難時，先寫下「我能控制的一件事」。', '把「我必須……」改成「我選擇……」，檢視是否真的是自己的選擇。', '在回應前暫停 10 秒（可搭配生理性嘆息）。', '每週回顧一次：哪些事情從關注圈移進了影響圈？'],
    toolTitle: '關注圈與影響圈',
    toolDesc: '輸入目前的困難，將相關事項拖曳分類為「能直接控制／可以嘗試影響／目前超出控制」，再選擇一項行動建立微承諾。',
    reflections: ['最近讓我最消耗心力的事情，有多少在我的影響圈內？', '我常用哪些話，把選擇權交給了外在環境？', '有哪一件事，我其實可以尋求協助來擴大影響圈？'],
    selfCheck: [
      { id: 'p1', text: '遇到困難時，我會先找出自己能做的下一步。' },
      { id: 'p2', text: '我能分辨哪些事在我的控制範圍內、哪些不在。' },
      { id: 'p3', text: '我在情緒出現時，能暫停一下再決定如何回應。' },
    ],
    links: {
      affirmationIds: [5, 7],
      patternIds: ['approval'],
      chapterIds: ['ch7', 'ch2'],
      labTools: [{ label: '刺激與反應之間的空間', to: '/lab/pause' }, { label: '微承諾追蹤器', to: '/pattern/promises#tool' }],
    },
    quiz: [
      { id: 'q1', question: '「影響圈」指的是什麼？', options: ['所有我在意的事情', '我在意的事情中，我能採取行動的部分', '別人能控制的事情', '已經發生且無法改變的事'], answer: 1, explanation: '影響圈是關注圈中，我們能透過行動產生影響的部分。' },
      { id: 'q2', question: '關於主動積極，下列何者較準確？', options: ['只要夠努力，所有結果都能控制', '應該壓抑所有負面情緒', '在承認限制與情緒的同時，找出自己能做的選擇', '把所有問題都歸咎於自己'], answer: 2, explanation: '主動積極需要同時理解個人限制與可選擇的空間。' },
      { id: 'q3', question: '面試結果不理想時，哪一個是影響圈內的行動？', options: ['決定面試官的偏好', '練習回答常見問題並修改履歷', '控制其他應徵者的表現', '改變職缺數量'], answer: 1, explanation: '準備與練習是個人可以持續投入的部分。' },
    ],
    apply: '找一件這週讓你煩惱的事，用三個欄位寫下：能控制、能影響、無法控制。',
    quickAction: '現在就寫下一個「今天可以做到」的小行動，並在一句話中說明為什麼它在你的影響圈內。',
    finalReflection: '如果我把今天的心力多放一點在影響圈內，我會先做什麼？',
    extension: { label: '練習「停 → 察 → 選 → 行」', to: '/lab/pause', desc: '在情境題中練習刺激與反應之間的選擇空間。' },
    experiment: '使用「關注圈與影響圈」工具整理一個困難，並為影響圈中的一項建立微承諾，今天完成一次。',
    referenceIds: ['covey1989', 'bandura1977', 'rotter1966', 'kashdan2010', 'arnsten2009'],
  },

  /* ---------------- 習慣二 ---------------- */
  {
    id: 'end',
    no: 2,
    stage: 'private',
    title: '以終為始',
    en: 'Begin with the End in Mind',
    icon: 'target',
    core: '從長期願景與核心價值出發，思考目前的選擇是否符合自己希望前進的方向。',
    definition: [
      '以終為始是先想清楚「我希望成為什麼樣的人、過什麼樣的生活」，再回頭檢視今天的安排。它像是在出發前確認方向，而不是只顧著加快速度。',
      '願景不需要宏大或一次寫完。它可以是幾個你真正在乎的價值，以及一年後希望看見的一些具體改變；隨著人生階段變化，也可以修改。',
    ],
    situations: [
      { label: '職涯', text: '同時收到兩份工作邀約。比較薪水之外，也可以問：哪一份更接近我三年後想具備的能力與生活方式？' },
      { label: '學習', text: '想學的東西太多。先寫下「一年後我希望能做到什麼」，就比較容易決定先學哪一項。' },
      { label: '生活', text: '週末總是被各種邀約填滿。回到自己重視的健康與家人時間，可以幫助決定哪些邀約要婉拒。' },
    ],
    misconceptions: [
      { myth: '一定要有一個明確的人生終極目標。', better: '方向可以是幾個核心價值，具體目標可以邊走邊調整。' },
      { myth: '寫下願景就會自動實現。', better: '願景需要轉化為具體目標與日常行動，並定期回顧。' },
      { myth: '以終為始代表只看未來、犧牲現在。', better: '價值導向也包含珍惜當下的關係、健康與體驗。' },
    ],
    neuro: {
      text: '「未來自我」研究發現，當人覺得與未來的自己較有連結時，較可能做出有利長期的選擇；部分研究也觀察到，思考現在與未來自己時的腦部活動模式有差異。',
      caution: '相關研究多以儲蓄與金錢決策為主，且為實驗情境；不能推論寫下願景就會改變大腦。',
    },
    concepts: [
      { term: '以終為始 Begin with the End in Mind', text: '先釐清希望前往的方向，再安排行動。', source: 'covey' },
      { term: '價值澄清 Values Clarification', text: '辨識對自己真正重要的價值，作為決策參考。', source: 'psych' },
      { term: '自我一致目標 Self-Concordant Goals', text: '與個人價值和興趣一致的目標，較可能被持續追求，並與幸福感有關。', source: 'psych' },
      { term: '目標設定 Goal Setting', text: '具體且具挑戰性的目標通常提升表現，但需要能力、承諾與回饋配合。', source: 'psych' },
      { term: '未來自我連續性 Future Self-Continuity', text: '感覺與未來自己越有連結，越可能做出有利長期的決定。', source: 'psych' },
      { term: '人生羅盤 Life Compass', text: '以八個生活領域探索價值、一年後的改變與下一步行動，並撰寫個人願景宣言。', source: 'tool' },
    ],
    strategies: ['用人生羅盤探索一到兩個你最在乎的領域。', '寫一段 3–5 句的個人願景宣言，每季更新一次。', '為今年選一個年度關鍵字。', '每週檢查：本週行事曆中，有多少時間花在與願景相關的事上？'],
    toolTitle: '人生羅盤 Life Compass',
    toolDesc: '探索八個生活領域的價值與一年後的改變，建立可編輯的個人願景宣言、年度關鍵字、年度目標與行動計畫。',
    reflections: ['如果一年後回頭看，我希望這一年留下了什麼？', '最近的哪一個選擇，最符合我重視的價值？', '我的時間安排，反映了哪些價值？'],
    selfCheck: [
      { id: 'e1', text: '我清楚知道自己最重視的幾個價值。' },
      { id: 'e2', text: '做重要決定時，我會思考它是否符合我的長期方向。' },
      { id: 'e3', text: '我的日常行動與長期目標大致一致。' },
    ],
    links: {
      affirmationIds: [2, 7],
      patternIds: ['shortterm'],
      chapterIds: ['ch3', 'ch8'],
      labTools: [{ label: '短期與長期選擇模擬器', to: '/pattern/shortterm#tool' }, { label: 'If-Then 行動計畫', to: '/lab/if-then' }],
    },
    quiz: [
      { id: 'q1', question: '以終為始最核心的意思是？', options: ['先定好一個永遠不變的終極目標', '從希望前往的方向與價值出發，安排目前的選擇', '只關注未來，不在乎現在', '把所有目標寫下來就好'], answer: 1, explanation: '重點在於方向與價值，並讓日常行動與之一致。' },
      { id: 'q2', question: '「自我一致目標」研究的主要發現是？', options: ['越困難的目標越好', '與個人價值一致的目標較可能被持續追求', '目標應該由別人設定', '設定目標會降低幸福感'], answer: 1, explanation: 'Sheldon 與 Elliot（1999）發現自我一致的目標與持續努力和幸福感有關。' },
      { id: 'q3', question: '寫完個人願景宣言後，下一步最重要的是？', options: ['不需要再看', '轉化成具體目標與日常行動，並定期回顧', '只告訴別人', '每天重寫一次'], answer: 1, explanation: '願景需要連結到具體行動與回顧，才會影響日常選擇。' },
    ],
    apply: '從八個生活領域中，挑一個你最近最在意的，回答「一年後我希望有什麼改變？」',
    quickAction: '寫下今年的一個年度關鍵字，並說明它代表什麼。',
    finalReflection: '我今天做的哪一件小事，讓我更靠近自己想成為的人？',
    extension: { label: '短期與長期選擇模擬器', to: '/pattern/shortterm#tool', desc: '把願景放進當下的選擇裡比較。' },
    experiment: '使用「人生羅盤」完成一個生活領域的五個問題，並寫下第一版個人願景宣言。',
    referenceIds: ['covey1989', 'sheldon1999', 'locke2002', 'hershfield2011', 'hershfield2011b'],
  },

  /* ---------------- 習慣三 ---------------- */
  {
    id: 'first',
    no: 3,
    stage: 'private',
    title: '要事第一',
    en: 'Put First Things First',
    icon: 'listTodo',
    core: '依照重要性與緊急程度安排優先順序，確保真正重要的事情能獲得適當時間與資源。',
    definition: [
      '要事第一是把「重要的事」放在行事曆中，而不是只回應眼前最緊急、最吵的事。柯維用重要性與緊急性兩個軸，把事情分成四個象限。',
      '其中特別值得關注的是「重要但不緊急」的第二象限：運動、學習、人際經營、職涯探索、健康檢查、長期財務規劃。它們很少催促你，卻深深影響長期生活。',
    ],
    situations: [
      { label: '職場', text: '一整天都在回訊息與處理臨時請求，下班才發現重要的提案一字未動。可以試著每天先保留 60 分鐘給第二象限。' },
      { label: '健康', text: '年度健康檢查一延再延。它不緊急，但很重要，適合直接排進行事曆。' },
      { label: '學習', text: '想準備證照考試，卻總被雜事打斷。用「本週三件要事」先決定這週一定要完成的部分。' },
    ],
    misconceptions: [
      { myth: '要事第一就是把每分鐘都排滿。', better: '休息與彈性時間本身也可以是重要的事。' },
      { myth: '緊急的事都不重要。', better: '第一象限的事情需要處理；目標是減少本來可以預防的緊急事件。' },
      { myth: '只要列好清單就會做到。', better: '把重要的事放進具體時段，並搭配 If-Then 計畫，比只列清單更可能執行。' },
    ],
    neuro: {
      text: '安排優先順序需要工作記憶、抑制控制與計畫等執行功能；這些功能會受到疲勞、壓力與睡眠影響。研究也發現，人們常偏好處理「有時限的」事情，即使另一件事回報更大。',
      caution: '四象限是實用的管理框架；時間管理的後設分析顯示它與工作表現有小到中度關聯，但與幸福感的關聯更明顯，效果因人與情境而異。',
    },
    concepts: [
      { term: '四象限 Time Management Matrix', text: '以重要性與緊急性分類事情，並優先保護第二象限。', source: 'covey' },
      { term: '緊急效應 Mere Urgency Effect', text: '人們傾向選擇有時限壓力的任務，即使另一任務回報更大。', source: 'psych' },
      { term: '執行功能 Executive Function', text: '工作記憶、抑制控制與認知彈性，幫助我們依目標安排行動。', source: 'neuro' },
      { term: '執行意圖 Implementation Intentions', text: '用「如果……就……」把重要的事連結到具體時間與情境。', source: 'psych' },
      { term: '時間管理研究', text: '後設分析顯示時間管理與表現、幸福感有正相關，且對幸福感的關聯較強。', source: 'psych' },
      { term: '四象限優先矩陣與本週三件要事', text: '新增、拖曳、追蹤任務，並每週選出三件最重要的事。', source: 'tool' },
    ],
    strategies: ['每週開始前，選出三件要事並排進具體時段。', '每天先處理一件第二象限的事，再打開訊息。', '把常見的第三象限事項批次處理。', '為第二象限任務設定 If-Then 計畫。'],
    toolTitle: '四象限優先矩陣',
    toolDesc: '新增任務、拖曳調整象限、設定截止日期與完成狀態、備註提醒；檢視每週任務分布，並選出本週三件要事。',
    reflections: ['過去一週，我的時間主要花在哪一個象限？', '哪一件第二象限的事，如果持續做一年，會帶來最大的不同？', '我常被哪些第三象限的事打斷？'],
    selfCheck: [
      { id: 'f1', text: '我會為重要但不緊急的事保留時間。' },
      { id: 'f2', text: '我能分辨哪些事情真正重要，而不只是緊急。' },
      { id: 'f3', text: '我每週會規劃最重要的幾件事。' },
    ],
    links: {
      affirmationIds: [7],
      patternIds: ['promises', 'convenience', 'shortterm'],
      chapterIds: ['ch8', 'ch1'],
      labTools: [{ label: 'If-Then 行動計畫', to: '/lab/if-then' }, { label: '微承諾追蹤器', to: '/pattern/promises#tool' }],
    },
    quiz: [
      { id: 'q1', question: '下列哪一項最可能屬於第二象限（重要但不緊急）？', options: ['今天下午截止的報告', '定期運動與健康檢查', '突然響起的推銷電話', '漫無目的地滑社群'], answer: 1, explanation: '運動與健康檢查重要，但通常沒有立即的時間壓力。' },
      { id: 'q2', question: '「緊急效應」研究發現什麼？', options: ['人們總是先做最重要的事', '人們傾向選擇有時限的任務，即使另一任務回報更大', '緊急的事都不重要', '時間壓力會提升所有表現'], answer: 1, explanation: 'Zhu 等人（2018）發現時限壓力會影響選擇，即使回報較小。' },
      { id: 'q3', question: '讓第二象限的事更可能被完成，下列何者最有幫助？', options: ['等有空時再做', '排進具體時段並搭配 If-Then 計畫', '把它和所有雜事放在同一清單', '只靠意志力'], answer: 1, explanation: '具體時段與執行意圖能幫助重要的事真正被執行。' },
      { id: 'q4', question: '關於時間管理研究的結論，何者較準確？', options: ['四象限已被神經科學證實', '時間管理與表現、幸福感有正相關，但效果因人而異', '時間管理完全無效', '只要分類就能提升表現'], answer: 1, explanation: 'Aeon 等人（2021）的後設分析顯示正相關，且與幸福感的關聯較強。' },
    ],
    apply: '把明天的待辦事項放進四象限，看看第二象限有幾件。',
    quickAction: '選出本週三件要事，為其中一件寫下具體時間。',
    finalReflection: '這週我願意為哪一件重要但不緊急的事，保留第一個時段？',
    extension: { label: 'If-Then 行動計畫產生器', to: '/lab/if-then', desc: '把第二象限任務連結到具體情境。' },
    experiment: '在「四象限優先矩陣」整理至少 5 件任務，並選出本週三件要事，完成其中一件。',
    referenceIds: ['covey1989', 'zhu2018', 'aeon2021', 'diamond2013', 'gollwitzer2006'],
  },

  /* ---------------- 習慣四 ---------------- */
  {
    id: 'winwin',
    no: 4,
    stage: 'public',
    title: '雙贏思維',
    en: 'Think Win-Win',
    icon: 'handshake',
    core: '理解雙方的需求、界線與目標，尋找能夠兼顧彼此合理利益的合作方式。',
    definition: [
      '雙贏思維是一種合作的心態：不把關係看成「你贏我就輸」，而是嘗試找到彼此都能接受、甚至更好的方案。它需要清楚自己的需求，也願意理解對方的需求。',
      '雙贏不等於退讓或討好。清楚的界線、對自己需求的尊重，是能長期合作的基礎。',
    ],
    importantNote: '雙贏需要考慮實際權力關係與利益分配。在部分情況下，拒絕合作、暫停協商或尋求第三方協助（例如主管、人資、調解或專業諮詢），也可能是合理且健康的選擇。',
    situations: [
      { label: '職場', text: '兩個部門都想在同一週使用會議室做簡報。與其爭先後，可以了解彼此真正需要的是時段、空間還是設備。' },
      { label: '家庭', text: '家人希望你週末回家，你需要時間準備考試。可以討論：回家一天、或改成視訊聚餐。' },
      { label: '合作', text: '接案時客戶希望降價。了解對方的預算限制後，或許可以調整交付範圍，而不是單純降價。' },
    ],
    misconceptions: [
      { myth: '雙贏就是各退一步。', better: '妥協只是選項之一；整合雙方需求，有時能找到比妥協更好的方案。' },
      { myth: '雙贏就是不能拒絕。', better: '若無法兼顧合理利益，「這次不合作」也是尊重彼此的選擇。' },
      { myth: '只要態度好，就能雙贏。', better: '權力不對等、資訊不足或對方不願合作時，需要不同的策略與支持。' },
    ],
    neuro: {
      text: '社會神經科學研究發現，公平與合作相關的決策會牽動與獎勵和情緒相關的腦區；換位思考也與降低刻板印象有關。',
      caution: '這些研究說明了合作與公平的心理基礎，但沒有證明「雙贏思維」是一種可被腦造影驗證的習慣。',
    },
    concepts: [
      { term: '雙贏思維 Think Win-Win', text: '以互惠、互利的心態看待合作關係。', source: 'covey' },
      { term: '原則式協商 Principled Negotiation', text: '聚焦利益而非立場、創造多種選項、使用客觀標準。', source: 'psych' },
      { term: '整合式協商 Integrative Negotiation', text: '研究顯示，同時重視自己與對方利益的協商者，較常達成更好的整合性結果。', source: 'psych' },
      { term: '換位思考 Perspective Taking', text: '主動想像對方的觀點，可能降低刻板印象與偏見。', source: 'psych' },
      { term: '心理安全感 Psychological Safety', text: '團隊成員相信提出意見不會被懲罰，與學習行為有關。', source: 'psych' },
      { term: '雙贏協商工作坊', text: '整理雙方需求、共同目標、界線與方案，並比較各方案的互利程度。', source: 'tool' },
    ],
    strategies: ['協商前先寫下自己的需求與不可妥協的界線。', '問「你最在意的是什麼？」，聚焦利益而非立場。', '至少想出三個方案再做決定。', '如果無法雙贏，坦白說明並保留關係。'],
    toolTitle: '雙贏協商工作坊',
    toolDesc: '輸入衝突情境，整理雙方需求、共同目標、界線與可調整條件，並為多個方案評分比較。',
    reflections: ['在最近一次衝突中，對方真正在意的可能是什麼？', '我有哪些界線，是需要更清楚說出口的？', '在什麼情況下，暫停或拒絕合作對我是比較好的選擇？'],
    selfCheck: [
      { id: 'w1', text: '發生衝突時，我會試著理解對方真正的需求。' },
      { id: 'w2', text: '我能清楚表達自己的需求與界線。' },
      { id: 'w3', text: '我會嘗試找出不只一種可能的解決方案。' },
    ],
    links: {
      affirmationIds: [3, 6],
      patternIds: ['approval'],
      chapterIds: ['ch5', 'ch3'],
      labTools: [{ label: '口袋句（表達需求、拒絕）', to: '/lab/pocket' }, { label: '認可依賴覺察器', to: '/pattern/approval#tool' }],
    },
    quiz: [
      { id: 'q1', question: '原則式協商建議聚焦在？', options: ['雙方的立場', '雙方的利益與需求', '誰比較有權力', '誰先讓步'], answer: 1, explanation: '聚焦利益而非立場，較容易找到多種方案。' },
      { id: 'q2', question: '下列哪一個是對雙贏思維的誤解？', options: ['雙贏需要理解雙方需求', '雙贏代表永遠不能拒絕', '雙贏可能需要創造新方案', '雙贏需要清楚的界線'], answer: 1, explanation: '當無法兼顧合理利益時，拒絕或暫停也是合理選擇。' },
      { id: 'q3', question: '權力明顯不對等的衝突中，較合適的做法是？', options: ['一定要自己硬撐到雙贏', '考慮尋求第三方協助或暫停協商', '完全照對方要求', '避免任何溝通'], answer: 1, explanation: '雙贏需要考慮實際權力關係，第三方協助可能是合理選擇。' },
    ],
    apply: '選一個最近的小衝突，分別寫下「我的需求」與「對方可能的需求」。',
    quickAction: '寫下一句你可以用來表達界線的話。',
    finalReflection: '在這段關係中，什麼樣的結果會讓雙方都覺得被尊重？',
    extension: { label: '口袋句：表達需求與拒絕', to: '/lab/pocket', desc: '複製可直接使用的句型。' },
    experiment: '使用「雙贏協商工作坊」分析一個情境，至少列出三個方案並比較。',
    referenceIds: ['covey1989', 'fisher1981', 'dedreu2000', 'galinsky2000', 'edmondson1999'],
  },

  /* ---------------- 習慣五 ---------------- */
  {
    id: 'understand',
    no: 5,
    stage: 'public',
    title: '知彼解己',
    en: 'Seek First to Understand, Then to Be Understood',
    icon: 'messages',
    core: '先理解對方的立場、感受與需求，再清楚表達自己的觀點。',
    definition: [
      '知彼解己包含兩個部分：先理解，再表達。很多時候我們聽別人說話，是在準備自己的回應；練習先聽懂對方，能讓對話更有效，也讓對方更願意聽你說。',
      '「再被理解」同樣重要。理解對方不代表放棄自己的觀點，而是在對方感到被聽見後，更清楚、平和地說出自己的想法。',
    ],
    situations: [
      { label: '友誼', text: '朋友分享工作壓力，你很快給了三個建議，對方卻更沮喪。也許他當下需要的，是先被理解。' },
      { label: '職場', text: '同事質疑你的專案方案。先問清楚他擔心的部分，再說明你的考量，常能讓討論更聚焦。' },
      { label: '團隊', text: '成員對工作分配有不同意見。先反映對方的感受與需求，再一起討論調整方式。' },
    ],
    misconceptions: [
      { myth: '同理就是同意對方。', better: '同理是理解對方的感受與觀點，你仍可以有不同意見。' },
      { myth: '傾聽就是安靜不說話。', better: '積極傾聽包含反映、提問與確認理解。' },
      { myth: '先理解別人，就不能表達自己。', better: '知彼之後的「解己」同樣重要，健康的溝通需要雙方都被聽見。' },
    ],
    neuro: {
      text: '情緒命名研究發現，為情緒找到詞彙時，與情緒反應相關的腦區活動較低；在對話中幫對方說出感受（例如「聽起來你很有壓力」），可能有類似的調節作用。',
      caution: '情緒命名研究多是個人為自己命名、在實驗室進行；在對話中替他人命名的效果，仍需要更多研究。',
    },
    concepts: [
      { term: '知彼解己 Seek First to Understand', text: '先理解對方，再表達自己。', source: 'covey' },
      { term: '積極傾聽 Active Listening', text: '透過專注、反映與提問來確認理解；研究發現它能讓對方感到更被理解。', source: 'psych' },
      { term: '高品質傾聽 High-Quality Listening', text: '被好好傾聽的人，較能看見自己觀點中的複雜性，態度也較不極端。', source: 'psych' },
      { term: '非暴力溝通 Nonviolent Communication', text: '以觀察、感受、需要、請求四個要素表達與傾聽。', source: 'psych' },
      { term: '情緒命名 Affect Labeling', text: '為情緒找到詞彙，可能與較低的情緒反應有關。', source: 'neuro' },
      { term: '同理溝通模擬器', text: '在情境中選擇回應，並依五個面向回饋分析。', source: 'tool' },
    ],
    strategies: ['回應前先用自己的話重述對方的意思。', '問「你最在意的是哪個部分？」', '先確認對方是需要建議，還是需要被聽見。', '在對方感到被理解後，用「我」開頭表達自己的想法。'],
    toolTitle: '同理溝通模擬器',
    toolDesc: '在三個情境中選擇回應方式，獲得五個面向的分析；並可複製、收藏常用的同理回應句型。',
    reflections: ['最近一次對話中，我是在傾聽，還是在準備回應？', '有誰是我想更理解的人？', '當我感到被理解時，對方做了什麼？'],
    selfCheck: [
      { id: 'u1', text: '在給建議之前，我會先確認自己理解對方的意思。' },
      { id: 'u2', text: '我能察覺並說出對方可能的感受。' },
      { id: 'u3', text: '在對方被理解後，我能清楚表達自己的觀點。' },
    ],
    links: {
      affirmationIds: [5, 6],
      patternIds: ['approval', 'environment'],
      chapterIds: ['ch2', 'ch7'],
      labTools: [{ label: '情緒命名', to: '/lab/labeling' }, { label: '認知濾鏡實驗', to: '/lab/cognitive-filter' }],
    },
    quiz: [
      { id: 'q1', question: '朋友分享壓力時，哪一種回應最符合「先理解」？', options: ['你應該換工作', '這沒什麼，大家都一樣', '聽起來這件事讓你很有壓力，最困擾你的是哪部分？', '我上次比你更慘'], answer: 2, explanation: '先反映感受並詢問，能讓對方感到被理解。' },
      { id: 'q2', question: '同理對方是否代表同意對方？', options: ['是，同理就是同意', '不是，同理是理解，仍可以有不同意見', '同理就是不說話', '同理只適用於朋友'], answer: 1, explanation: '同理與同意是兩回事。' },
      { id: 'q3', question: '非暴力溝通的四個要素是？', options: ['觀察、感受、需要、請求', '批評、要求、命令、威脅', '傾聽、沉默、離開、忘記', '目標、計畫、執行、檢討'], answer: 0, explanation: 'Rosenberg 提出觀察、感受、需要、請求四個要素。' },
    ],
    apply: '下一次對話時，先用一句話重述對方的意思，再說出你的想法。',
    quickAction: '收藏一句你最想練習的同理回應句型。',
    finalReflection: '今天有誰需要被我好好聽見？',
    extension: { label: '情緒命名練習', to: '/lab/labeling', desc: '增加情緒詞彙，讓同理更精準。' },
    experiment: '在「同理溝通模擬器」完成三個情境，並在現實中使用一次同理回應句型。',
    referenceIds: ['covey1989', 'weger2014', 'itzchakov2017', 'rosenberg2003', 'lieberman2007'],
  },

  /* ---------------- 習慣六 ---------------- */
  {
    id: 'synergize',
    no: 6,
    stage: 'public',
    title: '統合綜效',
    en: 'Synergize',
    icon: 'network',
    core: '結合不同背景、專長與思考方式，透過合作探索更完整的解決方案。',
    definition: [
      '統合綜效是讓「不同」成為資源：當不同觀點被認真看待、整合，團隊有機會找到任何一個人單獨都想不到的方案。',
      '綜效不會自動發生。它需要共同目標、心理安全感，以及把衝突聚焦在問題本身，而不是攻擊個人。',
    ],
    situations: [
      { label: '專案', text: '行銷與工程對產品功能意見不同。把雙方的考量都放上思考板，常能找到兼顧使用者與技術限制的第三種方案。' },
      { label: '社團', text: '活動企劃中，有人重視預算、有人重視體驗。先定義共同目標，再整合不同觀點。' },
      { label: '家庭', text: '家人對旅遊計畫各有想法。列出每個人最在意的一件事，再設計行程。' },
    ],
    misconceptions: [
      { myth: '團隊越多元，表現一定越好。', better: '多元需要良好的整合過程；處理不好也可能增加衝突與溝通成本。' },
      { myth: '有衝突就代表合作失敗。', better: '聚焦於任務的建設性討論可能有幫助；需要小心的是轉變為人身攻擊的關係衝突。' },
      { myth: '綜效就是少數服從多數。', better: '綜效是整合觀點，而不是只用投票決定。' },
    ],
    neuro: {
      text: '團隊合作的研究多來自組織與社會心理學。神經科學層面，學習新觀點、調整既有想法需要認知彈性，這是執行功能的一部分。',
      caution: '「集體智慧」等團隊研究有重複驗證的爭議；本章不宣稱綜效有特定的神經機制。',
    },
    concepts: [
      { term: '統合綜效 Synergize', text: '整合差異，創造比各自加總更好的結果。', source: 'covey' },
      { term: '認知多樣性 Cognitive Diversity', text: '團隊多元性可能帶來資訊與觀點優勢，但效果取決於整合過程。', source: 'psych' },
      { term: '任務衝突與關係衝突', text: '後設分析顯示兩種衝突都與團隊表現呈負相關，但關係衝突的負面影響通常較明顯。', source: 'psych' },
      { term: '心理安全感 Psychological Safety', text: '成員敢於提出不同意見，是整合觀點的前提。', source: 'psych' },
      { term: '設計思考 Design Thinking', text: '以理解使用者、發想多種方案與快速原型探索問題的方法。', source: 'psych' },
      { term: '團隊合作思考板', text: '以八個區塊的便利貼整理專案挑戰，可匯出與匯入分享（個人工作坊，非即時多人協作）。', source: 'tool' },
    ],
    strategies: ['先一起寫下問題定義與共同目標。', '請每個人說出「我最在意的一件事」。', '把衝突聚焦在方案，而不是人。', '討論結束前，明確寫下下一步與負責人。'],
    toolTitle: '團隊合作思考板',
    toolDesc: '輸入專案挑戰，在八個區塊中新增、拖曳、編輯便利貼，並匯出內容與他人分享。',
    reflections: ['最近一次合作中，哪一個不同觀點讓結果變得更好？', '我在團隊中，是否讓別人感到可以安心提出意見？', '面對不同意見時，我通常的第一反應是什麼？'],
    selfCheck: [
      { id: 's1', text: '面對不同意見時，我會先好奇對方的考量。' },
      { id: 's2', text: '我能把衝突聚焦在問題，而不是個人。' },
      { id: 's3', text: '我會主動邀請不同背景的人提供觀點。' },
    ],
    links: {
      affirmationIds: [2, 4],
      patternIds: ['environment'],
      chapterIds: ['ch3', 'ch9'],
      labTools: [{ label: '成長環境盤點', to: '/pattern/environment#tool' }, { label: '身份敘事改寫器', to: '/lab/identity-rewriter' }],
    },
    quiz: [
      { id: 'q1', question: '關於團隊多元性，研究較支持哪一個說法？', options: ['多元一定提升表現', '多元的效果取決於團隊如何整合不同觀點', '多元一定降低表現', '多元與表現無關'], answer: 1, explanation: 'van Knippenberg 與 Schippers（2007）指出效果取決於歷程與情境。' },
      { id: 'q2', question: '統合綜效的前提，下列何者最重要？', options: ['所有人意見一致', '成員敢於提出不同意見的心理安全感', '由一個人做所有決定', '避免任何衝突'], answer: 1, explanation: '心理安全感讓不同觀點得以浮現。' },
      { id: 'q3', question: '本站的團隊合作思考板是？', options: ['即時多人協作平台', '個人工作坊，可透過匯出與匯入分享', '雲端同步工具', 'AI 自動產生方案'], answer: 1, explanation: '無後端版本為個人工作坊，不具即時多人協作功能。' },
    ],
    apply: '找一個正在進行的合作，寫下兩個和你不同的觀點，以及它們可能的價值。',
    quickAction: '在團隊合作思考板上寫下一個「問題定義」。',
    finalReflection: '下一次討論時，我可以怎麼讓不同的聲音更容易被聽見？',
    extension: { label: '成長環境盤點', to: '/pattern/environment#tool', desc: '觀察你所處環境的支持程度。' },
    experiment: '建立一個「團隊合作思考板」，至少在四個區塊加入便利貼，並匯出一次。',
    referenceIds: ['covey1989', 'vanknippenberg2007', 'dedreu2003', 'edmondson1999', 'brown2008'],
  },

  /* ---------------- 習慣七 ---------------- */
  {
    id: 'renew',
    no: 7,
    stage: 'renewal',
    title: '不斷更新',
    en: 'Sharpen the Saw',
    icon: 'refresh',
    core: '持續照顧身體、心智、價值與人際關係，使個人成長能夠長期維持。',
    definition: [
      '不斷更新是投資在「能夠持續做事的自己」身上。柯維用磨鋸子比喻：一直鋸木頭卻不停下來磨利鋸子，效率只會越來越低。',
      '這裡把更新分成四個面向：身體、心智、價值與意義（可依個人信仰或非宗教價值觀設定）、社會情緒。四個面向不需要相同權重，可以依目前的人生階段調整。',
    ],
    situations: [
      { label: '身體', text: '連續加班一個月後，睡眠與運動都中斷。先恢復固定的就寢時間，往往比增加更多計畫更有幫助。' },
      { label: '心智', text: '每天讀 10 頁書或學一個新概念，讓思考保持彈性。' },
      { label: '人際', text: '每週和一位重要的人好好吃一頓飯，關係也需要定期「更新」。' },
    ],
    misconceptions: [
      { myth: '休息是浪費時間。', better: '恢復是持續表現的一部分；研究發現下班後能真正抽離與放鬆，與較好的身心狀態有關。' },
      { myth: '四個面向都要同時做到滿分。', better: '依人生階段調整重視程度，比追求全面完美更可持續。' },
      { myth: '靈性一定與宗教有關。', better: '這個面向可以是信仰，也可以是個人價值、意義感、感恩或靜心。' },
    ],
    neuro: {
      text: '這是七個習慣中與神經科學證據最直接相關的部分：規律運動與認知功能、大腦健康有關；睡眠參與記憶鞏固與情緒調節；社會連結與身心健康密切相關。',
      caution: '多數研究呈現的是平均關聯，個人效果因健康狀況與生活條件而異；本站紀錄不是醫療建議。',
    },
    concepts: [
      { term: '不斷更新 Sharpen the Saw', text: '定期照顧身體、心智、精神與社會情緒四個面向。', source: 'covey' },
      { term: '運動與認知功能', text: '規律有氧運動與認知功能、大腦健康有關。', source: 'neuro' },
      { term: '睡眠與記憶', text: '睡眠參與記憶鞏固與情緒調節。', source: 'neuro' },
      { term: '恢復經驗 Recovery Experiences', text: '心理抽離、放鬆、精熟與控制感，與下班後的恢復有關。', source: 'psych' },
      { term: '感恩練習', text: '記錄感恩的事，在部分研究中與較高的正向情緒有關。', source: 'psych' },
      { term: '四維成長儀表板', text: '自訂各面向權重與目標，每週自評、雷達圖、習慣追蹤與休息紀錄。', source: 'tool' },
    ],
    strategies: ['為四個面向各設定一個小目標，權重依自己決定。', '每週日花 10 分鐘做一次四維自評與反思。', '把休息與恢復也記錄下來，它們同樣是進步的一部分。', '狀態不好時，優先照顧睡眠與身體。'],
    toolTitle: '四維成長儀表板',
    toolDesc: '設定四個面向的重視程度與行動目標，每週自評並以雷達圖檢視；追蹤習慣、記錄休息與恢復、撰寫每週反思並調整目標。',
    reflections: ['哪一個面向最近最需要被照顧？', '什麼樣的休息，真正讓我恢復？', '在目前的人生階段，我最想優先投資哪個面向？'],
    selfCheck: [
      { id: 'r1', text: '我有固定照顧身體的習慣（睡眠、運動或飲食）。' },
      { id: 'r2', text: '我會安排時間學習或思考新的事物。' },
      { id: 'r3', text: '我會刻意安排休息與恢復，而不是等到撐不住。' },
    ],
    links: {
      affirmationIds: [1, 2, 3, 4, 5, 6, 7],
      patternIds: ['solitude', 'convenience', 'shortterm'],
      chapterIds: ['ch7', 'ch1'],
      labTools: [{ label: '睡眠與記憶鞏固', to: '/lab/sleep' }, { label: '安靜五分鐘', to: '/pattern/solitude#tool' }, { label: '生理性嘆息', to: '/lab/sigh' }],
    },
    quiz: [
      { id: 'q1', question: '「不斷更新」的四個面向是？', options: ['工作、金錢、名聲、權力', '身體、心智、價值與意義、社會情緒', '早上、中午、晚上、週末', '學習、考試、升學、就業'], answer: 1, explanation: '本站依柯維框架，整理為身體、心智、價值與意義、社會情緒四個面向。' },
      { id: 'q2', question: '關於四個面向的權重，本站的建議是？', options: ['必須完全相同', '依目前人生階段自行調整', '只需要照顧身體', '由系統自動決定'], answer: 1, explanation: '不強制相同權重，依個人階段調整較可持續。' },
      { id: 'q3', question: '下列哪一項在研究中與恢復較有關？', options: ['下班後仍持續處理工作訊息', '下班後的心理抽離與放鬆', '減少睡眠時間', '完全不運動'], answer: 1, explanation: 'Sonnentag 與 Fritz（2007）描述了心理抽離與放鬆等恢復經驗。' },
    ],
    apply: '用 1–10 分為自己這週的四個面向打分，找出最需要照顧的一個。',
    quickAction: '記錄一次今天的休息或恢復活動。',
    finalReflection: '這週，我可以為哪一個面向做一件小小的照顧？',
    extension: { label: '睡眠紀錄與趨勢', to: '/lab/sleep', desc: '觀察作息與狀態的關係。' },
    experiment: '在「四維成長儀表板」設定權重與目標，完成一次每週自評，並記錄一次休息。',
    referenceIds: ['covey1989', 'hillman2008', 'walker2006', 'sonnentag2007', 'emmons2003', 'holtlunstad2010'],
  },
];

export const h7Map = Object.fromEntries(h7Habits.map((h) => [h.id, h])) as Record<H7Id, H7Habit>;

export const selfCheckScale = ['很少如此', '偶爾如此', '有時如此', '經常如此', '幾乎總是如此'];

/* ========== 跨模組推薦規則（公開、可檢視） ========== */

/**
 * Break the Pattern 習慣 → 推薦的 7 Habits 章節與 Rewire 練習。
 * 規則刻意寫成簡單的對照表，並在頁面上完整列出，讓使用者知道推薦的依據。
 */
export const recommendationRules: { patternId: PatternHabitId; habits: H7Id[]; practices: { label: string; to: string }[]; reason: string }[] = [
  { patternId: 'approval', habits: ['proactive', 'winwin'], practices: [{ label: '自我接納練習：「我已經足夠好了」', to: '/daily' }, { label: '認可依賴覺察器', to: '/pattern/approval#tool' }], reason: '把焦點拉回自己能選擇的事，並在關係中同時照顧自己與他人的需求。' },
  { patternId: 'convenience', habits: ['first', 'renew'], practices: [{ label: '舒適圈探索地圖', to: '/pattern/convenience#tool' }, { label: '微小行動', to: '/lab/steps' }], reason: '為重要但需要投入的事保留時間，並以循序漸進的方式練習。' },
  { patternId: 'impress', habits: ['end', 'first'], practices: [{ label: '消費動機檢視器', to: '/pattern/impress#tool' }, { label: '人生羅盤：財務領域', to: '/habits7/end#tool' }], reason: '回到自己的價值與長期目標，讓消費與願景一致。' },
  { patternId: 'solitude', habits: ['end', 'renew'], practices: [{ label: '安靜五分鐘', to: '/pattern/solitude#tool' }, { label: '情緒命名', to: '/lab/labeling' }], reason: '安靜與反思的時間，是釐清方向與自我更新的基礎。' },
  { patternId: 'promises', habits: ['first'], practices: [{ label: 'If-Then 行動計畫', to: '/lab/if-then' }, { label: '微承諾追蹤器', to: '/pattern/promises#tool' }], reason: '用具體時段與小承諾，讓重要的事真正發生。' },
  { patternId: 'environment', habits: ['understand', 'synergize', 'winwin'], practices: [{ label: '成長環境盤點', to: '/pattern/environment#tool' }, { label: '口袋句', to: '/lab/pocket' }], reason: '練習理解、表達界線與合作，逐步建立更支持的關係。' },
  { patternId: 'shortterm', habits: ['end', 'first', 'renew'], practices: [{ label: '短期與長期選擇模擬器', to: '/pattern/shortterm#tool' }, { label: '四象限優先矩陣', to: '/habits7/first#tool' }], reason: '把長期願景放進當下的選擇，並為休息與享受保留位置。' },
];

/** 依使用者的焦點習慣產生推薦（去除重複，保留來源規則） */
export function recommendFor(patternIds: PatternHabitId[]) {
  const rules = recommendationRules.filter((r) => patternIds.includes(r.patternId));
  const habits = [...new Set(rules.flatMap((r) => r.habits))];
  return { rules, habits };
}

/* ========== 21 天七習慣探索計畫 ========== */

export const PLAN_NOTE = '21 天是課程設計的長度，用來依序探索七個習慣，並不代表完成後就能養成永久的習慣。習慣形成所需的時間因人與行為而異（見第 6 章）。';

export interface PlanDay {
  day: number;
  habitId: H7Id;
  phase: 'understand' | 'experiment' | 'reflect';
  title: string;
  task: string;
  reflection: string;
}

/** 每個習慣三天：理解概念 → 行動實驗 → 反思調整 */
export const planDays: PlanDay[] = h7Habits.flatMap((h, i) => [
  { day: i * 3 + 1, habitId: h.id, phase: 'understand' as const, title: `理解概念：${h.title}`, task: `閱讀「${h.title}」章節的定義、情境與常見誤區，並完成章節測驗。`, reflection: h.reflections[0] },
  { day: i * 3 + 2, habitId: h.id, phase: 'experiment' as const, title: `行動實驗：${h.toolTitle}`, task: h.experiment, reflection: h.reflections[1] },
  { day: i * 3 + 3, habitId: h.id, phase: 'reflect' as const, title: `反思並調整：${h.title}`, task: `完成「${h.title}」的自我評估，回顧行動實驗的結果，寫下一個想調整的策略。`, reflection: h.finalReflection },
]);

export const PHASE_LABEL: Record<PlanDay['phase'], string> = { understand: '理解概念', experiment: '行動實驗', reflect: '反思調整' };

/* ========== 工具用靜態內容 ========== */

/** 人生羅盤的八個生活領域 */
export const compassAreas = [
  { id: 'health', label: '健康' },
  { id: 'career', label: '職涯' },
  { id: 'learning', label: '學習' },
  { id: 'relationships', label: '人際關係' },
  { id: 'family', label: '家庭' },
  { id: 'finance', label: '財務' },
  { id: 'experience', label: '生活體驗' },
  { id: 'values', label: '個人價值與信念' },
];
export const compassQuestions: { key: 'values' | 'why' | 'oneYear' | 'adjust' | 'next'; q: string }[] = [
  { key: 'values', q: '1. 我重視什麼？' },
  { key: 'why', q: '2. 為什麼重要？' },
  { key: 'oneYear', q: '3. 我希望一年後有什麼改變？' },
  { key: 'adjust', q: '4. 目前最需要調整的是什麼？' },
  { key: 'next', q: '5. 下一個可以執行的小行動' },
];

export const quadrants = [
  { q: 1 as const, title: '第一象限', desc: '重要且緊急', tone: 'bg-apricot/30' },
  { q: 2 as const, title: '第二象限', desc: '重要但不緊急', tone: 'bg-sage/30' },
  { q: 3 as const, title: '第三象限', desc: '緊急但較不重要', tone: 'bg-soft' },
  { q: 4 as const, title: '第四象限', desc: '較不重要且不緊急', tone: 'bg-surface' },
];
export const Q2_EXAMPLES = ['運動', '學習新技能', '人際經營', '職涯探索', '健康檢查', '長期財務規劃'];

/** 同理溝通模擬器：情境、回應選項與五個面向分析 */
export const EMPATHY_DIMS = ['先理解情境', '確認對方感受', '沒有過早提供建議', '表達自己的觀點', '尊重彼此界線'] as const;
export const empathyScenarios: {
  id: string;
  title: string;
  prompt: string;
  options: { text: string; scores: [boolean, boolean, boolean, boolean, boolean]; note: string }[];
}[] = [
  {
    id: 'friend',
    title: '朋友分享工作壓力',
    prompt: '朋友說：「這個月每天都加班到很晚，主管又一直改需求，我真的快撐不住了。」',
    options: [
      { text: '「那你就直接跟主管說不要改了啊，或是乾脆換工作。」', scores: [false, false, false, true, true], note: '直接給建議很常見，也出於好意；但對方可能還沒感到被理解，建議容易被聽成否定。' },
      { text: '「聽起來這個月真的很累，又一直被改需求，一定很挫折。你最難受的是哪個部分？」', scores: [true, true, true, false, true], note: '先反映感受並詢問，讓對方感到被聽見。之後若對方想聽，再分享你的想法。' },
      { text: '「大家都很累啦，我上個月也加班加到半夜。」', scores: [false, false, true, true, true], note: '分享自己的經驗有時能拉近距離，但太快轉到自己身上，可能讓對方覺得沒被聽見。' },
      { text: '「聽起來你真的很辛苦。我想陪你聊聊；如果你需要，我也可以分享我之前處理需求變更的方法。」', scores: [true, true, true, true, true], note: '先理解與確認感受，再徵詢對方意願後表達自己的觀點，兼顧雙方。' },
    ],
  },
  {
    id: 'colleague',
    title: '同事質疑專案方案',
    prompt: '會議中同事說：「我覺得這個方案根本行不通，時程太趕了。」',
    options: [
      { text: '「這個方案我們已經討論很久了，現在才說不行嗎？」', scores: [false, false, true, true, false], note: '有防衛是自然的，但可能讓討論變成立場之爭。' },
      { text: '「我想確認一下，你最在意的是哪個部分？是時程、人力，還是某個技術風險？」', scores: [true, true, true, false, true], note: '先釐清對方的具體擔心，讓討論聚焦在問題本身。' },
      { text: '「謝謝你提出來。我想先了解你擔心時程的原因，之後我也想說明我們當初的考量，再一起看看怎麼調整。」', scores: [true, true, true, true, true], note: '同時表達理解的意願與自己的觀點，並邀請合作。' },
      { text: '「好啦，那就照你的意思改。」', scores: [false, false, true, false, false], note: '為了避免衝突而立刻讓步，可能錯過了解真正問題的機會，也忽略了自己的觀點。' },
    ],
  },
  {
    id: 'team',
    title: '團隊成員對工作分配有不同意見',
    prompt: '團隊成員私下跟你說：「為什麼這次又是我負責最麻煩的部分？」',
    options: [
      { text: '「因為你最有經驗啊，大家都相信你。」', scores: [false, false, false, true, true], note: '雖然是稱讚，但可能沒有回應對方覺得不公平的感受。' },
      { text: '「聽起來你覺得這次的分配不太公平，也很累。可以多說一點嗎？」', scores: [true, true, true, false, true], note: '先承認感受並邀請對方說明，是很好的開始。' },
      { text: '「謝謝你直接告訴我。我想先聽聽你覺得哪裡不合理；我也會說明這次分配的考量，然後我們一起看能怎麼調整。」', scores: [true, true, true, true, true], note: '理解、表達與共同調整兼具，也尊重了雙方。' },
      { text: '「每個人都有麻煩的部分，你就先做吧。」', scores: [false, false, true, true, false], note: '可能讓對方感到被忽視，影響之後提出意見的意願。' },
    ],
  },
];
export const empathyPhrases = [
  '聽起來這件事讓你感到很有壓力。',
  '我想確認一下，你最在意的是哪個部分？',
  '謝謝你分享，我也想談談我的想法。',
  '你現在比較需要我聽你說，還是一起想辦法？',
  '如果我理解得沒錯，你的意思是……對嗎？',
  '我可能沒辦法完全體會，但我想多了解一點。',
];

/** 團隊合作思考板的八個區塊 */
export const boardZones = [
  { id: 'problem' as const, title: '1. 問題定義' },
  { id: 'goal' as const, title: '2. 共同目標' },
  { id: 'stakeholders' as const, title: '3. 利害關係人' },
  { id: 'views' as const, title: '4. 不同觀點' },
  { id: 'resources' as const, title: '5. 團隊能力與資源' },
  { id: 'conflicts' as const, title: '6. 潛在衝突' },
  { id: 'solutions' as const, title: '7. 解決方案' },
  { id: 'next' as const, title: '8. 下一步行動' },
];

/** 四維成長面向 */
export const renewDims: { id: RenewDim; label: string; items: string[] }[] = [
  { id: 'physical', label: '身體', items: ['睡眠', '運動', '飲食', '休息', '健康照護'] },
  { id: 'mental', label: '心智', items: ['閱讀', '學習', '思考', '問題解決', '創造力'] },
  { id: 'spiritual', label: '價值與意義', items: ['個人價值觀', '生命意義', '信仰或哲學思考', '感恩', '靜心與反思'] },
  { id: 'social', label: '社會情緒', items: ['家庭與友誼', '社交連結', '情緒調節', '關係界線', '社會參與'] },
];
export const restKinds = ['睡眠補眠', '散步', '與人相處', '興趣嗜好', '靜心', '什麼都不做', '其他'];
