# MVP 协作文档

| 版本号 | 当前状态 | 负责人 |
|--------|----------|--------|
| v3     | 待开发 | Fullstack-Dev |

当前状态可选：`待规划` → `待开发` → `待 Review` → `已通过` / `需修改`

> 本文档由 **Planner → Fullstack-Dev → Reviewer** 依次填写，请勿跳过或打乱顺序。  
> 每次工作后，各角色须在 **`docs/agent-log.md`** 追加一条操作记录，便于回档与做教程。

---

## 1. 需求（用户 / 产品）

<!-- Planner 只读此部分。需求以产品文档为准。 -->

**需求来源**：`docs/doc-mvp-v1.md`（AI 求职助手 MVP 产品文档 V1）  
**设计规范**：`agents/design.md`（参考魔方简历、全民简历、BOSS 直聘），样式 token 见 `styles/globals.css`。

**v1 核心范围**：输入（经历 + JD）→ 输出（1 句判断 + 2 个问题 + 1 段改写） + 基础反馈按钮。

**v2 新增需求**：
1.  **页面拆分**：
    - 原「经历匹配 JD」功能迁移至 `/match` 页面。
    - 新增「AI 简历生成」功能，独立为 `/resume` 页面。
    - 首页 `/` 改为导航页（Landing Page），引导用户进入上述两个功能。
2.  **简历生成功能**：
    - 收集用户信息（基本信息、核心经历、意向岗位）。
    - AI 生成优化后的简历内容。

**v3 新增需求**：
1.  **简历导出 PDF**：
    - 在生成的简历下方增加「导出 PDF」按钮。
    - 将渲染后的 Markdown 简历导出为 A4 格式的 PDF。

---

## 2. 任务拆解（Planner 输出）

<!-- Planner 根据「需求」输出可执行步骤；Fullstack-Dev 只读此部分实现。 -->

**v2 任务拆解**：

**Step 1: 页面结构重构**
- **输入**：现有的 `pages/index.tsx`
- **输出**：
    1.  新建 `pages/match.tsx`，迁移原 `index.tsx` 的核心逻辑（匹配功能）。
    2.  新建 `pages/resume.tsx`（初始化为空白页或简单占位）。
    3.  重写 `pages/index.tsx`，作为 Landing Page，包含两个卡片/按钮分别跳转 `/match` 和 `/resume`。
- **可写死/简化**：Landing Page 仅需简单导航，无需复杂动效。

**Step 2: 简历生成页 UI**
- **输入**：无
- **输出**：`pages/resume.tsx` 包含表单：
    - 意向岗位（Input）
    - 核心经历（Textarea，支持粘贴多段）
    - 「生成简历」按钮
- **可写死/简化**：表单项先只做最核心的，不做复杂校验；暂不收集姓名电话等隐私信息。

**Step 3: 简历生成 API (Mock)**
- **输入**：用户填写的表单数据
- **输出**：Mock 的简历内容（Markdown 格式），包含：个人总结、经历优化、技能关键词。
- **可写死/简化**：直接返回一段写死的 Markdown 简历模版。

**Step 4: 简历展示与交互**
- **输入**：API 返回的简历内容
- **输出**：在 `pages/resume.tsx` 下方展示生成的简历，支持 Markdown 渲染，支持一键复制。
- **可写死/简化**：样式简单可读即可。

**Step 5: 接入真实 AI 生成简历**
- **输入**：表单数据
- **输出**：调用 LLM 生成的真实简历内容。
- **可写死/简化**：复用 `analyze` 的 API 调用模式，Prompt 需针对简历生成优化。

**v3 任务拆解**：

**Step 1: 安装依赖**
- **输入**：无
- **输出**：安装 `html2canvas` 和 `jspdf`。

**Step 2: 实现 PDF 导出逻辑**
- **输入**：渲染后的简历 DOM
- **输出**：在 `pages/resume.tsx` 中实现 `exportToPDF` 函数，支持将内容转换为图片并嵌入 A4 PDF。
- **可写死/简化**：优先保证内容完整，不处理复杂的多页分页逻辑。

**Step 3: UI 完善与多语言**
- **输入**：无
- **输出**：在「复制简历」旁边增加「导出 PDF」按钮；更新 `common.json` 补充相关文案。

---

## 3. 实现说明（Fullstack-Dev 输出）

<!-- Fullstack-Dev 根据「任务拆解」实现后，在此列出：改了哪些文件、关键逻辑说明。Reviewer 据此 + 代码做 Review。 -->

| 文件 | 说明 |
|------|------|
| `pages/index.tsx` | 首页：Landing Page，引导用户前往匹配或简历生成功能 |
| `pages/match.tsx` | 匹配页：原首页逻辑迁移，支持经历与 JD 匹配分析 |
| `pages/resume.tsx` | 简历生成页：支持 Markdown 渲染、一键复制及导出为 A4 PDF |
| `pages/api/analyze.ts` | 分析接口：支持从 `prompt/` 目录动态读取系统提示词与 Few-shot 示例 |
| `pages/api/resume.ts` | 简历生成接口：支持 DeepSeek API 真实分析与 Mock 数据切换 |
| `src/store/analyze.ts` | Zustand 状态管理：存储匹配分析结果、解锁状态及反馈 |
| `src/types/analyze.ts` | 定义 `AnalyzeResponse`（summary, problems, rewrite）以匹配“毒舌筛选”风格 |
| `src/styles/globals.css` | 样式配置，集成 `@tailwindcss/typography` 插件 |
| `public/locales/{zh,en}/common.json` | 补充 Landing Page 与简历生成相关多语言文案 |
| `package.json` | 新增 `react-markdown`、`@tailwindcss/typography`、`html2canvas` 与 `jspdf` 依赖 |

---

## 4. Review 结论（Reviewer 输出）

<!-- Reviewer 根据「任务拆解」+「实现说明」+ 实际代码，给出问题与替代方案，或确认可推进。 -->

（待 Reviewer 填写）

---

## 协作约定

| 角色 | 读取 | 写入 |
|------|------|------|
| Planner | §1 需求 | §2 任务拆解 |
| Fullstack-Dev | §2 任务拆解 | §3 实现说明 + 代码仓库 |
| Reviewer | §2 + §3 + 代码 | §4 Review 结论 |
