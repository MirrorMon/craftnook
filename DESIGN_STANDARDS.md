# CraftNook 设计规范 (Design Standards)

本指南总结了 CraftNook 项目中的视觉风格和交互规范，以便在后续迭代中保持一致性。

## 1. 核心色彩 (Core Colors)

| 属性 | 颜色值 | 说明 |
| :--- | :--- | :--- |
| **分割线 (Border)** | `#EFEFEF` | 用于全站所有的边框、分割线。 |
| **输入框背景 (Input BG)** | `#EDEDED` | 用于后台管理页面所有编辑表单的输入框背景。 |
| **次级背景 (Secondary BG)** | `#F7F8F8` | 用于个人主页列表模式的项目背景、视图切换器背景、后台系列列表卡片的 hover 底色。 |
| **品牌色 (Primary)** | `oklch(0.30 0.02 60)` | 核心交互元素（如主按钮）的背景色。 |
| **危险红 (Destructive)** | `#C65035` | 删除、退出登录、取消发布等危险/反向操作（含 `hover:bg-destructive/10` 淡色底、`hover:bg-destructive` 反白底）。对应 token `--destructive`。 |
| **成功绿 (Success)** | `#54A844` | 发布成功等正向状态提示（如「已发布」按钮态、成功 toast）。对应 token `--success`。 |
| **图标按钮 Hover 底色 (Icon Hover BG)** | `#AFAFAF` 10% (`rgba(175,175,175,0.1)`) | 后台系列列表行内纯图标按钮（预览/编辑/删除）hover 时的背景色。 |

> **实现约定**：新代码必须使用语义 token 类（`text-destructive`、`bg-destructive/10`、`bg-destructive`、`bg-success`、`text-success-foreground`），禁止再硬编码 `red-500`、`green-600` 等 Tailwind 默认色。错误/成功 toast 配色已跟随以上两色（见 `components/ui/sonner.tsx`）。

## 2. 形状与圆角 (Shapes & Radius)

*   **全局标准圆角**: `4px` (`rounded-md`)。
    *   应用于：按钮、输入框、视图切换器、系列卡片、列表项、弹窗等几乎所有矩形容器。
*   **全圆角 (Pill)**: `rounded-full`。
    *   应用于：头像、浮动按钮、标签等。

## 3. 后台管理规范 (Admin UI Standards)

### 3.1 按钮布局
*   在产品管理页（Product Grid）中：
    *   **“新增产品”** 按钮必须始终位于操作栏的 **最右侧**。
    *   **“发布”** 按钮（在有未发布修改、或系列未上线时显示，表示"把后台内容发布为线上版本"）与 **“撤销修改”** 按钮（在有未发布修改且存在已发布快照时显示，二次确认后把后台还原为前台正在展示的版本）应紧贴并位于“新增产品”按钮的 **左侧**。
*   新增入口统一使用「新增 XX」文案（如“新增产品”“新增系列”），不使用“添加”。

### 3.2 表单样式
*   所有 `input` 和 `textarea` 应使用 `bg-input` (`#EDEDED`) 填充。
*   表单元素统一使用 `4px` 圆角。
*   内边距标准：`px-4 py-3`。

### 3.3 按钮规范（后台通用，新页面必须遵守）
*   **带文字的操作按钮高度统一 40px**（`h-10`），不再用 `py-*` 控制高度；水平内边距按场景 `px-3`~`px-8`。
*   **文字统一 14px**（`text-sm`）。
*   **纯图标按钮统一 24×24px**（`h-6 w-6 flex items-center justify-center`，图标 16px）：弹窗关闭 X、系列行内预览/编辑/删除、产品卡片编辑/删除、图片列表删除、页头图标按钮、叠加在图片/二维码角上的移除角标等。
*   **颜色**：主按钮 `bg-primary`、危险操作 `bg-destructive` / `text-destructive`（`#C65035`）、成功态 `bg-success`（`#54A844`）；一律用语义 token，不写死色值。状态标签（如「未发布」）使用 `bg-destructive/20 text-destructive`。
*   **例外（不强制尺寸，保持原设计）**：
    *   内容型选择按钮（如弹窗内「排版方式」的大图卡片按钮，`p-4` 卡式布局）；
    *   登录页按钮（另行定义）。
*   参考实现见 `app/admin/page.tsx`、`components/admin/*.tsx`。

### 3.4 图片上传预览
*   上传/编辑预览区必须与前台实际展示的裁切比例一致（`object-cover`，所见即所得）：
    *   **系列封面**：`aspect-[4/5]`（与前台卡片模式 `SeriesCard` 封面一致），宽度上限 `max-w-[256px]` 居中。
    *   如前台新增其他展示比例，上传预览需同步调整。

### 3.5 弹窗结构（表单类弹窗通用）
*   **限高**：弹窗容器统一 `max-h-[90vh] flex flex-col overflow-hidden`（与「编辑产品」一致），内容超出即在弹窗内部滚动，不允许弹窗超出视口。
*   **固定头尾**：标题栏与底部操作栏为 `flex-shrink-0`，不随内容滚动。
*   **滚动区**：中间内容区为 `flex-1 min-h-0 overflow-y-auto`，是唯一的滚动容器。
*   **操作按钮固定在弹窗底部**：取消/确认等按钮放在滚动区之外；提交按钮通过 `form="<表单id>"` 关联表单（保持回车提交与校验语义）。
*   参考实现：`components/admin/add-product-modal.tsx`、`edit-product-modal.tsx`、`add-series-modal.tsx`、`edit-series-modal.tsx`、`brand-settings-modal.tsx`。

### 3.6 系列列表（左侧栏）交互规范
*   **卡片 hover 底色**：`#F7F8F8`（即核心色彩里的「次级背景」）；选中态为品牌色 `bg-primary` 反白（此时不叠 hover 底色）。
*   **行内操作按钮**：预览 / 编辑 / 删除三个纯图标按钮位于 **「发布于」同一行的右侧**，默认隐藏（`opacity-0`），hover 卡片时显示；hover 图标本身时背景为 `#AFAFAF` 10%（`rgba(175,175,175,0.1)`），其中删除图标保持危险红 `text-destructive`。在线系列点击删除会提示"先取消发布"。
*   **发布时间**：仅显示日期（月/日，如 `10/12`），不显示时分；从未发布过的显示「从未发布」。
*   **状态标签**：当前未上线的系列显示灰色「未发布」；已上线且有未发布修改的显示红色「修改未发布」；已上线且无修改的不显示标签。标签规则以 `is_published`（是否在线）与"是否有未发布修改"两个状态为唯一依据。
*   参考实现：`components/admin/series-list.tsx`。

## 4. 前台展示规范 (Frontend UI Standards)

### 4.1 个人主页
*   **列表模式**:
    *   移除项目边框，改用 `#F7F8F8` 填充色。
    *   项目圆角为 `4px` (`rounded-md`)。
*   **视图切换器**:
    *   容器圆角为 `4px` (`rounded-md`)。
    *   背景色为 `#F7F8F8`，激活状态按钮为白色背景带阴影。

### 4.2 联系作者弹窗 (Inquiry Widget)
*   **入口**: 个人主页与系列详情页均在右下角显示浮动「联系作者」按钮（`fixed bottom-8 right-8`，hover 展开文字），两处使用同一组件 `components/series/inquiry-widget.tsx`。
*   **弹窗样式**:
    *   无外边框，使用 `shadow-2xl` 深度投影。
    *   圆角为 `4px` (`rounded-md`)。
*   **二维码展示**:
    *   直接展示，无需点击。
    *   单二维码居中，双二维码并排。
    *   二维码卡片投影透明度为 `10%` (`rgba(0,0,0,0.1)`)。
    *   二维码内部卡片圆角为 `4px` (`rounded-md`)。
*   **字体样式**:
    *   作者昵称：`text-2xl` 加粗。
    *   辅助文字（简介、其它、扫码提示）：统一为 `text-sm`，颜色为 `text-muted-foreground/80`。

## 5. 交互原则 (Interaction Principles)

*   **反馈优先**: 发布、保存等耗时操作必须有 Loading 状态（如 `Loader2` 动画）。
*   **视觉层级**: 浮动动作按钮（FAB）应具备高层级（`z-[999]`）和清晰的阴影（`shadow-2xl`）。
