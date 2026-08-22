import { useState, useMemo, useEffect } from 'react';
import { Calculator, Compass, Check, Copy } from 'lucide-react';

/**
 * 波段頂底速算器（三分法頂底與抄底測算）
 * 核心公式源自經典波段測幅法：
 * 1. 關鍵支撐位 (回檔抄底價) = (B - A) / 3 + A
 * 2. 波段強弱分水嶺 (半數回檔) = (B - A) / 2 + A
 * 3. 突破上攻第一目標 (測頂價) = B + (B - A) / 3
 * 4. 等幅對稱測頂目標 = B + (B - A)
 */
export default function SwingPivotCalculator({
  stockCode = '',
  stockName = '',
  currentPrice = 0,
  historicalData = []
}) {
  // 自動從近 60 根 K 棒尋找波段高低點
  const defaultPivots = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      const p = Number(currentPrice) || 100;
      return {
        lowA: Number((p * 0.85).toFixed(2)),
        highB: Number((p * 1.15).toFixed(2))
      };
    }
    const recentBars = historicalData.slice(-60);
    let minLow = Infinity;
    let maxHigh = -Infinity;

    recentBars.forEach(bar => {
      if (bar.low < minLow) minLow = bar.low;
      if (bar.high > maxHigh) maxHigh = bar.high;
    });

    return {
      lowA: minLow === Infinity ? (currentPrice * 0.85) : Number(minLow.toFixed(2)),
      highB: maxHigh === -Infinity ? (currentPrice * 1.15) : Number(maxHigh.toFixed(2))
    };
  }, [historicalData, currentPrice]);

  const [pointA, setPointA] = useState(defaultPivots.lowA);
  const [pointB, setPointB] = useState(defaultPivots.highB);
  const [copiedKey, setCopiedKey] = useState(null);

  // 當股價或數據更新時同步預設值
  useEffect(() => {
    setPointA(defaultPivots.lowA);
    setPointB(defaultPivots.highB);
  }, [defaultPivots]);

  // 快速切換週期範圍
  const handleRangeChange = (days) => {
    if (!historicalData || historicalData.length === 0) return;
    const sliceBars = historicalData.slice(-days);
    let minLow = Infinity;
    let maxHigh = -Infinity;
    sliceBars.forEach(b => {
      if (b.low < minLow) minLow = b.low;
      if (b.high > maxHigh) maxHigh = b.high;
    });
    if (minLow !== Infinity) setPointA(Number(minLow.toFixed(2)));
    if (maxHigh !== -Infinity) setPointB(Number(maxHigh.toFixed(2)));
  };

  // 核心公式計算
  const calc = useMemo(() => {
    const a = Number(pointA) || 0;
    const b = Number(pointB) || 0;
    const cur = Number(currentPrice) || 0;

    const diff = Math.max(0, b - a);
    const oneThird = diff / 3;
    const half = diff / 2;

    // 1. 關鍵支撐位 (回檔 1/3 位置 / 抄底參考價)
    const keySupport = Number((oneThird + a).toFixed(2));
    // 2. 半數回檔強弱分水嶺
    const halfRetracement = Number((half + a).toFixed(2));
    // 3. 淺回檔黃金支撐 (回檔 2/3 位置)
    const shallowSupport = Number((b - oneThird).toFixed(2));
    // 4. 突破第一目標頂
    const target1 = Number((b + oneThird).toFixed(2));
    // 5. 等幅對稱測頂
    const targetEqual = Number((b + diff).toFixed(2));

    // 當前價格相對於各點位的位置與距離 %
    const getDiffPercent = (targetVal) => {
      if (!cur || !targetVal) return null;
      const pct = ((cur - targetVal) / targetVal) * 100;
      return Number(pct.toFixed(2));
    };

    return {
      diff: Number(diff.toFixed(2)),
      oneThird: Number(oneThird.toFixed(2)),
      keySupport,
      keySupportPct: getDiffPercent(keySupport),
      halfRetracement,
      halfRetracementPct: getDiffPercent(halfRetracement),
      shallowSupport,
      shallowSupportPct: getDiffPercent(shallowSupport),
      target1,
      target1Pct: getDiffPercent(target1),
      targetEqual,
      targetEqualPct: getDiffPercent(targetEqual)
    };
  }, [pointA, pointB, currentPrice]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '24px 0', border: '1px solid rgba(59, 130, 246, 0.25)', position: 'relative', overflow: 'hidden' }}>
      
      {/* 頂部裝飾光暈 */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      {/* 標題與簡介 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Calculator size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                波段頂底速算器（三分法測算）
              </h3>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '600' }}>
                精準抄底公式
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
              依據波段起漲點 A 與高點 B，透過波段三分法則自動推演關鍵回檔支撐與目標測頂
            </p>
          </div>
        </div>

        {/* 快速選取歷史波段區間按鈕 */}
        {historicalData && historicalData.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>自動帶入高低點：</span>
            {[
              { label: '20日', days: 20 },
              { label: '60日', days: 60 },
              { label: '120日', days: 120 }
            ].map(item => (
              <button
                key={item.days}
                onClick={() => handleRangeChange(item.days)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 輸入區塊：A點 與 B點 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* A 點 (起漲低點) */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#93c5fd', fontWeight: '700', marginBottom: '6px' }}>
            <span>起漲點 A（波段低點）</span>
            <span style={{ color: '#64748b', fontSize: '0.74rem' }}>起點</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              step="any"
              value={pointA}
              onChange={(e) => setPointA(e.target.value)}
              placeholder="輸入低點 A"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#131b2e',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontSize: '1.05rem',
                fontWeight: '700',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* B 點 (波段頂部) */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#fca5a5', fontWeight: '700', marginBottom: '6px' }}>
            <span>波段高點 B（衝刺頂部）</span>
            <span style={{ color: '#64748b', fontSize: '0.74rem' }}>頂點</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              step="any"
              value={pointB}
              onChange={(e) => setPointB(e.target.value)}
              placeholder="輸入高點 B"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#241318',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '1.05rem',
                fontWeight: '700',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* 當前參考現價 */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>
            <span>當前參考股價</span>
            <span style={{ color: '#38bdf8', fontSize: '0.74rem' }}>{stockCode ? `${stockCode} ${stockName}` : '即時價'}</span>
          </label>
          <div style={{
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '1.05rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>${currentPrice || '--'}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>
              波段振幅: {pointA && pointB ? `+${(((pointB - pointA) / pointA) * 100).toFixed(1)}%` : '--'}
            </span>
          </div>
        </div>

      </div>

      {/* 核心計算結果卡片清單 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        
        {/* 1. 核心公式：關鍵支撐位 (回檔抄底價) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#10b981', color: '#0f172a', fontSize: '0.75rem', fontWeight: '900' }}>
                  影片核心公式
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc' }}>
                  關鍵支撐位 (回檔抄底價)
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(calc.keySupport.toString(), 'keySupport')}
                title="複製數值"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                {copiedKey === 'keySupport' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>

            {/* 展開算式圖示 */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#a7f3d0', fontFamily: 'monospace', margin: '8px 0' }}>
              ({pointB} - {pointA}) / 3 + {pointA} = <span style={{ fontWeight: 'bold', color: '#34d399' }}>{calc.keySupport}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#34d399' }}>
              ${calc.keySupport}
            </div>
            {calc.keySupportPct !== null && (
              <span style={{ fontSize: '0.75rem', color: calc.keySupportPct >= 0 ? '#6ee7b7' : '#f87171', fontWeight: '600' }}>
                距現價: {calc.keySupportPct >= 0 ? `+${calc.keySupportPct}%` : `${calc.keySupportPct}%`}
              </span>
            )}
          </div>
        </div>

        {/* 2. 波段強弱分水嶺 (半數回檔) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#cbd5e1' }}>
                強弱分水嶺（0.5 半數回檔）
              </span>
              <button
                onClick={() => copyToClipboard(calc.halfRetracement.toString(), 'half')}
                title="複製數值"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                {copiedKey === 'half' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#cbd5e1', fontFamily: 'monospace', margin: '8px 0' }}>
              ({pointB} - {pointA}) / 2 + {pointA} = {calc.halfRetracement}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#f8fafc' }}>
              ${calc.halfRetracement}
            </div>
            {calc.halfRetracementPct !== null && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                距現價: {calc.halfRetracementPct >= 0 ? `+${calc.halfRetracementPct}%` : `${calc.halfRetracementPct}%`}
              </span>
            )}
          </div>
        </div>

        {/* 3. 突破第一目標頂 (測頂) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: '900' }}>
                  上攻測頂
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc' }}>
                  第一目標壓力位
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(calc.target1.toString(), 'target1')}
                title="複製數值"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                {copiedKey === 'target1' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#fca5a5', fontFamily: 'monospace', margin: '8px 0' }}>
              {pointB} + ({pointB} - {pointA}) / 3 = <span style={{ fontWeight: 'bold', color: '#f87171' }}>{calc.target1}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ fontSize: '1.65rem', fontWeight: '900', color: '#f87171' }}>
              ${calc.target1}
            </div>
            {calc.target1Pct !== null && (
              <span style={{ fontSize: '0.75rem', color: calc.target1Pct >= 0 ? '#f87171' : '#6ee7b7', fontWeight: '600' }}>
                距現價: {calc.target1Pct >= 0 ? `+${calc.target1Pct}%` : `${calc.target1Pct}%`}
              </span>
            )}
          </div>
        </div>

        {/* 4. 等幅對稱測頂 (1:1 漲幅滿足點) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#cbd5e1' }}>
                等幅對稱測頂（1:1 滿足點）
              </span>
              <button
                onClick={() => copyToClipboard(calc.targetEqual.toString(), 'targetEqual')}
                title="複製數值"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                {copiedKey === 'targetEqual' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              </button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#cbd5e1', fontFamily: 'monospace', margin: '8px 0' }}>
              {pointB} + ({pointB} - {pointA}) = {calc.targetEqual}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#f8fafc' }}>
              ${calc.targetEqual}
            </div>
            {calc.targetEqualPct !== null && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                距現價: {calc.targetEqualPct >= 0 ? `+${calc.targetEqualPct}%` : `${calc.targetEqualPct}%`}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 視覺化階梯 / 數線說明圖示 */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#e2e8f0', fontWeight: '700', marginBottom: '6px' }}>
          <Compass size={16} color="#60a5fa" />
          <span>波段測算使用指南與實戰防守心法：</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>
            <strong style={{ color: '#34d399' }}>回檔抄底買點</strong>：當強勢股創高後回檔，第一道關鍵支撐為 <span style={{ color: '#34d399' }}>${calc.keySupport}</span>（波段起漲 1/3 位置），若在此處出現止跌 K 棒（如十字星、下影神針），為高勝率防守進場點。
          </li>
          <li>
            <strong style={{ color: '#f87171' }}>突破測頂停利</strong>：若股價再次放量突破高點 B（${pointB}），第一階上攻測頂滿足點為 <span style={{ color: '#f87171' }}>${calc.target1}</span>，可作為分批停利減碼的客觀參考價位。
          </li>
          <li>
            <strong style={{ color: '#fbbf24' }}>失效防守點</strong>：若後續回檔實體跌破起漲點 A（${pointA}），則代表原有波段上漲結構遭到破壞，推論失效，必須嚴格執行防守停損。
          </li>
        </ul>
      </div>

    </div>
  );
}
