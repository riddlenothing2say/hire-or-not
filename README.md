# Hire or Not - AI 求职助手

Hire or Not 是一款高效的全栈 AI 助手，旨在通过 AI 深度分析简历与职位描述（JD）的匹配度，并提供针对性的简历生成服务，助你更轻松地通过初筛，拿到面试邀请。

**✨ 郑重承诺：本项目的基础分析与生成功能将永久免费。**

## 🚀 核心功能

- **简历匹配分析**：采用“毒舌招聘官”人设，直接指出简历中的“致命风险点”，并提供过筛建议。
- **AI 简历生成**：根据核心经历与意向岗位，一键生成高转化的 Markdown 格式简历。
- **多语言支持**：支持中英文双语界面切换。

## 🤖 AI Agents 协作模式

本项目采用 **AI Agents 协作开发** 模式完成。在 `agents/` 目录下，定义了多个具备特定职责的 Agent 角色，通过 [collab-doc.md](file:///c:/Users/Administrator/Documents/trae_projects/hire-or-not/agents/collab-doc.md) 进行协同工作：

- **Planner (规划者)**：负责解析需求，将其拆解为可执行的 Step。
- **Fullstack-Dev (全栈开发)**：负责根据 Step 编写高质量的代码。
- **Reviewer (审查者)**：负责对代码进行逻辑审查和风格把控。
- **Design (设计规范)**：提供统一的设计 Token 和视觉指引。

当前版本仅为 **AI 协作的 MVP 阶段**。我们通过这种方式验证了 Agent 在复杂全栈项目中的协同效率。后续我们将继续优化各 Agent 的提示词精度与自动化流转能力，探索更高效的“无人值守”开发模式。

## 🛠️ 技术栈

- **前端**：Next.js 14 (Pages Router), React 19, Tailwind CSS 4, Zustand, react-hook-form
- **后端**：Next.js API Routes, DeepSeek API (deepseek-reasoner)
- **其他**：next-i18next (i18n), react-markdown, @tailwindcss/typography

## 📦 快速启动

### 1. 克隆并安装依赖

```bash
git clone <your-repo-url>
cd hire-or-not
npm install
```

### 2. 补全必要文件

由于安全原因，部分配置文件和提示词文件未上传至 Git 仓库。请根据以下步骤手动补全：

#### A. 配置环境变量
在项目根目录下新建 `.env.local` 文件，并填入你的 DeepSeek API Key：

```env
# .env.local
DEEPSEEK_API_KEY=你的_DEEPSEEK_API_KEY
```

#### B. 补全提示词目录 (重要)
在项目根目录下创建 `prompt/` 目录，并添加以下三个文件（内容可根据需要自行调整）：

- **`prompt/prompt.md`** (匹配分析系统提示词)：
  ```markdown
  你是一个专业的招聘筛选专家... (此处填入你的人设描述)
  ```
- **`prompt/few-shot.md`** (匹配分析示例)：
  ```markdown
  (此处填入示例输入输出)
  ```
- **`prompt/resume-prompt.md`** (简历生成提示词)：
  ```markdown
  你是一个专业的简历优化专家... (此处填入生成逻辑)
  ```

*注：若不补全上述提示词文件，系统将使用代码中预设的默认提示词（Fallback）。*

### 3. 运行开发服务器

```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可。

## 🛡️ 安全说明

- **环境变量**：API Token 仅在服务端读取，不会泄露至前端。
- **提示词安全**：提示词文件存放在 `prompt/` 目录，由服务端动态读取，有效防止前端解包泄露。

## 📝 许可证

ISC License.
