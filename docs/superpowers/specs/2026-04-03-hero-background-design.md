# Hero 区域响应式背景设计规格书

## 1. 目标
实现一个具有“包裹感”的 Hero 首屏区域，背景由左、右、底三个分离的装饰图构成。要求在不同设备尺寸下保持良好的视觉比例，且不遮挡主体内容。

## 2. 视觉组件与布局
### 2.1 结构设计
- **父容器 (`.hero-container`)**:
  - 采用 `position: relative; overflow: hidden;` 防止装饰物溢出。
- **装饰层 (`.decoration-layer`)**:
  - `position: absolute; inset: 0; pointer-events: none; z-index: 1;`。
- **内容层 (`.hero-content`)**:
  - `position: relative; z-index: 10;`。

### 2.2 装饰元素定位
- **左侧装饰 (hand-left)**:
  - 定位：`left: 0; top: 50%; transform: translateY(-50%);`。
  - 尺寸：宽度使用 `clamp(150px, 20vw, 300px)`，确保在大屏和小屏下比例协调。
- **右侧装饰 (hand-right)**:
  - 定位：`right: 0; top: 50%; transform: translateY(-50%);`。
  - 尺寸：同左侧。
- **底部装饰 (bottom-flowers)**:
  - 定位：`bottom: 0; left: 50%; transform: translateX(-50%);`。
  - 尺寸：`width: 100%; max-width: 1200px;`。

## 3. 响应式策略
### 3.1 方案 A: 等比例缩小 (Desktop & Tablet)
- 在 768px 以上，左、右手部装饰随屏幕宽度同步缩小，始终保持在内容两侧，不重叠文字。

### 3.2 方案 2: 固定高度/中间裁剪 (Mobile)
- **屏幕宽度 < 768px**:
  - 隐藏左、右手部装饰 (`display: none`)。
  - 底部花朵装饰保持固定高度（如 `120px`），并使用 `object-fit: cover; object-position: center;` 确保显示花朵最集中的中间区域。

## 4. 资源重构
为了项目整洁，将图片从 `/public/` 根目录迁移：
- `/public/Bg-L.png` -> `/public/images/hero/hand-left.png`
- `/public/Bg-R.png` -> `/public/images/hero/hand-right.png`
- `/public/Bg-B.png` -> `/public/images/hero/bottom-flowers.png`

## 5. 技术实现
- 使用 Tailwind CSS 进行快速布局。
- 采用 Next.js `next/image` 组件优化图片加载。
- 确保 `pointer-events: none` 避免干扰按钮交互。
