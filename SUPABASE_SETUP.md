# TaroEcho 雲端分享版 — Supabase 設置指南

## 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com)
2. 用 GitHub/Google 帳號登入
3. 點「New Project」
4. 填入：
   - **Project Name**: `taroecho`（或任意名稱）
   - **Database Password**: 牢記這個密碼（需要等等填入）
   - **Region**: 選最近的區域（例如 Tokyo / Singapore）
5. 等 1-2 分鐘讓資料庫初始化完成

## 2. 建立資料表

進入 Supabase dashboard 後：

1. 左側選 **SQL Editor**
2. 點 **New Query**
3. 複製貼上下面整個 SQL，然後按 **Run**：

```sql
-- memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  privacy TEXT NOT NULL CHECK (privacy IN ('private', 'family', 'public')),
  duration INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  listens INTEGER DEFAULT 0
);

-- audio storage path: memories/{user_id}/{id}.webm
-- Audio files stored in public bucket under memories/ prefix

-- family members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NFC tags table (for tracking which tags are bound to which memory)
CREATE TABLE nfc_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_serial TEXT,
  bound_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_bindings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users can view their own and public/family memories
CREATE POLICY "view_own_and_public" ON memories
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR privacy = 'public'
    OR (privacy = 'family' AND user_id IN (
      SELECT user_id FROM family_members 
      WHERE name = auth.email()
    ))
  );

-- RLS Policy: users can only insert/update/delete their own memories
CREATE POLICY "manage_own" ON memories
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Similar for family_members
CREATE POLICY "view_own_family" ON family_members
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "manage_own_family" ON family_members
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- NFC bindings
CREATE POLICY "view_own_nfc" ON nfc_bindings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "manage_own_nfc" ON nfc_bindings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## 3. 建立存儲 Bucket

1. 左側選 **Storage**
2. 點 **New Bucket**
3. 名稱輸入 `memories`，選 **Public** 以便下載
4. 建立完成

## 4. 取得 API 金鑰

1. 左側選 **Project Settings**（齒輪圖示）
2. 選 **API**
3. 複製以下資訊並暫存：
   - **Project URL** (形如 `https://xxxxx.supabase.co`)
   - **anon key** (公開金鑰，用於前端)

## 5. 更新 index.html

在 `index.html` 頂部 `<head>` 區域找到 `<style>` 標籤前，加入：

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const SUPABASE_URL = 'YOUR_PROJECT_URL';      // 填入你的 Project URL
  const SUPABASE_KEY = 'YOUR_ANON_KEY';         // 填入你的 anon key
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
</script>
```

**用你複製的值替換掉** `YOUR_PROJECT_URL` 和 `YOUR_ANON_KEY`。

## 6. 設定 GitHub Secrets（可選，用於 CI/CD）

如果將來要自動部署：
1. 到 GitHub repo Settings -> Secrets and variables -> Actions
2. 新增：
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

## 完成！

設置完成後，刷新網頁，應該會看到登入提示。

### 備註

- **Auth**: 目前程式用匿名登入（方便測試）。生產環境建議改成Email/Google登入。
- **Audio Storage**: 錄音存到 Supabase Storage 的 `memories/{user_id}/{memory_id}.webm`
- **Privacy**: 
  - **private**: 只有你看得到
  - **family**: 只有家族成員看得到（目前簡化為同一帳戶的成員）
  - **public**: 所有人都能看到

### 測試跨手機分享

1. 手機 A：錄一段，設為 Public
2. 複製該記憶的網址（帶 ?m=<記憶ID> 參數）
3. 手機 B 開同一個連結
4. 手機 B 應該能看到那段記憶並播放（不需額外登入）
