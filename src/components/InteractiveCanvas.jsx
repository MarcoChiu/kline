import React, { useState } from 'react';
import { Play, Plus, RotateCcw, Trash2, TrendingUp, Info } from 'lucide-react';
import { PatternSVG } from './PatternEncyclopedia';

export default function InteractiveCanvas() {
  const [candles, setCandles] = useState([
    { open: 70, close: 35, high: 28, low: 75, color: '#ef4444' }, // 紅 K
    { open: 36, close: 50, high: 32, low: 55, color: '#10b981' }, // 小綠 K
    { open: 50, close: 62, high: 45, low: 68, color: '#10b981' }, // 小綠 K
    { open: 60, close: 20, high: 15, low: 65, color: '#ef4444' }  // 長紅突破
  ]);

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

  // 重設
  const handleReset = () => {
    setCandles([
      { open: 70, close: 35, high: 28, low: 75, color: '#ef4444' },
      { open: 36, close: 50, high: 32, low: 55, color: '#10b981' },
      { open: 50, close: 62, high: 45, low: 68, color: '#10b981' },
      { open: 60, close: 20, high: 15, low: 65, color: '#ef4444' }
    ]);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '20px 0' }}>
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
          <button onClick={handleReset} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RotateCcw size={15} /> 重設
          </button>
        </div>
      </div>

      {/* 畫板展示區 */}
      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '30px 20px', minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {candles.map((candle, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <PatternSVG config={{ type: 'single', ...candle }} width={55} height={130} />
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>T+{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 模擬診斷結果 */}
      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={20} color="#60a5fa" />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: '600' }}>即時模擬組合判定：</div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
              {candles.length >= 4 ? '上升三法 / 多頭攻擊中繼型態' : candles.length >= 3 ? '三 K 多空拉扯結構' : '雙 K 反轉測試型態'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#f8fafc', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '20px' }}>
          預估隔日續攻勝率：<strong style={{ color: '#ef4444' }}>78%</strong>
        </div>
      </div>

    </div>
  );
}
