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

export default function PatternEncyclopedia({ selectedPatternId, onSelectPattern }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | single | dual | multi
  const [sentimentFilter, setSentimentFilter] = useState('all'); // all | bullish | bearish | neutral

  // 篩選型態
  const filteredPatterns = KLINE_PATTERNS.filter((pattern) => {
    const matchesSearch =
      pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || pattern.category === categoryFilter;
    const matchesSentiment = sentimentFilter === 'all' || pattern.sentiment === sentimentFilter;

    return matchesSearch && matchesCategory && matchesSentiment;
  });

  return (
    <div style={{ margin: '20px 0' }}>
      
      {/* 頂部搜尋與過濾條件 */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={22} color="#3b82f6" />
              <span>經典 K 線形態百科圖鑑</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              收錄單 K、雙 K 組合、三 K 與波段形態圖解，涵蓋歷史勝率、多空力量物理學與實戰操盤守則
            </p>
          </div>

          {/* 搜尋框 */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜尋型態名稱或關鍵字..."
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
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
                {/* 頂部形態名稱與徽章 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc' }}>
                      {pattern.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {pattern.chineseName}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isBull ? 'var(--tw-bull-bg)' : isBear ? 'var(--tw-bear-bg)' : 'rgba(245, 158, 11, 0.15)',
                      color: isBull ? '#fca5a5' : isBear ? '#6ee7b7' : '#fcd34d',
                      border: `1px solid ${isBull ? 'var(--tw-bull-border)' : isBear ? 'var(--tw-bear-border)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}
                  >
                    {isBull ? '🚀 建議找機會買進' : isBear ? '🔻 建議賣出 / 不要買' : '⚠️ 建議先在旁邊看戲'}
                  </span>
                </div>

                {/* SVG 圖解與全部內容直接展開 */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', margin: '16px 0', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '100px', width: '100%', marginBottom: '10px' }}>
                    <PatternSVG config={pattern.svgConfig} width={100} height={110} />
                  </div>
                  <div style={{ flex: 1, width: '100%' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                         白話圖解：
                      </strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '4px' }}>
                        {pattern.summary}
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={14} /> 主力心態：
                      </strong>
                      <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginTop: '4px' }}>
                        {pattern.marketPsychology}
                      </p>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={14} /> 實戰建議：
                      </strong>
                      <ul style={{ paddingLeft: '22px', fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', margin: '4px 0 0 0' }}>
                        {pattern.tradingRules?.map((rule, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部勝率 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#f59e0b" />
                  <span>
                    歷史上 {isBull ? '真的會上漲' : isBear ? '真的會暴跌' : '出現大轉折'} 的機率高達：
                    <strong style={{ color: '#fff', fontSize: '1rem', marginLeft: '2px' }}>{pattern.winRate}%</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
