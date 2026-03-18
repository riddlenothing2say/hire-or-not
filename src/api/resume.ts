import { ResumeResponse, ResumeRequest } from '@/types/resume';

export async function generateResume(data: ResumeRequest): Promise<ResumeResponse> {
  const response = await fetch('/api/resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Resume generation failed');
  }

  return response.json();
}
