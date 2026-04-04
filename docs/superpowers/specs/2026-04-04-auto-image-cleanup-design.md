# 自动清理存储桶图片功能设计文档 (2026-04-04)

本文档概述了在删除系列或产品时，自动异步清理 Supabase 存储桶中相关图片文件的方案。

## 1. 目标
- 当用户在管理后台删除产品、系列或更新图片时，自动清理云端存储中不再需要的图片文件。
- 采用异步非阻塞方式，确保不影响用户操作的流畅度。

## 2. 变更内容

### 2.1 存储工具扩展
- **文件**: `lib/supabase/storage.ts`
- **新增函数**: `deleteImagesFromUrls(urls: (string | null)[])`
    - **逻辑**: 
        1. 过滤空值和非本项目存储桶的 URL（如外部链接）。
        2. 从 URL 中提取文件名。
        3. 调用 `supabase.storage.from('craft-images').remove(fileNames)`。

### 2.2 Store 逻辑更新 (`lib/store.ts`)

#### A. 删除产品 (`deleteProduct`)
- 获取当前产品的图片 URL 列表。
- 执行数据库删除并同步更新 Zustand 状态。
- **异步调用** `deleteImagesFromUrls` 清理图片。

#### B. 删除系列 (`deleteSeries`)
- 收集该系列封面图 URL。
- 遍历该系列下所有产品，收集所有产品图片 URL。
- 执行数据库删除（系列级联删除产品）。
- 同步更新 Zustand 状态。
- **异步调用** `deleteImagesFromUrls` 清理所有收集到的图片。

#### C. 更新图片 (`updateSeries` / `updateProduct`)
- 比对更新前后的图片 URL。
- 如果某张旧图在更新后不再被引用，异步清理该旧图。

## 3. 技术细节：异步非阻塞
在 Store 中调用删除工具时，不使用 `await`，例如：
```typescript
// 数据库删除成功后
deleteImagesFromUrls(urlsToCleanup).catch(err => console.error('Background cleanup failed:', err))
```

## 4. 安全保护
- **URL 验证**: 只有符合本项目 Supabase 存储格式的 URL 才会触发删除，防止误删外部资源。
- **错误容忍**: 如果后台清理失败，仅在控制台记录错误，不中断用户的正常流程。

## 5. 验证准则
- [ ] 删除产品后，Supabase 存储桶中对应的图片文件消失。
- [ ] 删除系列后，该系列封面及所属所有产品的图片文件消失。
- [ ] 更新封面图后，旧的封面图文件被清理。
- [ ] 所有的清理操作都不导致 UI 界面出现明显的等待或卡顿。
