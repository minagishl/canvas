import { CanvasObject } from '~/types/canvas';
import { showTemporaryAlert } from './alert';
import { handleAddObject } from './history';
import { parseAsync } from 'valibot';
import { CanvasAIDaraSchema } from '~/schema';
import { HistoryState } from '~/types/history';

export const aIGenerate = async (
  aiInputText: string,
  setShowAIInput: React.Dispatch<React.SetStateAction<boolean>>,
  setAlert: React.Dispatch<React.SetStateAction<string>>,
  setIsAIGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>,
  setHistory: React.Dispatch<React.SetStateAction<HistoryState[]>>,
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>
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
        const objectWithNewId = { ...object, id: generateRandomId() };
        handleAddObject(
          objectWithNewId,
          setObjects,
          setHistory,
          setCurrentHistoryIndex
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

export const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
