import { useCallback } from 'react';
import { posterData } from './posterData';

export function usePosterPrompt(params: any) {
  const generatePrompt = useCallback(() => {
    const prompt = 'PROMPT LOGIC HERE';
    params.onPromptGenerated(prompt);
    return prompt;
  }, [params]);

  return { generatePrompt };
}
