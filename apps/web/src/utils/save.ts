import type { CanvasObject } from '../types/canvas';

interface SaveResponse {
  id: string;
  message: string;
}

interface SaveResult {
  id?: string;
  error?: string;
}

export const save = async (objects: CanvasObject[]): Promise<SaveResult> => {
  try {
    // Get turnstile token
    let token = window.turnstileToken;
    if (!token) {
      token = await window.turnstile.execute();
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodies: objects,
        token,
      }),
    });

    if (!res.ok) {
      const error = (await res.json()) as { error: string };
      if (error.error === 'turnstile token is required') {
        window.turnstileToken = undefined;
        return {
          error:
            'Human verification failed. Please try again in a few seconds.',
        };
      }
      return { error: error.error || 'An error occurred while saving' };
    }

    const data = (await res.json()) as SaveResponse;
    return { id: data.id };
  } catch (e) {
    console.error(e);
    return {
      error: e instanceof Error ? e.message : 'An unexpected error occurred',
    };
  }
};
