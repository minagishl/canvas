export const showTemporaryAlert = (
  message: string,
  setAlert: React.Dispatch<React.SetStateAction<string>>
): void => {
  const duration = 3500;
  setAlert(message);
  setTimeout(() => {
    setAlert('');
  }, duration);
};

export const hiddenAlert = (
  setAlert: React.Dispatch<React.SetStateAction<string>>
): void => {
  setAlert('');
};
