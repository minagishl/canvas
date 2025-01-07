export const showTemporaryAlert = (
  message: string,
  setAlert: React.Dispatch<React.SetStateAction<string>>
) => {
  const duration = 3500;
  setAlert(message);
  setTimeout(() => {
    setAlert('');
  }, duration);
};
