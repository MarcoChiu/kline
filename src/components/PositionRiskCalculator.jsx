import { useState, useMemo, useEffect } from 'react';
import { Calculator, BookmarkPlus, Check } from 'lucide-react';

/**
 * 台股實戰部位風控與手續費計算器 (Position Sizing & Risk/Reward Calculator)
 */
export default function PositionRiskCalculator({ stockCode, stockName, currentPrice, defaultStopLoss, defaultTarget, detectedPatternName }) {
  // 帳戶資金
  const [accountCapital, setAccountCapital] = useState(500000);
  // 單筆最大承受風險 %
  const [riskPercent, setRiskPercent] = useState(1.0);
  // 進場價格
  const [entryPrice, setEntryPrice] = useState(currentPrice || 100);
  // 停損防守價
  const [stopLossPrice, setStopLossPrice] = useState(defaultStopLoss || (currentPrice ? Number((currentPrice * 0.95).toFixed(2)) : 95));
  // 獲利目標價
  const [targetPrice, setTargetPrice] = useState(defaultTarget || (currentPrice ? Number((currentPrice * 1.1).toFixed(2)) : 110));
  // 券商手續費折讓 (預設 6 折)
  const [brokerDiscount, setBrokerDiscount] = useState(0.6);
  // 是否當沖 (證交稅 0.15% vs 波段 0.3%)
  const [isDayTrade, setIsDayTrade] = useState(false);
  // 儲存狀態提示
  const [isSaved, setIsSaved] = useState(false);

  // 同步外部價格變動
  useEffect(() => {
    if (currentPrice) setEntryPrice(currentPrice);
    if (defaultStopLoss) setStopLossPrice(defaultStopLoss);
    if (defaultTarget) setTargetPrice(defaultTarget);
  }, [currentPrice, defaultStopLoss, defaultTarget]);

  // 精算部位與手續費損益
  const calculations = useMemo(() => {
    const capital = Math.max(1000, Number(accountCapital) || 0);
    const riskRate = Math.max(0.1, Number(riskPercent) || 1.0) / 100;
    const entry = Math.max(0.1, Number(entryPrice) || 1);
    const stop = Math.max(0.01, Number(stopLossPrice) || 0.1);
    const target = Math.max(0.1, Number(targetPrice) || entry * 1.05);

    // 最大容許虧損金額 (Dollar Risk)
    const maxRiskDollar = capital * riskRate;
    
    // 單股承受價差風險
    const perShareRisk = Math.abs(entry - stop);
    
    // 理論可承擔股數 (向下取整)
    const theoreticalShares = perShareRisk > 0 ? Math.floor(maxRiskDollar / perShareRisk) : 0;
    const recommendedShares = Math.max(0, theoreticalShares);
    
    // 換算張數與零股
    const lots = Math.floor(recommendedShares / 1000);
    const oddLots = recommendedShares % 1000;

    // 總進場本金需求
    const totalCapitalRequired = Math.round(recommendedShares * entry);
    const capitalUsagePercent = capital > 0 ? Number(((totalCapitalRequired / capital) * 100).toFixed(1)) : 0;

    // 交易成本計算 (台股手續費率 0.1425%，最低 20 元)
    const buyFee = Math.max(20, Math.round(totalCapitalRequired * 0.001425 * brokerDiscount));
    
    // 停利出場總手續費與證交稅
    const targetValue = Math.round(recommendedShares * target);
    const targetSellFee = Math.max(20, Math.round(targetValue * 0.001425 * brokerDiscount));
    const targetTaxRate = isDayTrade ? 0.0015 : 0.003;
    const targetTax = Math.round(targetValue * targetTaxRate);
    const netProfit = (targetValue - totalCapitalRequired) - (buyFee + targetSellFee + targetTax);
    const profitPercent = totalCapitalRequired > 0 ? Number(((netProfit / totalCapitalRequired) * 100).toFixed(2)) : 0;

    // 停損出場總手續費與證交稅
    const stopValue = Math.round(recommendedShares * stop);
    const stopSellFee = Math.max(20, Math.round(stopValue * 0.001425 * brokerDiscount));
    const stopTax = Math.round(stopValue * targetTaxRate);
    const netLoss = (totalCapitalRequired - stopValue) + (buyFee + stopSellFee + stopTax);
    const lossPercent = totalCapitalRequired > 0 ? Number(((netLoss / totalCapitalRequired) * 100).toFixed(2)) : 0;

    // 真實風報比 (Risk-to-Reward Ratio)
    const riskRewardRatio = netLoss > 0 ? Number((netProfit / netLoss).toFixed(2)) : 0;

    return {
      maxRiskDollar: Math.round(maxRiskDollar),
      recommendedShares,
      lots,
      oddLots,
      totalCapitalRequired,
      capitalUsagePercent,
      buyFee,
      netProfit,
      profitPercent,
      netLoss,
      lossPercent,
      riskRewardRatio
    };
  }, [accountCapital, riskPercent, entryPrice, stopLossPrice, targetPrice, brokerDiscount, isDayTrade]);

  // 儲存至 LocalStorage 交易計畫
  const handleSaveTradePlan = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('kline_trade_plans') || '[]');
      const newPlan = {
        id: `plan_${Date.now()}`,
        date: new Date().toISOString(),
        stockCode: stockCode || '0000',
        stockName: stockName || '自選個股',
        patternName: detectedPatternName || '形態交易',
        entryPrice: Number(entryPrice),
        stopLossPrice: Number(stopLossPrice),
        targetPrice: Number(targetPrice),
        shares: calculations.recommendedShares,
        lots: calculations.lots,
        oddLots: calculations.oddLots,
        capitalRequired: calculations.totalCapitalRequired,
        riskRewardRatio: calculations.riskRewardRatio,
        maxLoss: calculations.netLoss,
        status: 'pending' // pending | active | completed | stopped_out
      };

      existing.unshift(newPlan);
      // 最多保存 50 筆計畫
      localStorage.setItem('kline_trade_plans', JSON.stringify(existing.slice(0, 50)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.warn('儲存交易計畫失敗:', e);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.35)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(20, 30, 55, 0.85) 100%)' }}>
      
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              實戰部位大小與風控計算器
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              依帳戶總資金與單筆風險嚴格控管下單張數，自動扣除台股手續費與證交稅
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveTradePlan}
          className="btn-primary"
          style={{
            fontSize: '0.82rem',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isSaved ? '#10b981' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderColor: isSaved ? '#10b981' : '#3b82f6'
          }}
        >
          {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
          <span>{isSaved ? '已保存至交易計畫' : '儲存為我的交易計畫'}</span>
        </button>
      </div>

      {/* 參數輸入區 (網格排版) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: '14px', marginBottom: '18px' }}>
        
        {/* 帳戶總資金 */}
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>帳戶總資金 (NT$)</label>
          </div>
          <input
            type="number"
            value={accountCapital}
            onChange={(e) => setAccountCapital(Number(e.target.value))}
            step="10000"
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '1rem', fontWeight: '700' }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[100000, 300000, 500000, 1000000].map(amt => (
              <button
                key={amt}
                onClick={() => setAccountCapital(amt)}
                style={{ fontSize: '0.7rem', padding: '2px 6px', background: accountCapital === amt ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: accountCapital === amt ? '#60a5fa' : '#94a3b8', cursor: 'pointer' }}
              >
                {amt / 10000}萬
              </button>
            ))}
          </div>
        </div>

        {/* 單筆最大風險 % */}
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>單筆最大風險率</label>
            <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '800' }}>{riskPercent}% (NT$ {calculations.maxRiskDollar.toLocaleString()})</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            {[0.5, 1.0, 1.5, 2.0].map(rate => (
              <button
                key={rate}
                onClick={() => setRiskPercent(rate)}
                style={{ fontSize: '0.7rem', padding: '2px 6px', background: riskPercent === rate ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: riskPercent === rate ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* 預計進場價 */}
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            預計進場價 (NT$)
          </label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            step="0.1"
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #3b82f6', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '1rem', fontWeight: '700' }}
          />
        </div>

        {/* 停損防守價 */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <label style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            🛡️ 停損防守價 (NT$)
          </label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(Number(e.target.value))}
            step="0.1"
            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #ef4444', borderRadius: '6px', padding: '6px 10px', color: '#f87171', fontSize: '1rem', fontWeight: '700' }}
          />
        </div>

        {/* 獲利目標價 */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <label style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
            🎯 獲利目標價 (NT$)
          </label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(Number(e.target.value))}
            step="0.1"
            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid #10b981', borderRadius: '6px', padding: '6px 10px', color: '#34d399', fontSize: '1rem', fontWeight: '700' }}
          />
        </div>

        {/* 券商折讓與當沖選項 */}
        <div style={{ background: 'rgba(0,0,0,0.35)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>手續費折讓</label>
            <select
              value={brokerDiscount}
              onChange={(e) => setBrokerDiscount(Number(e.target.value))}
              style={{ background: '#1e293b', border: '1px solid var(--border-subtle)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              <option value="1.0">無折讓 (全額)</option>
              <option value="0.6">6 折 (一般券商)</option>
              <option value="0.28">2.8 折 (網路券商)</option>
              <option value="0.2">2 折 (極低折讓)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>當沖交易 (稅 0.15%)</label>
            <input
              type="checkbox"
              checked={isDayTrade}
              onChange={(e) => setIsDayTrade(e.target.checked)}
              style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
        </div>

      </div>

      {/* 精算結果卡片看板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '12px' }}>
        
        {/* 1. 建議下單部位 */}
        <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: '600', marginBottom: '4px' }}>
            建議買進部位 (嚴格風控)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff' }}>
            {calculations.lots > 0 ? `${calculations.lots} 張` : ''} {calculations.oddLots > 0 ? `${calculations.oddLots} 股` : (calculations.lots === 0 ? '0 股' : '')}
            <span style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: '600', marginLeft: '6px' }}>
              (共 {calculations.recommendedShares.toLocaleString()} 股)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
            總買進資金：NT$ {calculations.totalCapitalRequired.toLocaleString()} ({calculations.capitalUsagePercent}% 本金)
          </div>
        </div>

        {/* 2. 停損最大淨虧損 */}
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: '600', marginBottom: '4px' }}>
            觸及停損預估淨虧損 (含手續費)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#f87171' }}>
            - NT$ {calculations.netLoss.toLocaleString()}
            <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: '600', marginLeft: '6px' }}>
              (-{calculations.lossPercent}%)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '4px' }}>
            嚴守在單筆 {riskPercent}% 風險底線之內
          </div>
        </div>

        {/* 3. 達標預估淨獲利 */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <div style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: '600', marginBottom: '4px' }}>
            達標停利預估淨獲利 (淨落袋)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#34d399' }}>
            + NT$ {calculations.netProfit.toLocaleString()}
            <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: '600', marginLeft: '6px' }}>
              (+{calculations.profitPercent}%)
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '4px' }}>
            已扣除雙向手續費及證交稅
          </div>
        </div>

        {/* 4. 風險報酬比 R:R */}
        <div style={{ background: calculations.riskRewardRatio >= 2.0 ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255,255,255,0.05)', padding: '14px', borderRadius: '10px', border: `1px solid ${calculations.riskRewardRatio >= 2.0 ? 'rgba(234, 179, 8, 0.4)' : 'var(--border-subtle)'}` }}>
          <div style={{ fontSize: '0.8rem', color: calculations.riskRewardRatio >= 2.0 ? '#fde047' : '#cbd5e1', fontWeight: '600', marginBottom: '4px' }}>
            實質淨風險報酬比 (R:R)
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: '900', color: calculations.riskRewardRatio >= 2.0 ? '#facc15' : '#ffffff' }}>
            1 : {calculations.riskRewardRatio}
            {calculations.riskRewardRatio >= 2.0 && (
              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(234, 179, 8, 0.3)', color: '#fef08a', borderRadius: '4px', marginLeft: '6px', fontWeight: '800' }}>
                ⭐ 優質風報比
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {calculations.riskRewardRatio >= 1.5 ? '符合專業操盤正期望值標竿' : '風報比較低，建議提高目標價或拉緊防守'}
          </div>
        </div>

      </div>

    </div>
  );
}
