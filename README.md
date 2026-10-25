# 小兒脫水與輸液計算機 (Pediatric IV Fluid Calculator)

這是一個專為臨床醫護人員設計的單頁式 Web 應用程式 (SPA)，用於快速評估小兒脫水程度，並自動計算分階段的靜脈輸液（IV Fluid）計畫與電解質需求。支援 PWA（漸進式網頁應用），可在急診或無網路環境下離線使用。

## ✨ 核心功能 (Features)

*   **臨床脫水評分 (CDS, Clinical Dehydration Scale)：** 4 項臨床表徵（外觀精神、眼睛凹陷、口腔黏膜、眼淚量）→ 0 分無脫水 (<3%)、1–4 分輕至中度 (3–6%)、5–8 分中重度 (≥6%)。缺水百分比可手動覆寫；若填入**病前體重**，則以體重差直接計算缺水量。
*   **智能輸液計算 (Holliday-Segar Method)：**
    *   24 小時維持液量（100-50-20，每日上限 2400 ml）。
    *   總缺水量扣除急診已給予的 Bolus。
    *   「前 8 小時」與「後 16 小時」階段速率 (ml/hr)；**高血鈉 (Na ≥150)** 自動改為 48 小時均速矯正。
*   **Bolus 建議：** 中重度脫水或休克徵象時提示 20 ml/kg（單次上限 1000 ml）等張晶體液。
*   **點滴選擇（AAP 2018）：** 一律建議等張液 D5 0.9% NaCl（或 D5 Plasma-Lyte / LR），確認排尿後加 KCl 20 mEq/L，並顯示實際 Na/K 給予量 (mEq/kg/day)。
*   **臨床警示：** ORS 首選、新生兒不適用、CDS 年齡範圍、高/低血鈉矯正速率、3% NaCl 適應症、維持液上限等。
*   **醫囑單匯出 (PDF Export)：** 列印前自動依目前輸入重新計算，避免輸出過期結果。
*   **離線支援 (PWA)：** Service Worker 快取頁面與 Bootstrap，可加入主畫面離線使用。

## 📚 參考臨床指引 (Clinical Guidelines)

*   **水分維持量：** Holliday MA, Segar WE. Pediatrics 1957 (100-50-20 Rule)。
*   **脫水評估：** Friedman JN et al. J Pediatr 2004；Goldman RD et al. Pediatrics 2008 (CDS)。
*   **點滴選擇：** Feld LG et al. AAP Clinical Practice Guideline: Maintenance Intravenous Fluids in Children. Pediatrics 2018;142:e20183083。
*   **腸胃炎脫水處置：** ESPGHAN/ESPID 2014；WHO Treatment of Diarrhoea（持續流失：每次水瀉 10 ml/kg、每次嘔吐 2 ml/kg）。

> 本工具僅供臨床輔助，醫囑仍須依病童實際狀況與檢驗結果調整。

## 🚀 部署與安裝 (Deployment)

本專案由純 HTML、CSS (Bootstrap 5) 與 JavaScript 撰寫，無需後端伺服器。

1.  **線上遊玩 / 測試：**
    專案可直接透過 GitHub Pages 託管。前往 `Settings > Pages`，將來源選擇為 `main` 分支即可自動發布。
2.  **手機安裝 (PWA)：**
    使用手機瀏覽器 (Safari / Chrome) 開啟網頁後，點選底部的「分享」或「選單」，選擇 **「加入主畫面 (Add to Home Screen)」**，即可建立桌面捷徑並啟用離線功能。

## 📁 檔案結構 (File Structure)

```text
├── index.html            # 主程式與介面（計算引擎位於 /*ENGINE-START*/…/*ENGINE-END*/）
├── tests.cjs             # 引擎測試：node tests.cjs
├── manifest.webmanifest  # PWA 應用程式清單
├── sw.js                 # PWA Service Worker (離線快取)
└── icon.svg              # 桌面圖示
