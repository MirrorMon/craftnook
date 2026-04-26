# 自动清理存储桶图片实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理后台执行删除或更新操作时，自动异步清理 Supabase 存储桶中不再需要的图片文件。

**Architecture:** 扩展存储工具类，并在 Zustand Store 的相应动作中加入非阻塞的清理逻辑。

**Tech Stack:** TypeScript, Supabase Storage, Zustand.

---

### Task 1: 存储工具扩展

**Files:**
- Modify: `lib/supabase/storage.ts`

- [ ] **Step 1: 实现 deleteImagesFromUrls 函数**

文件：`lib/supabase/storage.ts`
添加以下导出函数：
```typescript
export async function deleteImagesFromUrls(urls: (string | null)[]) {
  const supabase = createClient()
  
  // 1. 过滤无效值并提取文件名
  const fileNames = urls
    .filter((url): url is string => !!url && url.includes('craft-images'))
    .map(url => {
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1].split('?')[0])
    })

  if (fileNames.length === 0) return

  try {
    console.log('[Storage] Cleaning up images:', fileNames)
    const { error } = await supabase.storage
      .from('craft-images')
      .remove(fileNames)
      
    if (error) {
      console.error('[Storage] Cleanup error:', error.message)
    }
  } catch (err) {
    console.error('[Storage] Unexpected error during cleanup:', err)
  }
}
```

- [ ] **Step 2: 提交更改**

```bash
git add lib/supabase/storage.ts
git commit -m "feat: add deleteImagesFromUrls utility to storage tools"
```

### Task 2: Store 删除逻辑更新

**Files:**
- Modify: `lib/store.ts`

- [ ] **Step 1: 更新 deleteProduct 实现异步清理**

文件：`lib/store.ts`
在 `deleteProduct` 中，数据库删除成功后调用清理逻辑。
```typescript
// 导入工具
import { uploadImage, deleteImagesFromUrls } from './supabase/storage'

// 修改 deleteProduct
deleteProduct: async (seriesId, productId) => {
  const product = get().draftSeries.find(s => s.id === seriesId)?.products.find(p => p.id === productId)
  const imagesToCleanup = product?.images || []

  set({ isSyncing: true })
  try {
    // ... 原有数据库删除逻辑 ...
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) throw error

    // 成功后异步清理存储
    if (imagesToCleanup.length > 0) {
      deleteImagesFromUrls(imagesToCleanup).catch(e => console.error('Cleanup failed:', e))
    }

    // ... 原有 set 逻辑 ...
  } catch (err: any) { /* ... */ }
}
```

- [ ] **Step 2: 更新 deleteSeries 实现异步清理**

文件：`lib/store.ts`
修改 `deleteSeries`：
```typescript
deleteSeries: async (id) => {
  const series = get().draftSeries.find(s => s.id === id)
  if (!series) return

  const urlsToCleanup = [
    series.coverImage,
    ...series.products.flatMap(p => p.images)
  ].filter(Boolean)

  set({ isSyncing: true })
  try {
    const { error } = await supabase.from('series').delete().eq('id', id)
    if (error) throw error

    if (urlsToCleanup.length > 0) {
      deleteImagesFromUrls(urlsToCleanup).catch(e => console.error('Cleanup failed:', e))
    }

    // ... 原有 set 逻辑 ...
  } catch (err: any) { /* ... */ }
}
```

- [ ] **Step 3: 提交更改**

```bash
git add lib/store.ts
git commit -m "feat: implement automatic image cleanup in delete actions"
```

### Task 3: Store 更新逻辑增强

**Files:**
- Modify: `lib/store.ts`

- [ ] **Step 1: 更新 updateSeries 清理旧封面**

文件：`lib/store.ts`
在 `updateSeries` 中对比封面变化。
```typescript
const oldCover = get().draftSeries.find(s => s.id === id)?.coverImage
// ... 执行上传 ...
if (oldCover && oldCover !== uploadedCover) {
  deleteImagesFromUrls([oldCover]).catch(e => console.error('Cleanup failed:', e))
}
```

- [ ] **Step 2: 更新 updateProduct 清理废弃图片**

文件：`lib/store.ts`
在 `updateProduct` 中找出不再需要的图片。
```typescript
const oldImages = get().draftSeries.find(s => s.id === seriesId)?.products.find(p => p.id === productId)?.images || []
// ... 执行上传 ...
const removedImages = oldImages.filter(url => !uploadedImages.includes(url))
if (removedImages.length > 0) {
  deleteImagesFromUrls(removedImages).catch(e => console.error('Cleanup failed:', e))
}
```

- [ ] **Step 3: 提交更改**

```bash
git add lib/store.ts
git commit -m "feat: implement image cleanup in update actions"
```

---

### 验证步骤 (本地)
1. 在管理后台删除一个有图片的系列。
2. 检查控制台输出 `[Storage] Cleaning up images: [...]`。
3. 检查 Supabase Dashboard 存储桶，确认文件已消失。
4. 替换一个系列的封面图，确认旧图被清理。
