import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BarChart2, Globe, Layers, Info } from 'lucide-react';

export default function StockInput({ onStockSubmit, isAnalyzing }) {
  const [stockCode, setStockCode] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState(null); // null | 'tw' | 'us'
  const [includeUS, setIncludeUS] = useState(() => {
    try {
      const saved = localStorage.getItem('kline_include_us');
      return saved !== null ? saved === 'true' : true; // 預設勾選 (true)
    } catch {
      return true;
    }
  });
  const [includeFutures, setIncludeFutures] = useState(() => {
    try {
      const saved = localStorage.getItem('kline_include_futures');
      return saved !== null ? saved === 'true' : true; // 預設勾選 (true)
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kline_include_us', includeUS.toString());
    } catch (e) {
      // 忽略無效儲存
    }
  }, [includeUS]);

  useEffect(() => {
    try {
      localStorage.setItem('kline_include_futures', includeFutures.toString());
    } catch (e) {
      // 忽略無效儲存
    }
  }, [includeFutures]);

  const handleSubmit = () => {
    if (stockCode.trim() && !isAnalyzing) {
      onStockSubmit(stockCode.trim(), { includeUS, includeFutures });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} color="#3b82f6" />
            <span>K 線圖表智能分析</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            輸入股號由系統自動抓取歷史數據，進行客觀的量化與籌碼分析。支援上市 (.TW) 與上櫃 (.TWO)。
          </p>
        </div>
      </div>

      {/* 核心輸入區：輸入台股代號自動分析 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(59, 130, 246, 0.08)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={18} color="#60a5fa" />
            輸入股號自動分析：
          </div>
          <div style={{ display: 'flex', gap: '8px', flex: '1 1 240px', minWidth: 0, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="輸入台股代號 (如 2330, 8069)"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              disabled={isAnalyzing}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '1.05rem',
                flex: '1 1 120px',
                minWidth: 0,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              disabled={!stockCode.trim() || isAnalyzing}
              onClick={handleSubmit}
              className="btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '0.95rem',
                opacity: (!stockCode.trim() || isAnalyzing) ? 0.5 : 1,
                cursor: (!stockCode.trim() || isAnalyzing) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
            >
              {isAnalyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={16} className="animate-spin-custom" /> 處理中...
                </span>
              ) : (
                '✨ 自動抓取並分析'
              )}
            </button>
          </div>
        </div>

        {/* 跨市場輔助判斷勾選區 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>
            跨市場輔助判斷：
          </span>

          {/* 1. 台股期指與大盤 (放前面) */}
          <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setHoveredTooltip('tw')}
            onMouseLeave={() => setHoveredTooltip(null)}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: includeFutures ? '#a78bfa' : '#94a3b8', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={includeFutures}
                onChange={(e) => setIncludeFutures(e.target.checked)}
                disabled={isAnalyzing}
                style={{ accentColor: '#8b5cf6', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <Layers size={14} />
              <span>納入台指期與大盤 (TXF/加權/櫃買)</span>
              <Info size={13} style={{ opacity: 0.7, marginLeft: '2px' }} />
            </label>

            {/* 台股懸浮提示視窗 */}
            {hoveredTooltip === 'tw' && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '0',
                maxWidth: 'calc(100vw - 32px)',
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                zIndex: 1000,
                fontSize: '0.8rem',
                color: '#e2e8f0',
                lineHeight: '1.6',
                boxSizing: 'border-box'
              }}>
                <div style={{ color: '#a78bfa', fontWeight: '700', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>
                  台股與期指連動涵蓋清單：
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div>• 台指期近一 (夜盤/近月 WTX&)</div>
                  <div>• 加權指數 (大盤 ^TWII)</div>
                  <div>• 櫃買指數 (OTC ^TWOII)</div>
                </div>
              </div>
            )}
          </div>

          {/* 2. 美股與國際主要指數 (放後面) */}
          <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            onMouseEnter={() => setHoveredTooltip('us')}
            onMouseLeave={() => setHoveredTooltip(null)}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: includeUS ? '#60a5fa' : '#94a3b8', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={includeUS}
                onChange={(e) => setIncludeUS(e.target.checked)}
                disabled={isAnalyzing}
                style={{ accentColor: '#3b82f6', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <Globe size={14} />
              <span>納入美股與主要指數 (費半/那指/道瓊/標普/TSM)</span>
              <Info size={13} style={{ opacity: 0.7, marginLeft: '2px' }} />
            </label>

            {/* 美股懸浮提示視窗 */}
            {hoveredTooltip === 'us' && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '0',
                maxWidth: 'calc(100vw - 32px)',
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                zIndex: 1000,
                fontSize: '0.8rem',
                color: '#e2e8f0',
                lineHeight: '1.6',
                boxSizing: 'border-box'
              }}>
                <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>
                  美股與主要外盤涵蓋清單：
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
                  <div>• 道瓊工業指數 (^DJI)</div>
                  <div>• S&P 500 指數 (^GSPC)</div>
                  <div>• NASDAQ 指數 (^IXIC)</div>
                  <div>• 費城半導體指數 (^SOX)</div>
                  <div>• 台積電 ADR (TSM)</div>
                  <div>• 輝達 (NVDA)</div>
                  <div>• 日經 225 指數 (^N225)</div>
                  <div>• 香港恒生指數 (^HSI)</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

