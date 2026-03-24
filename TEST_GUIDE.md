# TaroEcho 跨手機分享 — 快速測試指南

## 預備條件

1. ✅ 已在 [SUPABASE_SETUP.md](SUPABASE_SETUP.md) 完成 Supabase 設置
2. ✅ 已在 `index.html` 填入 Supabase 金鑰
3. ✅ 至少 2 台裝置（手機 A、手機 B）或 2 個瀏覽器分頁

## 測試情景 1：驗證雲端上傳

**目標**：確認錄音能上傳到 Supabase

### 步驟

1. 手機 A 開啟 app：`https://kaiserliu889087-jpg.github.io/Taroecho/`
2. 點下方「錄製」➜ 錄 3-5 秒演講（例如「這是第一段測試記憶」）
3. 輸入標題（例如「測試 #1」）
4. 按「完成錄製」
5. **期望結果**：
   - ✅ 出現 toast「已上傳到雲端！」
   - ✅ 記憶在 Vault (Home) 頁面顯示
   - ✅ 可點播放

### 驗證雲端狀態

進 Supabase Dashboard：
1. 左側 → **Storage**
2. 進入 `memories` bucket
3. 應該看到 `memories/{User_ID}/{Memory_ID}.webm` 檔案存在

## 測試情景 2：驗證跨手機分享（無登入）

**目標**：B 手機無登入情況下也能聽 A 的公開記憶

### 步驟

##### 手機 A（發布者）

1. 錄一段記憶，例如「Hello from Phone A」
2. 播放這段記憶
3. 確認隱私狀態設為 **Public**（綠色地球圖示）
4. 複製該記憶的網址：`?m=<記憶ID>`
   - 方式 1：點右上角 NFC 圖示 → 出現「已複製連結」（只在支援 Web NFC 時）
   - 方式 2：手動從瀏覽器網址列複製 `?m=...` 後面的部分

##### 手機 B（聽眾，未登入）

1. **新裝置 / 新帳戶 / 無登入狀態**
2. 用手機 B 開啟 A 複製的連結，例如：
   ```
   https://kaiserliu889087-jpg.github.io/Taroecho/?m=<記憶ID>
   ```
3. **期望結果**：
   - ✅ 頁面直接打開
   - ✅ 自動播放 A 的記憶
   - ✅ 能看到記憶標題
   - ✅ 能按播放鍵聽到聲音
   - ✅ 隱私標籤顯示 🌐 **Public**

## 測試情景 3：NFC 標籤綁定與掃描

**目標**：NFC 標籤能指向公開記憶

### 前置條件
- 裝置：Android 手機（支援 Web NFC）或 iPhone 13+ 搭 NFC 晶片
- 物理 NFC 標籤（NDEF 類型，容量 ≥ 200 bytes）

### 步驟

##### A 手機：寫入 NFC 標籤

1. 錄一段記憶，設為 **Public**
2. 播放這段記憶
3. 點右上角 NFC 圖示（WiFi 旋轉 90°）
4. 出現「靠近標籤」提示
5. 將 NFC 標籤靠近手機背面
6. 等待「標籤已識別」畫面出現
7. 按「將記憶寫入標籤」

**期望結果**：
- ✅ 提示「寫入成功 ✓」
- ✅ Toast 通知「NFC 標籤寫入成功！」

##### B 手機（或其他裝置）：掃描 NFC 標籤

1. 用 B 手機 Chrome 開啟 TaroEcho 網址
2. 點下方「Profile」➜ 找 NFC 標籤連結（本應在 Settings）
   *或* 直接在記憶頁面點右上 NFC ➜ 選「掃描標籤」
3. 靠近剛才 A 寫入的標籤
4. 標籤應被識別

**期望結果**：
- ✅ 出現「標籤已識別！」
- ✅ 顯示 A 的記憶標題
- ✅ 可點「播放」鍵聽到音檔
- ✅ 無需登入或額外操作

## 測試情景 4：隱私控制

**目標**：確認 private / family / public 設定生效

### Private（只有你）

1. 錄一段記憶
2. 確認隱私是 **Private**（鎖頭圖示）
3. 複製該記憶 ID
4. 用別的裝置 / 帳戶 開啟該 `?m=<ID>` 連結
5. **期望結果**：❌ 應該看不到該記憶，出現「找不到」或「無權限」

### Public（所有人）

1. 錄一段記憶
2. 播放時把隱私改成 **Public**（地球圖示）
3. 複製該記憶 ID
4. 用別的裝置開啟 `?m=<ID>` 連結
5. **期望結果**：✅ 能看到、能播放

## 常見問題排查

### 問題 1：「已上傳到雲端！」但實際無法從別裝置讀取

**排查**：
1. Supabase Dashboard → **Storage** → `memories` bucket
2. 確認檔案是否存在：`memories/{User_ID}/{Memory_ID}.webm`
3. 如果沒有：
   - 檢查瀏覽器開發者工具 Console 是否有錯誤
   - 確認 Supabase URL 和 Key 是否正確填入
   - 確認 memories table 中該記憶的 privacy 是否是 'public'

### 問題 2：掃 NFC 後出現「此記憶不在本裝置中」

**原因**：正常。這是預期行為——本機沒有快取。

**測試**：
- 確認隱私是 **Public**
- 用另一台手機開該 `?m=<ID>` 連結
- 應該能直接播放（不需本機有副本）

### 問題 3：B 手機無法讀取 A 的音檔

**排查**：
1. 隱私設定是否為 Public？
2. Supabase Storage `memories` bucket 是否設為 **Public**？
   - 到 Dashboard → Storage → memories → Edit permissions
   - Select 欄應有 `public` 選項
3. 音檔路徑是否正確？
   - `memories/{A的User_ID}/{Memory_ID}.webm`

## 成功標誌

✅ 所有情景都通過 → **跨手機分享功能正常運作！**

### 下一步

- 分享你的 NFC 標籤給朋友測試
- 在家族群組共享記憶
- 透過公開廣場分享故事

---

**有任何問題**？檢查：
1. [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 配置
2. Supabase Dashboard - 檢查資料表和 Storage
3. 瀏覽器 Console - 查看日誌訊息
