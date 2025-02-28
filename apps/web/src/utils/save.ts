import type { CanvasObject } from '../types/canvas';

interface SaveResponse {
  id: string;
  message: string;
}

export const save = async (
  objects: CanvasObject[]
): Promise<{ id: string } | undefined> => {
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
      }),
    });

    if (!res.ok) {
      const error = (await res.json()) as { error: string };
      throw new Error(error.error);
    }

    const data = (await res.json()) as SaveResponse;
    return { id: data.id };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
