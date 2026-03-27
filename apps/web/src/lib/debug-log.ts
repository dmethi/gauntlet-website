export const debugLog = (...args: unknown[]): void => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  console.warn(...args);
};
