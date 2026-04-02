-- Verify the changes in brand_info table
-- Run this in Supabase SQL Editor

SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'brand_info' 
    AND column_name IN (
        'author_name', 
        'author_bio', 
        'author_email', 
        'author_wechat_id', 
        'author_wechat_qr', 
        'author_xhs_id', 
        'author_xhs_qr', 
        'author_custom_text'
    );

-- Also check if author_name has been populated correctly
SELECT name, author_name FROM brand_info LIMIT 5;
