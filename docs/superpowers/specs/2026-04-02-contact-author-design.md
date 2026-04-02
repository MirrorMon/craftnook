# 联系作者功能设计方案 (Contact Author Design Spec)

## 1. 概述 (Overview)
将现有的“询价咨询”功能重构为“联系作者”功能。用户可以在后台配置详细的作者个人信息和多种联系方式（微信、小红书、邮箱等），前台通过悬浮按钮触发精美的作者名片展示，方便用户直接通过配置的途径联系作者。

## 2. 目标 (Goals)
*   提供完整的作者信息配置界面。
*   支持微信和小红书的账号及二维码配置。
*   前台展示精美的作者名片。
*   提供点击复制联系方式等交互增强。

## 3. 技术方案 (Technical Strategy)

### 3.1 数据库与数据模型 (Database & Data Model)
扩展现有的 `brand_info` 表，增加作者相关字段：
*   `author_name`: TEXT (必填) - 作者昵称
*   `author_bio`: TEXT (选填) - 作者简介
*   `author_email`: TEXT (选填) - 邮箱
*   `author_wechat_id`: TEXT (选填) - 微信号
*   `author_wechat_qr`: TEXT (选填) - 微信二维码图片 URL
*   `author_xhs_id`: TEXT (选填) - 小红书号
*   `author_xhs_qr`: TEXT (选填) - 小红书二维码图片 URL
*   `author_custom_text`: TEXT (选填) - 自定义文本内容

### 3.2 状态管理 (State Management)
更新 `lib/types.ts` 中的 `BrandInfo` 接口，并同步更新 `lib/store.ts` 中的 `DEFAULT_BRAND` 和 `updateBrand` 逻辑，确保新字段能正确保存和分发。

### 3.3 后台配置界面 (Admin UI)
修改 `components/admin/brand-settings-modal.tsx`：
*   在“品牌设置”下方增加“作者设置”分区。
*   实现图片上传组件（用于微信和小红书二维码）。
*   增加表单校验，确保 `author_name` 已填写。

### 3.4 前台展示界面 (Frontend UI)
重构 `components/series/inquiry-widget.tsx` 为 `contact-author-widget.tsx`（或保留原名但重构内部）：
*   悬浮按钮文案改为“联系作者”，图标保持或更换。
*   弹窗重构为 `AuthorCard` 模式：
    *   展示头像、昵称、简介。
    *   展示联系方式列表（微信、小红书、邮箱）。
    *   实现点击复制账号功能。
    *   展示二维码图片，支持点击放大。
    *   展示底部自定义文本。

## 4. 详细设计 (Detailed Design)

### 4.1 接口更新
`lib/types.ts`:
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

### 4.2 交互细节
*   **复制功能：** 使用 `navigator.clipboard.writeText` 实现。
*   **二维码：** 使用响应式容器展示，确保在移动端也能清晰扫描。

## 5. 验证标准 (Success Criteria)
*   [ ] 后台可以成功保存作者昵称、简介、微信/小红书账号及二维码。
*   [ ] 前台悬浮按钮显示为“联系作者”。
*   [ ] 点击按钮后弹出的名片包含所有已配置的信息。
*   [ ] 复制按钮功能正常。
*   [ ] 未配置的选填字段在名片中应隐藏，不留空白占位。
