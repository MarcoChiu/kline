import React, { useState, useEffect } from 'react';
import { Play, Plus, RotateCcw, Trash2, TrendingUp, Info, Sparkles, X } from 'lucide-react';
import { PatternSVG } from './PatternEncyclopedia';
import { getPatternSimulatorCandles } from '../data/klinePatterns';

export default function InteractiveCanvas({ loadedPattern, onClearLoadedPattern }) {
  const [candles, setCandles] = useState([
    { open: 70, close: 35, high: 28, low: 75, color: '#ef4444' }, // 紅 K
    { open: 36, close: 50, high: 32, low: 55, color: '#10b981' }, // 小綠 K
    { open: 50, close: 62, high: 45, low: 68, color: '#10b981' }, // 小綠 K
    { open: 60, close: 20, high: 15, low: 65, color: '#ef4444' }  // 長紅突破
  ]);

  // 當從百科帶入特定型態時，自動載入該型態之 K 棒
  useEffect(() => {
    if (loadedPattern) {
      const pCandles = getPatternSimulatorCandles(loadedPattern);
      if (pCandles.length > 0) {
        setCandles(pCandles);
      }
    }
  }, [loadedPattern]);

  const [detectedSimPattern, setDetectedSimPattern] = useState('上升三法 (中繼續漲型態)');

  // 新增紅 K
  const addBullCandle = () => {
    setCandles(prev => [...prev, { open: 60, close: 25, high: 20, low: 65, color: '#ef4444' }]);
  };

  // 新增綠 K
  const addBearCandle = () => {
    setCandles(prev => [...prev, { open: 25, close: 65, high: 20, low: 70, color: '#10b981' }]);
  };

  // 新增十字星
  const addDoji = () => {
    setCandles(prev => [...prev, { open: 45, close: 45, high: 20, low: 75, color: '#f59e0b' }]);
  };

  // 撤銷最後一根
  const handleUndo = () => {
    setCandles(prev => prev.slice(0, -1));
  };

  // 清空
  const handleClearAll = () => {
    setCandles([]);
  };

  // 重設為經典上升三法
  const handleReset = () => {
    setCandles([
      { open: 70, close: 35, high: 28, low: 75, color: '#ef4444' },
      { open: 36, close: 50, high: 32, low: 55, color: '#10b981' },
      { open: 50, close: 62, high: 45, low: 68, color: '#10b981' },
      { open: 60, close: 20, high: 15, low: 65, color: '#ef4444' }
    ]);
  };

  // 實時形態診斷演算法
  const getDiagnosticInfo = () => {
    const len = candles.length;
    if (len === 0) {
      return {
        name: '畫布空白，請點擊上方按鈕插入 K 棒',
        winRate: '--',
        sentiment: 'neutral',
        summary: '您可以隨意組合單 K、雙 K 或多 K 形態，實時查看多空力量物理學反應。'
      };
    }

    const last = candles[len - 1];
    const prev = len >= 2 ? candles[len - 2] : null;
    const prev2 = len >= 3 ? candles[len - 3] : null;

    // 判斷最後一根是否為十字星
    if (Math.abs(last.open - last.close) <= 5) {
      return {
        name: '長十字星 (變盤猶豫訊號)',
        winRate: '72%',
        sentiment: 'neutral',
        summary: '多空力量在此陷入僵局，上下引線拉鋸劇烈，通常代表原有走勢即將面臨方向大轉折。'
      };
    }

    // 判斷三 K 組合
    if (len >= 3 && prev && prev2) {
      // 連三紅 (紅三兵)
      if (last.color === '#ef4444' && prev.color === '#ef4444' && prev2.color === '#ef4444') {
        return {
          name: '紅三兵 (強勢攻堅型態)',
          winRate: '85%',
          sentiment: 'bullish',
          summary: '連續三日實體紅 K 步步高升，買盤力量源源不絕，主力發動波段主升段！'
        };
      }
      // 連三黑 (三隻烏鴉)
      if (last.color === '#10b981' && prev.color === '#10b981' && prev2.color === '#10b981') {
        return {
          name: '三隻烏鴉 (連續破底型態)',
          winRate: '86%',
          sentiment: 'bearish',
          summary: '連續三日長黑殺跌破低，空方壓倒性主導，多頭應果斷停損出場。'
        };
      }
      // 晨星 (綠 -> 星 -> 紅)
      if (prev2.color === '#10b981' && last.color === '#ef4444') {
        return {
          name: '早晨之星 (破曉反轉型態)',
          winRate: '86%',
          sentiment: 'bullish',
          summary: '殺跌後獲得支撐並以長紅拔起，經典底部三大形態之王！'
        };
      }
    }

    // 判斷雙 K 組合
    if (len >= 2 && prev) {
      // 陽包陰 (多頭吞噬)
      if (prev.color === '#10b981' && last.color === '#ef4444' && last.open >= prev.close && last.close <= prev.open) {
        return {
          name: '多頭吞噬 (強烈止跌起漲)',
          winRate: '84%',
          sentiment: 'bullish',
          summary: '今日長紅一口吞噬昨日長黑，多頭大軍全面吹響反攻號角！'
        };
      }
      // 陰包陽 (空頭吞噬)
      if (prev.color === '#ef4444' && last.color === '#10b981' && last.open <= prev.close && last.close >= prev.open) {
        return {
          name: '空頭吞噬 (高檔烏雲斷頭)',
          winRate: '85%',
          sentiment: 'bearish',
          summary: '今日長黑完全吞沒昨日長紅，主力高檔無情倒貨，宜迅速停利逃命。'
        };
      }
    }

    // 單 K 判斷
    if (last.color === '#ef4444') {
      return {
        name: '大陽線 / 多方掌控攻擊',
        winRate: '78%',
        sentiment: 'bullish',
        summary: '長紅實體飽滿，買方從頭到尾掌控盤面，氣勢強勁。'
      };
    } else {
      return {
        name: '大陰線 / 空方壓制整理',
        winRate: '80%',
        sentiment: 'bearish',
        summary: '實體收黑，盤面遭遇獲利了結賣壓，向下尋求支撐防守。'
      };
    }
  };

  const diag = getDiagnosticInfo();

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '20px 0' }}>
      {/* 若有從百科載入形態，顯示演練提示條 */}
      {loadedPattern && (
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#60a5fa" />
            <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
              正在演練百科型態：<strong style={{ color: '#93c5fd' }}>【{loadedPattern.name}】</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                （位階：{loadedPattern.locationType || '實戰起漲'}，勝率 {loadedPattern.winRate}%）
              </span>
            </span>
          </div>
          {onClearLoadedPattern && (
            <button
              onClick={onClearLoadedPattern}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={14} /> 退出此型態演練
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} color="#3b82f6" />
            <span>K 棒模擬測試畫板</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            自由組合排列 K 棒，實時驗證不同 K 棒組合所產生的多空力道與形態反應
          </p>
        </div>

        {/* 控制按鈕 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={addBullCandle} className="btn-secondary" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem' }}>
            <Plus size={15} /> 插入紅 K
          </button>
          <button onClick={addBearCandle} className="btn-secondary" style={{ color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)', fontSize: '0.85rem' }}>
            <Plus size={15} /> 插入綠 K
          </button>
          <button onClick={addDoji} className="btn-secondary" style={{ color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)', fontSize: '0.85rem' }}>
            <Plus size={15} /> 插入十字星
          </button>
          {candles.length > 0 && (
            <button onClick={handleUndo} className="btn-secondary" style={{ fontSize: '0.85rem', color: '#cbd5e1' }} title="撤銷最後一根 K 棒">
              撤銷
            </button>
          )}
          <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RotateCcw size={15} /> 範例重設
          </button>
          {candles.length > 0 && (
            <button onClick={handleClearAll} className="btn-secondary" style={{ fontSize: '0.85rem', color: '#f87171' }}>
              <Trash2 size={15} /> 清空
            </button>
          )}
        </div>
      </div>

      {/* 畫板展示區 */}
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '30px 20px', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
        {candles.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>畫布已清空，請點擊上方按鈕插入 K 棒開始模擬</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {candles.map((candle, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <PatternSVG config={{ type: 'single', ...candle }} width={55} height={130} />
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>T+{idx + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 模擬診斷結果 */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={20} color="#60a5fa" />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: '600' }}>即時模擬組合判定：</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
              {diag.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {diag.summary}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#f8fafc', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
          預估成真/反轉勝率：<strong style={{ color: diag.sentiment === 'bullish' ? '#ef4444' : diag.sentiment === 'bearish' ? '#10b981' : '#f59e0b' }}>{diag.winRate}</strong>
        </div>
      </div>

    </div>
  );
}
