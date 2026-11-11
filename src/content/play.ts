/**
 * Playful Growth｜輕遊戲化成長體驗：靜態內容
 *
 * 設計原則（全部模組共同遵守）：
 * - 低門檻：30 秒內可以開始；每個互動都能直接跳過。
 * - 沒有失敗懲罰：不扣分、植物不會枯萎、不因中斷歸零、已解鎖的收藏不收回。
 * - 不製造焦慮：沒有排行榜、連續登入天數、稀有度、付費抽獎或倒數計時。
 * - 有意義的回饋：收藏的是「實際做過的事」，而不是沒有意義的積分。
 * - 花園與收藏是「累積經驗的視覺化」，不代表實際神經迴路的成長。
 */

/* ========== 1. 心情盲盒 Mood Surprise ========== */

export type CardType = 'affirmation' | 'micro' | 'question' | 'fact' | 'reminder';
export const CARD_TYPE_LABEL: Record<CardType, string> = {
  affirmation: '心智語句',
  micro: '30 秒微練習',
  question: '有趣的反思問題',
  fact: '大腦冷知識',
  reminder: '溫柔的生活提醒',
};

export interface MoodCard {
  id: string;
  type: CardType;
  text: string;
  /** 冷知識卡附研究來源 id；心智語句卡附語句編號 */
  refId?: string;
  affirmationId?: number;
}

export const moodCards: MoodCard[] = [
  // 每日心智語句（七句原文）
  { id: 'a1', type: 'affirmation', text: '我現在是安全的', affirmationId: 1 },
  { id: 'a2', type: 'affirmation', text: '我的大腦可以改變', affirmationId: 2 },
  { id: 'a3', type: 'affirmation', text: '我已經足夠好了', affirmationId: 3 },
  { id: 'a4', type: 'affirmation', text: '犯錯是我成長的方式', affirmationId: 4 },
  { id: 'a5', type: 'affirmation', text: '我的想法不等於事實', affirmationId: 5 },
  { id: 'a6', type: 'affirmation', text: '我的存在很重要', affirmationId: 6 },
  { id: 'a7', type: 'affirmation', text: '今天是新的機會', affirmationId: 7 },
  // 30 秒微練習
  { id: 'm1', type: 'micro', text: '慢慢吸一口氣，再用比吸氣更長的時間吐出來。重複三次就好。' },
  { id: 'm2', type: 'micro', text: '環顧四周，說出你看到的三種顏色。' },
  { id: 'm3', type: 'micro', text: '把肩膀往上聳到耳朵，停兩秒，再整個放下來。' },
  { id: 'm4', type: 'micro', text: '喝一口水，留意它在嘴裡的溫度。' },
  { id: 'm5', type: 'micro', text: '看向窗外最遠的地方 30 秒，讓眼睛休息一下。' },
  { id: 'm6', type: 'micro', text: '感受雙腳踩在地面上的感覺，數五次呼吸。' },
  { id: 'm7', type: 'micro', text: '張開手指再握拳，重複五次，注意手的感覺。' },
  // 反思問題
  { id: 'q1', type: 'question', text: '今天有哪一刻，讓你不自覺地微笑了一下？' },
  { id: 'q2', type: 'question', text: '如果用一種天氣形容現在的心情，會是什麼？' },
  { id: 'q3', type: 'question', text: '最近學到的一件小事是什麼？' },
  { id: 'q4', type: 'question', text: '有誰最近讓你覺得被理解？' },
  { id: 'q5', type: 'question', text: '如果明天只做一件讓自己開心的事，會是什麼？' },
  { id: 'q6', type: 'question', text: '你最近對自己說過最溫柔的一句話是什麼？' },
  // 大腦冷知識（皆附研究來源；用語保守，避免誇大）
  { id: 'f1', type: 'fact', text: '一項小樣本研究中，成人學習三球雜耍約三個月後，部分腦區出現可測量的變化，停練後又部分回落。', refId: 'draganski2004' },
  { id: 'f2', type: 'fact', text: '專心計算傳球次數時，不少人完全沒看到穿著大猩猩裝的人走過畫面——注意力真的有限。', refId: 'simons1999' },
  { id: 'f3', type: 'fact', text: '為情緒找到詞彙時，與情緒反應有關的杏仁核活動在實驗中較低。說出「我現在很煩」也是一種調節。', refId: 'lieberman2007' },
  { id: 'f4', type: 'fact', text: '研究中，習慣達到穩定所需時間的中位數約 66 天，但個人差異從約 18 天到 254 天都有。', refId: 'lally2010' },
  { id: 'f5', type: 'fact', text: '和陌生人聊完天後，多數人會低估對方喜歡自己的程度。別人對你的印象，可能比你想的更好。', refId: 'boothby2018' },
  { id: 'f6', type: 'fact', text: '「Neurons that fire together, wire together」常被說成 Hebb 的名言，其實是後人濃縮的說法。', refId: 'hebb1949' },
  { id: 'f7', type: 'fact', text: '睡眠參與記憶的鞏固。白天練習的技能，常在睡一覺之後更穩定。', refId: 'walker2006' },
  { id: 'f8', type: 'fact', text: '實驗發現，壓力會讓人更傾向依照習慣行動，而不是依目標做選擇。累的時候回到老路很正常。', refId: 'schwabe2009' },
  // 溫柔的生活提醒
  { id: 'r1', type: 'reminder', text: '休息也是一種前進。' },
  { id: 'r2', type: 'reminder', text: '今天只做到一點點，也是有做到。' },
  { id: 'r3', type: 'reminder', text: '你不需要一次就把所有事情想清楚。' },
  { id: 'r4', type: 'reminder', text: '對自己說話時，試著用對朋友說話的語氣。' },
  { id: 'r5', type: 'reminder', text: '中斷了也沒關係，隨時都可以重新開始。' },
  { id: 'r6', type: 'reminder', text: '今天不想練習，只想看看，也很好。' },
];
export const moodCardMap = Object.fromEntries(moodCards.map((c) => [c.id, c])) as Record<string, MoodCard>;

/* ========== 2. 今日輕冒險 Mini Quest ========== */

export type QuestDepth = 'short' | 'medium' | 'long';
export const DEPTH_LABEL: Record<QuestDepth, string> = { short: '30 秒・輕鬆', medium: '2 分鐘・適中', long: '5 分鐘・深入' };

export const QUEST_CATEGORIES = [
  { id: 'relax', label: '放鬆一下', emoji: '🌿', desc: '給自己一段安靜的時間' },
  { id: 'know', label: '認識自己', emoji: '🪞', desc: '好奇地看看自己' },
  { id: 'brave', label: '勇敢探索', emoji: '🧭', desc: '試一件有一點點新鮮的事' },
  { id: 'organize', label: '整理生活', emoji: '🧺', desc: '讓生活清爽一點' },
  { id: 'connect', label: '連結他人', emoji: '🤝', desc: '和某個人靠近一點' },
  { id: 'learn', label: '學習新知', emoji: '💡', desc: '餵大腦一點新東西' },
] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number]['id'];

export interface Quest {
  id: string;
  category: QuestCategory;
  title: string;
  depths: Record<QuestDepth, string>;
}

export const quests: Quest[] = [
  { id: 'window', category: 'relax', title: '窗外的風景', depths: { short: '安靜觀察窗外 30 秒，看看有什麼在動。', medium: '看著窗外 2 分鐘，找出三個平常沒注意到的細節。', long: '到戶外或窗邊待 5 分鐘，不看手機，只感受光線、聲音與溫度。' } },
  { id: 'breath', category: 'relax', title: '慢一點的呼吸', depths: { short: '做三次慢慢吐氣的深呼吸。', medium: '做 2 分鐘生理性嘆息練習。', long: '用「安靜五分鐘」計時器陪自己一下。' } },
  { id: 'name', category: 'know', title: '情緒小天氣', depths: { short: '用一個詞說出你現在的感受。', medium: '用情緒輪盤，找到一個更精準的情緒詞。', long: '寫三句話：現在的感受、可能的原因、你需要什麼。' } },
  { id: 'value', category: 'know', title: '在乎的事', depths: { short: '說出一件你最近很在乎的事。', medium: '寫下這件事為什麼對你重要。', long: '在人生羅盤選一個領域，回答其中兩個問題。' } },
  { id: 'ask', category: 'brave', title: '問一個問題', depths: { short: '今天主動問一個你好奇的問題。', medium: '在對話中問對方：「你最近在忙什麼有趣的事？」', long: '向一位比你有經驗的人請教一個具體問題。' } },
  { id: 'new', category: 'brave', title: '一點點新鮮', depths: { short: '換一條路走、或點一個沒點過的飲料。', medium: '嘗試一個你一直想試的小功能或小技巧。', long: '把一件逃避的事拆成三步，完成第一步。' } },
  { id: 'desk', category: 'organize', title: '桌面一角', depths: { short: '收拾桌上的一樣東西。', medium: '整理桌面或包包的一個角落。', long: '清理手機中 10 張不需要的照片或通知。' } },
  { id: 'plan', category: 'organize', title: '明天的第一件事', depths: { short: '想好明天早上第一件要做的事。', medium: '選出本週三件要事中的一件，排一個時間。', long: '用四象限整理 5 件待辦事項。' } },
  { id: 'thanks', category: 'connect', title: '一句謝謝', depths: { short: '在心裡對一個人說聲謝謝。', medium: '傳一則訊息謝謝某個人做過的一件小事。', long: '和一位朋友好好聊 5 分鐘，先聽對方說。' } },
  { id: 'listen', category: 'connect', title: '先聽一下', depths: { short: '下一次對話，先讓對方把話說完。', medium: '用一句話重述對方的意思，再回應。', long: '玩一次人際情境小劇場，看看不同回應的發展。' } },
  { id: 'fact', category: 'learn', title: '一張冷知識', depths: { short: '打開心情盲盒，讀一張大腦冷知識。', medium: '讀一個章節的「核心概念」。', long: '完成一個章節的互動測驗。' } },
  { id: 'brain', category: 'learn', title: '大腦小實驗', depths: { short: '在神經道路模擬器點三下。', medium: '試一次認知濾鏡實驗。', long: '讀一張科學證據檢視卡，想想它的限制。' } },
];
export const questMap = Object.fromEntries(quests.map((q) => [q.id, q])) as Record<string, Quest>;

/* ========== 3. 人際情境小劇場 Social Stories ========== */

export interface SocialStory {
  id: string;
  title: string;
  theme: string;
  scene: string;
  options: { text: string; outcome: string; pros: string; limits: string }[];
  reflection: string;
  /** 延伸學習連結 */
  link: { label: string; to: string };
}

export const socialStories: SocialStory[] = [
  {
    id: 'decline',
    title: '週五晚上的加班請求',
    theme: '拒絕別人的要求',
    scene: '週五下午五點，同事說：「可以幫我把這份報告整理完嗎？我今晚有約。」你今晚也已經和家人約好吃飯。',
    options: [
      { text: '「好啊，沒問題。」然後取消家人的晚餐。', outcome: '同事很感謝你，但你整晚都有點悶，家人也有些失望。', pros: '維持了同事關係，也幫到了人。', limits: '自己的需要被放到最後；如果經常如此，可能累積疲憊與委屈。' },
      { text: '「我今晚也有安排，沒辦法幫忙。祝你今晚愉快！」', outcome: '同事愣了一下，說：「喔好，那我再想辦法。」你準時下班。', pros: '清楚表達界線，保護了自己的時間。', limits: '對方可能需要時間消化；若平常互動少，可以多說一句理由。' },
      { text: '「今晚我不行，不過週一早上我可以花 30 分鐘幫你看。」', outcome: '同事鬆了一口氣，你們約好週一處理。', pros: '同時照顧了界線與合作，提供可行的替代方案。', limits: '只適合你真的願意且有餘裕的時候，不必每次都提供替代方案。' },
    ],
    reflection: '在你心中，「好同事」與「照顧自己」之間，有哪些可以同時成立的做法？',
    link: { label: '口袋句：拒絕與表達需求', to: '/lab/pocket' },
  },
  {
    id: 'stranger',
    title: '活動上的空檔',
    theme: '與陌生人開啟對話',
    scene: '在講座休息時間，你旁邊坐著一個不認識的人，兩人都在滑手機。',
    options: [
      { text: '繼續滑手機，等下半場開始。', outcome: '休息時間很快過去，一切如常。', pros: '在需要休息或不想社交時，這完全是合理的選擇。', limits: '錯過了一次可能的交流；如果你其實想認識人，可以下次試試小小開場。' },
      { text: '「剛剛講者提到的那個例子，你覺得怎麼樣？」', outcome: '對方抬起頭，分享了自己的想法，你們聊了幾分鐘。', pros: '以共同經驗開場，自然又不突兀。', limits: '對方也可能只是簡短回應，這不代表你做錯了什麼。' },
      { text: '「你好，我是第一次來，你常參加這類活動嗎？」', outcome: '對方笑說自己也是第一次，你們交換了對活動的期待。', pros: '坦白、友善，容易讓彼此放鬆。', limits: '需要一點勇氣；記得「喜歡程度落差」——對方可能比你以為的更喜歡這段對話。' },
    ],
    reflection: '如果你知道對方很可能比你想的更喜歡和你聊天，你會想怎麼開口？',
    link: { label: '第 2 章：喜歡程度落差', to: '/learn/ch2' },
  },
  {
    id: 'misunderstand',
    title: '已讀不回',
    theme: '面對誤會',
    scene: '你傳訊息約好友週末吃飯，對方已讀了一整天都沒回覆。',
    options: [
      { text: '再傳一句：「不想去就直說啊。」', outcome: '好友隔天回覆：「我這兩天家裡有事，抱歉剛剛才看到……」氣氛有點尷尬。', pros: '直接表達了你的在意。', limits: '在不確定原因時下結論，容易造成不必要的誤會。' },
      { text: '先不回，告訴自己「他可能在忙」，晚上再看看。', outcome: '晚上好友回覆了，說週末可以，你們順利約好時間。', pros: '給彼此空間，也照顧了自己的情緒。', limits: '如果心裡很在意，壓抑太久也不好，可以溫和地確認。' },
      { text: '「最近還好嗎？不急著回，有空再告訴我週末方不方便。」', outcome: '好友回覆說最近壓力很大，謝謝你的體貼，你們改約下週。', pros: '同時關心對方、表達自己的期待，也降低對方壓力。', limits: '需要先照顧好自己的焦慮，才比較容易說出這樣的話。' },
    ],
    reflection: '在這個情境裡，哪些是事實？哪些是你的推測？',
    link: { label: '認知濾鏡實驗', to: '/lab/cognitive-filter' },
  },
  {
    id: 'feedback',
    title: '會議中的批評',
    theme: '接收批評',
    scene: '你報告完提案，主管說：「這個方向有點不夠清楚，數據也不太足夠。」',
    options: [
      { text: '立刻解釋：「其實我有考慮過，只是時間不夠。」', outcome: '主管點點頭，但會議很快進入下一個議題，你覺得有點懊惱。', pros: '說明了你的處境，這很自然。', limits: '急著辯解可能讓自己錯過理解主管真正在意的部分。' },
      { text: '「謝謝您的意見，可以多說一點哪部分不夠清楚嗎？」', outcome: '主管具體指出兩個問題，你記下來，修改方向清楚多了。', pros: '把批評轉成具體資訊，也展現開放的態度。', limits: '當下仍可能感到受傷，這很正常，可以會後再好好照顧情緒。' },
      { text: '什麼都不說，會後自己難過很久。', outcome: '你整天都在反覆想這段話，修改時也不太確定方向。', pros: '避免了當下的衝突。', limits: '沒有得到具體資訊，也容易讓一句批評擴大成對自己的否定。' },
    ],
    reflection: '這個批評是針對「這份提案」，還是針對「你這個人」？',
    link: { label: '自我對話轉換練習', to: '/lab/self-talk' },
  },
  {
    id: 'team',
    title: '分組報告的分工',
    theme: '團隊合作',
    scene: '小組報告只剩一週，有一位組員一直沒交進度，其他人開始在群組裡抱怨。',
    options: [
      { text: '跟著抱怨，然後自己把他的部分做完。', outcome: '報告準時完成，但你非常疲憊，對組員也累積不滿。', pros: '確保了報告品質。', limits: '問題沒被理解，下次可能重演；自己也承擔了過多工作。' },
      { text: '私下問他：「最近還好嗎？你負責的部分有遇到困難嗎？」', outcome: '他說自己卡在資料蒐集，你們一起討論，他當天補上了進度。', pros: '先理解原因，給對方說明的機會。', limits: '對方不一定會回應；必要時仍需要調整分工。' },
      { text: '在群組提議：「我們來重新確認一下每個人的進度和需要的幫忙。」', outcome: '大家重新分配工作，進度變得清楚。', pros: '把焦點放在問題本身，而非指責個人。', limits: '需要有人願意帶頭；也要留意不讓特定的人感到被公開指責。' },
    ],
    reflection: '如果你是那位遲交的組員，你會希望別人怎麼對待你？',
    link: { label: '7 Habits：統合綜效', to: '/habits7/synergize' },
  },
  {
    id: 'negotiate',
    title: '室友與冷氣溫度',
    theme: '雙贏協商',
    scene: '你和室友對冷氣溫度意見不同：你覺得 26 度剛好，室友想開 23 度。',
    options: [
      { text: '「那就照你的吧。」然後自己穿外套。', outcome: '衝突沒有發生，但你整個夏天都覺得有點冷。', pros: '避免了爭執。', limits: '自己的需要沒有被聽見，長期可能累積不滿。' },
      { text: '「我們各讓一步，開 24.5 度。」', outcome: '兩個人都覺得「還可以」，但都不是最舒服。', pros: '快速達成妥協。', limits: '妥協不一定是最好的方案，有時可以找到雙方都更滿意的做法。' },
      { text: '「你最在意的是睡覺時涼快嗎？我是白天在家工作怕冷，我們能不能分時段設定？」', outcome: '你們決定白天 26 度、睡前調低，再加上電風扇，兩個人都滿意。', pros: '聚焦雙方真正的需求，找到比妥協更好的方案。', limits: '需要花時間溝通，也需要雙方都願意合作。' },
    ],
    reflection: '在你最近的衝突中，對方真正在意的可能是什麼？',
    link: { label: '雙贏協商工作坊', to: '/habits7/winwin#tool' },
  },
  {
    id: 'listen',
    title: '朋友的低潮',
    theme: '同理傾聽',
    scene: '朋友說：「我最近好累，什麼都做不好，覺得自己好沒用。」',
    options: [
      { text: '「不要這樣想啦，你很棒的！」', outcome: '朋友勉強笑了笑，說「謝謝」，話題就結束了。', pros: '出於好意，想讓對方好過一點。', limits: '太快否定對方的感受，可能讓對方覺得沒被理解。' },
      { text: '「聽起來你最近真的很累。發生了什麼事嗎？」', outcome: '朋友說出最近工作上的壓力，聊完後說感覺輕鬆一點。', pros: '先理解、先陪伴，讓對方感到被聽見。', limits: '如果對方的低落持續很久，也可以溫和地鼓勵尋求專業協助（1925 安心專線）。' },
      { text: '「你應該早點睡、多運動，就會好一點。」', outcome: '朋友說：「我知道啦……」看起來有點沮喪。', pros: '建議本身可能是有用的。', limits: '在對方還沒感到被理解前給建議，容易被聽成「你做得不夠」。' },
    ],
    reflection: '當你低潮時，什麼樣的回應最讓你感到被支持？',
    link: { label: '同理溝通模擬器', to: '/habits7/understand#tool' },
  },
];
export const storyMap = Object.fromEntries(socialStories.map((s) => [s.id, s])) as Record<string, SocialStory>;

/* ========== 4. 隨機探索轉盤 Surprise Wheel ========== */

export interface WheelItem {
  id: string;
  label: string;
  color: string;
  /** 'route'：前往頁面；'card'：在轉盤旁直接顯示一張卡片 */
  action: { kind: 'route'; to: string } | { kind: 'card'; cardType: CardType } | { kind: 'quest' } | { kind: 'story' };
  desc: string;
}

export const wheelItems: WheelItem[] = [
  { id: 'labeling', label: '情緒命名', color: '#A8BBA3', action: { kind: 'route', to: '/lab/labeling' }, desc: '用情緒輪盤找到現在的感受。' },
  { id: 'affirmation', label: '心智語句', color: '#E8CCB2', action: { kind: 'card', cardType: 'affirmation' }, desc: '讀一句每日心智語句。' },
  { id: 'fact', label: '大腦冷知識', color: '#9FB3C8', action: { kind: 'card', cardType: 'fact' }, desc: '一張有研究來源的冷知識。' },
  { id: 'quest', label: '生活微挑戰', color: '#D8C38E', action: { kind: 'quest' }, desc: '一個 30 秒到 5 分鐘的小冒險。' },
  { id: 'story', label: '人際小劇場', color: '#C3B4D6', action: { kind: 'story' }, desc: '一個人際情境選擇遊戲。' },
  { id: 'quiet', label: '安靜時刻', color: '#7E9C8C', action: { kind: 'route', to: '/pattern/solitude#tool' }, desc: '安靜五分鐘，陪陪自己。' },
  { id: 'values', label: '價值探索', color: '#D9A28F', action: { kind: 'route', to: '/habits7/end#tool' }, desc: '在人生羅盤探索一個生活領域。' },
];

/* ========== 5. 成長收藏冊：徽章 ========== */

export interface BadgeDef {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  /** 解鎖方式（以文字公開說明規則） */
  how: string;
}

export const badges: BadgeDef[] = [
  { id: 'curious', title: '好奇探索家', emoji: '🔭', desc: '願意走進不同的學習角落。', how: '在三個不同的學習系統留下紀錄。' },
  { id: 'smallsteps', title: '小步實踐者', emoji: '👣', desc: '一小步一小步，累積真實的經驗。', how: '完成 3 次輕冒險或微承諾。' },
  { id: 'question', title: '勇敢提問者', emoji: '🙋', desc: '敢於好奇，也敢於開口。', how: '完成一次「勇敢探索」類的輕冒險。' },
  { id: 'listener', title: '溫柔傾聽者', emoji: '👂', desc: '練習先理解，再被理解。', how: '完成一次同理溝通練習，或玩「同理傾聽」小劇場。' },
  { id: 'selfcare', title: '自我照顧者', emoji: '🫖', desc: '記得照顧自己，也是一種能力。', how: '記錄一次休息、呼吸或安靜練習，或完成「放鬆一下」輕冒險。' },
  { id: 'restart', title: '重新開始者', emoji: '🌱', desc: '中斷之後，仍然願意回來。', how: '在微承諾記錄中斷後又完成一次，或隔一週以上再回來練習。' },
  { id: 'creative', title: '創意冒險家', emoji: '🎨', desc: '用不同的方式看待問題。', how: '建立一個團隊思考板，或玩過三個不同的人際小劇場。' },
  { id: 'collector', title: '小卡收藏家', emoji: '🃏', desc: '把喜歡的句子與知識帶在身邊。', how: '在心情盲盒收藏 3 張卡片。' },
  { id: 'messenger', title: '未來的信差', emoji: '✉️', desc: '寫下一句話，交給未來的自己。', how: '建立一個時光膠囊。' },
  { id: 'reader', title: '知識旅人', emoji: '📖', desc: '在知識中慢慢旅行。', how: '完成任一個神經可塑性章節或 7 Habits 章節。' },
];

/* ========== 6. 心智花園：植物、裝飾與景觀 ========== */

/**
 * 成長點的定義：你在網站中「每一筆實際保存的練習或紀錄」算 1 點（同一筆紀錄編輯不重複計算）。
 * 詳細資料定義見 lib/activity.ts。成長點只用來解鎖花園中的植物與景觀，不代表大腦或心理健康的分數。
 */
export interface PlantDef {
  id: string;
  name: string;
  /** 解鎖所需的成長點 */
  points: number;
  kind: 'plant' | 'decor';
}

export const plants: PlantDef[] = [
  { id: 'sprout', name: '小嫩芽', points: 0, kind: 'plant' },
  { id: 'clover', name: '幸運草', points: 1, kind: 'plant' },
  { id: 'tulip', name: '鬱金香', points: 3, kind: 'plant' },
  { id: 'fern', name: '蕨類', points: 6, kind: 'plant' },
  { id: 'stone', name: '圓石', points: 8, kind: 'decor' },
  { id: 'sunflower', name: '向日葵', points: 10, kind: 'plant' },
  { id: 'lavender', name: '薰衣草', points: 15, kind: 'plant' },
  { id: 'lantern', name: '小燈籠', points: 20, kind: 'decor' },
  { id: 'mushroom', name: '小蘑菇', points: 25, kind: 'plant' },
  { id: 'tree', name: '小樹', points: 32, kind: 'plant' },
  { id: 'bench', name: '木長椅', points: 40, kind: 'decor' },
  { id: 'butterfly', name: '蝴蝶', points: 50, kind: 'decor' },
];
export const plantMap = Object.fromEntries(plants.map((p) => [p.id, p])) as Record<string, PlantDef>;

export const gardenThemes = [
  { id: 'spring', name: '春日草地', points: 0, sky: '#E9EEE7', ground: '#C9D8C4' },
  { id: 'summer', name: '夏日午後', points: 10, sky: '#F4E9D2', ground: '#B9CFA9' },
  { id: 'autumn', name: '秋天小徑', points: 25, sky: '#F1E1D0', ground: '#D8C3A0' },
  { id: 'night', name: '星空夜晚', points: 40, sky: '#2E3A44', ground: '#4C6150' },
];

/* ========== 7. 成長夥伴 Rewire Buddy ========== */

export type BuddyMood = 'welcome' | 'curious' | 'thinking' | 'celebrating' | 'resting' | 'encouraging';
export const BUDDY_NAME = '小芽';

/** 夥伴的話：只有歡迎、好奇、陪伴與慶祝，不催促、不責備、不誘導依賴 */
export const buddyLines: Record<BuddyMood, string[]> = {
  welcome: ['嗨，歡迎來到這裡。今天想怎麼探索都可以。', '你來啦！不管今天做什麼，或什麼都不做，都很好。'],
  curious: ['我好奇今天會發現什麼呢？', '要不要一起翻翻看今天的小驚喜？'],
  thinking: ['嗯……這個問題值得慢慢想。', '不急，想到什麼都可以。'],
  celebrating: ['太好了！你又多了一個小小的經驗。', '耶！這一步我幫你記下來了。'],
  resting: ['今天就安安靜靜地待一下吧。', '休息也很重要，我陪你。'],
  encouraging: ['做到一點點也算數喔。', '不完美也沒關係，你願意試就很棒了。'],
};
/** 好一陣子沒來時的歡迎語（自然、不帶責備） */
export const buddyWelcomeBack = ['好久不見！很高興再見到你。花園一直都在這裡。', '歡迎回來，想從哪裡開始都可以。'];

/* ========== 首頁快速入口 ========== */

export const HOME_TITLE = '今天，你想怎麼探索自己？';
export const quietOptions = [
  { label: '安靜五分鐘', desc: '可自訂時間的安靜計時器', to: '/pattern/solitude#tool' },
  { label: '生理性嘆息', desc: '1 分鐘呼吸練習', to: '/lab/sigh' },
  { label: '逛逛我的花園', desc: '今天只想看看，也很好', to: '/play/garden' },
];
