# 小兒脫水與輸液計算機 (Pediatric IV Fluid Calculator)

這是一個專為臨床醫護人員設計的單頁式 Web 應用程式 (SPA)，用於快速評估小兒脫水程度，並自動計算分階段的靜脈輸液（IV Fluid）計畫與電解質需求。支援 PWA（漸進式網頁應用），可在急診或無網路環境下離線使用。

## ✨ 核心功能 (Features)

*   **臨床脫水評分 (CDS, Clinical Dehydration Scale)：** 透過勾選 4 項臨床表徵（外觀精神、眼睛凹陷、口腔黏膜、眼淚量），自動判定脫水嚴重度與缺水百分比。
*   **智能輸液計算 (Holliday-Segar Method)：** 
    *   自動計算 24 小時每日維持液量 (Maintenance Fluid)。
    *   精算總缺水量 (Deficit)，並可扣除急診已給予的急救輸液 (Bolus)。
    *   自動排程「前 8 小時」與「後 16 小時」的階段滴注速率 (ml/hr)。
*   **電解質與點滴建議：** 依據維持液與流失量換算 Na/K 需求，並根據 AAP 最新指引推薦合適的點滴液體（如 0.9% Normal Saline）。
*   **醫囑單匯出 (PDF Export)：** 內建專屬列印排版，可將計算結果與病患資料一鍵匯出為 PDF 醫囑單存檔。
*   **離線支援 (PWA)：** 支援安裝至手機主畫面，在無網路環境（如急診地下室）仍可流暢執行計算。

## 📚 參考臨床指引 (Clinical Guidelines)

*   **水分維持量：** Holliday-Segar 100-50-20 Rule.
*   **脫水評估：** Clinical Dehydration Scale (CDS) for Children.
*   **點滴選擇：** American Academy of Pediatrics (AAP) - Clinical Practice Guideline for Maintenance Intravenous Fluids in Children (防範醫源性低血鈉).

## 🚀 部署與安裝 (Deployment)

本專案由純 HTML、CSS (Bootstrap 5) 與 JavaScript 撰寫，無需後端伺服器。

1.  **線上遊玩 / 測試：**
    專案可直接透過 GitHub Pages 託管。前往 `Settings > Pages`，將來源選擇為 `main` 分支即可自動發布。
2.  **手機安裝 (PWA)：**
    使用手機瀏覽器 (Safari / Chrome) 開啟網頁後，點選底部的「分享」或「選單」，選擇 **「加入主畫面 (Add to Home Screen)」**，即可建立桌面捷徑並啟用離線功能。

## 📁 檔案結構 (File Structure)

```text
├── index.html       # 主程式與使用者介面 (包含 CSS 與 JS 計算邏輯)
├── manifest.json    # PWA 應用程式清單
├── sw.js            # PWA Service Worker (負責離線快取)
├── icon-192.png     # 桌面圖示 (小)
└── icon-512.png     # 桌面圖示 (大)
