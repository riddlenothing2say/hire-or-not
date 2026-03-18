import { AnalyzeResponse } from '@/types/analyze';

export async function analyze(experience: string, jd: string): Promise<AnalyzeResponse> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ experience, jd }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}
