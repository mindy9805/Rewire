/**
 * Break the Pattern｜打破慣性：7 個在不知不覺中消耗你的習慣
 *
 * 撰寫原則：
 * - 以中性、不羞辱、不恐嚇的語言描述行為；避免「一定會」「毀掉」等過度簡化的因果說法。
 * - 每個習慣都說明「健康行為與過度行為的界線」，並承認休息、娛樂、便利與人際支持的正面功能。
 * - 「自律」定義為：能夠根據自身價值與目標，持續做出適當選擇的能力。
 * - 研究證據只引用 references.ts 中可查證的文獻，並註明適用限制。
 *
 * 習慣 id 沿用先前「削弱習慣檢視」版本，舊的行動紀錄（counterChoices）可直接相容。
 */
import type { ChapterId, PatternHabitId } from '../types';

export const PATTERN_TITLE = '7 個在不知不覺中消耗你的習慣';
export const PATTERN_MODULE = 'Break the Pattern｜打破慣性';
export const PATTERN_SUBTITLE = '看見日常中的自動反應，重新選擇更符合長期價值的生活方式。';

export const PATTERN_CORE = [
  '每天重複的微小選擇，會逐漸塑造我們的習慣、能力與生活方式。',
  '當我們開始覺察自己的行為模式，就有機會透過小幅調整，培養更穩定的自律、信心、健康與自主性。',
];

/** 本模組對「自律」的定義 */
export const DISCIPLINE_DEFINITION = '自律，是能夠根據自身價值與目標，持續做出適當選擇的能力。它不是壓抑所有享受，也不是永遠選擇最辛苦的路。';

/** 休息、娛樂、便利與人際支持的正面功能 */
export const POSITIVE_FUNCTIONS = [
  { title: '休息', text: '恢復體力與注意力，讓之後的努力更可持續。' },
  { title: '娛樂', text: '帶來快樂、放鬆與創意，本身就是生活品質的一部分。' },
  { title: '便利', text: '節省時間與心力，讓資源留給真正重要的事。' },
  { title: '人際支持', text: '在低潮時提供陪伴與力量，是改變最重要的資源之一。' },
];

/** 模組結尾的六句話 */
export const PATTERN_CLOSING = [
  '每個微小的選擇，都在塑造未來的自己。',
  '練習自律，也練習理解自己的需要。',
  '選擇進步，也允許自己休息。',
  '選擇自主，減少被外在評價主導。',
  '選擇長期自由，同時珍惜當下的生活。',
  '改變可以從今天的一個小行動開始。',
];

/** 每個習慣對應的互動工具 */
export type PatternToolKind = 'validation' | 'comfort' | 'spending' | 'quiet' | 'commitment' | 'environment' | 'choice';

export interface PatternHabit {
  id: PatternHabitId;
  no: number;
  /** 首頁卡片用的短名稱 */
  short: string;
  title: string;
  concept: string;
  /** lucide 圖示名稱（由 UI 對應） */
  icon: 'users' | 'sofa' | 'shopping' | 'leaf' | 'handshake' | 'sprout' | 'hourglass';
  /** 首頁卡片：常見情境與反思提示 */
  cardScene: string;
  cardPrompt: string;
  definition: string;
  behaviors: string[];
  situations: string[];
  mechanisms: { term: string; text: string }[];
  impacts: string[];
  boundary: { healthy: string[]; excessive: string[]; note: string };
  neuro: string;
  alternatives: string[];
  reflections: string[];
  experiment: { title: string; duration: string; steps: string[] };
  evidence: { text: string; limits: string };
  referenceIds: string[];
  affirmationIds: number[];
  chapterIds: ChapterId[];
  tool: PatternToolKind;
  toolTitle: string;
  /** 14 天打破慣性挑戰：每日行動（標準版） */
  challengeActions: string[];
}

export const patternHabits: PatternHabit[] = [
  /* ---------------- Habit 01 ---------------- */
  {
    id: 'approval',
    no: 1,
    short: '過度尋求認可',
    title: '過度尋求他人認可',
    concept: 'External Validation',
    icon: 'users',
    cardScene: '發文後一直查看按讚數；想拒絕卻說不出口。',
    cardPrompt: '如果沒有人知道，我還會這樣選嗎？',
    definition: '外在評價（他人的喜歡、稱讚或回應）在決策與自我評價中占了過高比重，以至於經常改變自己的想法、目標或界線來換取認同。',
    behaviors: ['過度在意他人評價。', '為了獲得認同，反覆改變自己的觀點。', '害怕拒絕別人的要求。', '將自己的價值與他人的喜歡程度綁定。', '經常透過社群按讚或他人的回應確認自我價值。'],
    situations: [
      '會議中原本有不同意見，看到主管皺眉就立刻改口附和。',
      '同事臨時請你幫忙，你其實已經很累，還是說「好啊沒問題」。',
      '貼文發出後每隔幾分鐘就查看回應，回應少時整天心情低落。',
    ],
    mechanisms: [
      { term: '自我決定理論 Self-Determination Theory', text: '人有自主、勝任與關係三種基本心理需求。當行為主要為了外在認可而做，自主感可能下降，動機也較不穩定。' },
      { term: '自我價值依附 Contingencies of Self-Worth', text: '若自我價值主要建立在他人認可上，情緒會隨外界回應大幅起伏。' },
      { term: '社會比較 Social Comparison', text: '人們會透過與他人比較來評估自己；社群媒體讓比較更頻繁、也更常是與「精選版本」比較。' },
      { term: '討好型行為 People-Pleasing', text: '為避免衝突或被拒絕而優先滿足他人，短期降低焦慮，長期可能忽略自己的需要。' },
      { term: '自我認同與心理自主性', text: '能依自己的價值做選擇，並為選擇負責，是穩定自我認同的重要基礎。' },
    ],
    impacts: ['決策變得猶豫，常需要別人確認才能行動。', '界線模糊，承接過多責任而感到疲憊。', '自我感覺隨外在回應起伏，較難建立穩定的自信。'],
    boundary: {
      healthy: ['主動尋求回饋以改進工作。', '在乎重要他人的感受。', '享受被欣賞的時刻。'],
      excessive: ['沒有他人認可就無法做決定。', '經常違背自己的價值去迎合他人。', '一次負面回應就否定整個自己。'],
      note: '尋求回饋、人際連結及被認可都是正常需求。需要觀察的是：外在評價是否過度主導個人決策。',
    },
    neuro: '每一次「先問自己想要什麼，再考慮別人」的練習，都是在強化一條新的決策路徑。重複多次後，參考自己的價值會變得比較自然、不那麼費力（第 1 章：重複讓行為更流暢）。',
    alternatives: ['做決定前先寫下「我真正想要的是什麼」。', '用口袋句爭取思考時間：「我想一下，明天回覆你。」', '每週列出三個與他人評價無關的自我價值來源。', '練習用「我」開頭表達一個小意見。'],
    reflections: ['最近一次改變決定，是因為我的價值，還是擔心別人的看法？', '在哪些人面前，我比較能做自己？', '我希望自己的價值建立在哪些事情上？'],
    experiment: { title: '一天一個「我的決定」', duration: '7 天', steps: ['每天選一件小事（午餐、穿著、休息方式），完全依自己的偏好決定。', '記錄做決定時的感受與擔心。', '第 7 天回顧：擔心的事情實際發生了幾次？'] },
    evidence: {
      text: '自我決定理論與自我價值依附研究指出，以外在認可為主要動機或價值來源，與較不穩定的情緒和動機有關。喜歡程度落差研究也發現，我們常低估別人對自己的好感。',
      limits: '多數研究為西方大學生樣本與相關性設計；在重視和諧與關係的文化中，考慮他人看法可能有不同的意義與功能。',
    },
    referenceIds: ['ryan2000', 'crocker2001', 'festinger1954', 'boothby2018'],
    affirmationIds: [3, 6],
    chapterIds: ['ch3', 'ch2'],
    tool: 'validation',
    toolTitle: '認可依賴覺察器',
    challengeActions: [
      '觀察今天有幾次因為「擔心別人怎麼想」而改變做法，只記錄、不批評。',
      '寫下讓你最在意他人評價的一個情境（人物、地點、時間）。',
      '辨識在意評價時的身體感受與情緒，並為它命名。',
      '列出三個與他人評價無關的自我價值來源。',
      '用認可依賴覺察器分析一個近期決定。',
      '練習一句爭取時間的口袋句，今天至少使用一次。',
      '回顧本週：哪個情境最常觸發「需要被認可」？',
      '做一個完全依自己偏好的小決定，並記錄感受。',
      '對一個不合理的小請求，溫和地說「這次不行」。',
      '在安全的場合，用「我」開頭表達一個小意見。',
      '減少一次查看社群回應的次數，注意到想查看時的感受。',
      '寫一份 If-Then 計畫：「如果我想立刻答應，我就先說我確認一下」。',
      '練習用好朋友的語氣肯定自己今天做到的一件事。',
      '總結 14 天：哪些決定更像「我」？下一步想練習什麼？',
    ],
  },

  /* ---------------- Habit 02 ---------------- */
  {
    id: 'convenience',
    no: 2,
    short: '過度依賴便利',
    title: '過度依賴便利與舒適',
    concept: 'Comfort Seeking',
    icon: 'sofa',
    cardScene: '一遇到卡關就先放下；總是選最省力的方式。',
    cardPrompt: '這次的不舒服，是危險，還是成長的訊號？',
    definition: '習慣性地避開所有費力或不舒服的經驗，即使那些經驗是安全的、而且對自己的目標有幫助。',
    behaviors: ['一遇到困難就立即放棄。', '習慣選擇最省力的方式。', '害怕任何不舒服的感受。', '長期迴避需要投入時間的學習。', '對延遲回饋的事情缺乏耐心。'],
    situations: [
      '想學一個新軟體，看了五分鐘教學覺得難，就關掉不再打開。',
      '運動時稍微喘就停下，之後乾脆不去了。',
      '遇到需要思考的工作，先處理一堆簡單瑣事。',
    ],
    mechanisms: [
      { term: '逃避學習 Avoidance Learning', text: '逃避讓不舒服立即下降，這個「解脫感」會強化逃避行為，使下一次更容易逃避。' },
      { term: '不適耐受度 Distress Tolerance', text: '承受與經歷不舒服情緒或感受的能力；可以透過練習逐步提升。' },
      { term: '漸進式接觸 Exposure', text: '以安全、循序漸進的方式接觸原本迴避的情境，讓大腦學習「這可以承受」。' },
      { term: '努力與決策 Effort-Based Decision Making', text: '大腦會權衡努力成本與預期回報，人們通常傾向避開較費力的選項，除非回報足夠明確。' },
    ],
    impacts: ['新技能較難累積，學習停在入門階段。', '面對變動時的信心較低。', '容易把「不舒服」等同於「做不到」。'],
    boundary: {
      healthy: ['使用工具節省時間。', '疲累時好好休息。', '在資源有限時選擇較省力的方式。'],
      excessive: ['只要不舒服就放棄，即使事情安全且重要。', '長期迴避所有需要練習的事。', '因為怕難而不敢開始任何新事物。'],
      note: '便利工具能節省時間與精力，合理休息也有助於恢復。練習面對困難應採循序漸進的方式，並考慮健康、資源與個人能力。',
    },
    neuro: '漸進式地接觸「有點難但安全」的事，讓大腦有機會學到新的預期：不舒服會過去、我能應付。每一次成功的小挑戰，都在累積新的經驗（第 1、6 章）。',
    alternatives: ['把任務拆成「容易開始／稍有挑戰／需要更多準備」三階段。', '設定 10 分鐘「先試試看」時段，時間到可以停。', '卡關時先命名感受：「我現在是挫折，不是不行。」', '完成後記下一個學到的小東西。'],
    reflections: ['我最常在什麼情境下選擇放棄？', '哪些「不舒服」其實是成長的訊號？', '什麼樣的挑戰對我來說是安全且可行的？'],
    experiment: { title: '每天一個「小小的難」', duration: '7 天', steps: ['每天選一件稍有挑戰、安全可行的小事（例如走樓梯、學一個新功能）。', '做之前評估難度 1–10，做完後再評一次。', '觀察：實際難度和預期差多少？'] },
    evidence: {
      text: '努力決策研究發現，人們在其他條件相同時傾向避開費力選項；習得勤勉理論指出，努力若能與回報連結，人們會更願意投入。暴露療法研究支持以循序漸進的方式降低迴避。',
      limits: '暴露療法研究主要來自臨床焦慮族群；日常應用須以安全為前提。「便利讓人變弱」並無直接研究證據。',
    },
    referenceIds: ['kool2010', 'eisenberger1992', 'simons2005', 'craske2014'],
    affirmationIds: [2, 4],
    chapterIds: ['ch6', 'ch8'],
    tool: 'comfort',
    toolTitle: '舒適圈探索地圖',
    challengeActions: [
      '觀察今天有哪些時刻選擇了「最省力」的方式，只記錄、不評價。',
      '寫下一件你一直想做、但因為怕麻煩而逃避的事。',
      '辨識逃避時最常出現的感受（無聊、挫折、不安）。',
      '用舒適圈探索地圖，把那件事拆成三個階段。',
      '完成「容易開始」階段中的一步。',
      '設定 10 分鐘「先試試看」，時間到就可以停。',
      '回顧本週：哪一種不舒服其實比想像中容易承受？',
      '做一件小幅有挑戰、安全的事（例如走樓梯）。',
      '卡關時說出一句命名感受的話，再多試 2 分鐘。',
      '完成「稍有挑戰」階段中的一步。',
      '選一項便利服務，今天自己動手做一次（若時間與體力允許）。',
      '寫一份 If-Then：「如果我想放棄，我就再做 2 分鐘。」',
      '記錄這段期間學會的一件小技能。',
      '總結 14 天：哪些挑戰讓你更相信自己？下一階段想嘗試什麼？',
    ],
  },

  /* ---------------- Habit 03 ---------------- */
  {
    id: 'impress',
    no: 3,
    short: '為他人印象消費',
    title: '為了他人印象而過度消費',
    concept: 'Status Consumption',
    icon: 'shopping',
    cardScene: '看完別人的分享就想買同款；買完又擔心帳單。',
    cardPrompt: '這次購買，是為了我的需要，還是為了被看見？',
    definition: '消費決策主要受「別人會怎麼看我」驅動，而非實際需求或個人價值，並且超出預算或影響長期財務目標。',
    behaviors: ['為了展現成功購買超出預算的商品。', '因為比較心理而衝動購物。', '對社群展示的生活方式產生不必要的壓力。', '使用消費來暫時緩解自卑。', '購買後出現財務焦慮。'],
    situations: [
      '同學聚會前，覺得一定要買新衣服才不會「輸人」。',
      '看到網紅開箱，深夜下單一個其實用不太到的小家電。',
      '心情不好時逛購物網站，結帳後又後悔。',
    ],
    mechanisms: [
      { term: '社會比較 Social Comparison', text: '透過與他人比較來評估自己的生活，社群媒體讓比較對象變多、也更理想化。' },
      { term: '衝動購物 Impulse Buying', text: '突然、強烈的購買衝動，常伴隨情緒，較少經過深思熟慮。' },
      { term: '享樂適應 Hedonic Adaptation', text: '新事物帶來的快樂通常會隨時間回到原本水準，使人想再追求下一個新東西。' },
      { term: '延遲滿足 Delayed Gratification', text: '為了較大或長期的好處，選擇等待或放棄立即的滿足。' },
      { term: '自我價值與消費決策', text: '當擁有物被視為自我價值的證明，購物可能變成調節情緒或身份感的方式。' },
    ],
    impacts: ['財務壓力增加，可能影響儲蓄與未來選擇。', '購買後的短暫滿足常伴隨後悔或焦慮。', '持續比較，使「足夠」的標準不斷提高。'],
    boundary: {
      healthy: ['購買品質良好、會長期使用的物品。', '欣賞美感、適度犒賞自己。', '在預算內享受消費。'],
      excessive: ['經常超出預算只為了形象。', '用購物處理每一次低落情緒。', '購買後持續感到財務焦慮。'],
      note: '購買品質良好的物品、欣賞美感或適度犒賞自己，都可能符合個人價值。重點在於是否符合預算、實際需求及長期財務目標。',
    },
    neuro: '「想買 → 立刻下單」是一條經過強化的快速路徑。加入一段冷靜期，相當於在提示與行為之間放進停頓，讓評估長期目標的思考有機會參與（第 1 章：疲勞時更容易選擇立即回饋；第 7 章：停、察、選、行）。',
    alternatives: ['想買非必需品時，使用自訂冷靜期。', '計算「每次使用成本」：價格 ÷ 預估使用次數。', '先寫下購買的真正原因，區分需要與比較。', '情緒低落時，先用情緒命名或散步代替瀏覽購物網站。'],
    reflections: ['最近一次購買，背後的需求是什麼？', '如果沒有人會看到，我還會買嗎？', '我希望金錢幫我實現什麼樣的長期生活？'],
    experiment: { title: '48 小時冷靜期', duration: '14 天', steps: ['任何非必需品，先加入清單並設定 48 小時冷靜期。', '冷靜期結束時，再用消費動機檢視器評估一次。', '記錄：有多少東西在冷靜期後仍然想買？'] },
    evidence: {
      text: '後設分析顯示，物質主義價值觀與較低的個人幸福感有關；享樂適應研究指出，新事物帶來的快樂常隨時間減弱。衝動購物研究描述了購買衝動與情緒的關聯。',
      limits: '多為相關性研究，無法證明消費「造成」不快樂；個人財務狀況與文化背景差異很大，本工具不判定任何消費對錯。',
    },
    referenceIds: ['dittmar2014', 'brickman1978', 'rook1987', 'festinger1954'],
    affirmationIds: [3, 5],
    chapterIds: ['ch5', 'ch8'],
    tool: 'spending',
    toolTitle: '消費動機檢視器',
    challengeActions: [
      '觀察今天有幾次想買東西的念頭，以及當時在做什麼。',
      '回想最近一次購物，寫下當時的情緒與原因。',
      '辨識最容易觸發購物念頭的情境（滑社群、深夜、壓力大）。',
      '用消費動機檢視器分析一件想買的東西。',
      '為一件非必需品設定冷靜期。',
      '計算一件近期購買物品的「每次使用成本」。',
      '回顧本週：哪些購買念頭與比較或情緒有關？',
      '整理衣櫃或抽屜一角，看見已經擁有的東西。',
      '取消追蹤一個讓你持續想購物的帳號（若你願意）。',
      '情緒低落時，先試一個非消費的照顧自己方式。',
      '寫下三件不需要花錢、但讓你感到滿足的事。',
      '寫一份 If-Then：「如果我想立刻下單，我就先加入清單。」',
      '檢查冷靜期清單：哪些東西已經不想買了？',
      '總結 14 天：你的消費與價值觀更一致了嗎？下一步是什麼？',
    ],
  },

  /* ---------------- Habit 04 ---------------- */
  {
    id: 'solitude',
    no: 4,
    short: '缺少獨處思考',
    title: '缺少與自己獨處及思考的時間',
    concept: 'Constant Stimulation',
    icon: 'leaf',
    cardScene: '一有空檔就打開手機；同時聽、看好幾種內容。',
    cardPrompt: '我上一次只是安靜地想事情，是什麼時候？',
    definition: '幾乎所有空白時間都被外在資訊填滿，很少留給自己整理想法、感受與方向的時間。',
    behaviors: ['一有空就打開社群媒體。', '無法忍受短暫安靜。', '用大量資訊填滿所有空白。', '習慣同時觀看、聆聽多種內容。', '缺少整理想法與感受的機會。'],
    situations: [
      '排隊等咖啡的一分鐘，也會打開短影音。',
      '邊吃飯邊看影片，邊聽 Podcast 邊回訊息。',
      '睡前滑手機到很晚，躺下時腦中卻一團亂。',
    ],
    mechanisms: [
      { term: '注意力調節 Attention Regulation', text: '注意力是有限資源，頻繁切換會增加負擔，也讓深度思考較難發生。' },
      { term: '心智漫遊 Mind Wandering', text: '思緒自然離開當下任務的狀態；可能帶來創意與規劃，也可能伴隨反芻與不安。' },
      { term: '反思性思考 Reflective Thinking', text: '有意識地回顧經驗、整理意義，是學習與自我理解的重要歷程。' },
      { term: '認知負荷 Cognitive Load', text: '同時處理的資訊越多，可用於理解與整合的心智資源越少。' },
      { term: '後設認知 Metacognition', text: '「覺察自己在想什麼」的能力，讓我們能調整思考與行為。' },
    ],
    impacts: ['較少機會整理情緒，壓力容易累積。', '難以釐清自己真正想要的方向。', '注意力較分散，深度工作或學習較困難。'],
    boundary: {
      healthy: ['用音樂調節情緒、用 Podcast 學習。', '透過影片放鬆與娛樂。', '依自己的狀態安排安靜時間。'],
      excessive: ['幾乎無法容忍任何安靜片刻。', '用持續刺激迴避所有不舒服的念頭。', '長期沒有時間整理自己的想法。'],
      note: '音樂、影片與 Podcast 也能促進學習和情緒調節。安靜獨處並非越多越好，反思時間需依個人狀態與需求安排。',
    },
    neuro: '安靜時刻是練習後設認知的機會：注意到念頭、命名感受、選擇回應。這和第 7 章「刺激與反應之間的空間」是同一條練習路徑，重複後會越來越熟悉。',
    alternatives: ['通勤或排隊時，留幾分鐘不戴耳機。', '使用「安靜五分鐘」計時器。', '一次只做一件事：吃飯時只吃飯。', '睡前寫下今天的一個想法。'],
    reflections: ['安靜下來時，最常浮現什麼念頭？', '哪些內容真正幫助我，哪些只是填滿時間？', '我需要多少安靜時間，才會覺得剛剛好？'],
    experiment: { title: '每天 5 分鐘的空白', duration: '7 天', steps: ['每天選一個固定時間，進行 5 分鐘安靜練習。', '練習後寫下浮現的想法與感受。', '第 7 天比較：第一天與最後一天的感受有什麼不同？'] },
    evidence: {
      text: '實驗顯示許多人覺得短時間獨自思考並不容易；經驗取樣研究發現，人們有相當比例的時間處於心智漫遊狀態，且與當下情緒有關。認知負荷理論說明同時處理大量資訊會降低學習效率。',
      limits: '心智漫遊對情緒的影響因內容而異；「手機在旁就降低認知能力」的研究，後續重複驗證結果不一致，不宜過度推論。',
    },
    referenceIds: ['wilson2014', 'killingsworth2010', 'sweller1988', 'ward2017'],
    affirmationIds: [5, 1],
    chapterIds: ['ch7', 'ch2'],
    tool: 'quiet',
    toolTitle: '安靜五分鐘',
    challengeActions: [
      '觀察今天有幾次「一有空就拿起手機」，只記錄次數。',
      '寫下最常用來填滿空白的三種內容。',
      '注意空白時刻出現的感受（無聊、不安、放鬆）。',
      '完成一次「安靜五分鐘」練習。',
      '吃一餐時不看任何螢幕。',
      '通勤或散步時，留 10 分鐘不戴耳機。',
      '回顧本週：哪些空白時刻其實很需要被保留？',
      '做一次「安靜五分鐘」，並回答「我現在真正需要什麼？」',
      '關掉一個非必要的通知。',
      '睡前 10 分鐘不看手機，寫下今天的一個想法。',
      '一次只做一件事，持續 25 分鐘。',
      '寫一份 If-Then：「如果我排隊等待，我就先深呼吸三次。」',
      '整理這段期間浮現的想法，選一件值得行動的事。',
      '總結 14 天：你需要多少安靜時間？如何安排在生活中？',
    ],
  },

  /* ---------------- Habit 05 ---------------- */
  {
    id: 'promises',
    no: 5,
    short: '反覆違背承諾',
    title: '反覆違背對自己的承諾',
    concept: 'Self-Trust & Behavioral Consistency',
    icon: 'handshake',
    cardScene: '常說「明天再開始」；中斷一次就放棄整個計畫。',
    cardPrompt: '我的承諾，是否符合現在的現實條件？',
    definition: '經常對自己許下承諾卻沒有執行，或設定超出當下能力與資源的目標，逐漸削弱「我說到做得到」的自我信任。',
    behaviors: ['不斷延後計畫。', '設定超出能力的目標。', '常說明天再開始。', '因一次中斷而放棄整個計畫。', '因未完成目標而過度責備自己。'],
    situations: [
      '新年立志每天運動一小時，第三天加班就整個放棄。',
      '說好今晚開始讀書，結果又說「明天再好好開始」。',
      '計畫沒做到，整晚都在責怪自己沒用。',
    ],
    mechanisms: [
      { term: '自我效能 Self-Efficacy', text: '相信自己能完成特定行動的信念；成功經驗是提升自我效能最重要的來源。' },
      { term: '執行意圖 Implementation Intentions', text: '用「如果……就……」連結情境與行動，提高承諾被實際執行的機會。' },
      { term: '習慣形成 Habit Formation', text: '在穩定情境中重複行為，自動化程度會逐漸提高；偶爾中斷影響有限。' },
      { term: '目標設定 Goal Setting', text: '具體且具挑戰性的目標通常有助表現，但需要搭配能力、資源與回饋。' },
      { term: '自我調節 Self-Regulation', text: '監控、調整自己行為以朝向目標的能力，會受到壓力、疲勞與環境影響。' },
    ],
    impacts: ['「我做不到」的信念逐漸累積。', '越來越不敢設定目標。', '自責循環讓重新開始更困難。'],
    boundary: {
      healthy: ['根據新資訊調整承諾。', '生病或忙碌時降低標準。', '中斷後重新開始。'],
      excessive: ['反覆設定明知做不到的目標。', '習慣性地無限延後。', '每次中斷都全面否定自己。'],
      note: '適當修改承諾，是具備彈性與良好判斷的表現。承諾應符合現實條件，並允許中斷後重新調整。',
    },
    neuro: '小到幾乎不會失敗的「微承諾」，讓「說到做到」的經驗開始重複累積。這些成功經驗會提升自我效能，就像第 1 章的小徑：每走一次，路就更清楚一點。',
    alternatives: ['把承諾縮小到 2 分鐘版本。', '為每個承諾寫下具體情境與備用方案。', '中斷時記錄原因，而不是責備自己。', '每七天回顧一次，必要時降低難度。'],
    reflections: ['最近一次沒做到的承諾，原因是什麼？', '我的目標是否符合現在的時間、體力與資源？', '如果把承諾縮小一半，我做得到嗎？'],
    experiment: { title: '一週微承諾', duration: '7 天', steps: ['設定一個 2 分鐘內可完成的微承諾與具體情境。', '每天勾選完成或記錄中斷原因。', '第 7 天回顧完成率，決定維持、增加或降低難度。'] },
    evidence: {
      text: '自我效能理論指出成功經驗是建立信心的關鍵；執行意圖後設分析顯示 If-Then 計畫有助於目標達成；Lally 等人發現偶爾漏掉一天影響不大。「虛假希望症候群」研究則提醒，過高的期待容易導致反覆失敗與放棄。',
      limits: '多數研究為短期或特定行為；個人承諾的達成也受健康、經濟與照顧責任等外在條件影響。',
    },
    referenceIds: ['bandura1977', 'gollwitzer2006', 'lally2010', 'polivy2002', 'locke2002'],
    affirmationIds: [7, 4],
    chapterIds: ['ch6', 'ch8'],
    tool: 'commitment',
    toolTitle: '微承諾追蹤器',
    challengeActions: [
      '觀察今天有哪些「之後再說」，只記錄、不批評。',
      '回想一個常延後的計畫，寫下通常在哪個時刻放棄。',
      '辨識延後時的感受（疲累、不確定、怕做不好）。',
      '在微承諾追蹤器建立第一個微承諾（2 分鐘版本）。',
      '完成今天的微承諾，並勾選。',
      '為微承諾寫下一個備用方案。',
      '回顧本週：完成率如何？需要調整難度嗎？',
      '若有中斷，記錄原因，並用備用方案重新開始。',
      '寫一份 If-Then：「如果早餐吃完，我就讀兩頁書。」',
      '練習對自己說：「今天做到一點點，也算數。」',
      '檢查目標是否符合現實條件，必要時縮小。',
      '連續完成後，考慮是否增加一點點難度。',
      '寫下這段期間「說到做到」的三個時刻。',
      '總結 14 天：你對自己的信任有什麼變化？下一個微承諾是什麼？',
    ],
  },

  /* ---------------- Habit 06 ---------------- */
  {
    id: 'environment',
    no: 6,
    short: '缺乏支持性環境',
    title: '長期處於不利於成長的環境',
    concept: 'Social Environment & Behavioral Influence',
    icon: 'sprout',
    cardScene: '想改變時常被潑冷水；互動後總是覺得很累。',
    cardPrompt: '在哪些關係裡，我能自在地做自己？',
    definition: '長期身處缺乏支持、經常否定改變，或帶來持續壓力的人際或環境脈絡中，使個人的目標與作息不斷被拉扯。',
    behaviors: ['周圍的人習慣持續抱怨而缺少行動。', '所處環境經常否定學習與改變。', '缺乏互相支持與建設性回饋。', '容易被群體行為影響作息與目標。', '經常承受不合理的人際壓力。'],
    situations: [
      '每次提到想進修，朋友就說「那個沒用啦」。',
      '團隊下班後總是熬夜聚餐，你很難維持睡眠計畫。',
      '和某些人相處後，總是覺得自己不夠好。',
    ],
    mechanisms: [
      { term: '社會學習 Social Learning', text: '人們會透過觀察他人的行為與結果來學習。' },
      { term: '社會規範 Social Norms', text: '群體中「大家通常怎麼做」與「大家覺得應該怎麼做」會影響個人行為。' },
      { term: '同儕影響 Peer Influence', text: '身邊的人的習慣與態度，會影響我們的選擇與標準。' },
      { term: '環境設計 Environmental Design', text: '調整環境中的提示與阻力，讓想要的行為更容易發生。' },
      { term: '支持性關係 Supportive Relationships', text: '支持性的社會關係與身心健康密切相關，是改變的重要資源。' },
    ],
    impacts: ['改變的念頭容易被消磨。', '作息與目標受群體節奏影響。', '自我評價可能下降，感到孤立。'],
    boundary: {
      healthy: ['陪伴正在低潮的朋友。', '與不同觀點的人交流。', '在關係中互相調整。'],
      excessive: ['長期承受不合理的壓力而沒有界線。', '在關係中幾乎無法表達自己。', '完全沒有能支持自己的人或資源。'],
      note: '人際關係的價值不能單憑成就、收入或效率衡量。每個人都有低潮與需要支持的時候。本章引導你觀察互動模式、建立界線與尋找支持資源，而不是把人分類成高價值或低價值。',
    },
    neuro: '環境中的提示會一再觸發相同的行為與情緒反應。增加支持性的互動、調整環境提示，等於為新的行為提供更多重複的機會（第 8 章：環境設計）。',
    alternatives: ['觀察互動模式：哪些時刻讓你感到被支持或被消耗？', '使用口袋句練習表達界線。', '尋找一個學習或興趣社群。', '主動成為支持別人的人：分享一個有用的資源。'],
    reflections: ['在哪些關係裡，我能自在地表達想法？', '有哪些界線是我需要溫和說出口的？', '我可以從哪裡找到更多支持？'],
    experiment: { title: '一週互動觀察', duration: '7 天', steps: ['每天記錄一次讓你感到被支持、以及一次感到壓力的互動。', '觀察這些互動的共同點（人物、場合、話題）。', '選一個小行動：表達一個界線，或聯絡一位支持你的人。'] },
    evidence: {
      text: '社會學習與社會規範研究說明他人的行為會影響我們的選擇；後設分析顯示社會關係與健康結果密切相關。社會網絡研究觀察到行為在朋友間有群聚現象。',
      limits: '社會「傳染」研究多為觀察性資料，難以排除相似者互相吸引與共享環境的影響；環境是影響因素之一，而非決定因素。',
    },
    referenceIds: ['bandura1977b', 'cialdini1990', 'holtlunstad2010', 'christakis2007', 'cohencole2008'],
    affirmationIds: [6, 3],
    chapterIds: ['ch8', 'ch9'],
    tool: 'environment',
    toolTitle: '成長環境盤點',
    challengeActions: [
      '觀察今天的互動中，哪些讓你感到被支持、哪些帶來壓力。',
      '寫下一個你最常身處的環境（家庭、工作、朋友圈）。',
      '辨識某些互動後的身體感受與情緒。',
      '用成長環境盤點評估一個環境或關係。',
      '找出一個你在關係中想溫和表達的界線。',
      '練習一句表達需求的口袋句。',
      '回顧本週：哪些互動模式最常出現？',
      '聯絡一位讓你感到被支持的人。',
      '在一次對話中，把抱怨的話題轉向「我們可以做什麼？」',
      '調整一個環境提示（例如讀書地點、手機擺放）。',
      '尋找一個學習、運動或興趣社群的資訊。',
      '寫一份 If-Then：「如果有人否定我的計畫，我就說謝謝你的意見，我想試試看。」',
      '主動分享一個有用的資源給別人。',
      '總結 14 天：你想如何經營一個更支持成長的環境？',
    ],
  },

  /* ---------------- Habit 07 ---------------- */
  {
    id: 'shortterm',
    no: 7,
    short: '過度偏向立即滿足',
    title: '長期偏向立即滿足',
    concept: 'Immediate Gratification',
    icon: 'hourglass',
    cardScene: '明明想睡卻繼續看下一集；重要的事一延再延。',
    cardPrompt: '現在的選擇，和我想要的長期生活一致嗎？',
    definition: '在當下的愉悅與長期目標之間，經常、習慣性地選擇立即的獎勵，即使事後覺得那不是自己真正想要的選擇。',
    behaviors: ['明明想睡覺，卻持續觀看下一集。', '頻繁衝動購物。', '習慣透過短影音逃避重要任務。', '面對需要長期投入的目標時容易分心。', '總是將重要但不緊急的事情延後。'],
    situations: [
      '晚上 12 點，告訴自己「再一集就睡」，結果看到兩點。',
      '準備報告時，打開短影音「休息一下」，一小時就過去了。',
      '想存錢旅行，卻常在下班後用購物犒賞自己。',
    ],
    mechanisms: [
      { term: '時間折現 Temporal Discounting', text: '人們傾向給予近期獎勵較高的價值，越遠的獎勵感覺越不吸引人。' },
      { term: '獎勵學習 Reward Learning', text: '帶來立即回饋的行為容易被強化與重複。' },
      { term: '延遲折扣 Delay Discounting', text: '等待時間越長，主觀價值下降越多；個人差異很大，也受情境與信任感影響。' },
      { term: '習慣性行為 Habitual Behavior', text: '在固定情境中重複後，行為會被提示自動啟動，較少經過思考。' },
      { term: '執行功能 Executive Function', text: '抑制控制與工作記憶幫助我們記得長期目標；疲勞與壓力會削弱這些功能。' },
    ],
    impacts: ['睡眠、健康或財務等長期需求被一再延後。', '重要但不緊急的目標難以累積。', '事後懊悔與自責，形成循環。'],
    boundary: {
      healthy: ['享受一部好電影、一頓喜歡的餐點。', '工作後安排放鬆時間。', '有意識地選擇娛樂。'],
      excessive: ['事後經常後悔自己的選擇。', '立即滿足長期擠壓睡眠或重要目標。', '用娛樂迴避所有需要面對的事。'],
      note: '立即的快樂也能提升生活品質，長期目標同樣需要適當休息與愉悅經驗。練習重點是增加選擇能力，讓娛樂、享受與長期需求取得適合自己的平衡。',
    },
    neuro: '「再一集」是由提示（片尾倒數）、行為（按下一集）與立即回饋組成的熟悉路徑。調整提示、加入折衷方案，並重複新的選擇，能逐步讓另一條路變得更自然（第 1、5、6 章）。',
    alternatives: ['先決定「看到哪裡停」，而不是看完再決定。', '使用折衷方案：看一集後先完成睡前準備。', '讓娛樂多一步（例如關閉自動播放）。', '把重要但不緊急的事，安排成每天 10 分鐘。'],
    reflections: ['哪些時刻，我最容易選擇立即滿足？', '那個選擇滿足了我什麼需要？', '有沒有一種方式，可以同時照顧當下與長期？'],
    experiment: { title: '折衷方案實驗', duration: '7 天', steps: ['每天選一個「想要立即滿足」的時刻。', '用短期與長期選擇模擬器比較三個選項。', '至少試一次折衷方案，記錄感受與結果。'] },
    evidence: {
      text: '延遲折扣研究說明人們普遍偏好近期獎勵；日常經驗取樣研究發現，人們每天都會經歷多次欲望與目標的衝突。棉花糖實驗的重複研究則顯示，延遲滿足與日後成就的關聯比原研究小，且受家庭與環境影響。',
      limits: '延遲折扣的實驗多以金錢為獎勵；「自律」不只是個人意志，也和資源、壓力、環境可信度有關。',
    },
    referenceIds: ['green2004', 'ainslie1975', 'hofmann2012', 'watts2018', 'wood2016'],
    affirmationIds: [7, 2],
    chapterIds: ['ch1', 'ch6', 'ch8'],
    tool: 'choice',
    toolTitle: '短期與長期選擇模擬器',
    challengeActions: [
      '觀察今天有哪些「再一下就好」的時刻，只記錄、不評價。',
      '寫下最常出現的立即滿足行為與時段。',
      '辨識那些時刻的感受（疲累、無聊、想逃避）。',
      '用短期與長期選擇模擬器分析一個情境。',
      '先決定「看到哪裡停」，再開始一項娛樂。',
      '關閉一個自動播放或自動推薦功能。',
      '回顧本週：哪些立即滿足其實很值得，哪些不是？',
      '試一次折衷方案，並記錄感受。',
      '把一件重要但不緊急的事，安排 10 分鐘完成。',
      '有意識地享受一個喜歡的娛樂，完全不帶罪惡感。',
      '設定一個睡前提醒，提早 15 分鐘開始準備。',
      '寫一份 If-Then：「如果片尾開始倒數，我就先起身喝水。」',
      '寫下這段期間做過最滿意的一個選擇。',
      '總結 14 天：你如何平衡當下的快樂與長期的自由？',
    ],
  },
];

export const patternMap = Object.fromEntries(patternHabits.map((h) => [h.id, h])) as Record<PatternHabitId, PatternHabit>;

/* ========== 21 題自我覺察評估 ========== */

export const assessmentScale = [
  { v: 1, label: '幾乎沒有' },
  { v: 2, label: '偶爾' },
  { v: 3, label: '有時' },
  { v: 4, label: '經常' },
  { v: 5, label: '幾乎總是' },
];

/** 每個習慣三題，語句中性描述行為頻率 */
export const assessmentQuestions: { id: string; habitId: PatternHabitId; text: string }[] = [
  { id: 'a1', habitId: 'approval', text: '做決定前，我會先想別人會怎麼看。' },
  { id: 'a2', habitId: 'approval', text: '即使覺得不方便，我也很難拒絕別人的請求。' },
  { id: 'a3', habitId: 'approval', text: '收到的回應或按讚數，會明顯影響我當天對自己的感覺。' },
  { id: 'c1', habitId: 'convenience', text: '遇到需要費力的事，我傾向先選最省力的做法。' },
  { id: 'c2', habitId: 'convenience', text: '感到不舒服時，我會很快停止正在進行的事。' },
  { id: 'c3', habitId: 'convenience', text: '需要較長時間才看得到成果的學習，我較難持續。' },
  { id: 'i1', habitId: 'impress', text: '我會因為想讓別人留下好印象而購物。' },
  { id: 'i2', habitId: 'impress', text: '看到別人的生活分享後，我會想買類似的東西。' },
  { id: 'i3', habitId: 'impress', text: '購物後，我會對花費感到擔心。' },
  { id: 's1', habitId: 'solitude', text: '有空檔時，我會立刻打開手機或其他內容。' },
  { id: 's2', habitId: 'solitude', text: '我很少有不接收資訊、單純整理想法的時間。' },
  { id: 's3', habitId: 'solitude', text: '我會同時看、聽好幾種內容。' },
  { id: 'p1', habitId: 'promises', text: '我會把計畫延到「明天再開始」。' },
  { id: 'p2', habitId: 'promises', text: '我設定的目標，超過當時的時間或體力。' },
  { id: 'p3', habitId: 'promises', text: '計畫中斷一次後，我會放下整個計畫。' },
  { id: 'e1', habitId: 'environment', text: '在主要相處的環境中，我不太能自在表達想法。' },
  { id: 'e2', habitId: 'environment', text: '某些互動結束後，我會感到持續的壓力或疲憊。' },
  { id: 'e3', habitId: 'environment', text: '我身邊較少能互相支持或交流學習的人。' },
  { id: 'g1', habitId: 'shortterm', text: '原本想休息，卻繼續看下一集或下一支影片。' },
  { id: 'g2', habitId: 'shortterm', text: '我會用短影音或娛樂延後重要的事。' },
  { id: 'g3', habitId: 'shortterm', text: '重要但不緊急的事，我常一延再延。' },
];

export const ASSESSMENT_DISCLAIMER =
  '本評估僅供自我反思，結果是「自我回報的行為頻率」，不是醫學或心理診斷，也不代表自律程度、人格優劣或成功機率。若你長期感到困擾，請尋求專業協助（1925 安心專線，24 小時）。';

/** 依習慣建議的本站練習工具（含原有神經可塑性工具） */
export const suggestedTools: Record<PatternHabitId, { label: string; to: string }[]> = {
  approval: [{ label: '認可依賴覺察器', to: '/pattern/approval#tool' }, { label: '身份敘事改寫器', to: '/lab/identity-rewriter' }, { label: '口袋句', to: '/lab/pocket' }],
  convenience: [{ label: '舒適圈探索地圖', to: '/pattern/convenience#tool' }, { label: '微小行動', to: '/lab/steps' }, { label: '情緒命名', to: '/lab/labeling' }],
  impress: [{ label: '消費動機檢視器', to: '/pattern/impress#tool' }, { label: '習慣偵探', to: '/lab/habit-detective' }, { label: '刺激與反應之間的空間', to: '/lab/pause' }],
  solitude: [{ label: '安靜五分鐘', to: '/pattern/solitude#tool' }, { label: '生理性嘆息', to: '/lab/sigh' }, { label: '情緒命名', to: '/lab/labeling' }],
  promises: [{ label: '微承諾追蹤器', to: '/pattern/promises#tool' }, { label: 'If-Then 行動計畫', to: '/lab/if-then' }, { label: '習慣養成模擬器', to: '/lab/habit-curve' }],
  environment: [{ label: '成長環境盤點', to: '/pattern/environment#tool' }, { label: '口袋句', to: '/lab/pocket' }, { label: '認知濾鏡實驗', to: '/lab/cognitive-filter' }],
  shortterm: [{ label: '短期與長期選擇模擬器', to: '/pattern/shortterm#tool' }, { label: 'If-Then 行動計畫', to: '/lab/if-then' }, { label: '習慣偵探', to: '/lab/habit-detective' }],
};

/* ========== 工具用靜態內容 ========== */

/** 消費原因選項（中性描述，不判定對錯） */
export const spendingReasons: { id: string; label: string; social: boolean; need: boolean; emotion: boolean }[] = [
  { id: 'need', label: '實際需要／替換舊物', social: false, need: true, emotion: false },
  { id: 'quality', label: '喜歡它的品質或美感', social: false, need: true, emotion: false },
  { id: 'reward', label: '想犒賞自己', social: false, need: false, emotion: true },
  { id: 'others', label: '身邊的人都有', social: true, need: false, emotion: false },
  { id: 'seen', label: '想被看見或留下好印象', social: true, need: false, emotion: false },
  { id: 'feed', label: '看到網路或社群分享', social: true, need: false, emotion: false },
  { id: 'mood', label: '心情不好想轉換', social: false, need: false, emotion: true },
  { id: 'sale', label: '限時優惠，怕錯過', social: false, need: false, emotion: true },
];

/** 成長環境盤點的六個面向（reverse=true 代表分數越高越需要留意） */
export const environmentItems: { id: string; text: string; reverse?: boolean }[] = [
  { id: 'express', text: '我能自在表達想法。' },
  { id: 'boundary', text: '對方尊重我的界線。' },
  { id: 'support', text: '我們能互相支持。' },
  { id: 'stress', text: '這段互動帶來持續的壓力。', reverse: true },
  { id: 'autonomy', text: '我能在關係中保持自主性。' },
  { id: 'learn', text: '有共同學習或交流的機會。' },
];

export const environmentScale = ['非常不符合', '不太符合', '一半一半', '大致符合', '非常符合'];

/** 工作坊七個步驟 */
export const workshopSteps = [
  { no: 1, title: '察覺模式', desc: '辨識最常重複的行為。' },
  { no: 2, title: '理解觸發', desc: '記錄時間、情緒與環境提示。' },
  { no: 3, title: '分析回饋', desc: '理解舊行為帶來的短期好處與長期成本。' },
  { no: 4, title: '選擇替代行動', desc: '設計安全、具體且可執行的新行為。' },
  { no: 5, title: '建立微承諾', desc: '使用 If-Then Planning 制定行動計畫。' },
  { no: 6, title: '每日練習', desc: '透過每日七句心智練習與行動紀錄持續追蹤。' },
  { no: 7, title: '反思與調整', desc: '每七天回顧一次，必要時降低難度、修改環境或調整目標。' },
];

export const workshopAdjustments = ['降低難度', '修改環境', '調整目標', '尋求支持', '維持目前計畫'];

/** 14 天打破慣性挑戰：每日反思（依階段） */
export const patternChallengeReflections = [
  '今天我注意到這個習慣出現在什麼時候？',
  '觸發它的情境有什麼共同點？',
  '那一刻我真正需要的是什麼？',
  '舊行為給了我什麼短期好處？',
  '今天的小行動，和平常有什麼不同？',
  '哪個部分比我預期的容易或困難？',
  '回顧第一週，我對這個習慣有什麼新的理解？',
  '今天我選擇了什麼新的回應？',
  '如果遇到阻礙，我可以怎麼調整？',
  '今天有哪一刻讓我覺得更像自己？',
  '我需要降低難度、修改環境，還是維持目前的做法？',
  '我的 If-Then 計畫在現實中運作得如何？',
  '這段期間，我想感謝自己的是什麼？',
  '下一階段，我想帶著哪一個小行動繼續前進？',
];

/** 依難度產生當天行動文字 */
export function challengeAction(h: PatternHabit, day: number, level: 'gentle' | 'standard'): string {
  const base = h.challengeActions[day - 1];
  return level === 'gentle' ? `輕量版：${base}（只做最小版本，例如 2 分鐘或只觀察一次，也算完成。）` : base;
}

/** 當天對應的心智語句：在該習慣的兩句之間輪替 */
export function challengeAffirmation(h: PatternHabit, day: number): number {
  return h.affirmationIds[(day - 1) % h.affirmationIds.length];
}
