# 联系作者功能实施计划 (Contact Author Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有的“询价咨询”表单重构为展示作者详细联系方式（微信、小红书、邮箱）的精美名片。

**Architecture:** 扩展现有的 `brand_info` 数据库表以存储作者信息。通过 Zustand store 管理这些信息，并在管理后台提供配置界面。前端 `InquiryWidget` 将重构为触发作者名片弹窗的组件。

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Supabase, Lucide React, Sonner.

---

### Task 1: 数据库 Schema 变更

**Files:**
- Modify: `supabase/migrations` (直接通过 Supabase 控制台或本地 CLI 运行)

- [ ] **Step 1: 准备 SQL 语句**
在 Supabase SQL Editor 中运行以下语句以扩展 `brand_info` 表：
```sql
ALTER TABLE brand_info 
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_email TEXT,
ADD COLUMN IF NOT EXISTS author_wechat_id TEXT,
ADD COLUMN IF NOT EXISTS author_wechat_qr TEXT,
ADD COLUMN IF NOT EXISTS author_xhs_id TEXT,
ADD COLUMN IF NOT EXISTS author_xhs_qr TEXT,
ADD COLUMN IF NOT EXISTS author_custom_text TEXT;

-- 设置 author_name 的初始值为现有的 name (品牌名)
UPDATE brand_info SET author_name = name WHERE author_name IS NULL;
```

- [ ] **Step 2: 验证变更**
运行 `SELECT * FROM brand_info LIMIT 1;` 确认字段已存在。

---

### Task 2: 更新类型定义与 Store 逻辑

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/store.ts`

- [ ] **Step 1: 更新 BrandInfo 接口**
在 `lib/types.ts` 中添加新字段：
```typescript
export interface BrandInfo {
  name: string
  logo: string
  description: string
  authorName: string
  authorBio?: string
  authorEmail?: string
  authorWechatId?: string
  authorWechatQr?: string
  authorXhsId?: string
  authorXhsQr?: string
  authorCustomText?: string
}
```

- [ ] **Step 2: 更新 DEFAULT_BRAND 和 initStore**
在 `lib/store.ts` 中更新默认值和从数据库加载的逻辑。

- [ ] **Step 3: 更新 updateBrand 逻辑**
确保 `updateBrand` 能够处理并保存所有新字段。

- [ ] **Step 4: 提交变更**
`git commit -m "chore: extend brand info types and store logic"`

---

### Task 3: 实现作者信息配置界面 (Admin UI)

**Files:**
- Modify: `components/admin/brand-settings-modal.tsx`

- [ ] **Step 1: 增加作者设置分区**
在 `BrandSettingsModal` 中增加“作者信息”标题及相关输入字段（昵称、简介、邮箱、自定义文本）。

- [ ] **Step 2: 实现二维码上传组件**
复用 Logo 上传逻辑，为微信二维码和小红书二维码增加上传功能。

- [ ] **Step 3: 实现保存逻辑**
确保提交时所有新字段都被正确传递给 `updateBrand`。

- [ ] **Step 4: 提交变更**
`git commit -m "feat: add author settings to brand modal"`

---

### Task 4: 重构前台联系组件 (Frontend UI)

**Files:**
- Create: `components/ui/copy-button.tsx`
- Modify: `components/series/inquiry-widget.tsx`

- [ ] **Step 1: 创建通用的复制组件**
创建一个简单的组件，点击时复制文本并显示成功提示。

- [ ] **Step 2: 获取作者信息**
修改 `InquiryWidget` 使其能通过 Store 或 Props 获取 `BrandInfo`（需要确保 `SeriesDetailPage` 传递了这些信息）。

- [ ] **Step 3: 重写 InquiryModal 为 AuthorCardModal**
将原有的表单重构为名片样式，展示：
- 顶部：Logo、昵称、简介
- 中间：微信（ID+QR）、小红书（ID+QR）、邮箱
- 底部：自定义文本

- [ ] **Step 4: 替换“询价咨询”按钮文案**
将按钮文字改为“联系作者”。

- [ ] **Step 5: 提交变更**
`git commit -m "feat: refactor inquiry widget to author card modal"`

---

### Task 5: 最终验证与清理

- [ ] **Step 1: 验证端到端流程**
1. 登录后台 -> 打开品牌设置 -> 填写作者信息并上传二维码 -> 保存。
2. 进入预览或前台主页 -> 点击“联系作者” -> 检查名片内容是否正确。
3. 测试复制功能和二维码显示。

- [ ] **Step 2: 清理旧代码**
删除不再使用的 `InquiryModal` 相关逻辑和表单处理函数。

- [ ] **Step 3: 提交最终变更**
`git commit -m "refactor: cleanup and final validation of contact author feature"`
