import { create } from 'zustand';
import { AnalyzeResponse, FeedbackData } from '@/types/analyze';

interface AnalyzeState {
  result: AnalyzeResponse | null;
  unlocked: boolean;
  feedback: FeedbackData | null;
  isAnalyzing: boolean;
  setResult: (result: AnalyzeResponse | null) => void;
  setUnlocked: (unlocked: boolean) => void;
  setFeedback: (feedback: FeedbackData | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

export const useAnalyzeStore = create<AnalyzeState>((set) => ({
  result: null,
  unlocked: false,
  feedback: null,
  isAnalyzing: false,
  setResult: (result) => set({ result }),
  setUnlocked: (unlocked) => set({ unlocked }),
  setFeedback: (feedback) => set({ feedback }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));
