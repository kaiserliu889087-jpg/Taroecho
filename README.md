# TaroEcho 芋音

手機版 PWA 記憶錄音 App，支援：

- 本機錄音與播放（IndexedDB 儲存）
- 私密 / 公開狀態切換
- 公開聲音廣場
- NFC 標籤寫入與掃描（支援裝置）
- 家族成員管理（本機儲存）
- 離線快取（Service Worker）

## 本機啟動

建議使用本機靜態伺服器（不要直接雙擊 HTML）：

```powershell
# 在專案資料夾執行
python -m http.server 5500
```

開啟：`http://localhost:5500`

## 發布到 GitHub

1. 在 GitHub 建立新 repo（例如 `taroecho`）
2. 在本機專案執行：

```powershell
git init
git add .
git commit -m "feat: complete TaroEcho app and PWA setup"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/taroecho.git
git push -u origin main
```

3. 到 GitHub 專案頁：

- 打開 `Settings` -> `Pages`
- `Source` 選 `Deploy from a branch`
- `Branch` 選 `main` / `/ (root)`
- 儲存後等待部署完成

4. 部署網址通常會是：

`https://<YOUR_USERNAME>.github.io/taroecho/`

## 注意事項

- NFC 功能需要支援 Web NFC 的瀏覽器（通常是 Android Chrome）。
- iOS Safari 不支援 Web NFC，App 會自動提供複製連結作為替代。
- 已改為相對路徑設定，能在 GitHub Pages 子路徑正常載入 manifest 與 service worker。
