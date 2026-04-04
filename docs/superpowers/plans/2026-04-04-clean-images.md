# 清理未使用图片实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 找出并删除 Supabase `craft-images` 存储桶中未被引用的图片。

**Architecture:** 使用临时 TypeScript 脚本，连接 Supabase 并比对数据库记录与存储文件。

**Tech Stack:** TypeScript, Supabase SDK, Node.js (tsx).

---

### Task 1: 环境准备与脚本编写

**Files:**
- Create: `scripts/clean-images.ts`

- [ ] **Step 1: 创建扫描脚本**

文件：`scripts/clean-images.ts`
脚本需包含以下逻辑：
1. 初始化 Supabase 客户端（使用 Service Role Key 以获得完整权限）。
2. 从 `brand_info`, `series`, `products` 表中提取所有引用的图片 URL。
3. 从 URL 中提取文件名集合。
4. 列出 `craft-images` 存储桶中的所有文件。
5. 找出在存储桶中但不在引用集合中的文件。
6. 输出待删除列表。

```typescript
// scripts/clean-images.ts 核心逻辑参考
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 需要 Service Role Key
)

async function scan() {
  console.log('正在从数据库收集图片引用...')
  
  // 1. 收集所有引用
  const { data: brands } = await supabase.from('brand_info').select('logo, author_wechat_qr, author_xhs_qr')
  const { data: series } = await supabase.from('series').select('cover_image')
  const { data: products } = await supabase.from('products').select('images')

  const usedFiles = new Set<string>()
  const extractFileName = (url: string | null) => {
    if (!url) return
    const parts = url.split('/')
    const fileName = parts[parts.length - 1].split('?')[0]
    usedFiles.add(fileName)
  }

  brands?.forEach(b => {
    extractFileName(b.logo)
    extractFileName(b.author_wechat_qr)
    extractFileName(b.author_xhs_qr)
  })
  series?.forEach(s => extractFileName(s.cover_image))
  products?.forEach(p => p.images?.forEach(extractFileName))

  console.log(`数据库引用了 ${usedFiles.size} 个文件。`)

  // 2. 列出存储桶文件
  const { data: bucketFiles, error: listError } = await supabase.storage.from('craft-images').list()
  if (listError) throw listError

  const unusedFiles = bucketFiles
    .map(f => f.name)
    .filter(name => !usedFiles.has(name) && name !== '.emptyFolderPlaceholder')

  console.log(`发现 ${unusedFiles.size} 个未使用的文件：`)
  unusedFiles.forEach(f => console.log(` - ${f}`))
  
  return unusedFiles
}

// 暂时只执行扫描
scan().catch(console.error)
```

- [ ] **Step 2: 提交脚本**

```bash
git add scripts/clean-images.ts
git commit -m "chore: add unused images scanning script"
```

### Task 2: 执行扫描并汇报结果

- [ ] **Step 1: 运行扫描脚本**

运行：`npx tsx scripts/clean-images.ts`
（由于需要 Service Role Key，如果本地没有设置，请用户提供或手动输入。）

- [ ] **Step 2: 输出待删除列表**

**Action:** 将脚本输出的待删除文件名列表展示给用户确认。

### Task 3: 执行删除 (需确认后执行)

- [ ] **Step 1: 更新脚本执行删除**

修改 `scripts/clean-images.ts`，增加删除逻辑：
```typescript
if (process.argv.includes('--delete')) {
  console.log('正在执行删除...')
  const { error } = await supabase.storage.from('craft-images').remove(unusedFiles)
  if (error) console.error('删除失败:', error)
  else console.log('删除成功！')
}
```

- [ ] **Step 2: 运行删除命令**

运行：`npx tsx scripts/clean-images.ts --delete`

- [ ] **Step 3: 删除临时脚本并提交**

```bash
rm scripts/clean-images.ts
git add .
git commit -m "chore: cleanup unused images and remove script"
```
