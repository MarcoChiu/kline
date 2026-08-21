import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bookmark, RefreshCw, Trash2, ExternalLink, Award } from 'lucide-react';
import { fetchStockData } from '../services/yahooFinanceService';

/**
 * 交易計畫與自選追蹤日誌 (Trade Plan & Watchlist Journal)
 */
export default function TradePlanJournal({ onSelectStockToAnalyze }) {
  const [plans, setPlans] = useState([]);
  const [predictionLogs, setPredictionLogs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [activeSubTab, setActiveSubTab] = useState('plans'); // 'plans' | 'predictions'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'completed' | 'stopped_out'

  // 載入 LocalStorage 資料
  const loadData = () => {
    try {
      const savedPlans = JSON.parse(localStorage.getItem('kline_trade_plans') || '[]');
      setPlans(savedPlans);

      const savedLogs = JSON.parse(localStorage.getItem('kline_prediction_history') || '[]');
      setPredictionLogs(savedLogs);
    } catch (e) {
      console.warn('載入交易計畫失敗:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 批次更新所有計畫的即時行情
  const handleRefreshAll = useCallback(async () => {
    if (plans.length === 0) return;
    setIsRefreshing(true);

    const uniqueCodes = Array.from(new Set(plans.map(p => p.stockCode).filter(c => c && c !== '0000')));
    const priceMap = {};

    for (const code of uniqueCodes) {
      try {
        const data = await fetchStockData(code, 5);
        if (data && data.latest) {
          priceMap[code] = {
            price: data.latest.close,
            change: data.latest.priceChange,
            changePercent: data.latest.changePercent,
            date: data.latest.date,
            high: data.latest.high,
            low: data.latest.low
          };
        }
      } catch (err) {
        console.warn(`更新代碼 ${code} 失敗:`, err);
      }
    }

    setLivePrices(prev => ({ ...prev, ...priceMap }));
    setIsRefreshing(false);
  }, [plans]);

  // 初始載入時自動觸發一次現價更新
  useEffect(() => {
    if (plans.length > 0) {
      handleRefreshAll();
    }
  }, [plans, handleRefreshAll]);

  // 更新計畫狀態
  const handleUpdateStatus = (planId, newStatus) => {
    const updated = plans.map(p => p.id === planId ? { ...p, status: newStatus } : p);
    setPlans(updated);
    localStorage.setItem('kline_trade_plans', JSON.stringify(updated));
  };

  // 刪除計畫
  const handleDeletePlan = (planId) => {
    if (window.confirm('確定要刪除這筆交易計畫嗎？')) {
      const updated = plans.filter(p => p.id !== planId);
      setPlans(updated);
      localStorage.setItem('kline_trade_plans', JSON.stringify(updated));
    }
  };

  // 清空所有計畫
  const handleClearAll = () => {
    if (window.confirm('確定要清空所有交易計畫與追蹤記錄嗎？此動作無法復原。')) {
      setPlans([]);
      localStorage.removeItem('kline_trade_plans');
    }
  };

  // 過濾計畫
  const filteredPlans = useMemo(() => {
    if (statusFilter === 'all') return plans;
    return plans.filter(p => p.status === statusFilter);
  }, [plans, statusFilter]);

  // 計算 AI 預測命中率統計
  const aiStats = useMemo(() => {
    if (!predictionLogs || predictionLogs.length === 0) {
      return { total: 0, verified: 0, wins: 0, accuracy: 0 };
    }

    let verified = 0;
    let wins = 0;

    predictionLogs.forEach(log => {
      const current = livePrices[log.stockCode];
      if (current && current.price && log.initialPrice) {
        verified++;
        const priceDiff = current.price - log.initialPrice;
        const isBullPred = log.sentiment === 'bullish';
        const isBearPred = log.sentiment === 'bearish';

        if ((isBullPred && priceDiff > 0) || (isBearPred && priceDiff < 0)) {
          wins++;
        }
      }
    });

    const accuracy = verified > 0 ? Number(((wins / verified) * 100).toFixed(1)) : 0;
    return { total: predictionLogs.length, verified, wins, accuracy };
  }, [predictionLogs, livePrices]);

  return (
    <div style={{ margin: '20px 0' }}>
      
      {/* 頂部功能面板 */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                <Bookmark size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                交易計畫日誌與自選追蹤
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              嚴格執行進出場紀律，即時監控買點、停損防守與停利達標狀態
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing || plans.length === 0}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin-custom' : ''} />
              <span>{isRefreshing ? '正在同步現價...' : '🔄 批次更新現價'}</span>
            </button>
            {plans.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 12px', color: '#f87171' }}
              >
                清空計畫
              </button>
            )}
          </div>
        </div>

        {/* 分頁切換 (交易計畫 vs AI 預測成效驗證) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveSubTab('plans')}
              className={`btn-${activeSubTab === 'plans' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            >
              📋 我的交易計畫 ({plans.length})
            </button>
            <button
              onClick={() => setActiveSubTab('predictions')}
              className={`btn-${activeSubTab === 'predictions' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Award size={14} color="#f59e0b" />
              <span>AI 預測準確率驗證 ({aiStats.accuracy}%)</span>
            </button>
          </div>

          {activeSubTab === 'plans' && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: '全部' },
                { id: 'pending', label: '⏳ 等待進場' },
                { id: 'active', label: '🚀 持倉中' },
                { id: 'completed', label: '🎯 已達標' },
                { id: 'stopped_out', label: '🛡️ 已停損' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: statusFilter === tab.id ? '#3b82f6' : 'var(--border-subtle)',
                    background: statusFilter === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: statusFilter === tab.id ? '#60a5fa' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 內容區 A: 交易計畫列表 */}
      {activeSubTab === 'plans' && (
        <>
          {filteredPlans.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Bookmark size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                目前沒有任何交易計畫
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 16px' }}>
                請在「K 線分析儀」分析個股後，於下方的「實戰部位風控計算器」點擊「儲存為我的交易計畫」，即可隨時在此追蹤！
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '16px' }}>
              {filteredPlans.map(plan => {
                const live = livePrices[plan.stockCode];
                const currentPrice = live ? live.price : plan.entryPrice;
                const priceDiffPercent = Number((((currentPrice - plan.entryPrice) / plan.entryPrice) * 100).toFixed(2));
                
                // 動態狀態判定
                const isNearEntry = Math.abs(currentPrice - plan.entryPrice) / plan.entryPrice <= 0.015;
                const isHitTarget = currentPrice >= plan.targetPrice;
                const isHitStopLoss = currentPrice <= plan.stopLossPrice;

                let alertBadge = { text: '⏳ 監控中', color: '#94a3b8', bg: 'rgba(255,255,255,0.06)' };
                if (isHitTarget) {
                  alertBadge = { text: '🎯 已達標停利', color: '#34d399', bg: 'rgba(16, 185, 129, 0.2)' };
                } else if (isHitStopLoss) {
                  alertBadge = { text: '🔴 觸及停損防守', color: '#f87171', bg: 'rgba(239, 68, 68, 0.2)' };
                } else if (isNearEntry) {
                  alertBadge = { text: '🟢 接近買點', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.2)' };
                }

                return (
                  <div
                    key={plan.id}
                    className="glass-card"
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${isHitTarget ? '#10b981' : isHitStopLoss ? '#ef4444' : '#3b82f6'}`
                    }}
                  >
                    <div>
                      {/* 卡片標頭 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                              {plan.stockName}
                            </h3>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              ({plan.stockCode})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' }}>
                            {plan.patternName}
                          </div>
                        </div>

                        {/* 警示狀態標籤 */}
                        <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: alertBadge.bg, color: alertBadge.color, fontWeight: '700', border: `1px solid ${alertBadge.color}40` }}>
                          {alertBadge.text}
                        </span>
                      </div>

                      {/* 現價與浮動盈虧看板 */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>目前現價</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                            NT$ {currentPrice}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>相對進場價浮動</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: priceDiffPercent >= 0 ? '#34d399' : '#f87171' }}>
                            {priceDiffPercent >= 0 ? `+${priceDiffPercent}%` : `${priceDiffPercent}%`}
                          </div>
                        </div>
                      </div>

                      {/* 關鍵價位階梯 */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.78rem', textAlign: 'center', marginBottom: '12px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <div style={{ color: '#fca5a5' }}>停損價</div>
                          <div style={{ fontWeight: '700', color: '#f87171' }}>{plan.stopLossPrice}</div>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <div style={{ color: '#93c5fd' }}>進場價</div>
                          <div style={{ fontWeight: '700', color: '#60a5fa' }}>{plan.entryPrice}</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '6px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <div style={{ color: '#6ee7b7' }}>目標價</div>
                          <div style={{ fontWeight: '700', color: '#34d399' }}>{plan.targetPrice}</div>
                        </div>
                      </div>

                      {/* 部位規模資訊 */}
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '14px', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px' }}>
                        <div>📦 建議部位：<strong>{plan.lots ? `${plan.lots} 張` : ''} {plan.oddLots ? `${plan.oddLots} 股` : ''} ({plan.shares?.toLocaleString()} 股)</strong></div>
                        <div>💰 需備本金：<strong>NT$ {plan.capitalRequired?.toLocaleString()}</strong> | 風報比：<strong>1 : {plan.riskRewardRatio}</strong></div>
                      </div>
                    </div>

                    {/* 底部操作與狀態選擇 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', gap: '8px' }}>
                      <select
                        value={plan.status}
                        onChange={(e) => handleUpdateStatus(plan.id, e.target.value)}
                        style={{ background: '#1e293b', border: '1px solid var(--border-subtle)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        <option value="pending">⏳ 等待進場</option>
                        <option value="active">🚀 持倉中</option>
                        <option value="completed">🎯 已獲利平倉</option>
                        <option value="stopped_out">🛡️ 已停損出場</option>
                      </select>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {onSelectStockToAnalyze && (
                          <button
                            onClick={() => onSelectStockToAnalyze(plan.stockCode)}
                            className="btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="回到 K 線分析儀查看"
                          >
                            <ExternalLink size={12} />
                            <span>分析</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                          title="刪除這筆計畫"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 內容區 B: AI 預測成效驗證 */}
      {activeSubTab === 'predictions' && (
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                AI 歷史預測精準度事後驗證
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                記錄每一次 Gemini 預測結論，自動對照隔週真實收盤價統計命中率
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>驗證樣本數</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>{aiStats.verified} / {aiStats.total}</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>AI 預測命中率</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34d399' }}>{aiStats.accuracy}%</div>
              </div>
            </div>
          </div>

          {predictionLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              尚未累積 AI 預測快照。每次在 K 線分析儀完成分析時，系統將自動建檔並於後續進行成效對照。
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '12px' }}>
              {predictionLogs.map((log, idx) => {
                const live = livePrices[log.stockCode];
                const current = live ? live.price : log.initialPrice;
                const diff = Number((((current - log.initialPrice) / log.initialPrice) * 100).toFixed(2));
                const isBull = log.sentiment === 'bullish';
                const isCorrect = (isBull && diff > 0) || (!isBull && diff < 0);

                return (
                  <div key={idx} className="glass-card" style={{ padding: '14px', borderLeft: `4px solid ${isCorrect ? '#10b981' : '#f59e0b'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '800', color: '#ffffff' }}>{log.stockName} ({log.stockCode})</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.date?.split('T')[0]}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: isBull ? '#fca5a5' : '#6ee7b7', marginBottom: '4px' }}>
                      AI 判定：{isBull ? '🚀 偏多攻擊' : '🔻 偏空修正'} ({log.probability || 80}%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      分析時基準價：NT$ {log.initialPrice} $\rightarrow$ 目前現價：NT$ {current} ({diff >= 0 ? `+${diff}%` : `${diff}%`})
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: '700', color: isCorrect ? '#34d399' : '#fbbf24' }}>
                      {isCorrect ? '✅ 預測方向命中' : '⚠️ 走勢與預期不同'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
