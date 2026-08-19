import React, { useState } from 'react';
import { Search, Filter, BookOpen, ChevronRight, Award, Zap, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KLINE_PATTERNS } from '../data/klinePatterns';

/**
 * 動態繪製 K 線形態 SVG
 */
export function PatternSVG({ config, width = 90, height = 110 }) {
  if (!config) return null;

  if (config.type === 'single') {
    const { open, close, high, low, color } = config;
    const bodyTop = Math.min(open, close);
    const bodyHeight = Math.max(Math.abs(close - open), 3);

    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {/* 影線 */}
        <line x1="50" y1={high} x2="50" y2={low} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* 實體 */}
        <rect
          x="32"
          y={bodyTop}
          width="36"
          height={bodyHeight}
          fill={color}
          rx="2"
          stroke={color}
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (config.type === 'dual') {
    const { bars } = config;
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {bars.map((bar, i) => {
          const x = i === 0 ? 30 : 70;
          const bodyTop = Math.min(bar.open, bar.close);
          const bodyHeight = Math.max(Math.abs(bar.close - bar.open), 3);
          return (
            <g key={i}>
              <line x1={x} y1={bar.high} x2={x} y2={bar.low} stroke={bar.color} strokeWidth="2.5" strokeLinecap="round" />
              <rect
                x={x - 14}
                y={bodyTop}
                width="28"
                height={bodyHeight}
                fill={bar.color}
                rx="2"
                stroke={bar.color}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  if (config.type === 'tri') {
    const { bars } = config;
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {bars.map((bar, i) => {
          const x = 20 + i * 30;
          const bodyTop = Math.min(bar.open, bar.close);
          const bodyHeight = Math.max(Math.abs(bar.close - bar.open), 3);
          return (
            <g key={i}>
              <line x1={x} y1={bar.high} x2={x} y2={bar.low} stroke={bar.color} strokeWidth="2" strokeLinecap="round" />
              <rect
                x={x - 10}
                y={bodyTop}
                width="20"
                height={bodyHeight}
                fill={bar.color}
                rx="2"
                stroke={bar.color}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  if (config.type === 'multi') {
    const { bars } = config;
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {bars.map((bar, i) => {
          const x = 12 + i * 19;
          const bodyTop = Math.min(bar.open, bar.close);
          const bodyHeight = Math.max(Math.abs(bar.close - bar.open), 2.5);
          return (
            <g key={i}>
              <line x1={x} y1={bar.high} x2={x} y2={bar.low} stroke={bar.color} strokeWidth="1.8" strokeLinecap="round" />
              <rect
                x={x - 6.5}
                y={bodyTop}
                width="13"
                height={bodyHeight}
                fill={bar.color}
                rx="1"
                stroke={bar.color}
                strokeWidth="0.5"
              />
            </g>
          );
        })}
      </svg>
    );
  }

  return null;
}

export default function PatternEncyclopedia({ selectedPatternId, onSelectPattern, onLoadToSimulator }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('top12'); // 'top12' | 'all'
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | single | dual | multi
  const [sentimentFilter, setSentimentFilter] = useState('all'); // all | bullish | bearish | neutral

  // 篩選型態
  const filteredPatterns = KLINE_PATTERNS.filter((pattern) => {
    const matchesSearch =
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScope = scopeFilter === 'all' || (scopeFilter === 'top12' && pattern.isTopFrequent);
    const matchesCategory = categoryFilter === 'all' || pattern.category === categoryFilter;
    const matchesSentiment = sentimentFilter === 'all' || pattern.sentiment === sentimentFilter;

    return matchesSearch && matchesScope && matchesCategory && matchesSentiment;
  });

  return (
    <div style={{ margin: '20px 0' }}>
      
      {/* 頂部搜尋與過濾條件 */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} color="#3b82f6" />
              <span>經典 K 線形態實戰作戰圖鑑</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              結合形態學物理、主力心理、位階判定與具體進出場 SOP，支援一鍵帶入模擬畫板演練
            </p>
          </div>

          {/* 搜尋框 */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜尋型態名稱、戰法關鍵字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '9px 12px 9px 36px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 核心實戰範圍切換 (Top 12 vs 52 全集) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setScopeFilter('top12')}
            className={`btn-${scopeFilter === 'top12' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '0.88rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={16} color={scopeFilter === 'top12' ? '#fff' : '#f59e0b'} />
            <span>🔥 實戰高頻必背 (TOP 12 精選)</span>
          </button>

          <button
            onClick={() => setScopeFilter('all')}
            className={`btn-${scopeFilter === 'all' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '0.88rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={16} />
            <span>📚 全部 52 種 K 棒形態大全</span>
          </button>
        </div>

        {/* 分類按鈕列 (支援手機橫向滑動) */}
        <div className="scrollable-tabs" style={{ gap: '8px', marginTop: '16px', alignItems: 'center', paddingBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>形態維度：</span>
          {[
            { id: 'all', label: '全部' },
            { id: 'single', label: '單一 K 棒' },
            { id: 'dual', label: '雙 K 組合' },
            { id: 'multi', label: '三 K 及多 K' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '5px 12px',
                flexShrink: 0,
                background: categoryFilter === cat.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: categoryFilter === cat.id ? '#3b82f6' : 'var(--border-subtle)',
                color: categoryFilter === cat.id ? '#60a5fa' : 'var(--text-secondary)'
              }}
            >
              {cat.label}
            </button>
          ))}

          <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 4px', flexShrink: 0 }} />

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>操作建議：</span>
          {[
            { id: 'all', label: '全部顯示' },
            { id: 'bullish', label: '🚀 建議買進 (容易上漲)', color: '#fca5a5' },
            { id: 'bearish', label: '🔻 快逃/賣出 (容易下跌)', color: '#6ee7b7' },
            { id: 'neutral', label: '⚠️ 建議觀望 (方向不明)', color: '#fcd34d' }
          ].map((sent) => (
            <button
              key={sent.id}
              onClick={() => setSentimentFilter(sent.id)}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '5px 12px',
                flexShrink: 0,
                background: sentimentFilter === sent.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: sentimentFilter === sent.id ? 'rgba(255, 255, 255, 0.3)' : 'var(--border-subtle)',
                color: sentimentFilter === sent.id ? '#ffffff' : (sent.color || 'var(--text-secondary)')
              }}
            >
              {sent.label}
            </button>
          ))}
        </div>
      </div>

      {/* 形態卡片網格 */}
      {filteredPatterns.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', margin: '20px 0' }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '6px' }}>
            查無符合條件的 K 線形態
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            請嘗試切換「52 種形態大全」或重設篩選條件。
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setScopeFilter('all');
              setCategoryFilter('all');
              setSentimentFilter('all');
            }}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
          >
            重設所有篩選條件
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredPatterns.map((pattern) => {
            const isBull = pattern.sentiment === 'bullish';
            const isBear = pattern.sentiment === 'bearish';

            return (
              <div
                key={pattern.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${isBull ? 'var(--tw-bull)' : isBear ? 'var(--tw-bear)' : '#f59e0b'}`
                }}
              >
                <div>
                  {/* 頂部形態名稱、位階與徽章 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                          {pattern.name}
                        </h3>
                        {pattern.isTopFrequent && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: '700' }}>
                            TOP 實戰
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {pattern.chineseName}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: isBull ? 'var(--tw-bull-bg)' : isBear ? 'var(--tw-bear-bg)' : 'rgba(245, 158, 11, 0.15)',
                        color: isBull ? '#fca5a5' : isBear ? '#6ee7b7' : '#fcd34d',
                        border: `1px solid ${isBull ? 'var(--tw-bull-border)' : isBear ? 'var(--tw-bear-border)' : 'rgba(245, 158, 11, 0.3)'}`,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isBull ? '🚀 找機會買進' : isBear ? '🔻 賣出/避險' : '⚠️ 觀望變盤'}
                    </span>
                  </div>

                  {/* 位階判定標籤 */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      📍 適用位階：{pattern.locationType || (isBull ? '底部反轉 / 起漲段' : isBear ? '高檔反轉 / 逃命段' : '區間整理 / 方向待定')}
                    </span>
                  </div>

                  {/* SVG 圖解與內容 */}
                  <div style={{ margin: '14px 0', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '100px', width: '100%', marginBottom: '12px' }}>
                      <PatternSVG config={pattern.svgConfig} width={105} height={115} />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        📖 白話特徵：
                      </strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '3px', margin: 0 }}>
                        {pattern.summary}
                      </p>
                    </div>

                    {/* 實戰作戰 SOP 核心卡 */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Shield size={15} /> 實戰操盤 SOP 指引
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                        <div style={{ color: '#e2e8f0' }}>
                          <span style={{ color: '#60a5fa', fontWeight: '600' }}>• 進場觸發：</span>
                          {pattern.entryRule || pattern.tradingRules[0]}
                        </div>
                        <div style={{ color: '#e2e8f0' }}>
                          <span style={{ color: '#f87171', fontWeight: '600' }}>• 停損防守：</span>
                          {pattern.stopLossRule || pattern.tradingRules[1] || '跌破此形態最低點立即停損'}
                        </div>
                        {pattern.targetRule && (
                          <div style={{ color: '#e2e8f0' }}>
                            <span style={{ color: '#34d399', fontWeight: '600' }}>• 獲利目標：</span>
                            {pattern.targetRule}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 底部勝率與一鍵帶入畫板 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={15} color="#f59e0b" />
                    <span>
                      歷史勝率：<strong style={{ color: '#fff', fontSize: '0.95rem' }}>{pattern.winRate}%</strong>
                    </span>
                  </div>

                  {onLoadToSimulator && (
                    <button
                      onClick={() => onLoadToSimulator(pattern)}
                      className="btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '4px 10px', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                      title="將此形態直接載入至畫板，繼續插入 K 棒演練後續走勢"
                    >
                      🕹️ 帶入畫板演練
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
