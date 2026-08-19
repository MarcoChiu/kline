import { KLINE_PATTERNS } from '../data/klinePatterns';

export const GEMINI_MODEL_OPTIONS = [
  { value: 'gemini-2.0-pro-exp-02-05', label: '👑 Gemini 2.0 Pro Experimental (最高智商頂規版・預設首選)' },
  { value: 'gemini-2.0-flash-thinking-exp-01-21', label: '🧠 Gemini 2.0 Flash Thinking (深度推理思考版)' },
  { value: 'gemini-2.0-flash', label: '🥇 Gemini 2.0 Flash (最新旗艦・秒速辨識)' },
  { value: 'gemini-2.0-flash-lite', label: '⚡ Gemini 2.0 Flash-Lite (極速輕量)' },
  { value: 'gemini-1.5-pro', label: '📊 Gemini 1.5 Pro (長文本專業版)' },
  { value: 'gemini-1.5-flash', label: '💎 Gemini 1.5 Flash (經典穩定版)' }
];

const DEFAULT_GEMINI_MODELS = GEMINI_MODEL_OPTIONS.map(({ value }) => value);
const GEMINI_MODEL_CACHE_TTL = 5 * 60 * 1000;
let geminiModelCache = null;

import sampleYangMing from '../assets/sample_yangming.png';

/**
 * 預設標準截圖範例列表
 */
export const SAMPLE_CHARTS = [
  {
    id: sampleYangMing,
    title: '陽明 (2609) 標準看盤截圖',
    description: '包含頂部行情數值列、中間 K 線走勢與下方成交量之標準範例'
  }
];



/**
 * 智能圖片辨識入口 (需要 Gemini API Key)
 */
export async function analyzeKlineImage(base64Image, apiKey = null, selectedModel = 'auto') {
  if (!apiKey || apiKey.trim().length < 10) {
    throw new Error('請先設定 Gemini API Key 才能進行圖表辨識分析');
  }

  console.log('正在呼叫 Google Gemini Vision API, 指定模型:', selectedModel);
  const geminiResult = await callGeminiVision(base64Image, apiKey.trim(), selectedModel);
  if (geminiResult) return geminiResult;

  throw new Error('Gemini API 未回傳有效結果，請稍後再試');
}

/**
 * 呼叫 Google Gemini Vision API
 */
async function callGeminiVision(base64Data, apiKey, selectedModel = 'auto') {
  let mimeType = 'image/png';
  let cleanBase64 = base64Data;

  const dataUriMatch = base64Data.match(/^data:(image\/[a-zA-Z0-9\-\+\.]+);base64,([\s\S]+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1];
    cleanBase64 = dataUriMatch[2].replace(/\s/g, '');
  } else {
    cleanBase64 = base64Data.replace(/\s/g, '');
  }

  const patternNamesList = KLINE_PATTERNS.map(p => `- ${p.chineseName} (ID: ${p.id})`).join('\n');

  const prompt = `你是一位「嚴謹客觀的量化技術與籌碼分析師 (Strict Quantitative Technical & Chip Analyst)」。
你的唯一職責是透過視覺辨識使用者上傳的圖表，進行純粹基於數據、線型、價量與資金動向的客觀分析。

核心原則：
1. 絕對客觀，拒絕迎合：絕不為了討好而給出偏頗預測。如圖表顯示籌碼鬆動或技術面弱勢，必須直言不諱地指出風險。
2. 籌碼與技術互相印證：籌碼是推升股價的燃料，但價格行為是最終依歸。不可僅因外資投信連買就盲目看多，需檢視是否實際有效推升。
3. 無絕對預測：不使用「一定會」、「保證」等字眼。分析明日走勢時，必須提供多套劇本與觸發條件。
4. 風險控管優先：在任何推論中明確點出「失效點(Invalidation Level)」，跌破或突破哪個價位代表推論失敗，應採取防守。

【重要數據提取守則（極關鍵）】
請優先仔細閱讀圖表最頂部的行情資訊文字列（例如: '陽明 (2609) 2026/08/19 開 55.6 高 59 低 54.9 收 59 量(張) 113981 漲跌 2.8' 或右上角大字報價）。
- 【開盤價 openPrice】: 請提取 '開' 後面的數字（例如 55.6）。
- 【最高價 highPrice】: 請提取 '高' 後面的數字（例如 59.0）。
- 【最低價 lowPrice】: 請提取 '低' 後面的數字（例如 54.9）。
- 【收盤價/現價 closePrice & currentPrice】: 請務必提取 '收' 或現價後方的數字（例如 59.0），絕對不可把 '開 55.6' 誤當成現價！
- 【漲跌點數 priceChange】: 請提取 '漲跌' 後方的數字（例如 2.8），若為上漲給正數 2.8，若為下跌給負數 -1.5。
- 【漲跌幅 changePercent】: 當日漲跌幅百分比（例如 4.98），若圖中無 %，請由 priceChange / (closePrice - priceChange) * 100 自動算出。
- 【MA 均線】: 請精準提取 MA5, MA10, MA20, MA60 各均線數值。
- 切勿把 Y 軸或歷史刻度的最高標記誤當成今日收盤價！

【系統內建 K 線形態庫】
請盡量從以下 48 種系統支援的型態中，挑選最符合目前走勢的型態（請精準對應 ID 與名稱）：
${patternNamesList}

【特別警告與視覺重點】
1. K線圖**最右側的最後一根 K 棒**代表「今日 (最新)」的走勢。這根 K 棒是判斷當前型態與推演明日走勢的「絕對核心」，請務必精準辨識它的顏色、實體長度與上下影線。
2. 判斷 K 線型態時，請將重點放在最右側最近 1~5 天的 K 棒組合。

請嚴格執行以下工作流程：
Step 1: 視覺特徵提取 (價格、量能、最右側最新 K 棒型態、技術指標現況)
Step 2: 結構、趨勢與籌碼共振評估 (標示壓力/支撐、共振與背離分析、土洋動向)
Step 3: 明日走勢推演 (情境A偏多、情境B偏空、情境C盤整，各自的機率與條件)
Step 4: 嚴格的操作結論與風險提示 (強制標註防守點，提醒法人倒貨警訊)

【輸出格式要求】
請務必精準提取股名與代碼，並「嚴格以合法 JSON 格式」輸出，不可有 JSON 以外的文字。
語氣必須冷靜、專業、克制。絕對禁用任何表情符號 (Emojis)，以維持報告的嚴肅性。

JSON 格式定義：
{
  "stockName": "股票名稱（如 '陽明'，若找不到請填 '未知識別股'）",
  "stockCode": "股票代碼（如 '2609'，若無則填 '0000'）",
  "openPrice": 開盤價(數值，找 '開: xxx'，如 55.6),
  "highPrice": 最高價(數值，找 '高: xxx'，如 59.0),
  "lowPrice": 最低價(數值，找 '低: xxx'，如 54.9),
  "closePrice": 收盤價(數值，找 '收: xxx'，如 59.0),
  "currentPrice": 今日收盤現價(數值，必須與 closePrice 相同，如 59.0，千萬不要填成開盤價),
  "priceChange": 當日漲跌金額(數值，上漲為正數如 2.8，下跌為負數如 -1.5),
  "changePercent": 當日漲跌幅百分比(數值，例如 4.98 或 -2.15，純數字不帶 % 符號),
  "latestDate": "圖中日期",
  "movingAverages": { "ma5": 數值, "ma10": 數值, "ma20": 數值, "ma60": 數值 },
  "volume": "成交量描述(例如: 113,981 張)",
  "detectedPatterns": [
    {
      "patternId": "從上述形態庫挑選對應的 ID (如 'big_bull')",
      "name": "從上述形態庫挑選對應的中文名稱",
      "confidence": 90,
      "description": "詳細描述為何判定為此型態，以及籌碼背離或共振狀態"
    }
  ],
  "prediction": {
    "bullishProbability": 偏多機率(0-100),
    "neutralProbability": 盤整機率(0-100),
    "bearishProbability": 偏空機率(0-100),
    "sentimentSummary": "一句話總結目前籌碼、技術結構與跨市場共振預判",
    "nextDayForecast": "Step 3: 明日走勢推演 (請使用換行符號 \\n 條列：\n【情境 A (偏多/夜盤收紅)】: 觸發條件與挑戰天花板壓力策略\n【情境 B (偏空/夜盤下殺)】: 觸發條件與地板防守策略\n【情境 C (區間/夜盤平盤)】: 整理築底策略)",
    "supportLevels": [支撐1, 支撐2, 支撐3],
    "resistanceLevels": [壓力1, 壓力2, 壓力3],
    "tradingStrategy": [
      "Step 4 結論: 嚴格的操作結論與風險提示",
      "防守點提示: 必須明確給出技術面的停損/防守價位",
      "籌碼警訊: 提醒若出現特定籌碼動向應視為警訊"
    ],
    "riskLevel": "極高 / 高 / 中 / 低風險"
  }
}`;

  let availableModels = [];
  try {
    availableModels = await fetchAvailableGeminiModels(apiKey);
  } catch (err) {
    console.warn('無法取得 Gemini 模型清單，改用內建備援清單:', err.message);
  }

  const modelsToTry = getGeminiModelCandidates(selectedModel, availableModels);

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await requestGeminiModel(model, apiKey, prompt, mimeType, cleanBase64);
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson.error?.message || response.statusText;
        lastError = new Error(`[${model}] ${msg}`);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        const reason = data.candidates?.[0]?.finishReason || '未知原因';
        lastError = new Error(`[${model}] 未回傳任何文字 (${reason})`);
        continue;
      }

      let parsed;
      try {
        parsed = parseGeminiJson(rawText);
      } catch (err) {
        console.error('Gemini 輸出無法解析為 JSON:', rawText);
        lastError = new Error(`[${model}] 無法從回應中擷取 JSON 結構`);
        continue;
      }

      // 數值清洗與型別轉換
      if (typeof parsed.currentPrice === 'string') parsed.currentPrice = parseFloat(parsed.currentPrice.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.closePrice === 'string') parsed.closePrice = parseFloat(parsed.closePrice.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.openPrice === 'string') parsed.openPrice = parseFloat(parsed.openPrice.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.highPrice === 'string') parsed.highPrice = parseFloat(parsed.highPrice.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.lowPrice === 'string') parsed.lowPrice = parseFloat(parsed.lowPrice.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.priceChange === 'string') parsed.priceChange = parseFloat(parsed.priceChange.replace(/[^0-9.-]/g, '')) || 0;
      if (typeof parsed.changePercent === 'string') parsed.changePercent = parseFloat(parsed.changePercent.replace(/[^0-9.-]/g, '')) || 0;

      // 若有明確的 closePrice 則強制校正 currentPrice 為 closePrice (避免 AI 誤取開盤價)
      if (parsed.closePrice && parsed.closePrice > 0) {
        parsed.currentPrice = parsed.closePrice;
      }

      // 自動推算漲跌與百分比兜底
      if (parsed.currentPrice && (!parsed.priceChange || parsed.priceChange === 0) && parsed.changePercent && parsed.changePercent !== 0) {
        parsed.priceChange = +((parsed.currentPrice * parsed.changePercent) / (100 + parsed.changePercent)).toFixed(2);
      } else if (parsed.currentPrice && parsed.priceChange && parsed.priceChange !== 0 && (!parsed.changePercent || parsed.changePercent === 0)) {
        const prev = parsed.currentPrice - parsed.priceChange;
        if (prev > 0) {
          parsed.changePercent = +((parsed.priceChange / prev) * 100).toFixed(2);
        }
      }

      return {
        ...parsed,
        isGeminiVision: true,
        usedModel: model,
        analyzedAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('所有 Gemini 模型均無法解析，請檢查 API Key 是否正確');
}

export async function fetchAvailableGeminiModels(apiKey) {
  const normalizedKey = apiKey.trim();
  const now = Date.now();
  if (geminiModelCache && geminiModelCache.apiKey === normalizedKey && geminiModelCache.expiresAt > now) {
    return geminiModelCache.models;
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${normalizedKey}`,
    {},
    15000
  );
  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `獲取模型列表失敗 (HTTP ${response.status})`);
  }

  const data = await response.json();
  const models = Array.isArray(data.models) ? data.models : [];
  geminiModelCache = {
    apiKey: normalizedKey,
    models,
    expiresAt: now + GEMINI_MODEL_CACHE_TTL
  };
  return models;
}

export function getGeminiModelCandidates(selectedModel = 'auto', availableModels = []) {
  const selected = normalizeModelName(selectedModel);
  const configuredModels = [...new Set([
    ...(selected && selected !== 'auto' ? [selected] : []),
    ...DEFAULT_GEMINI_MODELS
  ])];
  const availableFlashModels = [...new Set(
    availableModels
      .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
      .map(model => normalizeModelName(model.name))
      .filter(isFreeVisionModel)
  )];

  if (availableFlashModels.length === 0) return configuredModels;

  const availableSet = new Set(availableFlashModels);
  const configuredAvailable = configuredModels.filter(model => availableSet.has(model));
  const discoveredAvailable = availableFlashModels.filter(model => !configuredModels.includes(model));
  return [...new Set([...configuredAvailable, ...discoveredAvailable])];
}

function normalizeModelName(modelName = '') {
  return modelName.replace(/^models\//, '').trim();
}

function isFreeVisionModel(modelName) {
  if (!modelName || !modelName.startsWith('gemini-')) return false;
  if (/(?:-image|-tts|-live|embedding|robotics|computer-use|deep-research)/i.test(modelName)) return false;
  return /flash|pro|thinking/i.test(modelName);
}

async function requestGeminiModel(model, apiKey, prompt, mimeType, cleanBase64) {
  const isThinkingModel = model.includes('thinking');
  const generationConfig = {
    temperature: 0.2,
    ...(isThinkingModel ? {} : { responseMimeType: 'application/json' })
  };

  const body = JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: cleanBase64
          }
        }
      ]
    }],
    generationConfig
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }, 45000);

      if (response.ok || !retryableStatuses.has(response.status) || attempt === 1) return response;
      await wait(800 * (attempt + 1));
    } catch (err) {
      if (attempt === 1) throw err;
      await wait(800 * (attempt + 1));
    }
  }

  throw new Error(`[${model}] 請求失敗`);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function parseGeminiJson(rawText) {
  const normalizedText = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(normalizedText);
  } catch {
    const start = normalizedText.indexOf('{');
    if (start === -1) throw new Error('找不到 JSON 物件');

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < normalizedText.length; index += 1) {
      const character = normalizedText[index];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }

      if (character === '"') inString = true;
      if (character === '{') depth += 1;
      if (character === '}') depth -= 1;
      if (depth === 0) {
        const candidate = normalizedText.slice(start, index + 1).replace(/,\s*([\}\]])/g, '$1');
        return JSON.parse(candidate);
      }
    }
  }

  throw new Error('JSON 結構不完整');
}
