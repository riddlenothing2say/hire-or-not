# 设计规范（参考竞品总结）

> 参考：魔方简历 [magicv.art/zh](https://magicv.art/zh)、全民简历 [qmjianli.com](https://www.qmjianli.com/)、BOSS 直聘 [zhipin.com](https://www.zhipin.com/)

## 一、参考结论摘要

| 产品       | 风格要点 |
|------------|----------|
| 魔方简历   | 极简、白底、大留白；强调「免费」「智能」「隐私」；按钮与标题简洁 |
| 全民简历   | 专业、卡片式布局；多色可定制感；强调「海量模板」「10 分钟」「千万用户」 |
| BOSS 直聘  | 主色橙（活力/行动）+ 蓝（专业/信任）+ 灰（稳重）；强 CTA、招聘场景 |

**本产品取用**：浅底 + 白卡片层级 + 蓝主色（专业/信任）+ 橙强调（转化/行动）+ 统一圆角与间距，贴合求职/过筛场景且便于实现。

---

## 二、色彩体系

| Token | 用途 | 色值 | 说明 |
|-------|------|------|------|
| `--color-page-bg` | 页面背景 | `#f8fafc` | 浅灰蓝底（偏魔方/全民的干净底） |
| `--color-surface` | 卡片/区块 | `#ffffff` | 纯白 |
| `--color-border` | 分割/描边 | `#e2e8f0` | 中性灰边框 |
| `--color-text` | 正文 | `#1e293b` | 深灰蓝（易读） |
| `--color-text-secondary` | 次要文案 | `#64748b` | 中灰 |
| `--color-text-muted` | 辅助/占位 | `#94a3b8` | 浅灰 |
| `--color-primary` | 主操作/链接 | `#2563eb` | 蓝（专业、信任，对齐 BOSS 蓝） |
| `--color-primary-hover` | 主色悬停 | `#1d4ed8` | 深蓝 |
| `--color-accent` | 强调/CTA | `#ea580c` | 橙（行动、转化，对齐 BOSS 橙） |
| `--color-accent-hover` | 强调悬停 | `#c2410c` | 深橙 |
| `--color-success` | 成功/正向 | `#059669` | 绿 |
| `--color-warning` | 警告/注意 | `#d97706` | 琥珀 |

---

## 三、圆角与阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `6px` | 小控件（输入框、标签） |
| `--radius-md` | `10px` | 按钮、卡片 |
| `--radius-lg` | `14px` | 大卡片、弹层 |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 轻描边感 |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)` | 卡片 |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.06)` | 浮层 |

---

## 四、间距与排版

- **间距阶梯**：`4 / 8 / 12 / 16 / 24 / 32 / 48`（单位 px）
- **页面内边距**：移动端 16px，桌面 24px。
- **标题**：H1 20px 粗体，H2 18px 粗体，H3 16px 粗体；色用 `--color-text`。
- **正文**：14–15px，行高 1.5–1.6；次要文案用 `--color-text-secondary`。
- **小字/说明**：12–13px，`--color-text-muted`。

---

## 五、组件约定

- **主按钮**：背景 `--color-primary`，白字，圆角 `--radius-md`，hover 用 `--color-primary-hover`。
- **强调/CTA 按钮**（如「解锁」「立即分析」）：背景 `--color-accent`，白字，hover `--color-accent-hover`。
- **输入框**：白底、`--color-border` 描边、圆角 `--radius-sm`，focus 时边框可改为 `--color-primary`。
- **卡片**：白底、`--shadow-md`、圆角 `--radius-lg`，内边距建议 24px。

---

## 六、与代码对应

以上 token 与组件约定在 **`styles/globals.css`** 的 `:root` 中定义；组件实现时优先使用 CSS 变量，便于后续换肤或与 Figma 对齐。
