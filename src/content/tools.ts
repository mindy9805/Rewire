/**
 * 互動練習所需的靜態內容：情緒詞彙、口袋句、情境題、認知濾鏡情境
 */

/** 情緒輪盤：六種核心情緒與更細緻的詞彙 */
export const emotionWheel: { core: string; color: string; words: string[] }[] = [
  { core: '喜悅', color: '#E8CCB2', words: ['開心', '滿足', '感激', '期待', '自豪', '放鬆'] },
  { core: '平靜', color: '#A8BBA3', words: ['安心', '踏實', '自在', '專注', '平和', '被支持'] },
  { core: '難過', color: '#9FB3C8', words: ['失落', '孤單', '委屈', '遺憾', '無力', '想念'] },
  { core: '生氣', color: '#D9A28F', words: ['煩躁', '不耐煩', '被冒犯', '不公平感', '挫折', '憤怒'] },
  { core: '害怕', color: '#C3B4D6', words: ['緊張', '不安', '擔心', '慌張', '被威脅', '沒把握'] },
  { core: '羞愧', color: '#D8C38E', words: ['尷尬', '丟臉', '內疚', '自責', '不夠好', '想躲起來'] },
];

/** 口袋句：五種情境的可複製句型 */
export const pocketPhrases: { category: string; desc: string; phrases: string[] }[] = [
  {
    category: '拒絕',
    desc: '溫和而清楚地說「不」，同時保留關係。',
    phrases: [
      '謝謝你想到我，不過這次我沒辦法參加。',
      '我目前手上的工作已經滿了，這件事可能沒辦法接。',
      '我理解這件事很重要，但我需要先拒絕，才能把現有的事做好。',
    ],
  },
  {
    category: '表達需求',
    desc: '描述事實與感受，提出具體請求。',
    phrases: [
      '當會議臨時改時間時，我會比較難安排，下次可以提早一天通知我嗎？',
      '我需要一點安靜的時間整理思緒，大約三十分鐘後再聊好嗎？',
      '我想請你幫我一個忙：可以幫我看一下這份文件的第二段嗎？',
    ],
  },
  {
    category: '面對質疑',
    desc: '不急著防衛，先理解對方的疑慮。',
    phrases: [
      '我聽到你對這個做法有疑慮，可以多說一點你擔心的部分嗎？',
      '你提的這點很重要，我需要再確認資料後回覆你。',
      '我們的看法不太一樣，我先說明我的考量，再聽聽你的想法。',
    ],
  },
  {
    category: '爭取思考時間',
    desc: '不必當下就給答案。',
    phrases: [
      '這個問題我想好好想一下，明天回覆你可以嗎？',
      '讓我先確認一下目前的時程，再告訴你我能不能接。',
      '我需要幾分鐘整理一下，等等再回答你。',
    ],
  },
  {
    category: '澄清誤會',
    desc: '先確認理解，再說明自己的意思。',
    phrases: [
      '我想確認一下，你剛剛的意思是……嗎？',
      '我剛剛那樣說可能讓你誤會了，我真正想表達的是……',
      '我們好像對這件事理解不同，可以一起再對一次細節嗎？',
    ],
  },
];

/** 停 → 察 → 選 → 行：情境選擇題 */
export const pauseScenarios: {
  id: string;
  situation: string;
  options: { text: string; step: '自動反應' | '停' | '察' | '選' | '行'; feedback: string; good: boolean }[];
}[] = [
  {
    id: 'p1',
    situation: '主管在群組裡公開指出你報告中的錯誤，你感到臉頰發熱。',
    options: [
      { text: '立刻在群組回覆長篇解釋，說明不是自己的錯。', step: '自動反應', good: false, feedback: '這是常見的自動防衛反應。先暫停，能避免在情緒高點做出之後後悔的回應。' },
      { text: '先放下手機，做兩次生理性嘆息，注意到「我覺得丟臉、也有點委屈」。', step: '察', good: true, feedback: '很好！你在暫停後覺察了身體與情緒，這讓接下來的選擇更有空間。' },
      { text: '假裝沒看到，整天都不處理。', step: '自動反應', good: false, feedback: '逃避能暫時降低不適，但問題仍在。可以先照顧情緒，再選擇合適的回應時機。' },
    ],
  },
  {
    id: 'p2',
    situation: '你正準備開始一份困難的作業，手卻自動伸向手機。',
    options: [
      { text: '發現自己的動作，停下來問：「我現在想逃開什麼？」', step: '停', good: true, feedback: '你在刺激與反應之間按下了暫停鍵，這就是建立新路徑的開始。' },
      { text: '滑一下就好，結果滑了一小時，然後責怪自己。', step: '自動反應', good: false, feedback: '這很常見，不需要自責。下次可以試著在拿起手機前先停 5 秒。' },
      { text: '選擇只打開檔案寫下標題，並把手機放到另一個房間。', step: '行', good: true, feedback: '你選擇了一個小而具體的行動，並用環境設計支持自己，非常好。' },
    ],
  },
  {
    id: 'p3',
    situation: '家人又提起你不想討論的話題，你感到煩躁，想大聲回嘴。',
    options: [
      { text: '覺察到煩躁後，想想自己真正在乎的是「被尊重」與「關係」，選擇說：「我現在不想談這件事，晚點再說好嗎？」', step: '選', good: true, feedback: '你依據自己的價值做出選擇，而不是被情緒推著走。這就是「選」的力量。' },
      { text: '立刻提高音量回嘴。', step: '自動反應', good: false, feedback: '這是情緒驅動的自動反應。下次可以先深呼吸，給自己一秒鐘的空間。' },
      { text: '默默忍耐，回房間後越想越生氣。', step: '自動反應', good: false, feedback: '壓抑情緒不等於調節情緒。命名感受、表達需求，可能是更好的選擇。' },
    ],
  },
];

/** 認知濾鏡實驗：情境與不同解讀的連鎖結果 */
export const filterScenarios: {
  id: string;
  title: string;
  event: string;
  interpretations: { label: string; thought: string; emotion: string; behavior: string; outcome: string; type: 'negative' | 'balanced' }[];
}[] = [
  {
    id: 'f1',
    title: '走廊上的同事',
    event: '早上在走廊遇到同事小陳，你跟他打招呼，他沒有回應就走過去了。',
    interpretations: [
      { label: '他討厭我', thought: '他一定對我有意見，可能是上次會議我說錯話了。', emotion: '焦慮、受傷', behavior: '整天避開小陳，開會時不敢發言。', outcome: '關係變得更疏遠，焦慮持續，也錯過表達意見的機會。', type: 'negative' },
      { label: '我很不受歡迎', thought: '果然大家都不喜歡我，我在公司就是個邊緣人。', emotion: '難過、羞愧', behavior: '午餐獨自吃飯，不參與同事聊天。', outcome: '確認偏誤加強「我不受歡迎」的信念，社交機會減少。', type: 'negative' },
      { label: '他可能在忙', thought: '他可能在想事情、趕著開會，或沒聽到我說話。', emotion: '平靜、略帶疑惑', behavior: '照常工作，之後遇到時再自然打招呼。', outcome: '情緒穩定，後來發現他當時戴著耳機在講電話。', type: 'balanced' },
      { label: '我想確認一下', thought: '我不確定發生什麼事，如果有誤會，可以找機會聊聊。', emotion: '些微不安但可承受', behavior: '午休時輕鬆地問：「早上你好像很趕，還好嗎？」', outcome: '獲得真實資訊，關係也因主動關心而更好。', type: 'balanced' },
    ],
  },
  {
    id: 'f2',
    title: '朋友的已讀',
    event: '你傳訊息約好友週末吃飯，對方已讀了三個小時都沒有回覆。',
    interpretations: [
      { label: '他不想見我', thought: '他一定是不想跟我出去，又不好意思拒絕。', emotion: '失落、不安', behavior: '傳訊息說「不方便就算了」，語氣有點酸。', outcome: '對方感到莫名其妙，引發不必要的誤會。', type: 'negative' },
      { label: '他可能還在確認行程', thought: '他可能在上班，或需要先確認週末的安排。', emotion: '平靜', behavior: '先做自己的事，晚上沒消息再輕鬆問一下。', outcome: '晚上收到回覆：他剛剛在開會，週末可以。', type: 'balanced' },
      { label: '我被討厭了', thought: '我是不是很煩？大家都受不了我。', emotion: '羞愧、焦慮', behavior: '收回訊息，決定以後都不主動約人。', outcome: '減少社交，孤單感增加，信念被強化。', type: 'negative' },
    ],
  },
  {
    id: 'f3',
    title: '會議上的沉默',
    event: '你在會議中提出一個想法，說完後大家安靜了幾秒，主管接著說：「好，我們先看下一項。」',
    interpretations: [
      { label: '我的想法很爛', thought: '大家一定覺得我的提案很蠢，我不應該開口的。', emotion: '羞愧、懊惱', behavior: '之後的會議都不再提出意見。', outcome: '團隊少了你的觀點，你也失去被看見的機會。', type: 'negative' },
      { label: '可能需要時間消化', thought: '這個想法比較新，大家可能需要時間想一想；主管也可能時間有限。', emotion: '略微失望但平穩', behavior: '會後寄一封簡短的信，補充想法的重點與資料。', outcome: '主管回信表示想在下次會議深入討論。', type: 'balanced' },
      { label: '我想要回饋', thought: '我不確定大家的看法，可以主動詢問。', emotion: '好奇', behavior: '會後問一位同事：「你覺得我剛剛的提案有哪裡需要補強？」', outcome: '得到具體建議，提案修改後更完整。', type: 'balanced' },
    ],
  },
];
