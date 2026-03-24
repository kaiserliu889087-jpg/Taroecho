# TaroEcho 芋音

手機版 PWA 記憶錄音 App，支援雲端分享與 NFC 連結。

## 功能

### 本機功能
- 本機錄音與播放（IndexedDB 緩存）
- 私密 / 公開 / 家族狀態切換
- 家族成員管理（本機儲存）
- 離線快取（Service Worker）

### 雲端功能（需 Supabase）
- ☁️ 錄音上傳到 Supabase Storage
- 🔗 跨手機分享記憶
- 🌐 公開聲音廣場
- 🏠 家族隱私控制
- 📊 聆聽次數統計

### NFC 集成
- 📱 NFC 標籤綁定記憶
- 🔐 支援隱私控制
- ↔️ 跨裝置深連結

## 快速開始

### 1. 本機測試（無 Supabase）
```powershell
python -m http.server 5500
```
開啟 `http://localhost:5500`

### 2. 啟用雲端分享（需 Supabase）

**步驟 1-5**：按照 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 設置後端  
**步驟 6**：在 `index.html` 中填入你的 Supabase 金鑰：

```html
<script>
  const SUPABASE_URL = 'YOUR_PROJECT_URL';
  const SUPABASE_KEY = 'YOUR_ANON_KEY';
</script>
```

完成後刷新頁面，即可開始上傳記憶到云端。

## 跨手機分享測試

1. **手機 A**：錄一段記憶，設為 **Public**
2. 點播放器右上角 NFC 按鈕，選「寫入標籤」或複製連結
3. **手機 B**（未登入）：掃 NFC 標籤或開複製的連結
4. **手機 B** 應該能聽到 A 的記憶

## 部署

### GitHub Pages

```powershell
git push origin main
```

到 GitHub 專案頁：
- Settings → Pages
- Source: Deploy from branch
- Branch: main / root
- 等待部署完成

網址：`https://你的帳號.github.io/Taroecho/`

## 架構

```
┌─ index.html (PWA 前端)
│  ├─ IndexedDB (本機存儲)
│  ├─ Supabase Client (雲端)
│  ├─ Web NFC API (標籤讀寫)
│  └─ Service Worker (離線快取)
│
└─ Supabase 後端
   ├─ memories 表 (記憶元數據)
   ├─ family_members 表 (家族成員)
   ├─ nfc_bindings 表 (NFC 綁定)
   └─ memories storage (音檔存儲)
```

## 注意事項

- **NFC**：需要 Android Chrome 或搭載 NFC 芯片的 iPhone（iOS 13.1+）
- **Audio**：支援 WebM (Opus) / Ogg / MP4 格式
- **隱私**：
  - `private`: 只有你看得到（需登入）
  - `family`: 家族成員可見
  - `public`: 所有人可見（無需登入）

## 本地開發

設置 Supabase 後，可在本地直接測試雲端功能：

```powershell
# 在專案資料夾
python -m http.server 5500

# 開啟本地測試
# http://localhost:5500
```

所有記憶會同時存到本機 IndexedDB 和 Supabase。

## 授權

MIT

