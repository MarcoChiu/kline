/**
 * 本地確定性量化回測引擎 (Deterministic K-Line Pattern Backtest Engine)
 * 針對個股近 2 年 (~500 根) 完整歷史 K 棒，進行客觀、可重現的訊號掃描與後續勝率/盈虧比驗證。
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
 * 確定性形態偵測條件庫
 */
const PATTERN_DETECTORS = {
  // 1. 大陽線 (長紅 K)
  big_bull: (bars, i) => {
    if (i < 0) return false;
    const { isBull, bodyPercent, upperShadow, body } = getCandleMetrics(bars[i]);
    return isBull && bodyPercent >= 3.0 && (upperShadow / (body || 1)) <= 0.4;
  },

  // 2. 大陰線 (長黑 K)
  big_bear: (bars, i) => {
    if (i < 0) return false;
    const { isBull, bodyPercent, lowerShadow, body } = getCandleMetrics(bars[i]);
    return !isBull && bodyPercent >= 3.0 && (lowerShadow / (body || 1)) <= 0.4;
  },

  // 3. 槌子線 (低檔探底長下影)
  hammer: (bars, i) => {
    if (i < 3) return false;
    const curr = getCandleMetrics(bars[i]);
    const isDip = bars[i].close <= (bars[i].ma20 || bars[i].close * 1.02);
    return isDip && curr.lowerShadow >= 1.8 * curr.body && curr.upperShadow <= 0.5 * curr.body;
  },

  // 4. 流星線 (高檔長上影)
  shooting_star: (bars, i) => {
    if (i < 3) return false;
    const curr = getCandleMetrics(bars[i]);
    const isHigh = bars[i].close >= (bars[i].ma20 || bars[i].close * 0.98);
    return isHigh && curr.upperShadow >= 1.8 * curr.body && curr.lowerShadow <= 0.5 * curr.body;
  },

  // 5. 多頭吞噬
  bullish_engulfing: (bars, i) => {
    if (i < 1) return false;
    const prev = getCandleMetrics(bars[i - 1]);
    const curr = getCandleMetrics(bars[i]);
    return (
      !prev.isBull &&
      curr.isBull &&
      bars[i].open <= bars[i - 1].close &&
      bars[i].close >= bars[i - 1].open &&
      curr.body >= prev.body
    );
  },

  // 6. 空頭吞噬
  bearish_engulfing: (bars, i) => {
    if (i < 1) return false;
    const prev = getCandleMetrics(bars[i - 1]);
    const curr = getCandleMetrics(bars[i]);
    return (
      prev.isBull &&
      !curr.isBull &&
      bars[i].open >= bars[i - 1].close &&
      bars[i].close <= bars[i - 1].open &&
      curr.body >= prev.body
    );
  },

  // 7. 貫穿線 / 曙光初現
  piercing_line: (bars, i) => {
    if (i < 1) return false;
    const prev = getCandleMetrics(bars[i - 1]);
    const curr = getCandleMetrics(bars[i]);
    const prevMid = (bars[i - 1].open + bars[i - 1].close) / 2;
    return !prev.isBull && curr.isBull && bars[i].open < bars[i - 1].low && bars[i].close > prevMid && bars[i].close < bars[i - 1].open;
  },

  // 8. 烏雲罩頂
  dark_cloud_cover: (bars, i) => {
    if (i < 1) return false;
    const prev = getCandleMetrics(bars[i - 1]);
    const curr = getCandleMetrics(bars[i]);
    const prevMid = (bars[i - 1].open + bars[i - 1].close) / 2;
    return prev.isBull && !curr.isBull && bars[i].open > bars[i - 1].high && bars[i].close < prevMid && bars[i].close > bars[i - 1].open;
  },

  // 9. 早晨之星
  morning_star: (bars, i) => {
    if (i < 2) return false;
    const first = getCandleMetrics(bars[i - 2]);
    const second = getCandleMetrics(bars[i - 1]);
    const third = getCandleMetrics(bars[i]);
    return !first.isBull && first.bodyPercent >= 1.8 && second.bodyPercent < 1.5 && third.isBull && bars[i].close >= (bars[i - 2].open + bars[i - 2].close) / 2;
  },

  // 10. 黃昏之星
  evening_star: (bars, i) => {
    if (i < 2) return false;
    const first = getCandleMetrics(bars[i - 2]);
    const second = getCandleMetrics(bars[i - 1]);
    const third = getCandleMetrics(bars[i]);
    return first.isBull && first.bodyPercent >= 1.8 && second.bodyPercent < 1.5 && !third.isBull && bars[i].close <= (bars[i - 2].open + bars[i - 2].close) / 2;
  },

  // 11. 紅三兵
  three_white_soldiers: (bars, i) => {
    if (i < 2) return false;
    const b0 = getCandleMetrics(bars[i - 2]);
    const b1 = getCandleMetrics(bars[i - 1]);
    const b2 = getCandleMetrics(bars[i]);
    return (
      b0.isBull && b1.isBull && b2.isBull &&
      bars[i - 1].close > bars[i - 2].close &&
      bars[i].close > bars[i - 1].close &&
      b0.bodyPercent >= 1.2 && b1.bodyPercent >= 1.2 && b2.bodyPercent >= 1.2
    );
  },

  // 12. 三隻烏鴉
  three_black_crows: (bars, i) => {
    if (i < 2) return false;
    const b0 = getCandleMetrics(bars[i - 2]);
    const b1 = getCandleMetrics(bars[i - 1]);
    const b2 = getCandleMetrics(bars[i]);
    return (
      !b0.isBull && !b1.isBull && !b2.isBull &&
      bars[i - 1].close < bars[i - 2].close &&
      bars[i].close < bars[i - 1].close &&
      b0.bodyPercent >= 1.2 && b1.bodyPercent >= 1.2 && b2.bodyPercent >= 1.2
    );
  }
};

/**
 * 依據 patternId 或名稱關鍵字尋找匹配的檢測器
 */
function resolveDetector(patternId, patternName = '') {
  if (patternId && PATTERN_DETECTORS[patternId]) {
    return { id: patternId, detect: PATTERN_DETECTORS[patternId] };
  }

  const name = patternName.toLowerCase();
  if (name.includes('陽線') || name.includes('長紅') || name.includes('光頭')) {
    return { id: 'big_bull', detect: PATTERN_DETECTORS.big_bull };
  }
  if (name.includes('陰線') || name.includes('長黑') || name.includes('長綠')) {
    return { id: 'big_bear', detect: PATTERN_DETECTORS.big_bear };
  }
  if (name.includes('槌') || name.includes('探底')) {
    return { id: 'hammer', detect: PATTERN_DETECTORS.hammer };
  }
  if (name.includes('流星') || name.includes('射擊')) {
    return { id: 'shooting_star', detect: PATTERN_DETECTORS.shooting_star };
  }
  if (name.includes('多頭吞噬') || name.includes('陽包陰')) {
    return { id: 'bullish_engulfing', detect: PATTERN_DETECTORS.bullish_engulfing };
  }
  if (name.includes('空頭吞噬') || name.includes('陰包陽')) {
    return { id: 'bearish_engulfing', detect: PATTERN_DETECTORS.bearish_engulfing };
  }
  if (name.includes('貫穿') || name.includes('曙光')) {
    return { id: 'piercing_line', detect: PATTERN_DETECTORS.piercing_line };
  }
  if (name.includes('烏雲')) {
    return { id: 'dark_cloud_cover', detect: PATTERN_DETECTORS.dark_cloud_cover };
  }
  if (name.includes('早晨') || name.includes('晨星')) {
    return { id: 'morning_star', detect: PATTERN_DETECTORS.morning_star };
  }
  if (name.includes('黃昏') || name.includes('夜星')) {
    return { id: 'evening_star', detect: PATTERN_DETECTORS.evening_star };
  }
  if (name.includes('紅三兵') || name.includes('連三紅')) {
    return { id: 'three_white_soldiers', detect: PATTERN_DETECTORS.three_white_soldiers };
  }
  if (name.includes('烏鴉') || name.includes('連三黑')) {
    return { id: 'three_black_crows', detect: PATTERN_DETECTORS.three_black_crows };
  }

  // 預設 fallback (強勢實體攻擊)
  return { id: 'big_bull', detect: PATTERN_DETECTORS.big_bull };
}

/**
 * 執行個股歷史資料完整回測
 * @param {Array} fullHistory - 個股全部歷史 K 棒 (~500 根)
 * @param {string} patternId - 形態 ID
 * @param {string} patternName - 形態中文名稱
 * @param {string} sentiment - 'bullish' | 'bearish' (多空預設方向)
 */
export function runPatternBacktest(fullHistory, patternId, patternName = '', sentiment = 'bullish') {
  if (!fullHistory || !Array.isArray(fullHistory) || fullHistory.length < 30) {
    return null;
  }

  const { id: resolvedId, detect } = resolveDetector(patternId, patternName);
  const totalBars = fullHistory.length;
  const occurrences = [];

  // 掃描歷史 (預留最近 1 根作為當前進行中 K 棒，不計入已完結回測樣本)
  for (let i = 2; i < totalBars - 1; i++) {
    if (detect(fullHistory, i)) {
      occurrences.push(i);
    }
  }

  const sampleCount = occurrences.length;
  if (sampleCount === 0) {
    return {
      patternId: resolvedId,
      sampleCount: 0,
      totalBarsAnalyzed: totalBars,
      message: '過去 2 年中該個股未出現完全符合此嚴格定義之歷史樣本。'
    };
  }

  const holdingPeriods = [1, 3, 5, 10];
  const isBull = sentiment === 'bullish';
  const periodStats = {};

  holdingPeriods.forEach((period) => {
    const returns = [];
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let maxWin = -Infinity;
    let maxLoss = Infinity;

    occurrences.forEach((idx) => {
      // 確保有未來的 K 棒可供評估
      const exitIdx = Math.min(totalBars - 1, idx + period);
      if (exitIdx <= idx) return;

      const entryPrice = fullHistory[idx].close;
      const exitPrice = fullHistory[exitIdx].close;
      
      // 計算多空報酬率
      let retPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
      if (!isBull) {
        retPercent = -retPercent; // 偏空操作，跌為賺
      }

      returns.push(retPercent);

      if (retPercent > 0) {
        wins++;
        grossProfit += retPercent;
      } else if (retPercent < 0) {
        losses++;
        grossLoss += Math.abs(retPercent);
      }

      if (retPercent > maxWin) maxWin = retPercent;
      if (retPercent < maxLoss) maxLoss = retPercent;
    });

    const evaluatedCount = returns.length;
    const winRate = evaluatedCount > 0 ? Number(((wins / evaluatedCount) * 100).toFixed(1)) : 0;
    const avgReturn = evaluatedCount > 0 ? Number((returns.reduce((a, b) => a + b, 0) / evaluatedCount).toFixed(2)) : 0;
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 99.9 : 0);

    periodStats[`${period}D`] = {
      periodDays: period,
      evaluatedCount,
      wins,
      losses,
      winRate,
      avgReturn,
      profitFactor,
      maxWin: maxWin !== -Infinity ? Number(maxWin.toFixed(2)) : 0,
      maxLoss: maxLoss !== Infinity ? Number(maxLoss.toFixed(2)) : 0
    };
  });

  // 取得最新 3 次歷史發生的日期
  const recentOccurrenceDates = occurrences.slice(-3).map(idx => fullHistory[idx].date);

  return {
    patternId: resolvedId,
    sampleCount,
    totalBarsAnalyzed: totalBars,
    sentiment,
    isBullishStrategy: isBull,
    periods: periodStats,
    recentOccurrenceDates
  };
}
