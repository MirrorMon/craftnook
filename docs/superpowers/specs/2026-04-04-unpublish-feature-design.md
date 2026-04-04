# 取消发布功能与 UI 更新设计文档 (2026-04-04)

本文档概述了在个人主页更新标题以及在管理后台添加“取消发布”功能的方案。

## 1. 目标
- 将个人主页的作品列表标题从“全部发布作品”改为“全部作品”。
- 在管理后台为每个系列增加“取消发布”按钮，允许用户将已发布的系列转为私有。

## 2. 变更内容

### 2.1 个人主页更新
- **文件**: `app/[username]/page.tsx`
- **操作**: 将 `<h2>` 标签文字从 `全部发布作品` 修改为 `全部作品`。

### 2.2 数据模型更新
- **文件**: `lib/types.ts`
- **操作**: 在 `Series` 接口中添加 `isPublished: boolean` 字段。
- **说明**: 数据库中的 `series` 表已存在 `is_published` 字段。

### 2.3 后端逻辑 (Server Actions)
- **文件**: `app/actions/publish.ts`
- **新增函数**: `unpublishSeriesAction(seriesId: string, username: string | null)`。
- **逻辑**: 
    1. 验证用户身份。
    2. 将 `series` 表中对应 `id` 的 `is_published` 设为 `false`。
    3. 调用 `revalidatePath('/', 'layout')` 刷新缓存。

### 2.4 状态管理 (Zustand Store)
- **文件**: `lib/store.ts`
- **新增方法**: `unpublish(seriesId: string): Promise<boolean>`。
- **逻辑**:
    1. 调用 `unpublishSeriesAction`。
    2. 成功后更新本地 `draftSeries` 和 `publishedSeries` 状态（将 `isPublished` 设为 `false`）。
- **更新 `initStore`**: 确保从数据库加载数据时正确映射 `is_published` 到 `isPublished`。

### 2.5 管理后台 UI
- **文件**: `components/admin/product-grid.tsx`
- **变更**: 在顶部操作栏增加“取消发布”按钮。
- **显示逻辑**: 当 `selectedSeries.isPublished === true` 且 `!selectedSeries.isDirty` 时显示。

## 3. 验证准则
- [ ] 个人主页标题显示为“全部作品”。
- [ ] 管理后台对于已发布的系列显示“取消发布”按钮。
- [ ] 点击“取消发布”后，该系列在管理后台的状态更新。
- [ ] 取消发布后的系列不再显示在个人主页（前台）。
- [ ] 取消发布操作后，前台缓存正确刷新。
