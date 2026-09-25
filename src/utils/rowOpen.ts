import type React from 'react';

// Makes a whole table row / card open the case detail when clicked anywhere,
// while buttons, links and form controls inside it keep their own behaviour.
export const rowOpenProps = (open: () => void) => ({
  className: 'clickable-row',
  tabIndex: 0,
  onClick: (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, label')) return;
    if (window.getSelection()?.toString()) return; // user is selecting text to copy
    open();
  },
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      open();
    }
  }
});
