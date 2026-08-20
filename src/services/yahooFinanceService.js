const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

/**
 * 從 Yahoo Finance 獲取 K 線歷史資料 (OHLCV)
 * @param {string} stockCode - 股票代碼 (預設加上 .TW 搜尋台股)
 * @param {number} days - 獲取天數 (預設 90 天，大約 3 個月)
 */
export async function fetchStockData(stockCode, days = 90) {
  // 自動產生台股上市(.TW)/上櫃(.TWO)備選名單
  let symbol = stockCode.trim().toUpperCase();
  let symbolsToTry = [symbol];
  if (!symbol.includes('.')) {
    symbolsToTry = [`${symbol}.TW`, `${symbol}.TWO`];
  }

  const range = '6mo'; // 抓取半年資料以利計算 MA60
  const interval = '1d';

  let lastError = null;
  let rawData = null;
  let finalSymbol = symbol;

  // 嘗試不同的 CORS 代理直到成功
  for (const proxy of PROXIES) {
    let proxyFailed = false;

    for (const sym of symbolsToTry) {
      try {
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=${range}&interval=${interval}`;
        const url = `${proxy}${encodeURIComponent(targetUrl)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`查無此股票代碼 (${sym})`);
          }
          proxyFailed = true;
          throw new Error(`Proxy ${proxy} returned ${response.status}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (e) {
          proxyFailed = true;
          throw new Error('Proxy 回傳非 JSON 格式');
        }

        if (data.chart && data.chart.error) {
          throw new Error(data.chart.error.description);
        }
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
          throw new Error('查無此股票代碼或無交易資料');
        }

        rawData = data.chart.result[0];
        finalSymbol = sym;
        break; // 成功找到資料，跳出 symbol 迴圈
      } catch (err) {
        console.warn(`Fetch via ${proxy} for ${sym} failed:`, err.message);
        lastError = err;
        if (proxyFailed) break; // 若 Proxy 異常，跳出 symbol 迴圈換下一個 Proxy
      }
    }
    
    if (rawData) break; // 如果已抓到資料，跳出 proxy 迴圈
  }

  if (!rawData) {
    throw new Error(`無法獲取 K 線資料，請確認股號是否正確。(${lastError?.message || '網路錯誤'})`);
  }

  const timestamps = rawData.timestamp || [];
  const quote = rawData.indicators.quote[0] || {};
  const opens = quote.open || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const closes = quote.close || [];
  const volumes = quote.volume || [];

  const validData = [];
  for (let i = 0; i < timestamps.length; i++) {
    // 濾除無效空數據
    if (closes[i] !== null && closes[i] !== undefined) {
      validData.push({
        date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
        open: opens[i],
        high: highs[i],
        low: lows[i],
        close: closes[i],
        volume: volumes[i]
      });
    }
  }

  if (validData.length === 0) {
    throw new Error('無有效的歷史價格資料');
  }

  // 計算均線 (MA)
  const calculateMA = (data, period) => {
    return data.map((item, index) => {
      if (index < period - 1) return null;
      const sum = data.slice(index - period + 1, index + 1).reduce((acc, curr) => acc + curr.close, 0);
      return Number((sum / period).toFixed(2));
    });
  };

  const ma5 = calculateMA(validData, 5);
  const ma10 = calculateMA(validData, 10);
  const ma20 = calculateMA(validData, 20);
  const ma60 = calculateMA(validData, 60);

  const formattedData = validData.map((item, index) => ({
    ...item,
    ma5: ma5[index],
    ma10: ma10[index],
    ma20: ma20[index],
    ma60: ma60[index]
  }));

  // 只回傳最近 `days` 天的數據以節省 token
  const recentData = formattedData.slice(-days);
  const latest = recentData[recentData.length - 1];
  const previous = recentData.length > 1 ? recentData[recentData.length - 2] : latest;

  const priceChange = Number((latest.close - previous.close).toFixed(2));
  const changePercent = Number(((priceChange / previous.close) * 100).toFixed(2));

  const meta = rawData.meta || {};
  const stockName = meta.shortName || meta.longName || finalSymbol;
  const volumeLots = latest.volume ? Math.round(latest.volume / 1000) : 0;
  const formattedVolume = `${volumeLots.toLocaleString()} 張 (${(latest.volume || 0).toLocaleString()} 股)`;

  return {
    symbol: finalSymbol,
    stockName,
    meta: {
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      regularMarketDayHigh: meta.regularMarketDayHigh,
      regularMarketDayLow: meta.regularMarketDayLow,
      chartPreviousClose: meta.chartPreviousClose
    },
    latest: {
      date: latest.date,
      open: Number(latest.open.toFixed(2)),
      high: Number(latest.high.toFixed(2)),
      low: Number(latest.low.toFixed(2)),
      close: Number(latest.close.toFixed(2)),
      volume: latest.volume,
      formattedVolume,
      priceChange,
      changePercent,
      ma5: latest.ma5,
      ma10: latest.ma10,
      ma20: latest.ma20,
      ma60: latest.ma60
    },
    historicalData: recentData
  };
}

/**
 * 抓取單一標的最新報價簡要數據
 */
export async function fetchSingleQuote(symbol, displayName = null) {
  const range = '5d';
  const interval = '1d';

  for (const proxy of PROXIES) {
    try {
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
      const url = `${proxy}${encodeURIComponent(targetUrl)}`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta || {};
      const quote = result.indicators?.quote?.[0] || {};
      const closes = (quote.close || []).filter(c => c !== null && c !== undefined);

      if (closes.length === 0) continue;

      const latestClose = closes[closes.length - 1];
      const prevClose = closes.length > 1 ? closes[closes.length - 2] : (meta.chartPreviousClose || latestClose);
      const priceChange = Number((latestClose - prevClose).toFixed(2));
      const changePercent = prevClose ? Number(((priceChange / prevClose) * 100).toFixed(2)) : 0;

      return {
        symbol,
        name: displayName || meta.shortName || meta.symbol || symbol,
        price: Number(latestClose.toFixed(2)),
        priceChange,
        changePercent
      };
    } catch (err) {
      // 靜默嘗試下一個 Proxy
    }
  }

  return null;
}

/**
 * 依據勾選條件抓取美股與期貨市場連動數據
 */
export async function fetchMarketContextData({ includeFutures = true, includeUS = true } = {}) {
  const tasks = [];
  const results = {
    futuresAndIndex: [],
    usMarkets: []
  };

  // 1. 台股期現貨優先抓取
  if (includeFutures) {
    const twSymbols = [
      { symbol: 'TXF=F', name: '台指期貨 (夜盤/近月)' },
      { symbol: '^TWII', name: '加權指數 (大盤)' },
      { symbol: '^TWOII', name: '櫃買指數 (OTC)' }
    ];

    twSymbols.forEach(({ symbol, name }) => {
      tasks.push(
        fetchSingleQuote(symbol, name).then(data => {
          if (data) results.futuresAndIndex.push(data);
        }).catch(() => {})
      );
    });
  }

  // 2. 美股與國際主要指數抓取
  if (includeUS) {
    const usSymbols = [
      { symbol: '^SOX', name: '費城半導體' },
      { symbol: '^IXIC', name: '那斯達克' },
      { symbol: '^DJI', name: '道瓊工業' },
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: 'TSM', name: '台積電 ADR' },
      { symbol: 'NVDA', name: '輝達 (NVDA)' },
      { symbol: '^N225', name: '日經 225' },
      { symbol: '^HSI', name: '香港恒生' }
    ];

    usSymbols.forEach(({ symbol, name }) => {
      tasks.push(
        fetchSingleQuote(symbol, name).then(data => {
          if (data) results.usMarkets.push(data);
        }).catch(() => {})
      );
    });
  }

  if (tasks.length > 0) {
    await Promise.allSettled(tasks);
  }

  return results;
}

