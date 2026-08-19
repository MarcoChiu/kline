import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target, ShieldAlert, Cpu, Award, Zap, Compass, X, Shield, Globe, ExternalLink } from 'lucide-react';
import { KLINE_PATTERNS } from '../data/klinePatterns';
import { PatternSVG } from './PatternEncyclopedia';

export default function AnalysisResult({ result, isAnalyzing, onSelectPatternView }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customCode, setCustomCode] = React.useState('');
  const [customPrice, setCustomPrice] = React.useState('');
  const [activeModalPattern, setActiveModalPattern] = React.useState(null);
  const [nightCatalyst, setNightCatalyst] = React.useState('neutral'); // 'neutral' | 'bullish' | 'bearish'

  React.useEffect(() => {
    if (result) {
      setCustomName(result.stockName || '');
      setCustomCode(result.stockCode || '');
      setCustomPrice(result.currentPrice?.toString() || '');
      setIsEditing(false);
    }
  }, [result]);

  if (isAnalyzing) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', margin: '24px 0' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '16px' }}>
          <div className="animate-spin-custom">
            <Cpu size={36} />
          </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          AI 視覺模型與形態神經網絡正在解析 K 線圖...
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
          正在辨識頂部文字（股名、代碼、開高低收）、計算 MA 均線排列、掃描 K 棒組合特徵並推演明日走勢...
        </p>
      </div>
    );
  }

  if (!result) return null;

  const { priceChange, changePercent, movingAverages, detectedPatterns, prediction, volume, latestDate, isLocalAnalyzed, analyzedAt } = result;
  const displayName = customName || result.stockName;
  const displayCode = customCode || result.stockCode;
  const displayPrice = customPrice ? parseFloat(customPrice) : result.currentPrice;
  const numChange = typeof priceChange === 'number' ? priceChange : (parseFloat(priceChange) || 0);
  const numPercent = typeof changePercent === 'number' ? changePercent : (parseFloat(changePercent) || 0);
  const isDown = numChange < 0 || (numChange === 0 && numPercent < 0);
  const isFlat = numChange === 0 && numPercent === 0;
  const isUp = !isDown && !isFlat;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '24px 0' }}>
      
      {/* 1. 股票基本行情與均線總覽橫幅 */}
      <div className="glass-panel" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(26, 34, 52, 0.8) 0%, rgba(18, 24, 36, 0.9) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* 股名與現價 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="股票名稱"
                      style={{ width: '110px', background: 'rgba(0,0,0,0.5)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px', color: '#fff', fontSize: '1rem', fontWeight: '700' }}
                    />
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="代碼"
                      style={{ width: '70px', background: 'rgba(0,0,0,0.5)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px', color: '#fff', fontSize: '1rem', fontFamily: 'monospace' }}
                    />
                    <input
                      type="text"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="價格"
                      style={{ width: '80px', background: 'rgba(0,0,0,0.5)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '4px 8px', color: '#fff', fontSize: '1rem', fontFamily: 'monospace' }}
                    />
                    <button onClick={() => setIsEditing(false)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      完成
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
                      {displayName}
                    </h2>
                    {displayCode && (
                      <span className="font-mono" style={{ fontSize: '1rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                        {displayCode}
                      </span>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      校正股名與價格
                    </button>
                  </>
                )}
                
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid currentColor' }}>
                  {`✨ ${result.usedModel ? result.usedModel.replace('gemini-', 'Gemini ').replace('-exp-01-21', '').replace('-exp-02-05', '') : 'Gemini AI'} 大模型`}
                </span>
                {analyzedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    更新：{analyzedAt}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                成交量態勢：<span style={{ color: '#f8fafc', fontWeight: '600' }}>{volume || '標準量能'}</span>
              </p>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isDown ? 'var(--tw-bear)' : (isFlat ? '#e2e8f0' : 'var(--tw-bull)'), display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isDown ? <TrendingDown size={24} /> : (isFlat ? <Minus size={24} color="#94a3b8" /> : <TrendingUp size={24} />)}
                <span className="font-mono">{displayPrice}</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: isDown ? '#6ee7b7' : (isFlat ? '#94a3b8' : '#fca5a5') }}>
                {numChange > 0 ? `+${numChange}` : numChange} ({numPercent > 0 ? `+${numPercent}%` : `${numPercent}%`})
              </div>
            </div>
          </div>

          {/* 均線儀表板 */}
          {movingAverages && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {movingAverages.ma5 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: '600' }}>MA5 (週線)</div>
                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{movingAverages.ma5}</div>
                </div>
              )}
              {movingAverages.ma10 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: '600' }}>MA10 (雙週)</div>
                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{movingAverages.ma10}</div>
                </div>
              )}
              {movingAverages.ma20 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: '600' }}>MA20 (月線)</div>
                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{movingAverages.ma20}</div>
                </div>
              )}
              {movingAverages.ma60 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '600' }}>MA60 (季線)</div>
                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: '700' }}>{movingAverages.ma60}</div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 2. 核心分析區：先百科形態，再明日走勢推演 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* 左側：對應百科 K 線形態 (優先閱讀) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#8b5cf6" />
              <span>對應百科 K 線形態</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              共鎖定 {detectedPatterns?.length || 0} 個顯著特徵
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {detectedPatterns?.map((item, idx) => {
              let matchedEncyclopedia = KLINE_PATTERNS.find(p => 
                p.id === item.patternId || 
                item.name?.toLowerCase().includes(p.name.toLowerCase()) || 
                item.name?.includes(p.chineseName) ||
                (item.description && (item.description.includes(p.name.split(' ')[0]) || item.description.includes(p.chineseName.split(' ')[0])))
              );

              // 智慧兜底：如果沒抓到精準 id，依多空判斷最貼近的百科形態
              if (!matchedEncyclopedia) {
                if (!isUp || item.description?.includes('跌破') || item.description?.includes('轉弱') || item.description?.includes('回測')) {
                  matchedEncyclopedia = KLINE_PATTERNS.find(p => p.id === 'dark_cloud_cover') || KLINE_PATTERNS.find(p => p.id === 'big_bear');
                } else {
                  matchedEncyclopedia = KLINE_PATTERNS.find(p => p.id === 'big_bull') || KLINE_PATTERNS.find(p => p.id === 'three_white_soldiers');
                }
              }

              return (
                <div key={idx} className="glass-card" style={{ padding: '14px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: '#f8fafc' }}>
                      {matchedEncyclopedia ? matchedEncyclopedia.name : item.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', fontWeight: '600' }}>
                      形態符合度 {item.confidence}%
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '6px' }}>
                    {item.description}
                  </p>

                  {matchedEncyclopedia && (
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px', margin: '6px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      <div><strong style={{ color: '#60a5fa' }}>💡 百科白話解讀：</strong>{matchedEncyclopedia.summary}</div>
                      <div style={{ marginTop: '3px' }}><strong style={{ color: '#f59e0b' }}>⚡ 主力想法：</strong>{matchedEncyclopedia.marketPsychology}</div>
                    </div>
                  )}

                  {matchedEncyclopedia && (
                    <button
                      type="button"
                      onClick={() => setActiveModalPattern(matchedEncyclopedia)}
                      style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.82rem', cursor: 'pointer', marginTop: '6px', padding: 0, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      點擊查看【{matchedEncyclopedia.name.split(' ')[0]}】完整白話操盤守則 (彈出視窗) →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：明日勝率雷達與情境推演 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#06b6d4" />
              <span>明日走勢概率推演</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              AI 綜合評估
            </span>
          </div>

          {/* 🌐 夜盤與美股期指跨市場共振觀測列 */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} color="#60a5fa" />
                <span>夜盤與美股連動因子：</span>
              </div>

              {/* 外部即時行情連結 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href="https://tw.stock.yahoo.com/future/WTX&"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
                  🇹🇼 台指期夜盤 (WTX&) <ExternalLink size={11} />
                </a>
                <a
                  href="https://tw.stock.yahoo.com/markets"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none', background: 'rgba(139, 92, 246, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                >
                  🇺🇸 美股期指與國際盤 <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* 晚上氛圍快速情境切換 */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setNightCatalyst('neutral')}
                className="btn-secondary"
                style={{
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  background: nightCatalyst === 'neutral' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: nightCatalyst === 'neutral' ? '#fff' : 'var(--border-subtle)',
                  color: nightCatalyst === 'neutral' ? '#fff' : 'var(--text-muted)'
                }}
              >
                ⚖️ 基準 (純日 K)
              </button>
              <button
                type="button"
                onClick={() => setNightCatalyst('bullish')}
                className="btn-secondary"
                style={{
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  background: nightCatalyst === 'bullish' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: nightCatalyst === 'bullish' ? '#ef4444' : 'var(--border-subtle)',
                  color: nightCatalyst === 'bullish' ? '#fca5a5' : '#f87171'
                }}
              >
                🚀 美股/夜盤大漲 (+1%↑)
              </button>
              <button
                type="button"
                onClick={() => setNightCatalyst('bearish')}
                className="btn-secondary"
                style={{
                  fontSize: '0.76rem',
                  padding: '4px 10px',
                  background: nightCatalyst === 'bearish' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: nightCatalyst === 'bearish' ? '#10b981' : 'var(--border-subtle)',
                  color: nightCatalyst === 'bearish' ? '#6ee7b7' : '#34d399'
                }}
              >
                🔻 美股/夜盤重挫 (-1%↓)
              </button>
            </div>

            {/* 動態連動提示 */}
            {nightCatalyst === 'bullish' && (
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#fca5a5', lineHeight: '1.4' }}>
                ✨ <strong>夜盤助攻加權</strong>：美股期指或台指夜盤強勢，明日台股個股跳空開高挑戰「天花板」機率增加！可留意早盤量能換手。
              </div>
            )}
            {nightCatalyst === 'bearish' && (
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#6ee7b7', lineHeight: '1.4' }}>
                ⚠️ <strong>夜盤逆風加權</strong>：美股或台指夜盤拉回下殺，明日需嚴防跳空開低回測「地板」防守價，早盤切勿衝動追價！
              </div>
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
            {prediction.sentimentSummary}
          </p>

          {/* 勝率進度條 (依據夜盤動態加權) */}
          {(() => {
            const rawBull = prediction.bullishProbability ?? 50;
            const rawBear = prediction.bearishProbability ?? 30;
            const rawNeut = prediction.neutralProbability ?? 20;

            let effBull = rawBull;
            let effBear = rawBear;
            let effNeut = rawNeut;

            if (nightCatalyst === 'bullish') {
              effBull = Math.min(rawBull + 18, 92);
              effBear = Math.max(rawBear - 12, 3);
              effNeut = Math.max(100 - effBull - effBear, 5);
            } else if (nightCatalyst === 'bearish') {
              effBear = Math.min(rawBear + 18, 92);
              effBull = Math.max(rawBull - 12, 3);
              effNeut = Math.max(100 - effBull - effBear, 5);
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 看多 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fca5a5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={14} /> 🚀 容易上漲 / 建議買進
                      {nightCatalyst === 'bullish' && <span style={{ fontSize: '0.7rem', color: '#fca5a5' }}>(夜盤+18%)</span>}
                    </span>
                    <span className="font-mono" style={{ color: '#fca5a5', fontWeight: '700' }}>{effBull}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${effBull}%`, height: '100%', background: 'linear-gradient(90deg, #f87171, #ef4444)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* 盤整 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fcd34d', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Minus size={14} /> ⚠️ 區間震盪 / 建議觀望
                    </span>
                    <span className="font-mono" style={{ color: '#fcd34d', fontWeight: '700' }}>{effNeut}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${effNeut}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                {/* 看空 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#6ee7b7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingDown size={14} /> 🔻 容易下跌 / 快逃或別買
                      {nightCatalyst === 'bearish' && <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>(夜盤+18%)</span>}
                    </span>
                    <span className="font-mono" style={{ color: '#6ee7b7', fontWeight: '700' }}>{effBear}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${effBear}%`, height: '100%', background: 'linear-gradient(90deg, #34d399, #10b981)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '700', marginBottom: '4px' }}>明日走勢白話推演：</div>
            <p style={{ fontSize: '0.88rem', color: '#f1f5f9', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {prediction.nextDayForecast}
            </p>
          </div>
        </div>

      </div>

      {/* 3. 關鍵價位階梯 & 操盤策略錦囊 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* 關鍵支撐與壓力階梯 (小白話天花板與地板) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#f59e0b" />
              <span>關鍵「天花板」與「地板」價位</span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              壓力與支撐
            </span>
          </div>

          {/* 新手白話導讀 */}
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            💡 <strong>大白話指南</strong>：股價往上衝容易在<strong>「天花板」</strong>撞牆卡關（適合獲利了結，切勿追高）；往下掉時在<strong>「地板」</strong>容易踩到彈簧反彈（守住可買，若跌破地板代表漏水要快逃！）。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* 上方天花板 (壓力) */}
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={15} /> 🔴 上方天花板 (撞牆卡關價)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prediction.resistanceLevels?.map((lvl, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {i === 0 ? '第一道卡關價' : i === 1 ? '第二道賣壓區' : '歷史大壓力'}
                    </span>
                    <span className="font-mono" style={{ fontWeight: '700', color: '#ffffff' }}>{lvl} 元</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 下方地板 (支撐) */}
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={15} /> 🟢 下方地板 (彈簧防守價)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {prediction.supportLevels?.map((lvl, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {i === 0 ? '第一道彈簧價' : i === 1 ? '關鍵防守線' : '最後保命停損'}
                    </span>
                    <span className="font-mono" style={{ fontWeight: '700', color: '#ffffff' }}>{lvl} 元</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 專家級 AI 操盤錦囊 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#10b981" />
              <span>AI 實戰操盤建議</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {prediction.riskLevel || '標準風險'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prediction.tradingStrategy?.map((strat, idx) => (
              <div key={idx} style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.6', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                {strat}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={14} />
            <span>提醒：技術分析為概率推演，請嚴格執行資金控管與停損紀律。</span>
          </div>
        </div>

      </div>

      {/* 4. 點擊形態彈出的百科詳解 Modal (不切換頁面) */}
      {activeModalPattern && (
        <div
          onClick={() => setActiveModalPattern(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              maxWidth: '580px',
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${activeModalPattern.sentiment === 'bullish' ? 'rgba(239, 68, 68, 0.4)' : activeModalPattern.sentiment === 'bearish' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                    {activeModalPattern.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: activeModalPattern.sentiment === 'bullish' ? 'var(--tw-bull-bg)' : activeModalPattern.sentiment === 'bearish' ? 'var(--tw-bear-bg)' : 'rgba(245, 158, 11, 0.15)',
                      color: activeModalPattern.sentiment === 'bullish' ? '#fca5a5' : activeModalPattern.sentiment === 'bearish' ? '#6ee7b7' : '#fcd34d',
                      border: `1px solid ${activeModalPattern.sentiment === 'bullish' ? 'var(--tw-bull-border)' : activeModalPattern.sentiment === 'bearish' ? 'var(--tw-bear-border)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}
                  >
                    {activeModalPattern.sentiment === 'bullish' ? '🚀 建議買進' : activeModalPattern.sentiment === 'bearish' ? '🔻 快逃/賣出' : '⚠️ 建議觀望'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeModalPattern.chineseName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalPattern(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* SVG 圖形示意 */}
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
              <PatternSVG config={activeModalPattern.svgConfig} width={130} height={120} />
            </div>

            {/* 白話圖解 */}
            <div style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                💡 白話圖解：
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {activeModalPattern.summary}
              </p>
            </div>

            {/* 主力心態 */}
            <div style={{ marginBottom: '14px', background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={15} /> 主力心態與力量物理學：
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                {activeModalPattern.marketPsychology}
              </p>
            </div>

            {/* 實戰操盤交易守則 */}
            <div style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Shield size={15} /> 實戰操盤交易守則：
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                {activeModalPattern.tradingRules?.map((rule, rIdx) => (
                  <li key={rIdx} style={{ marginBottom: '4px' }}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* 勝率與關閉按鈕 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} color="#f59e0b" />
                <span>歷史上真的成真的機率高達：<strong style={{ color: '#fff', fontSize: '1rem' }}>{activeModalPattern.winRate}%</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPattern(null)}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
