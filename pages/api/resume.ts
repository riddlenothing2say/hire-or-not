import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ content: string } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { targetPosition, experience } = req.body;

  if (!targetPosition || !experience) {
    return res.status(400).json({ error: 'Missing targetPosition or experience' });
  }

  // Read prompt from filesystem
  let resumePrompt = '';
  try {
    const promptPath = path.join(process.cwd(), 'prompt', 'resume-prompt.md');
    resumePrompt = fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Failed to read resume prompt:', error);
    resumePrompt = '你是一个专业的简历优化专家。';
  }

  // Check for DEEPSEEK_API_KEY
  if (process.env.DEEPSEEK_API_KEY) {
    console.log('[Resume API] Starting AI resume generation...');
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
              content: resumePrompt,
            },
            {
              role: 'user',
              content: `意向岗位：${targetPosition}\n\n核心经历：\n${experience}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Resume API] DeepSeek API error! Status: ${response.status}, Body: ${errorText}`);
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Resume API] AI response received successfully.');
      const aiContent = data.choices[0].message.content;
      return res.status(200).json({ content: aiContent });
    } catch (error) {
      console.error('[Resume API] AI resume generation failed:', error);
      return res.status(500).json({ error: 'AI generation failed, falling back to mock' });
    }
  }

  return res.status(200).json({
    content: getMockResume(targetPosition, experience),
  });
}

function getMockResume(position: string, experience: string): string {
  return `
# 个人简历 - ${position}

## 核心优势
- 具备扎实的专业背景，深度契合 ${position} 岗位需求。
- 拥有丰富的项目实战经验，能够独立解决复杂技术难题。

## 工作/项目经历
${experience}

## 技能清单
- 精通核心开发语言及相关框架。
- 具备良好的团队协作能力和问题分析能力。
- 持续关注行业前沿动态，具备快速学习能力。

---
*由 Hire or Not AI 助手生成*
  `.trim();
}
