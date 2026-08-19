import React, { useEffect, useState } from 'react';
import { Key, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { GEMINI_MODEL_OPTIONS, fetchAvailableGeminiModels, getGeminiModelCandidates } from '../services/aiVisionService';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey, selectedModel = 'auto', onSaveModel }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [model, setModel] = useState(selectedModel || 'auto');
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setModel(selectedModel || 'auto');
  }, [selectedModel]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey || inputKey.trim().length < 10) {
      setTestStatus('error');
      setTestMessage('請先輸入有效的 Gemini API Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('正在測試與 Google Gemini 伺服器連線並獲取可用模型...');

    try {
      const models = await fetchAvailableGeminiModels(inputKey.trim());
      const modelsToTest = getGeminiModelCandidates(model, models);
      if (modelsToTest.length === 0) {
        throw new Error('您的 API Key 沒有權限存取可用的 Gemini Flash 視覺模型。');
      }

      let workingModel = null;
      let lastErrorMsg = '';

      for (const targetModel of modelsToTest) {
        try {
          setTestMessage(`正在測試模型：${targetModel}...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${inputKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello, reply "OK"' }] }]
            })
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            lastErrorMsg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
            continue;
          }

          workingModel = targetModel;
          break;
        } catch (err) {
          lastErrorMsg = err.message;
        }
      }

      if (workingModel) {
        setModel(workingModel);
        setTestStatus('success');
        setTestMessage(`連線測試成功！已選用可用模型：${workingModel}`);
      } else {
        throw new Error(lastErrorMsg || '所有可用模型均測試失敗');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`連線失敗: ${err.message}`);
    }
  };

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    if (onSaveModel) onSaveModel(model);
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    setTestStatus(null);
    onSaveApiKey('');
    if (onSaveModel) onSaveModel('auto');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
              配置 Google Gemini API Key
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              啟用 Gemini Flash 多模態視覺辨識
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
          配置 API Key 後，系統將透過 Google 雲端視覺大模型直接讀取截圖中的全部文字、代碼、價格、均線與 K 線結構。
        </p>

        {/* 模型自訂選擇 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '6px', fontWeight: '600' }}>
            指定使用模型 (AI Model)：
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              background: '#1a2234',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {GEMINI_MODEL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '6px', fontWeight: '600' }}>
            Gemini API Key：
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                setTestStatus(null);
              }}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
            >
              {testStatus === 'testing' ? <RefreshCw size={14} className="animate-spin-custom" /> : '測試連線'}
            </button>
          </div>

          {/* 測試結果反饋 */}
          {testStatus && (
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: testStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: testStatus === 'success' ? '#34d399' : testStatus === 'error' ? '#f87171' : '#60a5fa',
              border: `1px solid ${testStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
            }}>
              {testStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{testMessage}</span>
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#10b981" /> 僅儲存於您本地瀏覽器 (localStorage)
            </span>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
                前往 Google AI Studio 申請免費 Key <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {apiKey && (
            <button
              onClick={handleClear}
              className="btn-secondary"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              清除 Key
            </button>
          )}
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSave} className="btn-primary">
            儲存配置
          </button>
        </div>
      </div>
    </div>
  );
}
