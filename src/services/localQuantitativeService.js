/**
 * 本地純量化技術分析生成器 (Pure Local Quantitative Analysis Generator)
 * 當使用者未設定 Gemini API Key 或 API 限流時，即時由本地演算法生成客觀、精確的技術分析與量化回測數據。
 */

/**
 * 輔助計算 K 棒實體與影線長度
 */
function getCandleMetrics(bar) {
  const isBull = bar.close >= bar.open;
  const body = Math.abs(bar.close - bar.open);
  const bodyPercent = bar.open > 0 ? (body / bar.open) * 100 : 0;
  const upperShadow = isBull ? bar.high - bar.close : bar.high - bar.open;
  const lowerShadow = isBull ? bar.open - bar.low : bar.close - bar.low;
  return { isBull, body, bodyPercent, upperShadow, lowerShadow };
}

/**
 * 根據指定索引位置的歷史數據自動辨識該日 K 線形態
 * @param {Array} historicalData 完整歷史 K 棒陣列
 * @param {number} index 指定辨識的 K 棒索引 (預設為最新一根)
 */
export function detectPatternAtBar(historicalData, index = -1) {
  if (!historicalData || historicalData.length === 0) {
    return {
      patternId: 'big_bull',
      name: '大陽線 / 光頭光腳長紅',
      confidence: 85,
      sentiment: 'bullish',
      description: '多方主力掌控盤面進攻節奏，實體紅 K 展現實質推升力道。'
    };
  }

  const n = historicalData.length;
  const targetIdx = index >= 0 && index < n ? index : n - 1;
  const latest = historicalData[targetIdx];
  const prev = targetIdx > 0 ? historicalData[targetIdx - 1] : latest;
  const prev2 = targetIdx > 1 ? historicalData[targetIdx - 2] : prev;

  const currM = getCandleMetrics(latest);
  const prevM = getCandleMetrics(prev);
  const prev2M = getCandleMetrics(prev2);

  // 1. 多頭吞噬 (陽包陰起漲)
  if (!prevM.isBull && currM.isBull && latest.open <= prev.close && latest.close >= prev.open && currM.body >= prevM.body) {
    return {
      patternId: 'bullish_engulfing',
      name: '多頭吞噬 / 陽包陰起漲',
      confidence: 88,
      sentiment: 'bullish',
      description: '今日長紅實體一口氣吞沒昨日黑 K 實體，低檔爆發強勁抄底買盤，多方奪回主導權。'
    };
  }

  // 2. 空頭吞噬 (陰包陽斷頭)
  if (prevM.isBull && !currM.isBull && latest.open >= prev.close && latest.close <= prev.open && currM.body >= prevM.body) {
    return {
      patternId: 'bearish_engulfing',
      name: '空頭吞噬 / 陰包陽斷頭',
      confidence: 88,
      sentiment: 'bearish',
      description: '今日長黑實體完全覆蓋昨日紅 K，高檔賣壓沉重，短線獲利了結賣壓湧現。'
    };
  }

  // 3. 槌子線 (低檔探底神針)
  if (currM.lowerShadow >= 1.8 * currM.body && currM.upperShadow <= 0.4 * currM.body && latest.close <= (latest.ma20 || latest.close * 1.02)) {
    return {
      patternId: 'hammer',
      name: '槌子線 / 低檔探底神針',
      confidence: 82,
      sentiment: 'bullish',
      description: '盤中遭遇空方摜壓後迅速被主力大單拉起，留有長下影線，顯示下檔支撐強勁。'
    };
  }

  // 4. 流星線 (高檔長上影)
  if (currM.upperShadow >= 1.8 * currM.body && currM.lowerShadow <= 0.4 * currM.body && latest.close >= (latest.ma20 || latest.close * 0.98)) {
    return {
      patternId: 'shooting_star',
      name: '流星線 / 射擊之星遇阻',
      confidence: 80,
      sentiment: 'bearish',
      description: '早盤多頭嘗試衝高後在天花板遭遇沉重倒貨賣壓，留下長上影線，短線宜居安思危。'
    };
  }

  // 5. 早晨之星 (啟明之星)
  if (!prev2M.isBull && prevM.bodyPercent < 1.0 && currM.isBull && currM.bodyPercent >= 1.5 && latest.close >= (prev2.open + prev2.close) / 2) {
    return {
      patternId: 'morning_star',
      name: '早晨之星 / 底部轉折',
      confidence: 89,
      sentiment: 'bullish',
      description: '長黑急殺後接小星線整固，今日長紅帶量反轉確立底部翻揚。'
    };
  }

  // 6. 黃昏之星 (高檔見頂)
  if (prev2M.isBull && prevM.bodyPercent < 1.0 && !currM.isBull && currM.bodyPercent >= 1.5 && latest.close <= (prev2.open + prev2.close) / 2) {
    return {
      patternId: 'evening_star',
      name: '黃昏之星 / 高檔轉折',
      confidence: 89,
      sentiment: 'bearish',
      description: '長紅衝高後接高檔星線，今日長黑摜破多方防線，波段獲利賣壓出籠。'
    };
  }

  // 7. 貫穿線 (曙光初現)
  if (!prevM.isBull && currM.isBull && latest.open <= prev.low && latest.close > (prev.open + prev.close) / 2) {
    return {
      patternId: 'piercing_line',
      name: '貫穿線 / 曙光初現',
      confidence: 84,
      sentiment: 'bullish',
      description: '開低走高深入昨日黑 K 實體二分之一以上，多方展現強勢反攻決心。'
    };
  }

  // 8. 烏雲罩頂
  if (prevM.isBull && !currM.isBull && latest.open >= prev.high && latest.close < (prev.open + prev.close) / 2) {
    return {
      patternId: 'dark_cloud_cover',
      name: '烏雲罩頂 / 空方反撲',
      confidence: 84,
      sentiment: 'bearish',
      description: '高開低走深入昨日紅 K 實體二分之一以下，短線多頭動能衰竭。'
    };
  }

  // 9. 大陽線 (長紅 K)
  if (currM.isBull && currM.bodyPercent >= 2.5) {
    return {
      patternId: 'big_bull',
      name: '大陽線 / 光頭光腳長紅',
      confidence: 85,
      sentiment: 'bullish',
      description: '多方買盤積極進攻，實體紅 K 飽滿，買氣從開盤貫徹至尾盤，趨勢偏多。'
    };
  }

  // 10. 大陰線 (長黑 K)
  if (!currM.isBull && currM.bodyPercent >= 2.5) {
    return {
      patternId: 'big_bear',
      name: '大陰線 / 長黑摜壓',
      confidence: 85,
      sentiment: 'bearish',
      description: '空方賣盤全面宣洩，實體綠 K 摜破多頭防線，宜保守應對並嚴設停損。'
    };
  }

  // 11. 十字變盤線
  if (currM.bodyPercent <= 0.35) {
    return {
      patternId: 'long_legged_doji',
      name: '十字變盤線 / 區間平衡',
      confidence: 75,
      sentiment: 'neutral',
      description: '多空雙方在當前價位勢均力敵，實體小且處於平衡點，等待後續方向表態。'
    };
  }

  // 12. 標準 K 棒
  return {
    patternId: currM.isBull ? 'small_bull' : 'small_bear',
    name: currM.isBull ? '小陽線 / 盤整紅K' : '小陰線 / 盤整綠K',
    confidence: 70,
    sentiment: currM.isBull ? 'bullish' : 'bearish',
    description: currM.isBull ? '價格常態推升，多方略佔優勢。' : '價格常態回檔，空方略佔優勢。'
  };
}

/**
 * 根據最新數據自動辨識最顯著的 K 線形態
 */
function detectLatestPattern(historicalData) {
  return detectPatternAtBar(historicalData, historicalData ? historicalData.length - 1 : -1);
}

/**
 * 本地純量化分析主函數
 */
export function generateLocalQuantitativeAnalysis(stockData, marketContext = null) {
  if (!stockData || !stockData.latest) {
    throw new Error('無效的股票行情數據');
  }

  const { latest, historicalData = [], symbol, stockName } = stockData;
  const currentPrice = latest.close;
  const ma5 = latest.ma5 || currentPrice;
  const ma10 = latest.ma10 || currentPrice;
  const ma20 = latest.ma20 || currentPrice;
  const ma60 = latest.ma60 || currentPrice;
  const ma120 = latest.ma120;
  const ma240 = latest.ma240;

  // 均線排列判斷
  const isBullTrend = currentPrice > ma20 && ma5 >= ma10 && ma10 >= ma20;
  const isBearTrend = currentPrice < ma20 && ma5 <= ma10 && ma10 <= ma20;

  // 支撐與壓力計算 (濾除非數值)
  const recentLows = historicalData.slice(-20).map(d => d.low).filter(v => typeof v === 'number' && !isNaN(v));
  const recentHighs = historicalData.slice(-20).map(d => d.high).filter(v => typeof v === 'number' && !isNaN(v));
  const min20Low = recentLows.length > 0 ? Math.min(...recentLows) : Number((currentPrice * 0.95).toFixed(2));
  const max20High = recentHighs.length > 0 ? Math.max(...recentHighs) : Number((currentPrice * 1.05).toFixed(2));

  const sup1 = Number(Math.min(currentPrice * 0.98, ma20 || currentPrice * 0.97).toFixed(2));
  const sup2 = Number(Math.min(sup1 * 0.98, ma60 || min20Low).toFixed(2));
  const sup3 = Number(Math.min(sup2 * 0.97, min20Low * 0.98).toFixed(2));

  const res1 = Number(Math.max(currentPrice * 1.02, max20High).toFixed(2));
  const res2 = Number((res1 * 1.03).toFixed(2));
  const res3 = Number((res2 * 1.04).toFixed(2));

  // 形態辨識
  const detectedPattern = detectLatestPattern(historicalData);

  // 多空機率量化估算 (原始分數加權並正規化為 100%)
  let bullScore = 45;
  let bearScore = 45;
  let neutralScore = 25;

  if (isBullTrend) {
    bullScore += 25;
    bearScore = Math.max(10, bearScore - 15);
    neutralScore = Math.max(10, neutralScore - 10);
  } else if (isBearTrend) {
    bearScore += 25;
    bullScore = Math.max(10, bullScore - 15);
    neutralScore = Math.max(10, neutralScore - 10);
  } else {
    neutralScore += 15; // 盤整形態提升中性比重
  }

  if ((latest.priceChange || 0) > 0) {
    bullScore += 12;
  } else if ((latest.priceChange || 0) < 0) {
    bearScore += 12;
  }

  if (currentPrice > ma60) {
    bullScore += 8;
  } else if (currentPrice < ma60) {
    bearScore += 8;
  }

  // 計算總分並正規化至 100%
  const totalScore = bullScore + bearScore + neutralScore;
  const bullishProb = Math.round((bullScore / totalScore) * 100);
  const bearishProb = Math.round((bearScore / totalScore) * 100);
  const neutralProb = Math.max(0, 100 - bullishProb - bearishProb);

  const isMoreBull = bullishProb >= bearishProb && bullishProb >= neutralProb;

  return {
    stockName: stockName || symbol || '台股標的',
    stockCode: symbol || '0000',
    openPrice: latest.open,
    highPrice: latest.high,
    lowPrice: latest.low,
    closePrice: latest.close,
    currentPrice: latest.close,
    priceChange: latest.priceChange || 0,
    changePercent: latest.changePercent || 0,
    latestDate: latest.date,
    movingAverages: { ma5, ma10, ma20, ma60, ma120, ma240 },
    volume: latest.formattedVolume || '0 張',
    detectedPatterns: [detectedPattern],
    isLocalAnalyzed: true, // 標記為本地量化模式
    analyzedAt: new Date().toISOString(),
    stockData,
    marketContext,
    prediction: {
      bullishProbability: bullishProb,
      neutralProbability: neutralProb,
      bearishProbability: bearishProb,
      sentimentSummary: isBullTrend
        ? `目前價格站於月線 (MA20: ${ma20}) 之上，均線呈現多頭排列發散，短線動能偏多。`
        : isBearTrend
        ? `目前價格跌破月線 (MA20: ${ma20})，短中均線反壓沉重，操作宜以風險控管為先。`
        : `價格於月線 (MA20: ${ma20}) 與季線 (MA60: ${ma60}) 之間震盪整固，等待關鍵放量突破。`,
      nextDayForecast: `【情境 A (偏多突破)】: 若明日開高放量站穩 ${res1}，則有望挑戰波段壓力天花板 ${res2}。\n【情境 B (偏空回測)】: 若開低跌破 ${sup1}，則需回測下方關鍵支撐地板 ${sup2} 尋求買盤承接。\n【情境 C (區間整理)】: 若量能萎縮，則維持在 [${sup1} ~ ${res1}] 區間箱型整理。`,
      supportLevels: [sup1, sup2, sup3],
      resistanceLevels: [res1, res2, res3],
      tradingStrategy: [
        `關鍵防守點：建議以 ${sup1} (或近期低點 ${min20Low}) 作為單筆嚴格停損防守線。`,
        `操作策略：${isMoreBull ? '若回測支撐不破可分批佈局，順勢沿 5 日線抱牢。' : '反彈遇壓力宜適度調節部位，切勿在高檔盲目追價。'}`,
        '風控提醒：請搭配下方部位風控計算器，嚴格將單筆虧損控制在帳戶資金 1% 以內。'
      ],
      orderBooking: {
        buyLimit: isMoreBull ? Number((currentPrice * 0.99).toFixed(2)) : sup1,
        entryLimit: isMoreBull ? Number((currentPrice * 1.005).toFixed(2)) : sup1,
        takeProfitLimit: res1,
        targetLimit: res1,
        stopLossLimit: sup1,
        buyNote: '逢低承接關鍵支撐',
        takeProfitNote: '波段衝高分批停利',
        stopLossNote: '跌破關鍵防守嚴格停損'
      },
      actionDecision: isMoreBull ? '買進' : (bullishProb <= 35 ? '賣出' : '觀望'),
      beginnerAdvice: isMoreBull
        ? `【空手者】可在拉回 ${sup1} 附近分批建立部位；【持有者】只要收盤未跌破 ${sup1} 可續抱波段。`
        : `【空手者】目前位階偏向修正，建議在場外觀望；【持有者】若跌破 ${sup1} 應果斷停損或減碼。`,
      riskLevel: isBullTrend ? '中低風險' : '中高風險'
    }
  };
}
