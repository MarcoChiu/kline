import React, { useState } from 'react';
import { Sparkles, RefreshCw, BarChart2 } from 'lucide-react';

export default function StockInput({ onStockSubmit, isAnalyzing }) {
  const [stockCode, setStockCode] = useState('');

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(59, 130, 246, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px' }}>
          <Sparkles size={18} color="#60a5fa" />
          輸入股號自動分析：
        </div>
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 280px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="輸入台股代號 (如 2330, 8069)"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && stockCode.trim() && !isAnalyzing) {
                onStockSubmit(stockCode.trim());
              }
            }}
            disabled={isAnalyzing}
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '1.05rem',
              flex: '1 1 140px',
              minWidth: '130px',
              outline: 'none'
            }}
          />
          <button
            disabled={!stockCode.trim() || isAnalyzing}
            onClick={() => onStockSubmit(stockCode.trim())}
            className="btn-primary"
            style={{
              padding: '10px 18px',
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
    </div>
  );
}
