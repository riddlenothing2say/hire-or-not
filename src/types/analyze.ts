export interface AnalyzeResponse {
  summary: string;
  problems: string[];
  rewrite: string;
}

export interface FeedbackData {
  applied?: boolean;
  interviewStatus?: 'none' | 'got' | 'failed';
}
