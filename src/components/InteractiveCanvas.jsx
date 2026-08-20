import React, { useState, useEffect } from 'react';
import { Play, Plus, RotateCcw, Trash2, TrendingUp, Info, Sparkles, X, Cpu, Bot, BarChart2, Shield, Target, Flame, Droplets, Scale } from 'lucide-react';
import { PatternSVG } from './PatternEncyclopedia';
import { getPatternSimulatorCandles, KLINE_PATTERNS } from '../data/klinePatterns';
import { analyzeSimulatedCandles } from '../services/aiVisionService';

// 8 大經典實戰劇本預設組合 (含量價配置)
const PRESET_SCENARIOS = [
  {
    id: 'rising_three',
    name: '上升三法 (中繼續漲)',
    tag: '🚀 中繼突破',
    candles: [
      { open: 70, close: 35, high: 28, low: 75, color: '#ef4444', volumeLevel: 'burst', shadowType: '長紅實體' },
      { open: 36, close: 48, high: 32, low: 52, color: '#10b981', volumeLevel: 'dry', shadowType: '小黑壓回' },
      { open: 48, close: 58, high: 44, low: 62, color: '#10b981', volumeLevel: 'dry', shadowType: '縮量洗盤' },
      { open: 58, close: 20, high: 15, low: 62, color: '#ef4444', volumeLevel: 'burst', shadowType: '帶量長紅突破' }
    ]
  },
  {
    id: 'morning_star',
    name: '早晨之星 (破曉反轉底)',
    tag: '🟢 底部築底',
    candles: [
      { open: 25, close: 65, high: 20, low: 70, color: '#10b981', volumeLevel: 'burst', shadowType: '恐慌長黑' },
      { open: 75, close: 75, high: 65, low: 85, color: '#f59e0b', volumeLevel: 'dry', shadowType: '跳空十字星' },
      { open: 70, close: 30, high: 25, low: 75, color: '#ef4444', volumeLevel: 'burst', shadowType: '爆量貫穿長紅' }
    ]
  },
  {
    id: 'evening_star',
    name: '黃昏夜星 (高檔見頂斷頭)',
    tag: '🔴 高檔反轉',
    candles: [
      { open: 65, close: 25, high: 20, low: 70, color: '#ef4444', volumeLevel: 'burst', shadowType: '最後衝刺長紅' },
      { open: 15, close: 15, high: 8, low: 25, color: '#f59e0b', volumeLevel: 'burst', shadowType: '高檔懸空十字' },
      { open: 25, close: 68, high: 22, low: 72, color: '#10b981', volumeLevel: 'burst', shadowType: '無情貫穿長黑' }
    ]
  },
  {
    id: 'bullish_engulfing',
    name: '多頭吞噬 (陽包陰反攻)',
    tag: '🟢 止跌轉強',
    candles: [
      { open: 35, close: 60, high: 30, low: 65, color: '#10b981', volumeLevel: 'normal', shadowType: '一般跌勢黑K' },
      { open: 68, close: 25, high: 20, low: 72, color: '#ef4444', volumeLevel: 'burst', shadowType: '全包覆大長紅' }
    ]
  },
  {
    id: 'bearish_engulfing',
    name: '空頭吞噬 (陰包陽斷頭)',
    tag: '🔴 主力倒貨',
    candles: [
      { open: 60, close: 35, high: 30, low: 65, color: '#ef4444', volumeLevel: 'normal', shadowType: '一般漲勢紅K' },
      { open: 28, close: 70, high: 22, low: 75, color: '#10b981', volumeLevel: 'burst', shadowType: '全吞沒大長黑' }
    ]
  },
  {
    id: 'shooting_star',
    name: '射擊之星 (高檔假突破爆量倒貨)',
    tag: '🔴 避險停利',
    candles: [
      { open: 70, close: 40, high: 35, low: 75, color: '#ef4444', volumeLevel: 'normal', shadowType: '前置拉抬紅K' },
      { open: 35, close: 42, high: 10, low: 45, color: '#10b981', volumeLevel: 'burst', shadowType: '極長上引線' }
    ]
  },
  {
    id: 'hammer_bottom',
    name: '槌子探底神針 (下影線打底)',
    tag: '🟢 底部承接',
    candles: [
      { open: 20, close: 50, high: 15, low: 55, color: '#10b981', volumeLevel: 'normal', shadowType: '連跌黑K' },
      { open: 55, close: 50, high: 45, low: 88, color: '#ef4444', volumeLevel: 'burst', shadowType: '極長下引線' }
    ]
  },
  {
    id: 'three_soldiers',
    name: '紅三兵 (強勢攻堅主升段)',
    tag: '🚀 強勢攻擊',
    candles: [
      { open: 75, close: 55, high: 50, low: 80, color: '#ef4444', volumeLevel: 'normal', shadowType: '起步小紅' },
      { open: 55, close: 35, high: 30, low: 60, color: '#ef4444', volumeLevel: 'normal', shadowType: '墊高中紅' },
      { open: 35, close: 15, high: 10, low: 40, color: '#ef4444', volumeLevel: 'burst', shadowType: '帶量大長紅' }
    ]
  }
];

export default function InteractiveCanvas({ loadedPattern, onClearLoadedPattern, apiKey, selectedModel, onOpenApiKeyModal }) {
  const [candles, setCandles] = useState(PRESET_SCENARIOS[0].candles);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // 當從百科帶入特定型態時，自動載入該型態之 K 棒
  useEffect(() => {
    if (loadedPattern) {
      const pCandles = getPatternSimulatorCandles(loadedPattern);
      if (pCandles.length > 0) {
        setCandles(pCandles.map(c => ({
          ...c,
          volumeLevel: c.volumeLevel || 'normal',
          shadowType: c.shadowType || '自訂型態'
        })));
        setAiReport(null);
      }
    }
  }, [loadedPattern]);

  // 切換某根 K 棒的成交量狀態 (normal -> burst -> dry)
  const toggleVolume = (index) => {
    setCandles(prev => prev.map((c, i) => {
      if (i !== index) return c;
      const nextVol = c.volumeLevel === 'normal' ? 'burst' : c.volumeLevel === 'burst' ? 'dry' : 'normal';
      return { ...c, volumeLevel: nextVol };
    }));
  };

  // 插入特定類型 K 棒
  const addCandle = (type) => {
    let newCandle = { open: 60, close: 25, high: 20, low: 65, color: '#ef4444', volumeLevel: 'normal', shadowType: '標準紅K' };
    
    switch (type) {
      case 'bull': // 長紅
        newCandle = { open: 65, close: 20, high: 15, low: 70, color: '#ef4444', volumeLevel: 'burst', shadowType: '大長紅' };
        break;
      case 'bear': // 長黑
        newCandle = { open: 20, close: 65, high: 15, low: 70, color: '#10b981', volumeLevel: 'burst', shadowType: '大長黑' };
        break;
      case 'doji': // 十字星
        newCandle = { open: 45, close: 45, high: 20, low: 75, color: '#f59e0b', volumeLevel: 'dry', shadowType: '十字星' };
        break;
      case 'upper_shadow': // 長上引線 (射擊之星)
        newCandle = { open: 45, close: 50, high: 12, low: 52, color: '#10b981', volumeLevel: 'burst', shadowType: '長上引線' };
        break;
      case 'lower_shadow': // 長下引線 (槌子線)
        newCandle = { open: 35, close: 30, high: 25, low: 75, color: '#ef4444', volumeLevel: 'burst', shadowType: '長下引線' };
        break;
      case 'gap_up': // 向上跳空紅
        newCandle = { open: 30, close: 12, high: 8, low: 35, color: '#ef4444', volumeLevel: 'burst', shadowType: '跳空突破紅' };
        break;
      case 'gap_down': // 向下跳空黑
        newCandle = { open: 55, close: 78, high: 52, low: 85, color: '#10b981', volumeLevel: 'burst', shadowType: '跳空殺跌黑' };
        break;
      default:
        break;
    }

    setCandles(prev => [...prev, newCandle]);
    setAiReport(null);
  };

  // 撤銷最後一根
  const handleUndo = () => {
    setCandles(prev => prev.slice(0, -1));
    setAiReport(null);
  };

  // 清空
  const handleClearAll = () => {
    setCandles([]);
    setAiReport(null);
  };

  // 載入經典劇本
  const loadScenario = (scenario) => {
    setCandles(scenario.candles.map(c => ({ ...c })));
    setAiReport(null);
  };

  // 呼叫 Gemini AI 深度推演當前手繪畫板組合
  const handleRunAiAnalysis = async () => {
    if (candles.length === 0) {
      alert('請先在畫板中插入至少 1 根 K 棒！');
      return;
    }

    if (!apiKey || apiKey.trim().length < 10) {
      if (onOpenApiKeyModal) onOpenApiKeyModal();
      return;
    }

    setIsAiAnalyzing(true);
    setAiReport(null);

    try {
      const result = await analyzeSimulatedCandles(candles, apiKey, selectedModel);
      setAiReport(result);
    } catch (err) {
      console.error('AI 模擬推演失敗:', err);
      alert(`⚠️ 推演失敗：${err.message}`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // 內建即時快速診斷
  const getQuickDiagnosis = () => {
    const len = candles.length;
    if (len === 0) return { name: '畫布空白，請插入 K 棒或點選下方 8 大劇本', winRate: '--', sentiment: 'neutral', summary: '自由組合 K 棒與量能，實時觀察多空力量反應。' };
    
    const last = candles[len - 1];
    const prev = len >= 2 ? candles[len - 2] : null;

    if (Math.abs(last.open - last.close) <= 5) {
      return { name: '長十字星 (變盤猶豫訊號)', winRate: '75%', sentiment: 'neutral', summary: '多空陷入僵局，若伴隨縮量代表洗盤待變，若爆量則代表高檔換手。' };
    }
    if (last.shadowType === '長上引線' || (last.open >= 40 && last.high <= 15)) {
      return { name: '射擊之星 / 倒槌 (上方賣壓沉重)', winRate: '82%', sentiment: 'bearish', summary: '衝高後遭遇大戶無情摜壓，若伴隨爆量代表主力出貨。' };
    }
    if (last.shadowType === '長下引線' || (last.low >= 70 && last.close <= 40)) {
      return { name: '探底槌子線 (低檔買盤承接)', winRate: '84%', sentiment: 'bullish', summary: '下殺過程中出現強勁低接買盤，有築底反彈契機。' };
    }
    if (len >= 2 && prev && prev.color === '#10b981' && last.color === '#ef4444' && last.close <= prev.open) {
      return { name: '多頭吞噬 (強烈止跌反攻)', winRate: '85%', sentiment: 'bullish', summary: '今日長紅一口吞噬昨日長黑，多軍發起強烈反攻！' };
    }
    if (len >= 2 && prev && prev.color === '#ef4444' && last.color === '#10b981' && last.close >= prev.open) {
      return { name: '空頭吞噬 (烏雲罩頂倒貨)', winRate: '86%', sentiment: 'bearish', summary: '今日長黑直接破壞昨日長紅，空方重拳出擊。' };
    }
    if (last.color === '#ef4444') {
      return { name: '大陽線 (多方攻擊掌控)', winRate: '78%', sentiment: 'bullish', summary: '實體飽滿，多方掌控盤面節奏。' };
    }
    return { name: '大陰線 (空方壓制整理)', winRate: '80%', sentiment: 'bearish', summary: '實體收黑，盤面面臨獲利回吐賣壓。' };
  };

  const quickDiag = getQuickDiagnosis();

  return (
    <div className="glass-panel" style={{ padding: '24px', margin: '20px 0' }}>
      
      {/* 頂部若有從百科載入形態 */}
      {loadedPattern && (
        <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#60a5fa" />
            <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
              正在演練百科型態：<strong style={{ color: '#93c5fd' }}>【{loadedPattern.name}】</strong>
            </span>
          </div>
          {onClearLoadedPattern && (
            <button
              onClick={onClearLoadedPattern}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={14} /> 退出此型態
            </button>
          )}
        </div>
      )}

      {/* 標題與核心動作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} color="#3b82f6" />
            <span>K 棒模擬測試畫板 (實戰升級版)</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            自由拼接 K 棒與量價關係，支援 8 大主力劇本快速載入與一鍵呼叫 Gemini AI 深度推演！
          </p>
        </div>

        {/* 核心 AI 推演按鈕 */}
        <button
          onClick={handleRunAiAnalysis}
          disabled={candles.length === 0 || isAiAnalyzing}
          className="btn-primary"
          style={{
            fontSize: '0.9rem',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            boxShadow: '0 4px 18px rgba(139, 92, 246, 0.4)'
          }}
        >
          {isAiAnalyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={18} className="animate-spin-custom" /> AI 思考推演中...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={18} /> 🤖 呼叫 AI 深度走勢推演
            </span>
          )}
        </button>
      </div>

      {/* 【升級 1】8 大實戰劇本快捷切換列 */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={15} /> ⚡ 8 大經典主力作戰劇本（點擊秒切換演練）：
        </div>
        <div className="scrollable-tabs" style={{ gap: '8px', paddingBottom: '4px' }}>
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => loadScenario(sc)}
              className="btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--border-subtle)',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 【升級 2】多功能 K 棒插入工具箱 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px' }}>➕ 插入 K 棒：</span>
          <button onClick={() => addCandle('bull')} className="btn-secondary" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🔴 長紅 K
          </button>
          <button onClick={() => addCandle('bear')} className="btn-secondary" style={{ color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.4)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🟢 長黑 K
          </button>
          <button onClick={() => addCandle('doji')} className="btn-secondary" style={{ color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.4)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🟡 十字星
          </button>
          <button onClick={() => addCandle('upper_shadow')} className="btn-secondary" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🔺 射擊之星(長上影)
          </button>
          <button onClick={() => addCandle('lower_shadow')} className="btn-secondary" style={{ color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.3)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🔻 探底神針(長下影)
          </button>
          <button onClick={() => addCandle('gap_up')} className="btn-secondary" style={{ color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', fontSize: '0.82rem', padding: '6px 10px' }}>
            🚀 向上跳空
          </button>
          <button onClick={() => addCandle('gap_down')} className="btn-secondary" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.82rem', padding: '6px 10px' }}>
            💥 向下跳空
          </button>
        </div>

        {/* 畫布清空 / 撤銷 */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {candles.length > 0 && (
            <button onClick={handleUndo} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#cbd5e1' }}>
              撤銷上一步
            </button>
          )}
          {candles.length > 0 && (
            <button onClick={handleClearAll} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', color: '#f87171' }}>
              <Trash2 size={14} /> 清空畫布
            </button>
          )}
        </div>
      </div>

      {/* 【升級 3】K 線 + 成交量雙軌視覺展示畫板 */}
      <div 
        style={{ 
          background: 'rgba(0,0,0,0.5)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-subtle)', 
          padding: '24px 20px', 
          minHeight: '300px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          overflowX: 'auto'
        }}
      >
        {candles.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>畫布已清空，請點擊上方按鈕插入 K 棒或點選 8 大劇本開始模擬</p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px', padding: '10px 0' }}>
            {candles.map((candle, idx) => {
              const isBull = candle.color === '#ef4444';
              const volHeight = candle.volumeLevel === 'burst' ? 65 : candle.volumeLevel === 'dry' ? 15 : 35;
              const volLabel = candle.volumeLevel === 'burst' ? '🔥 爆量' : candle.volumeLevel === 'dry' ? '💧 窒息' : '⚖️ 均量';
              const volColor = candle.volumeLevel === 'burst' ? '#f59e0b' : isBull ? '#ef4444' : '#10b981';

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  
                  {/* K 棒本體 */}
                  <PatternSVG config={{ type: 'single', ...candle }} width={55} height={125} />
                  
                  {/* 時間軸標籤 */}
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    T+{idx + 1}
                  </span>

                  {/* 成交量柱狀圖 (點擊可切換爆量/均量/窒息量) */}
                  <div
                    onClick={() => toggleVolume(idx)}
                    style={{
                      width: '42px',
                      height: '75px',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      padding: '2px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    title="點擊切換成交量 (爆量 / 均量 / 窒息量)"
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${volHeight}px`,
                        background: volColor,
                        borderRadius: '2px',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  {/* 成交量標籤 */}
                  <button
                    onClick={() => toggleVolume(idx)}
                    style={{
                      fontSize: '0.68rem',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: volColor,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {volLabel}
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部即時速覽列 */}
      <div style={{ marginTop: '16px', padding: '14px 16px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="#60a5fa" />
          <div>
            <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: '700' }}>即時幾何力道速判：</span>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginLeft: '6px' }}>{quickDiag.name}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>{quickDiag.summary}</span>
          </div>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#f8fafc', background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: '16px' }}>
          歷史勝率：<strong style={{ color: quickDiag.sentiment === 'bullish' ? '#ef4444' : quickDiag.sentiment === 'bearish' ? '#10b981' : '#f59e0b' }}>{quickDiag.winRate}</strong>
        </div>
      </div>

      {/* 【升級 4】Gemini AI 深度推演報告卡片 (當執行 AI 推演時展現) */}
      {aiReport && (
        <div className="glass-panel" style={{ marginTop: '20px', padding: '22px', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={22} color="#a855f7" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                Gemini AI 深度技術與量價推演報告
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.4)', fontWeight: '700' }}>
              型態預估勝率：{aiReport.winRate || 80}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', alignItems: 'start' }}>
            
            {/* 主力心態分析 */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={15} /> 🧠 主力心態與量價博弈：
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                {aiReport.marketPsychology}
              </p>
            </div>

            {/* 明日三套應對劇本 */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fcd34d', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={15} /> 🔮 明日推演劇本與觸發條件：
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                {aiReport.nextDayForecast}
              </p>
            </div>

          </div>

          {/* 操盤 SOP */}
          {aiReport.tradingStrategy?.length > 0 && (
            <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={15} /> 🛡️ 實戰操盤 SOP 與防守底線：
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                {aiReport.tradingStrategy.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
