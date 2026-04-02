-- 20240402_add_author_fields.sql
-- Task 1: Extend brand_info table with author fields

ALTER TABLE brand_info 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_email TEXT,
ADD COLUMN IF NOT EXISTS author_wechat_id TEXT,
ADD COLUMN IF NOT EXISTS author_wechat_qr TEXT,
ADD COLUMN IF NOT EXISTS author_xhs_id TEXT,
ADD COLUMN IF NOT EXISTS author_xhs_qr TEXT,
ADD COLUMN IF NOT EXISTS author_custom_text TEXT;

-- Initial value for author_name from brand name
UPDATE brand_info SET author_name = name WHERE author_name IS NULL;
