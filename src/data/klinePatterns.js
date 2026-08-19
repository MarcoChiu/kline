/**
 * 完整 48 種經典 K 棒型態戰法圖鑑資料庫 (源自《錢線百分百》48種K棒型態戰法大全)
 * 全面轉化為極度白話、新手友善、具備實戰操盤建議的口語文案。
 */

/**
 * 將百科型態的 svgConfig 轉換為可載入模擬畫板的 K 棒陣列
 */
export function getPatternSimulatorCandles(pattern) {
  if (!pattern?.svgConfig) return [];
  const { type, bars, open, close, high, low, color } = pattern.svgConfig;
  if (type === 'single') {
    return [{ open, close, high, low, color }];
  }
  if (bars && Array.isArray(bars)) {
    return bars.map(b => ({ ...b }));
  }
  return [];
}

export const KLINE_PATTERNS = [
  // ==========================================
  // 【第一維度：單一 K 棒戰法】(Single Bar)
  // ==========================================
  {
    id: 'big_bull',
    name: '大陽線 (長紅 K)',
    category: 'single',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 82,
    isTopFrequent: true,
    locationType: '突破平台 / 主升起漲段',
    entryRule: '突破長期整理箱型或帶量開高時直接追價進場',
    stopLossRule: '跌破長紅實體 1/2 處或開盤最低點立刻停損',
    targetRule: '測量整理平台之 1:1 等距等長波段滿足點',
    chineseName: '大陽線 / 光頭光腳長紅',
    summary: '一根實心飽滿的大紅柱，幾乎沒有上下引線。代表買家從開盤一路爆買到收盤，氣勢完全碾壓空軍！',
    marketPsychology: '多頭部隊傾巢而出，市場搶購氣氛熱烈，空軍毫無招架之力，通常是行情發動或加速突破的強烈訊號！',
    tradingRules: [
      '突破長期整理區時出現，為絕佳追價做多點。',
      '將當日長紅實體的 1/2 或最低點設為防守停損點。'
    ],
    svgConfig: { type: 'single', open: 80, close: 20, high: 15, low: 85, color: '#ef4444' }
  },
  {
    id: 'big_bear',
    name: '大陰線 (長黑/長綠 K)',
    category: 'single',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 83,
    isTopFrequent: true,
    locationType: '高檔做頭 / 破線逃命段',
    entryRule: '跌破關鍵均線或支撐應立即出清多單避險',
    stopLossRule: '若收盤重新站回長黑頂部則空單停損',
    targetRule: '向下尋找前波歷史低點或長期均線防守',
    chineseName: '大陰線 / 長黑摜壓',
    summary: '一根超大根的綠色實體柱，從頭跌到尾。代表主力大戶不計成本瘋狂拋售，多頭被一網打盡。',
    marketPsychology: '市場湧現恐慌性賣壓，買盤徹底崩潰，多方全面棄守，接下來極可能展開連續修正。',
    tradingRules: [
      '跌破均線或支撐時出現，應立即停損或出清多單保命。',
      '千萬不要急於接刀抄底，等待止跌訊號再行動。'
    ],
    svgConfig: { type: 'single', open: 20, close: 80, high: 15, low: 85, color: '#10b981' }
  },
  {
    id: 'hammer',
    name: '槌子線 (Hammer)',
    category: 'single',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 76,
    isTopFrequent: true,
    locationType: '連續重挫 / 底部止跌段',
    entryRule: '隔日開高或收紅確認止跌時進場試單',
    stopLossRule: '跌破槌子線長下影線最低點立刻停損',
    targetRule: '挑戰上方第一道下彎均線 (MA5/MA10)',
    chineseName: '槌子線 / 低檔探底神針',
    summary: '實體短短在頂部，下方拖著超過身體兩倍長的長下影線，出現在連續下跌後的低檔區。',
    marketPsychology: '空方盤中極力摜壓，但低檔爆發神祕強大買盤強行收復失土，代表空頭力竭、多方開始奪回主導權！',
    tradingRules: [
      '隔日開高或確認收紅即可進場試單做多。',
      '以槌子線的最低下影線作為極低風險的停損點。'
    ],
    svgConfig: { type: 'single', open: 25, close: 20, high: 18, low: 85, color: '#ef4444' }
  },
  {
    id: 'hanging_man',
    name: '吊人線 (Hanging Man)',
    category: 'single',
    sentiment: 'bearish',
    signalStrength: 'medium-high',
    winRate: 73,
    isTopFrequent: true,
    locationType: '連續大漲 / 高檔力竭段',
    entryRule: '隔日開低或跌破實體時全面停利賣出',
    stopLossRule: '突破吊人線當日最高點則停損',
    targetRule: '回測下方月線 (MA20) 或起漲平台',
    chineseName: '吊人線 / 高檔吊頸線',
    summary: '外觀與槌子相同，但出現在連續大漲後的高檔區。長下影線看似有買盤，實為主力出貨後的脆弱假象。',
    marketPsychology: '高檔籌碼已經嚴重鬆動，盤中曾出現劇烈殺盤，雖然尾盤勉強拉回，但多頭隨時可能引爆獲利了結雪崩！',
    tradingRules: [
      '隔日若開低或跌破吊人線實體，應無條件獲利了結或停利出場。',
      '切勿在吊人線出現時追高加碼。'
    ],
    svgConfig: { type: 'single', open: 25, close: 20, high: 18, low: 85, color: '#10b981' }
  },
  {
    id: 'shooting_star',
    name: '流星線 / 射擊之星 (Shooting Star)',
    category: 'single',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 79,
    isTopFrequent: true,
    locationType: '波段衝頂 / 高檔遇阻段',
    entryRule: '盤中見長上影線逢高減碼，隔日收黑出清',
    stopLossRule: '若後續爆量收復流星頂部則停損',
    targetRule: '下探前波突破缺口或起漲整理平台',
    chineseName: '流星線 / 隕石墜落線',
    summary: '身體短短在下方，上方頂著長長的上影線。出現在連續上漲的高檔區，如流星劃破天際。',
    marketPsychology: '早盤多頭嘗試衝高，但在高點遭遇主力排山倒海的倒貨，直接打回原形，多頭氣數已盡！',
    tradingRules: [
      '高檔見流星，通常已達波段頂部，應立刻逢高減碼或停利。',
      '隔日若再收黑，跌勢正式啟動。'
    ],
    svgConfig: { type: 'single', open: 75, close: 80, high: 15, low: 83, color: '#10b981' }
  },
  {
    id: 'inverted_hammer',
    name: '倒槌線 (Inverted Hammer)',
    category: 'single',
    sentiment: 'bullish',
    signalStrength: 'medium',
    winRate: 70,
    chineseName: '倒槌線 / 底部試探線',
    summary: '長得像流星線但出現在下跌低檔區。長上影線代表多頭首次吹起反攻號角。',
    marketPsychology: '雖然尾盤被壓回，但證明低檔已有大資金進場點火測試賣壓，空軍已無法肆無忌憚往下摜。',
    tradingRules: [
      '需等待隔日出現長紅確認反轉再行進場。',
      '屬於左側觀察訊號。'
    ],
    svgConfig: { type: 'single', open: 80, close: 75, high: 15, low: 83, color: '#ef4444' }
  },
  {
    id: 'dragonfly_doji',
    name: '蜻蜓線 (Dragonfly Doji)',
    category: 'single',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 77,
    chineseName: '蜻蜓線 / 丁字線 / 地心引力反彈',
    summary: '開盤價、收盤價與最高價幾乎在同一水平，下方留有極長的下影線，像一隻張開翅膀的蜻蜓。',
    marketPsychology: '盤中空軍瘋狂砍倉，但終場前被主力全數以最高價掃貨吃光，空軍全軍覆沒！',
    tradingRules: [
      '出現在低檔是超強烈的止跌反轉訊號，可積極分批做多。',
      '停損設在下影線尖端。'
    ],
    svgConfig: { type: 'single', open: 20, close: 20, high: 18, low: 85, color: '#ef4444' }
  },
  {
    id: 'gravestone_doji',
    name: '墓碑線 (Gravestone Doji)',
    category: 'single',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 78,
    chineseName: '墓碑線 / 倒丁字線 / 斷頭線',
    summary: '開盤價、收盤價與最低價幾乎在同一條水平線，上方拖著很長的上影線，宛如墓碑立於高崗。',
    marketPsychology: '開盤後買方曾全力衝刺，但最終在收盤前全數吐回，追高的買盤全部陣亡變成套牢幽靈。',
    tradingRules: [
      '高檔出現墓碑線為極度凶險的見頂訊號，持股者宜迅速出清。',
      '空手者嚴禁在此進場接刀。'
    ],
    svgConfig: { type: 'single', open: 80, close: 80, high: 15, low: 82, color: '#10b981' }
  },
  {
    id: 'long_legged_doji',
    name: '長十字星 (Long-Legged Doji)',
    category: 'single',
    sentiment: 'neutral',
    signalStrength: 'medium-high',
    winRate: 72,
    chineseName: '長十字星 / 大轉折十字',
    summary: '上下影線都非常長，開盤價與收盤價幾乎重疊在中間，代表盤中多空經歷了激烈的血戰。',
    marketPsychology: '多空雙方廝殺得難分難解，力量勢均力敵，原有的單邊趨勢即將在此發生重大變盤！',
    tradingRules: [
      '在高檔出現偏空看，在低檔出現偏多看。',
      '以隔日 K 棒的方向作為最終方向表態的依歸。'
    ],
    svgConfig: { type: 'single', open: 50, close: 50, high: 10, low: 90, color: '#f59e0b' }
  },
  {
    id: 'spinning_top',
    name: '紡錘線 (Spinning Top)',
    category: 'single',
    sentiment: 'neutral',
    signalStrength: 'medium',
    winRate: 65,
    chineseName: '紡錘線 / 陀螺線 / 猶豫線',
    summary: '實體很小，上下影線長度對稱，像旋轉的陀螺，代表市場進入迷茫與猶豫期。',
    marketPsychology: '買賣雙方都不敢輕舉妄動，成交意願降低，原先推升或下跌的動能正在快速衰竭中。',
    tradingRules: [
      '建議先在場外觀望，等突破陀螺的高點或跌破低點再順勢進場。'
    ],
    svgConfig: { type: 'single', open: 45, close: 55, high: 20, low: 80, color: '#f59e0b' }
  },
  {
    id: 'immortal_guide',
    name: '仙人指路 (Immortal Guide)',
    category: 'single',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 80,
    chineseName: '仙人指路 / 主力試盤劍',
    summary: '在大漲剛起步的階段，出現一根帶長上影線的紅 K 或小黑 K，看似遇阻，實為主力量價試盤。',
    marketPsychology: '主力故意拉高測試上方歷史套牢賣壓有多重，上影線是未來的「指路明燈」，預告即將突破！',
    tradingRules: [
      '若成交量放大且未跌破 5 日線，拉回上影線 1/2 處為極佳切入點。',
      '後續突破上影線頂端將展開主升段。'
    ],
    svgConfig: { type: 'single', open: 75, close: 60, high: 15, low: 80, color: '#ef4444' }
  },
  {
    id: 'flat_doji',
    name: '一字線 (Flat Doji)',
    category: 'single',
    sentiment: 'neutral',
    signalStrength: 'high',
    winRate: 85,
    chineseName: '一字線 / 漲跌停鎖死線',
    summary: '開高低收完全集中在同一個價位，沒有任何上下影線，通常是重大利多漲停或利空跌停鎖死。',
    marketPsychology: '市場買盤或賣盤處於極端失衡狀態，單邊力量壓倒性鎖死流動性。',
    tradingRules: [
      '若為一字漲停，代表強烈主升多頭，持股續抱。',
      '若為一字跌停，千萬不可抄底，應排單避險。'
    ],
    svgConfig: { type: 'single', open: 50, close: 50, high: 50, low: 50, color: '#ef4444' }
  },

  // ==========================================
  // 【第二維度：雙 K 組合戰法】(Dual Bars)
  // ==========================================
  {
    id: 'bullish_engulfing',
    name: '多頭吞噬 (Bullish Engulfing)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 84,
    isTopFrequent: true,
    locationType: '波段低檔 / 破曉反轉段',
    entryRule: '今日長紅實體完全吞噬昨日長黑時，尾盤或隔日開盤積極買進',
    stopLossRule: '跌破今日長紅最低點 (吞噬底部) 嚴格停損',
    targetRule: '向上挑戰前波起跌點壓力區',
    chineseName: '多頭吞噬 / 陽包陰起漲',
    summary: '昨天是綠 K，今天一根巨大紅 K 從頭到腳把昨天的綠 K 身體完全「一口吞掉」！',
    marketPsychology: '多方主力以壓倒性的大資金全面反攻，瞬間吃掉昨天的所有空方籌碼，反轉確立！',
    tradingRules: [
      '出現在波段低點時是勝率極高的買進訊號。',
      '以今天長紅的最低點作為防守停損點。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 40, close: 65, high: 35, low: 70, color: '#10b981' }, { open: 75, close: 25, high: 20, low: 80, color: '#ef4444' } ]
    }
  },
  {
    id: 'bearish_engulfing',
    name: '空頭吞噬 / 陰吞噬 (Bearish Engulfing)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 85,
    isTopFrequent: true,
    locationType: '波段高檔 / 烏雲罩頂逃命段',
    entryRule: '長黑吞沒前日長紅，果斷結清多單並建立避險空單',
    stopLossRule: '站回長黑實體頂部則停損',
    targetRule: '回測波段起漲點或半年線支撐',
    chineseName: '空頭吞噬 / 陰包陽斷頭',
    summary: '昨天是紅 K，今天一根巨大長黑（綠 K）把昨天的紅 K 實體完完全全吞沒覆蓋。',
    marketPsychology: '主力高檔無情倒貨，昨日的買方歡樂氣氛瞬間冰凍，籌碼全數轉為沉重套牢賣壓！',
    tradingRules: [
      '高檔見陰吞噬，請以最快速度出清持股或執行減碼。',
      '跌破前日低點代表空頭攻勢正式確立。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 65, close: 40, high: 35, low: 70, color: '#ef4444' }, { open: 25, close: 75, high: 20, low: 80, color: '#10b981' } ]
    }
  },
  {
    id: 'piercing_line',
    name: '貫穿線 / 曙光初現 (Piercing Line)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 78,
    chineseName: '貫穿線 / 曙光初現',
    summary: '昨天是大綠 K，今天跳空開低後強勢拉升，收盤價硬生生攻破昨天綠 K 實體的 1/2 以上！',
    marketPsychology: '原本市場還在絕望殺低，沒想到低檔湧入抄底主力，直接收復昨日大半失土，多頭露出曙光！',
    tradingRules: [
      '突破昨日中線越深，反轉力道越強，可分批進場做多。',
      '停損設在今日最低點。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 25, close: 70, high: 20, low: 75, color: '#10b981' }, { open: 80, close: 40, high: 38, low: 85, color: '#ef4444' } ]
    }
  },
  {
    id: 'dark_cloud_cover',
    name: '烏雲罩頂 (Dark Cloud Cover)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 80,
    chineseName: '烏雲罩頂 / 烏雲蓋頂',
    summary: '昨天是大紅 K，今天開高歡呼後直接跳水砸盤，收盤跌破昨天紅 K 實體的 1/2 以下！',
    marketPsychology: '散戶早上還在追高開香檳，主力卻在天花板大舉倒貨，整個盤面瞬間烏雲密布！',
    tradingRules: [
      '高檔遇烏雲罩頂，上方賣壓如山，多單應立即逢高停利出場。',
      '反彈靠近昨日高點為空方防守線。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 70, close: 25, high: 20, low: 75, color: '#ef4444' }, { open: 18, close: 55, high: 15, low: 60, color: '#10b981' } ]
    }
  },
  {
    id: 'harami_bullish',
    name: '多頭母子 (Bullish Harami)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'medium-high',
    winRate: 72,
    chineseName: '多頭母子線 / 孕線起漲',
    summary: '昨天是大綠 K（母親），今天是一根小紅 K（胎兒），小紅 K 完完全全被包在昨天的肚子裡。',
    marketPsychology: '原本凶猛的跌勢突然踩剎車，空方殺盤能量已消耗殆盡，即將醞釀底部反彈。',
    tradingRules: [
      '等待第三天突破母線（昨日）高點即可確認反轉進場。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 20, close: 75, high: 15, low: 80, color: '#10b981' }, { open: 55, close: 40, high: 35, low: 60, color: '#ef4444' } ]
    }
  },
  {
    id: 'harami_bearish',
    name: '空頭母子 (Bearish Harami)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'medium-high',
    winRate: 74,
    chineseName: '空頭母子線 / 孕線見頂',
    summary: '昨天是大紅 K（母親），今天是一根小綠 K（胎兒），完全縮在昨天大紅 K 的懷抱裡。',
    marketPsychology: '多頭連續推升後突然氣力放盡，買盤在高檔猶豫不前，漲勢已強弩之末。',
    tradingRules: [
      '高檔見母子線宜調降持股水位，跌破昨日低點則全面停利。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 75, close: 20, high: 15, low: 80, color: '#ef4444' }, { open: 40, close: 55, high: 35, low: 60, color: '#10b981' } ]
    }
  },
  {
    id: 'harami_cross_bullish',
    name: '多頭母子十字 (Harami Cross Bullish)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 79,
    chineseName: '多頭母子十字 / 孕十字底',
    summary: '昨天是大綠 K，今天縮成一顆微小的十字星，完全包在昨天的大綠 K 身體內。',
    marketPsychology: '空方力量在今天達到完美的平衡與衰竭，十字星意味著跌勢徹底終結，強烈預告明日變盤大漲！',
    tradingRules: [
      '比一般母子線更具備反轉威力，隔日開高可積極試多。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 20, close: 75, high: 15, low: 80, color: '#10b981' }, { open: 48, close: 48, high: 38, low: 58, color: '#f59e0b' } ]
    }
  },
  {
    id: 'harami_cross_bearish',
    name: '空頭母子十字 (Harami Cross Bearish)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 81,
    chineseName: '空頭母子十字 / 孕十字頂',
    summary: '昨天是大紅 K，今天在高檔縮成一顆微小的十字星，完全被昨天大紅 K 包容。',
    marketPsychology: '多頭在最高點突然失去所有推升動力，猶豫十字星預示著多轉空的雷霆變盤！',
    tradingRules: [
      '高檔孕十字是極強烈的逃命警訊，應果斷賣出持股。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 75, close: 20, high: 15, low: 80, color: '#ef4444' }, { open: 48, close: 48, high: 38, low: 58, color: '#f59e0b' } ]
    }
  },
  {
    id: 'tweezers_bottom',
    name: '平頭底部 (Tweezers Bottom)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'medium-high',
    winRate: 75,
    chineseName: '平頭底部 / 鉗子雙針打底',
    summary: '連續兩天的最低點完全一模一樣，像一把鉗子整整齊齊夾在地板上。',
    marketPsychology: '主力連續兩天在同一個精準價位建立銅牆鐵壁，空頭連續兩次進攻都無法越雷池一步，雙重支撐無比堅固！',
    tradingRules: [
      '底部雙重探底成功，為極穩健的進場點。',
      '停損就設在鉗子底部下方 1 檔。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 30, close: 60, high: 25, low: 80, color: '#10b981' }, { open: 65, close: 35, high: 30, low: 80, color: '#ef4444' } ]
    }
  },
  {
    id: 'tweezers_top',
    name: '平頭頂部 (Tweezers Top)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'medium-high',
    winRate: 76,
    chineseName: '平頭頂部 / 鉗子雙頂遇阻',
    summary: '連續兩天的最高點完全一模一樣，像一把鉗子頂在天花板上過不去。',
    marketPsychology: '多頭連續兩天嘗試衝破天花板都宣告失敗，上方賣壓沉重無比，雙重頭部確立！',
    tradingRules: [
      '高點兩次過不去就是逃命波，建議逢高分批出清。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 60, close: 30, high: 20, low: 75, color: '#ef4444' }, { open: 25, close: 55, high: 20, low: 70, color: '#10b981' } ]
    }
  },
  {
    id: 'bullish_counterattack',
    name: '多頭反撲 (Bullish Counterattack)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 77,
    chineseName: '多頭反撲 / 友晴線',
    summary: '第一天大黑 K 重挫，第二天大幅跳空開低後強勢逆襲拉高，收盤價剛好跟第一天收盤價平齊！',
    marketPsychology: '空頭早盤狂殺，但多方大軍迅速集結發動絕地大反撲，直接逼平戰局，空方大勢已去！',
    tradingRules: [
      '多空力量瞬間逆轉，隔日續強即可跟進買進。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 20, close: 65, high: 15, low: 70, color: '#10b981' }, { open: 85, close: 65, high: 60, low: 90, color: '#ef4444' } ]
    }
  },
  {
    id: 'bearish_counterattack',
    name: '空頭反撲 (Bearish Counterattack)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 78,
    chineseName: '空頭反撲 / 暗雲反撲',
    summary: '第一天大長紅狂飆，第二天跳空開高後遭到迎頭痛擊一路大跌，收盤價剛好落回第一天的收盤價！',
    marketPsychology: '多頭早盤歡呼追高，卻被主力反手一記悶棍打回原點，形成沉重的高檔假突破套牢！',
    tradingRules: [
      '高檔遇阻反撲，宜立即停利避險。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 65, close: 20, high: 15, low: 70, color: '#ef4444' }, { open: 10, close: 20, high: 5, low: 25, color: '#10b981' } ]
    }
  },
  {
    id: 'upside_gap_two_rabbits',
    name: '向上跳空並列陽線 (Upside Gap Side-by-Side)',
    category: 'dual',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 83,
    chineseName: '向上跳空並列陽線 / 雙兔躍升',
    summary: '在上升趨勢中，向上跳空開出第一根紅 K，隔日再次開在相近位置收出第二根紅 K，兩根陽線肩並肩並列。',
    marketPsychology: '多頭買盤源源不絕，跳空缺口毫不回補，雙陽並列代表攻擊火力極度旺盛！',
    tradingRules: [
      '極強勢的中繼續漲訊號，持股抱緊或順勢加碼。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 55, close: 30, high: 25, low: 60, color: '#ef4444' }, { open: 55, close: 30, high: 25, low: 60, color: '#ef4444' } ]
    }
  },
  {
    id: 'downside_gap_two_crows',
    name: '向下跳空並列陰線 (Downside Gap Side-by-Side)',
    category: 'dual',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 84,
    chineseName: '向下跳空並列陰線 / 雙鴉墜落',
    summary: '在下跌趨勢中，向下跳空開出第一根綠 K，隔日再次並列收出第二根綠 K，兩根陰線並排下殺。',
    marketPsychology: '賣壓洶湧澎湃，反彈無力，空方徹底主導戰局，下跌浪潮將持續延伸！',
    tradingRules: [
      '極危險的續跌訊號，絕對不可逢低攤平。'
    ],
    svgConfig: {
      type: 'dual',
      bars: [ { open: 30, close: 55, high: 25, low: 60, color: '#10b981' }, { open: 30, close: 55, high: 25, low: 60, color: '#10b981' } ]
    }
  },

  // ==========================================
  // 【第三維度：三 K 及多 K 經典戰法】(Multi Bars)
  // ==========================================
  {
    id: 'morning_star',
    name: '晨星 (Morning Star)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 86,
    isTopFrequent: true,
    locationType: '波段底部 / 三日破曉段',
    entryRule: '第三日長紅確認貫穿第一日長黑 1/2 以上時進場追價做多',
    stopLossRule: '跌破中間星線之最低價立即停損',
    targetRule: '展開波段大多頭反彈，挑戰季線 (MA60)',
    chineseName: '早晨之星 / 破曉晨星',
    summary: '第一天大綠 K $\\rightarrow$ 第二天向下跳空開出小星星 $\\rightarrow$ 第三天拔地而起收出一根大紅 K，直搗第一天核心！',
    marketPsychology: '黑夜即將過去，黎明破曉來到！三部曲完美演繹了「恐慌殺盤 $\\rightarrow$ 力量平衡 $\\rightarrow$ 多頭暴風反攻」！',
    tradingRules: [
      '經典底部三大形態之王，看到第三天紅 K 確認即可重倉切入。',
      '停損設在中間那顆星星的最低點。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 20, close: 65, high: 15, low: 70, color: '#10b981' }, { open: 78, close: 80, high: 72, low: 85, color: '#f59e0b' }, { open: 65, close: 25, high: 20, low: 70, color: '#ef4444' } ]
    }
  },
  {
    id: 'evening_star',
    name: '夜星 / 黃昏之星 (Evening Star)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 87,
    isTopFrequent: true,
    locationType: '波段頭部 / 日落反轉段',
    entryRule: '第三日長黑摜破第一日長紅 1/2 時全面停利並建立避險',
    stopLossRule: '突破中間高檔星線最高點則停損',
    targetRule: '向下回測整理箱型底部或年線',
    chineseName: '黃昏之星 / 日落西山',
    summary: '第一天大紅 K $\\rightarrow$ 第二天跳空開出高檔星星 $\\rightarrow$ 第三天大綠 K 狠狠砸下來，直接跌破第一天的一半以上。',
    marketPsychology: '多頭的狂歡宴會結束了！第三天的大長黑宣告主力高檔出貨完畢，接下來將迎接漫長黑夜！',
    tradingRules: [
      '見黃昏之星，持股必須毫不猶豫清倉離場。',
      '波段頂部成型。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 65, close: 20, high: 15, low: 70, color: '#ef4444' }, { open: 12, close: 10, high: 5, low: 18, color: '#f59e0b' }, { open: 20, close: 65, high: 18, low: 68, color: '#10b981' } ]
    }
  },
  {
    id: 'morning_doji_star',
    name: '晨星十字 (Morning Doji Star)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 88,
    chineseName: '晨星十字 / 破曉十字星',
    summary: '晨星的中間那顆星是一顆完美的「十字星 (Doji)」，反轉訊號比一般晨星更加凌厲！',
    marketPsychology: '十字星代表空頭力量在此精準歸零，隨後多頭大單火箭般噴發！',
    tradingRules: [
      '勝率極高的底部起漲組合，積極買進。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 20, close: 65, high: 15, low: 70, color: '#10b981' }, { open: 80, close: 80, high: 70, low: 90, color: '#f59e0b' }, { open: 65, close: 25, high: 20, low: 70, color: '#ef4444' } ]
    }
  },
  {
    id: 'evening_doji_star',
    name: '黃昏十字星 (Evening Doji Star)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 89,
    chineseName: '黃昏十字星 / 日落十字頂',
    summary: '黃昏之星的中間高點是一顆完美的「十字星 (Doji)」，隨後被大長黑吞沒。',
    marketPsychology: '多頭在最高點被十字星定格，隨後遭到空軍毀滅性打擊！',
    tradingRules: [
      '極高勝率的頂部反轉組合，見訊號即刻停利逃命。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 65, close: 20, high: 15, low: 70, color: '#ef4444' }, { open: 10, close: 10, high: 3, low: 18, color: '#f59e0b' }, { open: 20, close: 65, high: 18, low: 68, color: '#10b981' } ]
    }
  },
  {
    id: 'abandoned_baby_bullish',
    name: '棄嬰底 (Abandoned Baby Bullish)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 91,
    chineseName: '棄嬰底 / 絕壁孤星反轉',
    summary: '中間的十字星與前後兩根 K 棒都留有「明確跳空缺口」，像被單獨遺棄在懸崖下方的嬰兒。',
    marketPsychology: '極罕見但威力最霸道的底部形態！代表空頭主力在最底部誘空後直接鎖死籌碼拔高！',
    tradingRules: [
      '罕見五星級強烈反轉訊號，大膽做多。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 15, close: 55, high: 10, low: 60, color: '#10b981' }, { open: 82, close: 82, high: 75, low: 90, color: '#f59e0b' }, { open: 55, close: 15, high: 10, low: 60, color: '#ef4444' } ]
    }
  },
  {
    id: 'abandoned_baby_bearish',
    name: '棄嬰頂 (Abandoned Baby Bearish)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 92,
    chineseName: '棄嬰頂 / 高崗孤星崩塌',
    summary: '中間的十字星與前後兩根 K 棒在頂部都留有「跳空缺口」，高高掛在天空被遺棄。',
    marketPsychology: '主力在最高點誘多鎖死散戶，隨後直接向下跳空殺盤，散戶連逃命的機會都沒有！',
    tradingRules: [
      '最凶險的雪崩形態，開盤跳空跌破立即市價停損。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 60, close: 20, high: 15, low: 65, color: '#ef4444' }, { open: 8, close: 8, high: 2, low: 15, color: '#f59e0b' }, { open: 20, close: 60, high: 18, low: 65, color: '#10b981' } ]
    }
  },
  {
    id: 'three_white_soldiers',
    name: '紅三兵 (Three White Soldiers)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 85,
    isTopFrequent: true,
    locationType: '底部起漲 / 攻堅突破段',
    entryRule: '第三根紅 K 伴隨量能溫和放大時進場佈局主升段',
    stopLossRule: '跌破第一根紅 K 的開盤低點立即停損',
    targetRule: '展開主升段波段行情，沿 5 日線順勢抱牢',
    chineseName: '紅三兵 / 連三紅攻堅',
    summary: '連續三天都收出穩健上升的實體紅 K，每天開在昨日實體內、收盤創新高，且影線極短。',
    marketPsychology: '多方買盤源源不絕，主力節奏分明地推升股價，正式進入波段主升攻擊段！',
    tradingRules: [
      '剛突破整理區時出現，跟進追買勝率極高。',
      '沿 5 日線順勢抱牢。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 75, close: 55, high: 50, low: 80, color: '#ef4444' }, { open: 58, close: 38, high: 33, low: 62, color: '#ef4444' }, { open: 40, close: 20, high: 15, low: 45, color: '#ef4444' } ]
    }
  },
  {
    id: 'three_black_crows',
    name: '三隻烏鴉 (Three Black Crows)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 86,
    isTopFrequent: true,
    locationType: '高檔崩盤 / 連續破底段',
    entryRule: '連三黑且步步破底，空方強勢，持股者無條件清倉避險',
    stopLossRule: '站上第一隻烏鴉高點則空單出場',
    targetRule: '向下尋找恐慌拋售窒息量低點',
    chineseName: '三隻烏鴉 / 連三黑破底',
    summary: '連續三天在高檔收出步步走低的大長黑（綠 K），每天收盤都摜破前日低點。',
    marketPsychology: '空方賣壓排山倒海而來，大戶奪門而出，盤面全面潰敗進入主跌段！',
    tradingRules: [
      '絕對不可在此接刀抄底，多單請無條件停損出場。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 20, close: 40, high: 15, low: 45, color: '#10b981' }, { open: 38, close: 58, high: 33, low: 62, color: '#10b981' }, { open: 55, close: 75, high: 50, low: 80, color: '#10b981' } ]
    }
  },
  {
    id: 'unique_three_river_bottom',
    name: '獨特三河床 (Unique Three River)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 81,
    chineseName: '獨特三河床 / 三河築底',
    summary: '第一天大長綠 $\\rightarrow$ 第二天帶長下影線的小實體綠 K $\\rightarrow$ 第三天收一根小紅 K 守在第二天下影線之上。',
    marketPsychology: '空軍在三條河流交界處深陷泥淖，長下影線成功探底，第三天小紅確認防守成功，河床築底完成！',
    tradingRules: [
      '穩健型底部型態，第三天收紅可進場佈局。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 20, close: 60, high: 15, low: 65, color: '#10b981' }, { open: 55, close: 65, high: 50, low: 85, color: '#10b981' }, { open: 65, close: 50, high: 45, low: 70, color: '#ef4444' } ]
    }
  },
  {
    id: 'bullish_sandwich',
    name: '多頭三明治 (Bullish Sandwich)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 80,
    chineseName: '多頭三明治 / 兩綠夾一紅底',
    summary: '第一天綠 K $\\rightarrow$ 第二天大紅 K 反彈 $\\rightarrow$ 第三天綠 K 再次回測，但收盤價精準落在第一天的收盤價上！',
    marketPsychology: '像三明治一樣包夾，空頭兩次進攻都在同一個價位被完全抵擋，雙重水平支撐無懈可擊！',
    tradingRules: [
      '第四天只要開紅，即代表雙底築成，向上反噴！'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 25, close: 65, high: 20, low: 70, color: '#10b981' }, { open: 65, close: 35, high: 30, low: 70, color: '#ef4444' }, { open: 30, close: 65, high: 25, low: 70, color: '#10b981' } ]
    }
  },
  {
    id: 'bullish_artillery',
    name: '多方砲 (Bullish Artillery)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 86,
    chineseName: '多方砲 / 兩陽夾一陰主升',
    summary: '第一天長紅突破 $\\rightarrow$ 第二天量縮微幅拉回小綠 K $\\rightarrow$ 第三天再次爆量長紅一口氣吞噬前日小綠並創新高！',
    marketPsychology: '多方主力架好大砲，中間的小綠 K 只是洗盤甩掉浮額，第三天大長紅點火開砲，直衝雲霄！',
    tradingRules: [
      '台股最強勢的主升段戰法，第三天長紅確認時大膽追價買進。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 65, close: 30, high: 25, low: 70, color: '#ef4444' }, { open: 32, close: 45, high: 28, low: 50, color: '#10b981' }, { open: 42, close: 15, high: 10, low: 48, color: '#ef4444' } ]
    }
  },
  {
    id: 'bearish_artillery',
    name: '空方砲 (Bearish Artillery)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 87,
    chineseName: '空方砲 / 兩陰夾一陽主跌',
    summary: '第一天長黑殺盤 $\\rightarrow$ 第二天弱勢微幅反彈小紅 K $\\rightarrow$ 第三天再次重挫長黑摜破前低！',
    marketPsychology: '空軍架設重砲陣地，中間的小紅只是多頭垂死掙扎的誘多陷阱，第三天大長黑直接引爆雪崩！',
    tradingRules: [
      '極危險的主跌段訊號，手上有持股者應立即停損出場。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 30, close: 65, high: 25, low: 70, color: '#10b981' }, { open: 65, close: 50, high: 45, low: 70, color: '#ef4444' }, { open: 52, close: 85, high: 48, low: 90, color: '#10b981' } ]
    }
  },
  {
    id: 'rising_three_methods',
    name: '上升三法 (Rising Three Methods)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 84,
    isTopFrequent: true,
    locationType: '多頭中繼 / 洗盤突破段',
    entryRule: '第五根大陽線強勢突破前三日黑 K 高點時加碼做多',
    stopLossRule: '跌破第一根長紅 K 最低點嚴格停損',
    targetRule: '開啟波段第二波等長主升攻擊段',
    chineseName: '上升三法 / 中繼強勢整理',
    summary: '一根大長紅後，連續出現三根無力的小綠 K（皆未跌破第一根長紅低點），第五天再出一根大長紅突破天際！',
    marketPsychology: '主力發動攻擊後刻意壓盤休息三天洗盤甩轎，浮額沉澱後再次發動強勁攻勢！',
    tradingRules: [
      '強勢中繼形態，第五天突破第一天高點時加碼做多。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 75, close: 25, high: 20, low: 80, color: '#ef4444' },
        { open: 30, close: 40, high: 25, low: 45, color: '#10b981' },
        { open: 38, close: 48, high: 33, low: 52, color: '#10b981' },
        { open: 45, close: 55, high: 40, low: 60, color: '#10b981' },
        { open: 50, close: 15, high: 10, low: 55, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'falling_three_methods',
    name: '下降三法 (Falling Three Methods)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 85,
    chineseName: '下降三法 / 空頭中繼續跌',
    summary: '一根大長黑後，連續出現三根弱勢反彈的小紅 K（皆未越過第一天高點），第五天再出大長黑灌破前低！',
    marketPsychology: '反彈無量且無力，只是空頭主力歇腳的過程，隨後發動更猛烈的二次殺盤！',
    tradingRules: [
      '反彈無力莫追多，跌破低點應堅決離場。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 25, close: 75, high: 20, low: 80, color: '#10b981' },
        { open: 70, close: 60, high: 55, low: 75, color: '#ef4444' },
        { open: 62, close: 52, high: 48, low: 68, color: '#ef4444' },
        { open: 55, close: 45, high: 40, low: 60, color: '#ef4444' },
        { open: 48, close: 85, high: 45, low: 90, color: '#10b981' }
      ]
    }
  },
  {
    id: 'tri_star_bullish',
    name: '三星做底 (Tri-Star Bullish)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 82,
    chineseName: '三星做底 / 晨曦三星',
    summary: '在連續下跌後，由三顆十字星組成的罕見組合，中間那顆十字星位置最低。',
    marketPsychology: '多空連續三天陷入極限膠著，空頭動能完全枯竭，三顆星象徵黑夜中的北極星指引反轉！',
    tradingRules: [
      '確認突破第三顆十字星高點即可進場做多。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 40, close: 40, high: 30, low: 50, color: '#f59e0b' }, { open: 60, close: 60, high: 50, low: 70, color: '#f59e0b' }, { open: 45, close: 45, high: 35, low: 55, color: '#f59e0b' } ]
    }
  },
  {
    id: 'tri_star_bearish',
    name: '三星做頂 (Tri-Star Bearish)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 83,
    chineseName: '三星做頂 / 暮色三星',
    summary: '在連續上漲的高檔，由三顆十字星相連而成，中間那顆位置最高。',
    marketPsychology: '多頭在高檔連續三天衝刺無果，力量耗盡，天花板完全封死，即將迎來重大雪崩！',
    tradingRules: [
      '高檔三星是罕見的大頂部訊號，逢高出清。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [ { open: 50, close: 50, high: 40, low: 60, color: '#f59e0b' }, { open: 30, close: 30, high: 20, low: 40, color: '#f59e0b' }, { open: 45, close: 45, high: 35, low: 55, color: '#f59e0b' } ]
    }
  },
  {
    id: 'ladder_bottom',
    name: '步步高升 / 梯形底部 (Ladder Bottom)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 84,
    chineseName: '步步高升 / 梯形階梯底',
    summary: '連跌三根長黑 $\\rightarrow$ 第四天出現帶長上影線的倒槌 $\\rightarrow$ 第五天跳空大長紅拔起！',
    marketPsychology: '空頭連殺三天後遇到倒槌頑強抵抗，第五天多頭主力吹響號角大長紅跳空翻轉！',
    tradingRules: [
      '第五天跳空長紅為強力反轉確認點，全力做多。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 15, close: 35, high: 10, low: 40, color: '#10b981' },
        { open: 35, close: 55, high: 30, low: 60, color: '#10b981' },
        { open: 55, close: 75, high: 50, low: 80, color: '#10b981' },
        { open: 78, close: 72, high: 45, low: 82, color: '#ef4444' },
        { open: 65, close: 20, high: 15, low: 70, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'tower_top',
    name: '高塔頂部 / 鋪天蓋地 (Tower Top)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'very-high',
    winRate: 88,
    chineseName: '高塔頂部 / 鋪天蓋地崩塌',
    summary: '左側一根大長紅拔高 $\\rightarrow$ 中間多根小 K 棒橫盤停滯 $\\rightarrow$ 右側一根同等巨大長黑向下貫穿！',
    marketPsychology: '主力拉出高塔後在高檔橫盤偷偷出貨，散戶以為是整理，最後主力一根大長黑拆毀高塔，形成大型崩塌！',
    tradingRules: [
      '右側長黑出現時立即清倉，跌破高塔底部將引發巨大多殺多。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 75, close: 20, high: 15, low: 80, color: '#ef4444' },
        { open: 22, close: 25, high: 18, low: 30, color: '#ef4444' },
        { open: 23, close: 27, high: 19, low: 32, color: '#10b981' },
        { open: 25, close: 28, high: 20, low: 35, color: '#f59e0b' },
        { open: 25, close: 80, high: 20, low: 85, color: '#10b981' }
      ]
    }
  },
  {
    id: 'tower_bottom',
    name: '高塔底部 / 絕處逢生 (Tower Bottom)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 87,
    chineseName: '高塔底部 / 絕地高塔築底',
    summary: '左側一根大長黑殺跌 $\\rightarrow$ 中間多根小 K 棒橫盤打底 $\\rightarrow$ 右側一根同等巨大長紅拔地衝天！',
    marketPsychology: '空頭殺出深谷後無力再下，主力在谷底悄悄吸籌，最後以一根火箭長紅宣告築底完成！',
    tradingRules: [
      '右側長紅確認突破時進場，勝率極高。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 20, close: 75, high: 15, low: 80, color: '#10b981' },
        { open: 75, close: 72, high: 68, low: 80, color: '#10b981' },
        { open: 73, close: 70, high: 65, low: 78, color: '#ef4444' },
        { open: 72, close: 68, high: 64, low: 75, color: '#f59e0b' },
        { open: 70, close: 15, high: 10, low: 75, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'mat_hold',
    name: '執墊型態 (Mat Hold)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 89,
    chineseName: '執墊型態 / 超強勢多頭墊步',
    summary: '大長紅後向上跳空開出三根小綠 K，但三根小綠完全懸空浮在第一根長紅上方（跳空缺口完全不補），隨後再噴大長紅！',
    marketPsychology: '多頭最強悍的中繼結構！連回測都不願意補缺口，代表主力急迫拉抬，即將迎來主升暴衝！',
    tradingRules: [
      '比上升三法更強烈的攻擊型態，看到即可堅定加碼！'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 80, close: 45, high: 40, low: 85, color: '#ef4444' },
        { open: 35, close: 42, high: 30, low: 46, color: '#10b981' },
        { open: 38, close: 45, high: 34, low: 48, color: '#10b981' },
        { open: 40, close: 47, high: 36, low: 50, color: '#10b981' },
        { open: 42, close: 15, high: 10, low: 46, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'breakaway_gap',
    name: '突破跳空缺口 (Breakaway Gap)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'very-high',
    winRate: 90,
    chineseName: '突破缺口 / 飛龍在天',
    summary: '在長期整理平台末端，突然以跳空長紅的方式一口氣越過所有歷史反壓區，留下巨大的未補缺口。',
    marketPsychology: '主力不給任何人低價上車的機會，直接用真金白銀砸開天花板，開啟全新歷史波段！',
    tradingRules: [
      '順勢操作的黃金買點，只要缺口未被回補，一路持股抱緊。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 70, close: 65, high: 60, low: 75, color: '#ef4444' },
        { open: 66, close: 68, high: 62, low: 72, color: '#10b981' },
        { open: 45, close: 15, high: 10, low: 50, color: '#ef4444' }
      ]
    }
  },
  {
    id: 'exhaustion_gap',
    name: '竭盡缺口 (Exhaustion Gap)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 85,
    chineseName: '竭盡缺口 / 最後的狂歡',
    summary: '在連續大漲多日後，再次加速向上跳空開高，但隨後量能爆出歷史天量且當日或隔日迅速被回補。',
    marketPsychology: '散戶全部被誘多進場瘋狂追價，主力趁最後的激情將籌碼全部出清給散戶，多頭能量徹底枯竭！',
    tradingRules: [
      '高檔見天量跳空卻快速回補，應無條件全部出清避險。'
    ],
    svgConfig: {
      type: 'multi',
      bars: [
        { open: 60, close: 40, high: 35, low: 65, color: '#ef4444' },
        { open: 25, close: 18, high: 10, low: 30, color: '#ef4444' },
        { open: 18, close: 45, high: 15, low: 50, color: '#10b981' }
      ]
    }
  },
  {
    id: 'upside_tasuki_gap',
    name: '上升跳空三法 (Upside Tasuki Gap)',
    category: 'multi',
    sentiment: 'bullish',
    signalStrength: 'high',
    winRate: 82,
    chineseName: '上升跳空三法 / 踏喜缺口',
    summary: '向上跳空長紅後，隔日收出一根小綠 K 掉入缺口中，但並未完全封閉該缺口，隨後多頭再次發動上攻。',
    marketPsychology: '小拉回只是多頭暫時喘口氣，缺口依然具備強力支撐，短線洗盤完畢後將重返升途！',
    tradingRules: [
      '回測缺口不補為優質上車買點。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [
        { open: 75, close: 50, high: 45, low: 80, color: '#ef4444' },
        { open: 35, close: 18, high: 12, low: 40, color: '#ef4444' },
        { open: 22, close: 38, high: 18, low: 42, color: '#10b981' }
      ]
    }
  },
  {
    id: 'downside_tasuki_gap',
    name: '下降跳空三法 (Downside Tasuki Gap)',
    category: 'multi',
    sentiment: 'bearish',
    signalStrength: 'high',
    winRate: 83,
    chineseName: '下降跳空三法 / 踏喜反撲失敗',
    summary: '向下跳空長黑後，隔日反彈一根小紅 K 進入缺口，但未能封閉該跳空缺口，隨後再次展開大跌。',
    marketPsychology: '弱勢反彈只是逃命波，上方跳空缺口形成巨大天花板壓制，空頭攻勢遠未結束！',
    tradingRules: [
      '反彈至缺口處為最佳空點或停損點。'
    ],
    svgConfig: {
      type: 'tri',
      bars: [
        { open: 20, close: 45, high: 15, low: 50, color: '#10b981' },
        { open: 65, close: 82, high: 60, low: 88, color: '#10b981' },
        { open: 78, close: 62, high: 58, low: 82, color: '#ef4444' }
      ]
    }
  }
];
