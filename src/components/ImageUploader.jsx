import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { SAMPLE_CHARTS } from '../services/aiVisionService';

export default function ImageUploader({ onImageSelected, isAnalyzing, selectedImage }) {
  const [isDragging, setIsDragging] = useState(false);
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

        {/* 快速範例按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>快速載入範例：</span>
          {SAMPLE_CHARTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onImageSelected(sample.id, sample.title, sample.presetAnalysis)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Zap size={13} color="#f59e0b" />
              <span>{sample.stockName || sample.title.split(' - ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 拖曳上傳與貼上區域 */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: selectedImage ? '16px' : '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
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
                支援 PNG, JPG, WebP 圖片，亦可直接按 <strong style={{ color: '#60a5fa' }}>Ctrl+V</strong> 貼上
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
