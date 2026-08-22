import { useEffect, useState } from 'react';
import { Key, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { GEMINI_MODEL_OPTIONS, fetchAvailableGeminiModels, getGeminiModelCandidates } from '../services/aiVisionService';

export default function ApiKeyModal({ isOpen, onClose, apiKey, initialStorageMode = 'session', onSaveApiKey, selectedModel = 'auto', onSaveModel, patternCount = 12, onSavePatternCount }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [storageMode, setStorageMode] = useState(initialStorageMode || 'session');
  const [model, setModel] = useState(selectedModel || 'auto');
  const [localPatternCount, setLocalPatternCount] = useState(patternCount);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setInputKey(apiKey || '');
    setStorageMode(initialStorageMode || 'session');
    setModel(selectedModel || 'auto');
    setLocalPatternCount(patternCount || 12);
  }, [apiKey, initialStorageMode, selectedModel, patternCount]);

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
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': inputKey.trim()
            },
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
    onSaveApiKey(inputKey.trim(), storageMode);
    if (onSaveModel) onSaveModel(model);
    if (onSavePatternCount) onSavePatternCount(localPatternCount);
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    setTestStatus(null);
    onSaveApiKey('', 'session');
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
          maxWidth: '560px',
          width: '100%',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
              配置 Google Gemini AI 視覺模型
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              解鎖大模型多維量化推演、跨市場共振解讀與第二意見分析
            </p>
          </div>
        </div>

        {/* 模型選擇 */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>
            🤖 AI 辨識模型偏好
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              background: '#1a1a2e',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          >
            {GEMINI_MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e', color: '#fff' }}>
                {opt.label} ({opt.desc})
              </option>
            ))}
          </select>
        </div>

        {/* 形態辨識數量上限 */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#e2e8f0' }}>
              📐 形態偵測演算法覆蓋庫
            </label>
            <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '700' }}>
              已載入 {localPatternCount} 種形態
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setLocalPatternCount(12)}
              className={`btn-${localPatternCount === 12 ? 'primary' : 'secondary'}`}
              style={{ padding: '8px 12px', fontSize: '0.82rem', textAlign: 'center' }}
            >
              ⭐ Top 12 經典高勝率形態
            </button>
            <button
              type="button"
              onClick={() => setLocalPatternCount(52)}
              className={`btn-${localPatternCount === 52 ? 'primary' : 'secondary'}`}
              style={{ padding: '8px 12px', fontSize: '0.82rem', textAlign: 'center' }}
            >
              📚 完整 52 種全形態圖鑑庫
            </button>
          </div>
        </div>

        {/* API Key 輸入框 */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: '600', marginBottom: '8px', color: '#e2e8f0' }}>
            🔑 Gemini API Key
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

          {/* 金鑰儲存模式切換 */}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
              🛡️ 金鑰儲存方式偏好：
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: storageMode === 'session' ? '#60a5fa' : '#94a3b8', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="storageMode"
                  value="session"
                  checked={storageMode === 'session'}
                  onChange={() => setStorageMode('session')}
                />
                <span>僅限本次工作階段 (推薦，關閉分頁即銷毀)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: storageMode === 'local' ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="storageMode"
                  value="local"
                  checked={storageMode === 'local'}
                  onChange={() => setStorageMode('local')}
                />
                <span>儲存於此瀏覽器 (下次免重複輸入)</span>
              </label>
            </div>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#10b981" /> 前端直連 Google，絕不上傳第三方伺服器
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
