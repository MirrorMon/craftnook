# 取消发布功能与 UI 更新实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在个人主页更新标题，并在管理后台实现系列的“取消发布”功能。

**Architecture:** 扩展 `Series` 数据模型，增加 `unpublishSeriesAction` Server Action，并在 Zustand Store 中实现 `unpublish` 方法，最后更新管理后台 UI。

**Tech Stack:** Next.js, Zustand, Supabase, Tailwind CSS.

---

### Task 1: 个人主页标题更新与模型扩展

**Files:**
- Modify: `app/[username]/page.tsx`
- Modify: `lib/types.ts`

- [ ] **Step 1: 修改个人主页标题**

文件：`app/[username]/page.tsx`
将第 87 行附近的：
```tsx
<h2 className="text-2xl font-medium text-foreground">全部发布作品</h2>
```
改为：
```tsx
<h2 className="text-2xl font-medium text-foreground">全部作品</h2>
```

- [ ] **Step 2: 扩展 Series 接口**

文件：`lib/types.ts`
在 `Series` 接口中添加 `isPublished` 字段：
```typescript
export interface Series {
  id: string
  title: string
  description: string
  coverImage: string
  products: Product[]
  createdAt: string
  lastPublished: string | null
  isPublished: boolean // 新增
  isDirty: boolean
}
```

- [ ] **Step 3: 提交更改**

```bash
git add app/[username]/page.tsx lib/types.ts
git commit -m "feat: update home page title and extend Series model"
```

### Task 2: 后端逻辑与 Store 更新

**Files:**
- Modify: `app/actions/publish.ts`
- Modify: `lib/store.ts`

- [ ] **Step 1: 添加 unpublishSeriesAction**

文件：`app/actions/publish.ts`
添加以下函数：
```typescript
export async function unpublishSeriesAction(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '未授权' }

  try {
    const { error } = await supabase
      .from('series')
      .update({ is_published: false })
      .eq('id', seriesId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}
```

- [ ] **Step 2: 在 Store 中添加 unpublish 方法并更新 initStore**

文件：`lib/store.ts`
1. 在 `StoreState` 接口中添加 `unpublish: (seriesId: string) => Promise<boolean>`。
2. 在 `initStore` 中映射 `is_published` 到 `isPublished`。
3. 实现 `unpublish` 函数。

```typescript
// 在 initStore 映射处
description: s.description || '',
coverImage: s.cover_image || '',
isPublished: s.is_published, // 添加映射
isDirty: false,
```

```typescript
// 实现 unpublish
unpublish: async (seriesId) => {
  try {
    const result = await unpublishSeriesAction(seriesId)
    if (!result.success) throw new Error(result.message)

    set((state) => ({
      draftSeries: state.draftSeries.map(s => 
        s.id === seriesId ? { ...s, isPublished: false } : s
      ),
      publishedSeries: state.publishedSeries.filter(s => s.id !== seriesId)
    }))
    return true
  } catch (err: any) {
    toast.error(`取消发布失败: ${err.message}`)
    return false
  }
},
```

- [ ] **Step 3: 提交更改**

```bash
git add app/actions/publish.ts lib/store.ts
git commit -m "feat: implement unpublish logic in server actions and store"
```

### Task 3: 管理后台 UI 更新

**Files:**
- Modify: `components/admin/product-grid.tsx`

- [ ] **Step 1: 在顶部操作栏添加“取消发布”按钮**

文件：`components/admin/product-grid.tsx`
1. 从 `useStore` 解构 `unpublish`。
2. 在“发布”按钮旁边添加“取消发布”按钮。

```tsx
// 显示逻辑
{selectedSeries.isPublished && !selectedSeries.isDirty && (
  <button
    onClick={() => unpublish(selectedSeriesId!)}
    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors px-3 py-2 rounded-md hover:bg-red-50 whitespace-nowrap"
  >
    <EyeOff size={16} />
    取消发布
  </button>
)}
```

- [ ] **Step 2: 导入 EyeOff 图标**

```typescript
import { 
  Plus, Trash2, LayoutGrid, Columns2, Image as ImageIcon, Pencil, 
  Upload, RotateCcw, Check, Loader2, GripVertical, EyeOff // 新增 EyeOff
} from 'lucide-react'
```

- [ ] **Step 3: 提交并测试**

```bash
git add components/admin/product-grid.tsx
git commit -m "feat: add unpublish button to admin UI"
```

### Task 4: 验证与最终发布

- [ ] **Step 1: 本地测试**
1. 进入管理后台。
2. 选择一个已发布的系列。
3. 点击“取消发布”。
4. 检查个人主页，确认该系列已消失。
5. 检查数据库，确认 `is_published` 为 `false`。

- [ ] **Step 2: 生产环境部署**

运行：`npx vercel --prod`
