import type { NextApiRequest, NextApiResponse } from 'next';
import { AnalyzeResponse } from '@/types/analyze';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { experience, jd } = req.body;

  if (!experience || !jd) {
    return res.status(400).json({ error: 'Missing experience or jd' });
  }

  // Read prompts from filesystem
  let systemPrompt = '';
  let fewShot = '';
  try {
    const promptDir = path.join(process.cwd(), 'prompt');
    systemPrompt = fs.readFileSync(path.join(promptDir, 'prompt.md'), 'utf-8');
    fewShot = fs.readFileSync(path.join(promptDir, 'few-shot.md'), 'utf-8');
  } catch (error) {
    console.error('Failed to read prompts:', error);
    // Fallback if files don't exist
    systemPrompt = '你是一个专业的招聘筛选专家。';
  }

  // Check for DEEPSEEK_API_KEY to switch between real AI and mock
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `【示例参考】：\n${fewShot}\n\n【当前任务】：\nJD：\n${jd}\n\n简历：\n${experience}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResult = JSON.parse(data.choices[0].message.content);
      return res.status(200).json(aiResult);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return res.status(500).json({ error: 'AI analysis failed, falling back to mock' });
    }
  }

  return res.status(200).json(getMockData());
}

function getMockData(): AnalyzeResponse {
  return {
    summary: "背景资深但AI能力表达模糊，存在明显不过筛风险（偏平台/测试方向）",
    problems: [
      "AI经验表述泛化，仅提“平台”和“测评”，未说明具体做了什么（如Prompt、RAG等），无法判断真实能力",
      "角色更偏质量/平台建设，而非AI应用开发，容易被归类为测试方向直接筛掉",
      "缺少技术实现细节，项目只描述结果，没有说明具体方案或实现路径",
      "AI项目缺少业务闭环，未说明如何使用模型解决实际问题",
      "技术栈以Java为主，与AI岗位常见Python生态存在偏差"
    ],
    rewrite: "主导AI工程平台建设，负责模型评测与应用落地..."
  };
}
