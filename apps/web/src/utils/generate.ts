import { CanvasObject } from '~/types/canvas';
import { showTemporaryAlert } from './alert';
import { handleAddObject } from './history';
import { parseAsync } from 'valibot';
import { CanvasAIDaraSchema } from '~/schema';
import { HistoryState } from '~/types/history';

export const aIGenerate = async (
  aiInputText: string,
  setShowAIInput: (value: boolean) => void,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  setIsAIGenerating: (value: boolean) => void,
  setObjects: (callback: (prev: CanvasObject[]) => CanvasObject[]) => void,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>,
  currentHistoryIndex: number
) => {
  if (aiInputText.trim() === '') {
    showTemporaryAlert('Please enter a description', setAlert);
    setShowAIInput(false);
    return;
  }

  if (aiInputText.length > 128) {
    showTemporaryAlert('Description is too long', setAlert);
    setShowAIInput(false);
    return;
  }

  try {
    setIsAIGenerating(true);
    const apiUrl = new URL(import.meta.env.VITE_API_URL);
    const response = await fetch(`${apiUrl.href}generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: aiInputText }),
    });

    const data = await response.json();
    if (data) {
      const result = await parseAsync(CanvasAIDaraSchema, data);
      // Add each generated object
      result.forEach((object) => {
        handleAddObject(
          object,
          setObjects,
          setHistory,
          setCurrentHistoryIndex,
          currentHistoryIndex
        );
      });
      showTemporaryAlert('AI generated content added', setAlert);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    showTemporaryAlert('Error generating content', setAlert);
  } finally {
    setIsAIGenerating(false);
    setShowAIInput(false);
  }
};
