import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import PatternEncyclopedia from './components/PatternEncyclopedia';
import InteractiveCanvas from './components/InteractiveCanvas';
import ApiKeyModal from './components/ApiKeyModal';
import { analyzeKlineImage, SAMPLE_CHARTS } from './services/aiVisionService';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'encyclopedia' | 'simulator'
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const [loadedSimulatorPattern, setLoadedSimulatorPattern] = useState(null);

  // 讀取儲存的 API Key 與模型設定
  useEffect(() => {
    const savedKey = localStorage.getItem('kline_gemini_api_key');
    if (savedKey) setApiKey(savedKey);

    const savedModel = localStorage.getItem('kline_gemini_model');
    if (savedModel) setSelectedModel(savedModel);

    // 預設載入標準陽明截圖並執行真實即時辨識
    const defaultSample = SAMPLE_CHARTS[0];
    if (defaultSample && defaultSample.id) {
      handleImageSelected(defaultSample.id, defaultSample.title);
    }
  }, []);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('kline_gemini_api_key', key);
    } else {
      localStorage.removeItem('kline_gemini_api_key');
    }
  };

  const handleSaveModel = (model) => {
    setSelectedModel(model);
    localStorage.setItem('kline_gemini_model', model);
  };

  // 從百科直接帶入特定型態至模擬測試畫板
  const handleLoadToSimulator = (pattern) => {
    setLoadedSimulatorPattern(pattern);
    setActiveTab('simulator');
  };

  // 選擇圖片並開始分析 (即時調用 AI 進行真實辨識)
  const handleImageSelected = async (imageSource, title) => {
    setSelectedImage(imageSource || null);
    setIsAnalyzing(true);
    setAnalysisResult(null); // 清除舊資料，讓 UI 確實反映出正在更新
    setActiveTab('analyzer');

    try {
      let base64Data = imageSource;
      if (imageSource && !imageSource.startsWith('data:')) {
        const res = await fetch(imageSource);
        const blob = await res.blob();
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      const result = await analyzeKlineImage(base64Data, apiKey, selectedModel);
      setAnalysisResult(result);

      // 特效回饋
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#ef4444']
      });
    } catch (err) {
      console.error('辨識失敗:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 16px 40px' }}>
      
      {/* 頂部導航 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={!!apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* 主要內容區 */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', flex: 1 }}>
        
        {activeTab === 'analyzer' && (
          <div>
            <ImageUploader
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
              selectedImage={selectedImage}
            />

            <AnalysisResult
              result={analysisResult}
              isAnalyzing={isAnalyzing}
              onSelectPatternView={(patternId) => {
                setActiveTab('encyclopedia');
              }}
            />
          </div>
        )}

        {activeTab === 'encyclopedia' && (
          <PatternEncyclopedia
            onLoadToSimulator={handleLoadToSimulator}
          />
        )}

        {activeTab === 'simulator' && (
          <InteractiveCanvas
            loadedPattern={loadedSimulatorPattern}
            onClearLoadedPattern={() => setLoadedSimulatorPattern(null)}
          />
        )}

      </main>

      {/* 頁尾資訊 */}
      <footer style={{ textAlign: 'center', marginTop: '30px', padding: '20px 0', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <p>K-Line Master | 股票 K 線智能分析與走勢預判系統 &copy; 2026</p>
        <p style={{ marginTop: '4px', fontSize: '0.72rem' }}>
          本系統分析結果僅供學術與技術形態研究參考，不構成任何實質投資建議。投資有風險，入市需謹慎。
        </p>
        <p style={{ marginTop: '6px', fontSize: '0.72rem', color: '#60a5fa', fontFamily: 'monospace' }}>
          Build Time: {typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'Dev'} build
        </p>
      </footer>

      {/* API Key & Model Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSaveModel={handleSaveModel}
      />

    </div>
  );
}
