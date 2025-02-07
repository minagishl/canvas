const userAgent = navigator.userAgent || navigator.vendor;
const isMobile =
  /iPhone|iPad|iPod/.test(userAgent) ||
  /android/i.test(userAgent) ||
  /webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

export { isMobile };
