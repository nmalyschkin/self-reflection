export const getSubmitShortcut = () => {
  if (navigator.userAgent.includes('Mac')) {
    return '⌘+↵';
  }
  return 'Ctrl+↵';
};
