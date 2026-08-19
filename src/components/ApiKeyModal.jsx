import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey, selectedModel = 'auto', onSaveModel }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [model, setModel] = useState(selectedModel || 'auto');
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

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
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${inputKey.trim()}`);
      if (!listRes.ok) {
        const errJson = await listRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `獲取模型列表失敗 (HTTP ${listRes.status})`);
      }
      
      const listData = await listRes.json();
      const models = listData.models || [];
      
      // 找尋支援 generateContent 的模型
      const visionModels = models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
      
      if (visionModels.length === 0) {
        throw new Error(`您的 API Key 沒有權限存取任何支援對話的模型。`);
      }

      // 排列優先順序
      let preferredOrder = [
        'models/gemini-2.0-flash',
        'models/gemini-2.0-flash-thinking-exp-01-21',
        'models/gemini-2.0-pro-exp-02-05',
        'models/gemini-1.5-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-flash-latest',
        'models/gemini-1.5-pro-latest'
      ];

      if (model && model !== 'auto') {
        preferredOrder = [`models/${model}`, ...preferredOrder.filter(m => m !== `models/${model}`)];
      }
      
      const modelsToTest = [];
      for (const pref of preferredOrder) {
        if (visionModels.some(m => m.name === pref)) {
          modelsToTest.push(pref);
        }
      }
      // 加入剩下的
      for (const m of visionModels) {
        if (!modelsToTest.includes(m.name) && (m.name.includes('flash') || m.name.includes('pro') || m.name.includes('gemini'))) {
          modelsToTest.push(m.name);
        }
      }

      let workingModel = null;
      let lastErrorMsg = '';

      for (const targetModel of modelsToTest) {
        try {
          setTestMessage(`正在測試模型：${targetModel.replace('models/', '')}...`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${inputKey.trim()}`, {
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
        setTestStatus('success');
        setTestMessage(`連線測試成功！已綁定最佳視覺模型：${workingModel.replace('models/', '')}`);
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
              啟用 Gemini 2.0 Flash / Pro 深度多模態視覺辨識
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
            <option value="auto">✨ 智慧自動選擇 (推薦 - 優先 2.0 Flash / Thinking)</option>
            <option value="gemini-2.0-flash">🥇 Gemini 2.0 Flash (最新旗艦・秒速辨識)</option>
            <option value="gemini-2.0-flash-thinking-exp-01-21">🧠 Gemini 2.0 Flash Thinking (深度推理思考版)</option>
            <option value="gemini-2.0-pro-exp-02-05">👑 Gemini 2.0 Pro Experimental (最高智商頂規版)</option>
            <option value="gemini-1.5-pro">💎 Gemini 1.5 Pro (經典專業長文本版)</option>
            <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash (經典極速版)</option>
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
