# K-Line Master 複核與強化建議

**複核日期：** 2026-08-22  
**複核角色：** 資深產品經理、前端與全端工程檢視  
**目前驗證：** `npm run lint` 通過、`npm run build` 通過

## 一、目前版本評估

目前產品已經從單純的 K 線展示工具，發展成包含以下流程的研究型工具：

```text
輸入股票代碼
  -> 抓取個股與跨市場資料
  -> 本地量化或 Gemini 分析
  -> K 線圖與型態辨識
  -> 歷史回測
  -> 部位風控計算
  -> 交易計畫與預測紀錄
```

上一輪建議已落地的項目包括：

- 本地量化機率已調整為正規化結果
- 回測已改為次日開盤進場
- 回測已加入摩擦成本與小樣本警示
- 報告已加入資料品質與分析引擎標籤
- API Key 支援 sessionStorage 與 localStorage 選擇
- 預測紀錄已加入多空機率、基準日期與支撐壓力欄位
- 交易時段判定已改為每分鐘更新
- `npm run lint` 與 `npm run build` 均可通過

目前最需要加強的不是再增加更多型態，而是確保分析結果的統計定義正確、資料來源穩定，以及使用者不會把研究結果誤解為確定性交易指令。

## 二、P0：優先修正

### 1. 回測未滿完整持有期仍被計入

**檔案：** `src/services/backtestService.js`

目前使用類似以下邏輯：

```js
const exitIdx = Math.min(totalBars - 1, entryIdx + period - 1);
```

當訊號出現在資料尾端時，T+10 可能只剩 3 根 K 棒，卻仍被當作完整的 T+10 交易計入統計，會造成勝率與平均報酬失真。

建議改成：

```js
const exitIdx = entryIdx + period - 1;
if (exitIdx >= totalBars) return;
```

同時，畫面應使用每個期間自己的有效樣本數：

```jsx
有效樣本：{stat.evaluatedCount} 次
```

不要一律顯示整體的 `sampleCount`。

### 2. 預測驗證仍不是固定交易日窗口

**檔案：** `src/components/TradePlanJournal.jsx`

目前是依照使用者多久之後重新開啟頁面，計算經過幾天，再將紀錄分到 1D、3D、5D。這不是嚴格的預測期限驗證。

例如預測建立後第 1 天沒有開啟網站，第 8 天才回來，程式可能把這筆紀錄歸入 5D，但實際比較的是第 8 天價格。

建議建立預測時保存固定的評估資訊：

```js
{
  baseDate: '2026-08-21',
  horizon: 1,
  targetDate: '2026-08-24',
  entryPrice: 100,
  evaluationStatus: 'pending'
}
```

之後使用歷史日 K 資料找到 `targetDate` 的收盤價，再進行評估。必須使用交易日，不應使用單純的日曆日差。

### 3. 單獨分析的預測紀錄可能永遠不會被結算

**檔案：** `src/components/TradePlanJournal.jsx`

`handleRefreshAll` 目前只從交易計畫 `plans` 取得股票代碼。如果使用者只做股票分析、沒有建立交易計畫，預測雖然會保存到 `kline_prediction_history`，但不會被抓取價格，因此無法進入命中率統計。

更新代碼來源應合併交易計畫與預測紀錄：

```js
const codesFromPlans = plans.map(plan => plan.stockCode);
const codesFromPredictions = predictionLogs.map(log => log.stockCode);

const uniqueCodes = Array.from(
  new Set([...codesFromPlans, ...codesFromPredictions])
).filter(code => code && code !== '0000');
```

## 三、P1：高價值強化

### 1. 中性預測目前永遠不會命中

**檔案：** `src/components/TradePlanJournal.jsx`

目前命中條件只處理多方與空方：

```js
const isHit =
  (isBull && priceDiff > 0) ||
  (isBear && priceDiff < 0);
```

當預測為 `neutral` 時，`isHit` 永遠是 `false`，會讓中性預測無條件拉低整體命中率。

建議使用容許區間，例如價格在基準價上下 1% 內視為盤整命中：

```js
const tolerance = Math.abs(log.initialPrice) * 0.01;
const isHit =
  isBull ? priceDiff > tolerance :
  isBear ? priceDiff < -tolerance :
  Math.abs(priceDiff) <= tolerance;
```

更好的設計是直接保存預測區間：

```js
{
  direction: 'neutral',
  lowerBound: 98,
  upperBound: 102
}
```

### 2. 市場資料快取沒有區分勾選條件

**檔案：** `src/services/yahooFinanceService.js`

目前市場快取只使用一份全域資料，沒有區分：

- `includeFutures`
- `includeUS`

因此使用者改變勾選條件後，可能仍拿到前一次的市場資料。

建議使用快取 key：

```js
const cacheKey = `${includeFutures ? 'futures' : ''}:${includeUS ? 'us' : ''}`;
```

或改成 `Map`，以不同條件分別保存快取。

### 3. Gemini 回傳結果需要 schema 驗證

**檔案：** `src/services/aiVisionService.js`

目前解析 JSON 後，主要只檢查陣列與物件是否存在，沒有驗證外部模型回傳的內容是否合理。

至少應驗證：

- 三種機率是數字且介於 0 到 100
- 三種機率加總為 100
- 支撐、壓力、停損、停利是合法數字
- `actionDecision` 只允許指定值
- `riskLevel` 只允許合法值
- `confidence` 介於 0 到 100
- 多方的停損低於進場價、停利高於進場價
- 空方的條件符合做空方向

建議建立統一的 `normalizeAnalysisResult()`，將 Gemini 與本地分析都轉成同一份內部資料格式。

### 4. 模型名稱不應強制把 2.5 改成 2.0

**檔案：** `src/App.jsx`、`src/services/aiVisionService.js`

目前 `normalizeModelName()` 與設定讀取流程會將包含 `2.5` 的模型名稱替換成 `2.0`。這可能導致使用者選擇的模型與實際呼叫模型不一致。

建議：

- 只移除 `models/` 前綴
- 保留原始模型版本
- 由 API 回傳的可用模型決定是否可呼叫
- 不可用時顯示明確錯誤或選用第一個可用模型

另外，`ApiKeyModal.jsx` 使用了 `opt.desc`，但目前 `GEMINI_MODEL_OPTIONS` 沒有這個欄位，畫面可能出現空括號。應移除或補上 `desc`。

### 5. 部位計算器需要受帳戶資金上限限制

**檔案：** `src/components/PositionRiskCalculator.jsx`

目前股數只根據單筆最大風險計算，沒有檢查進場所需資金是否超過帳戶資金。

建議同時計算兩種上限：

```js
const sharesByRisk = Math.floor(maxRiskDollar / perShareRisk);
const sharesByCapital = Math.floor(capital / entry);
const recommendedShares = Math.min(sharesByRisk, sharesByCapital);
```

畫面可額外顯示：

- 風險上限產生的股數
- 資金上限產生的股數
- 最終採用的限制原因

### 6. 部位計算器需要驗證交易方向

**檔案：** `src/components/PositionRiskCalculator.jsx`

目前使用 `Math.abs(entry - stop)`，所以停損價高於進場價也會被當成合法多方計畫。

至少應驗證：

```js
const isValidLongPlan = stop < entry && target > entry;
```

若無效：

- 顯示輸入錯誤
- 不顯示建議股數
- 禁用儲存計畫

未來若支援放空，請增加明確的「做多 / 做空」選項，不要依照價格關係猜測方向。

### 7. 回測成本模型要明確化

**檔案：** `src/services/backtestService.js`

目前將台股交易成本簡化為固定 `0.585%`。但實際成本會受到以下因素影響：

- 手續費折扣
- 賣出證交稅
- 當沖與波段稅率
- 最低手續費
- 商品類型
- 滑價與流動性

建議改為可配置物件：

```js
{
  buyFeeRate,
  sellFeeRate,
  feeDiscount,
  sellTaxRate,
  slippageRate,
  minimumFee
}
```

報告中要明確列出假設：

```text
回測成本假設：台股現貨、手續費 6 折、賣出證交稅 0.3%、未包含流動性衝擊
```

### 8. 「平均最大回撤」名稱目前不夠精準

目前計算的是每筆交易期間的單筆盤中最差波動，不是整個策略資產曲線的最大回撤。

在真正建立 equity curve 前，建議將文案改成：

```text
平均單筆盤中不利波動
```

等未來加入資產曲線後，再使用「策略最大回撤」。

### 9. 資料日期與時區需要明確化

**檔案：** `src/services/yahooFinanceService.js`

目前使用 `toISOString()` 轉日期，而它採用 UTC。台股資料應明確使用 `Asia/Taipei`，並區分：

- 行情日期
- 資料抓取時間
- 資料來源時區
- 是否為最新收盤資料
- 是否為盤中資料

報告中的「個股報價基準」建議改為「最新日 K 收盤日期」，避免使用者誤以為這是即時行情。

## 四、P2：產品與維運強化

### 1. 核心結論不能忽略中性機率

**檔案：** `src/components/AnalysisResult.jsx`

目前核心方向主要比較多方與空方：

```js
const isBull = bullishProbability >= bearishProbability;
```

例如：

```text
多方 35%
盤整 50%
空方 30%
```

目前仍可能顯示偏多，但最高機率其實是盤整。

建議從三者中取最大值：

```js
const direction = [
  ['bullish', bullishProbability],
  ['neutral', neutralProbability],
  ['bearish', bearishProbability]
].sort((a, b) => b[1] - a[1])[0][0];
```

當中性最高時，顯示「區間觀察」或「等待方向表態」。

### 2. 降低型態庫的確定性投資語氣

**檔案：** `src/data/klinePatterns.js`、`src/components/AnalysisResult.jsx`

目前有些文案容易被理解成交易指令，例如：

- 絕佳追價做多點
- 極高勝率
- 全面出清
- 無條件停損
- 主力完全碾壓空軍

建議改成條件式描述：

- 可觀察的偏多條件
- 歷史樣本中的正報酬比例
- 若跌破條件，原先假設失效
- 可能代表賣壓增加
- 需搭配位階、成交量與市場環境確認

型態庫的固定 `winRate` 應標示為「教材參考分數」或「預設參考值」。真正的勝率只顯示指定個股、指定期間、指定成本模型下的回測結果。

### 3. 公開 CORS Proxy 不適合正式資料層

**檔案：** `src/services/yahooFinanceService.js`、`vite.config.js`

目前部署版仍依賴公開 CORS Proxy；本機 Vite proxy 只在開發環境有效。正式環境可能遇到：

- Proxy 限流
- Proxy 服務中斷
- Yahoo 回應格式變更
- 不同 Proxy 回傳資料不一致
- 使用者偶發查詢失敗

正式架構建議使用：

- Cloudflare Worker
- Vercel Function
- 自有 API Gateway
- 具備 timeout、retry、cache、rate limit 與來源標記

前端只呼叫自己的 API，不直接依賴公開代理。

### 4. 部署腳本不應自動 commit 與 push

**檔案：** `postdeploy.js`

目前 `npm run deploy` 會執行：

```text
git add -A
 git commit
 git push origin main
```

這可能把所有未提交檔案、暫存資料或敏感資訊一併加入 commit，也會讓部署操作意外修改 git history。

建議部署只負責建置與發布：

```json
{
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

若需要自動化，建議改用 GitHub Actions，讓 source commit 與 deploy 流程分離。

### 5. 補上純函式測試

目前沒有看到正式測試腳本。最值得先測試的範圍：

#### `localQuantitativeService.js`

- 三種機率總和等於 100
- 多空趨勢分類
- 缺少 MA 時的 fallback
- 歷史資料不足時的行為

#### `backtestService.js`

- 次日開盤進場
- 不足完整持有期間時不納入
- 多空報酬方向
- 成本扣除
- 小樣本警示

#### `yahooFinanceService.js`

- null OHLCV
- 無效股票
- Proxy timeout
- TW / TWO fallback
- 快取條件隔離

#### 預測驗證

- 單獨預測也能更新
- 中性預測可以命中
- 使用交易日而非日曆日
- 未到期預測保持 pending

## 五、產品定位建議

建議產品定位為：

> 給台股短線交易者使用的 K 線研究、情境推演與交易紀律工具。

不建議把產品定位成「預測股價的 AI」，原因是：

- 預測結果本質上具有不確定性
- 公開資料來源可能有延遲
- Gemini 回應不是交易訊號保證
- 型態勝率容易受到樣本與市場環境影響

### 建議追蹤的產品指標

- 首次輸入股票代碼後成功看到報告的比例
- 從分析結果建立交易計畫的比例
- 7 日內再次分析同一標的的比例
- 使用回測功能的比例
- 預測到期後完成驗證的比例
- API Key 設定轉換率
- 資料抓取失敗率
- 每次分析平均耗時

## 六、建議開發順序

1. 修正回測未滿持有期仍被計入的問題
2. 修正預測驗證只更新交易計畫、不更新單獨預測的問題
3. 改成固定 target date 的交易日驗證
4. 修正中性預測命中率
5. 修正市場快取的勾選條件隔離
6. 加入 Gemini response schema validation
7. 限制部位股數不能超過帳戶資金
8. 增加做多 / 做空與輸入條件驗證
9. 修正核心結論忽略中性機率的問題
10. 建立 local quantitative 與 backtest 純函式測試
11. 建立正式資料代理與快取服務
12. 最後再處理型態文案、部署流程與 UI 細節

## 七、總結

目前專案已具備完整的產品雛形，且上一輪重要的資料品質與回測方向已經開始落地。下一階段的核心不是增加功能數量，而是讓每一個數字都能回答以下問題：

- 這個數字如何計算？
- 使用的是哪一天的資料？
- 是否已完成完整評估期間？
- 樣本數是否足夠？
- 成本與滑價是否納入？
- 這是教材參考值，還是個股實際回測結果？

當回測、預測驗證與部位計算這三條鏈完成嚴格定義後，K-Line Master 才會從「功能完整的分析展示工具」提升成為「值得反覆使用的交易研究工具」。
