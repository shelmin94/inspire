-- Supabase 数据库表结构

-- 已使用名人表
CREATE TABLE IF NOT EXISTS used_celebrities (
  id SERIAL PRIMARY KEY,
  celebrity_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 名人队列表
CREATE TABLE IF NOT EXISTS celebrities_queue (
  id INTEGER PRIMARY KEY DEFAULT 1,
  queue_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_celebrity_name ON used_celebrities(celebrity_name);
CREATE INDEX IF NOT EXISTS idx_celebrity_created ON used_celebrities(created_at DESC);

-- 启用 Row Level Security
ALTER TABLE used_celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE celebrities_queue ENABLE ROW LEVEL SECURITY;

-- 创建策略允许所有人访问（生产环境建议更严格的策略）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'used_celebrities' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON used_celebrities FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'celebrities_queue' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON celebrities_queue FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 插入初始队列表记录
INSERT INTO celebrities_queue (id, queue_data) 
VALUES (1, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

