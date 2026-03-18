# MVP 协作文档

| 版本号 | 当前状态 | 负责人 |
|--------|----------|--------|
| v1     | 待开发   | Fullstack-Dev |

当前状态可选：`待规划` → `待开发` → `待 Review` → `已通过` / `需修改`

> 本文档由 **Planner → Fullstack-Dev → Reviewer** 依次填写，请勿跳过或打乱顺序。  
> 每次工作后，各角色须在 **`docs/agent-log.md`** 追加一条操作记录，便于回档与做教程。

---

## 1. 需求（用户 / 产品）

<!-- Planner 只读此部分。需求以产品文档为准。 -->

**需求来源**：`docs/doc-mvp-v1.md`（AI 求职助手 MVP 产品文档 V1）  
**设计规范**：`agents/design.md`（参考魔方简历、全民简历、BOSS 直聘），样式 token 见 `styles/globals.css`。

核心范围见该文档「第一周上线版本」：输入（经历 + JD）→ 输出（1 句判断 + 2 个问题 + 1 段改写）+ 基础反馈按钮。其余目标与约束以文档全文为准。

---

## 2. 任务拆解（Planner 输出）

<!-- Planner 根据「需求」输出可执行步骤；Fullstack-Dev 只读此部分实现。 -->

**第一周上线范围**：输入（经历 + JD）→ 输出（1 句判断 + 2 个问题 + 1 段改写）+ 基础反馈按钮。

---

**Step 1：初始化项目与 UI 规范**
- **输入**：`agents/design.md`
- **输出**：
  - 初始化 Next.js 项目（Pages Router, Tailwind 4）
  - 配置 `styles/globals.css` 设计变量
  - 完善多语言配置 `next-i18next.config.js`
- **可写死/简化**：先完成基础脚手架，不做业务逻辑

**Step 2：创建主页面（输入页）**
- **输入**：无
- **输出**：
  - 单页 `pages/index.tsx`
  - 包含两个 textarea（经历、JD）+ 一个「分析」按钮
  - 使用 `react-hook-form + yup` 做表单
- **可写死/简化**：不做路由，单页即可；样式极简

**Step 3：实现分析接口（先 mock）**
- **输入**：经历文案 + JD 文案
- **输出**：
  - API `pages/api/analyze.ts`
  - 返回 JSON：`judgment`（1 句）、`questions`（2 条）、`rewrite`（1 段）
- **可写死/简化**：先用 mock 数据，模拟延迟 1-2 秒，方便后续替换

**Step 4：展示分析结果**
- **输入**：Step 3 返回的 `judgment`、`questions`、`rewrite`
- **输出**：
  - 结果区展示：1 句判断 + 2 个问题 + 1 段改写（可复制）
- **可写死/简化**：排版用简单卡片

**Step 5：添加基础反馈按钮**
- **输入**：用户点击反馈
- **输出**：
  - 「已投递」「拿到面试 / 未拿到」按钮
  - 点击后记录状态到 `localStorage` 或 Zustand
- **可写死/简化**：不建库，仅做前端反馈记录

**Step 6：接入真实 AI 分析（替换 mock）**
- **输入**：经历 + JD（同 Step 3）
- **输出**：
  - `pages/api/analyze.ts` 调 DeepSeek API
  - 返回与 Step 3 相同结构的真实内容
- **可写死/简化**：API Key 用环境变量；Prompt 先固定在后端

---

**执行顺序**：Step 1 → 2 → 3 → 4 → 5 → 6。Step 3 完成后即可进行初步联调。

---

## 3. 实现说明（Fullstack-Dev 输出）

<!-- Fullstack-Dev 根据「任务拆解」实现后，在此列出：改了哪些文件、关键逻辑说明。Reviewer 据此 + 代码做 Review。 -->

（待 Fullstack-Dev 填写）

---

## 4. Review 结论（Reviewer 输出）

<!-- Reviewer 根据「任务拆解」+「实现说明」+ 实际代码，给出问题与替代方案，或确认可推进。 -->

（待 Reviewer 填写）

---

## 协作约定

| 角色 | 读取 | 写入 |
|------|------|------|
| Planner | §1 需求 | §2 任务拆解 |
| Fullstack-Dev | §2 任务拆解 | §3 实现说明 |
| Reviewer | §2, §3, 代码 | §4 Review 结论 |
