import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw, HelpCircle, X, Check, AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import { SAMPLE_CHARTS } from '../services/aiVisionService';

export default function ImageUploader({ onImageSelected, isAnalyzing, selectedImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [stockCode, setStockCode] = useState('');
  const fileInputRef = useRef(null);

  // 監聽全域 Ctrl + V 剪貼簿貼上圖片
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              onImageSelected(event.target.result, '剪貼簿貼上的 K 線截圖');
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onImageSelected]);

  // 處理檔案選擇
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageSelected(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // 拖曳處理
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageSelected(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="#3b82f6" />
            <span>K 線圖表輸入與辨識</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            支援在任意地方按 <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>Ctrl + V</kbd> 直接貼上看盤截圖，或拖曳圖檔至下方
          </p>
        </div>

        {/* 截圖指引與範例按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
          >
            <HelpCircle size={14} />
            <span>💡 截圖範圍教學</span>
          </button>

          {SAMPLE_CHARTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onImageSelected(sample.id, sample.title)}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
              title={sample.description}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>試用標準範例圖</span>
            </button>
          ))}
        </div>
      </div>

      {/* 快速開啟 Yahoo 股市截圖 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: '600' }}>
          快速開啟截圖網頁：
        </div>
        <input
          type="text"
          placeholder="輸入台股代號 (如 2330)"
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && stockCode.trim()) {
              window.open(`https://tw.stock.yahoo.com/quote/${stockCode.trim()}.TW/technical-analysis`, '_blank', 'noopener,noreferrer');
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#fff',
            fontSize: '0.85rem',
            width: '160px',
            outline: 'none'
          }}
        />
        <button
          disabled={!stockCode.trim()}
          onClick={() => window.open(`https://tw.stock.yahoo.com/quote/${stockCode.trim()}.TW/technical-analysis`, '_blank', 'noopener,noreferrer')}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '0.85rem', opacity: stockCode.trim() ? 1 : 0.5, cursor: stockCode.trim() ? 'pointer' : 'not-allowed' }}
        >
          前往 Yahoo 技術分析
        </button>
      </div>

      {/* 拖曳上傳與貼上區域 */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={isAnalyzing ? undefined : handleDragOver}
        onDragLeave={isAnalyzing ? undefined : handleDragLeave}
        onDrop={isAnalyzing ? undefined : handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        style={{
          padding: selectedImage ? '16px' : '40px 20px',
          textAlign: 'center',
          cursor: isAnalyzing ? 'wait' : 'pointer',
          opacity: isAnalyzing ? 0.7 : 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {selectedImage ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ maxHeight: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#000', width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedImage}
                alt="Selected K-Line Chart"
                style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> 圖片已就緒
              </span>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <RefreshCw size={13} /> 更換圖片
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <ImageIcon size={30} />
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text-primary)' }}>
                點擊上傳，或將 K 線截圖拖曳至此
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                支援各家看盤軟體截圖，亦可直接按 <strong style={{ color: '#60a5fa' }}>Ctrl+V</strong> 貼上
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 截圖範圍教學彈窗 (Screenshot Guide Modal) */}
      {isGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsGuideOpen(false)}>
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '100%', padding: '24px', position: 'relative', border: '1px solid rgba(59, 130, 246, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* 關閉按鈕 */}
            <button
              onClick={() => setIsGuideOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={22} color="#3b82f6" />
              <span>如何截出 100% 精準辨識的看盤截圖？</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              AI 辨識系統依賴以下 3 個核心區塊來進行精準量化與形態比對，截圖時請盡量完整涵蓋：
            </p>

            {/* 核心三要素圖解 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              
              {/* 要素 1 */}
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontWeight: '700', fontSize: '0.92rem' }}>
                  <Check size={16} /> 1. 【頂部行情狀態列】（最關鍵！）
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  務必包含：<strong>股票名稱、代碼 (如 2609)、開/高/低/收價格、當日漲跌幅、MA5/10/20/60 均線數字</strong>。AI 主要從這裡提取精準行情數據。
                  <br />
                  <span style={{ color: '#fca5a5', display: 'inline-block', marginTop: '4px' }}>💡 強烈推薦使用 <strong>Yahoo 股市 (技術分析頁面)</strong> 截圖，請確保股名旁邊的<strong>「股號數字」</strong>有拍進去，辨識率最高！</span>
                </p>
              </div>

              {/* 要素 2 */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontWeight: '700', fontSize: '0.92rem' }}>
                  <Check size={16} /> 2. 【中間 K 線主圖】
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  建議顯示 <strong>2 ~ 6 個月</strong> 的日 K 棒走勢與均線走勢，讓 AI 能準確比對型態結構（如突破、拉回、打底）。
                </p>
              </div>

              {/* 要素 3 */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontWeight: '700', fontSize: '0.92rem' }}>
                  <Check size={16} /> 3. 【下方成交量副圖】
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  包含當日與近期的量能柱狀圖，用以確認是否為「爆量長紅」或「窒息量打底」。
                </p>
              </div>

            </div>

            {/* 快捷鍵指南 */}
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
                ⚡ 推薦截圖快捷鍵：
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Monitor size={14} color="#60a5fa" />
                  <span>Windows: <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px' }}>Win + Shift + S</kbd> 框選</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Monitor size={14} color="#60a5fa" />
                  <span>Mac: <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px' }}>Cmd + Shift + 4</kbd> 框選</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone size={14} color="#34d399" />
                  <span>手機 App: 直接使用系統螢幕截圖</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', justifyContent: 'center' }}
            >
              我知道了，開始截圖！
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
