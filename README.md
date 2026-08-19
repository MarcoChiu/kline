# 📈 K-Line Master - 股票 K 線智能分析與走勢預判系統

> 基於 **React + Vite + Google Gemini Flash 多模態大模型 + 本地 WASM OCR** 的現代化股票 K 線圖表智能辨識、型態分析與隔日走勢預測工具。

🔗 **線上體驗直接點擊 (Live Demo)**：[https://marcochiu.github.io/kline/](https://marcochiu.github.io/kline/)

---

## 🌟 核心特色

1. **⚡ Google Gemini Flash 多模態視覺模型**
   - 優先使用 `Gemini 2.5 Flash`，並支援 `Gemini 2.5 Flash-Lite` 與 API Key 實際可用的 Flash 模型自動備援。
   - 免費層的模型、速率與每日配額依 Google AI Studio 帳號、地區與最新政策為準。
   - 秒速讀取看盤截圖中的股票名稱、代碼、開高低收價格、均線系統與成交量。

2. **📖 完整 52 種經典 K 棒型態百科圖鑑**
   - 收錄《錢線百分百》48 種戰法中的內困三日翻紅／翻黑，並補充其他經典單 K、雙 K 與多 K 型態。
   - 配備向量 SVG 動態圖解、大白話解析、主力心態力量物理學、實戰操盤守則與歷史勝率。

3. **🏠 關鍵「天花板 (壓力)」與「地板 (支撐)」階梯**
   - 全面大白話化，新手一秒看懂卡關撞牆價與彈簧防守底線。

4. **📱 手機優先響應式設計 (Mobile-First)**
   - 專為行動裝置量身打造，支援橫向滑動標籤列、卡片式格狀佈局、高質感深色玻璃擬態 (Glassmorphism)。

5. **🛡️ 零成本 & 隱私安全**
   - 支援 Google AI Studio 免費層 API Key，金鑰僅儲存於本地瀏覽器 `localStorage`，絕不上傳第三方伺服器。
   - 內建離線 Tesseract WASM 本地 OCR 備用引擎。

---

## 🚀 快速啟動

### 1. 安裝依賴
```bash
npm install
```

### 2. 本地開發運行
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:3000` 即可開始使用。

### 3. 一鍵建置與 GitHub Pages 部署
```bash
npm run deploy
```
系統將自動執行：
1. `predeploy`: 建置生產環境最佳化 Bundle (`vite build`)。
2. `deploy`: 發布至 `gh-pages` 分支。
3. `postdeploy`: 自動提交原始碼變更並同步推送到 GitHub `main` 分支。

---

## 🏗️ 專案架構

```
kline/
├── .agents/
│   └── AGENTS.md             # AI 助理角色設定與行為規範
├── public/
│   └── sample_yangming.png   # 預設看盤範例圖 (陽明 2609)
├── src/
│   ├── components/
│   │   ├── AnalysisResult.jsx       # 核心分析報告面板、天花板/地板、百科彈出視窗
│   │   ├── ApiKeyModal.jsx          # Gemini API Key 配置與模型自訂下拉選單
│   │   ├── Header.jsx               # 頂部導航與 Build Time 標籤
│   │   ├── ImageUploader.jsx        # 圖片拖曳、貼上、上傳與範例載入
│   │   ├── InteractiveCanvas.jsx    # 互動式 K 線模擬器 (畫板)
│   │   └── PatternEncyclopedia.jsx  # 52 種 K 線型態百科與 SVG 向量渲染
│   ├── data/
│   │   └── klinePatterns.js         # 52 種 K 棒型態戰法完整資料庫
│   ├── services/
│   │   └── aiVisionService.js       # Gemini Flash 雲端 API & 本地 OCR 解析引擎
│   ├── styles/
│   │   └── index.css                # 玻璃擬態樣式與行動端響應式 CSS
│   ├── App.jsx                      # 主應用程式入口
│   └── main.jsx
├── .gitignore
├── package.json
├── postdeploy.js                     # 自動化部署腳本
├── vite.config.js                    # Vite 配置 (支援動態 __BUILD_TIME__ 注入)
└── README.md
```

---

## 📜 免責聲明
本系統之所有分析結果、型態辨識與走勢推演僅供技術分析與學術研究參考，不構成任何實質投資建議。投資必定有風險，入市請務必嚴格執行資金控管與停損紀律。
