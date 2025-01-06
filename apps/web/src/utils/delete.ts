import { CanvasObject } from '../types/canvas';

export const handleDeleteObject = (
  selectedObjectId: string | null,
  setObjects: (value: React.SetStateAction<CanvasObject[]>) => void,
  setSelectedObjectId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!selectedObjectId) return;

  setObjects((prevObjects) =>
    prevObjects.filter((obj) => obj.id !== selectedObjectId)
  );
  setSelectedObjectId(null);
};

export const handleDeleteParms = (params: URLSearchParams) => {
  // Remove the id parameter from URL without page reload
  params.delete('id');
  const newUrl =
    window.location.pathname +
    (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState({}, '', newUrl);
};
