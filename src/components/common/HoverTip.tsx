import React, { useEffect, useRef, useState } from 'react';

type TipPos = { left: number; top: number; above: boolean; width: number };

// Floating card pinned to the viewport (position: fixed) so table scroll containers cannot clip it
const useFloatingTip = () => {
  const [tip, setTip] = useState<TipPos | null>(null);

  // The card is pinned to the viewport, so hide it as soon as anything scrolls
  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [tip]);

  const showFor = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const width = Math.min(Math.max(r.width, 300), 420, window.innerWidth - 24);
    const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
    const above = r.bottom + 180 > window.innerHeight;
    setTip({ left, top: above ? r.top - 6 : r.bottom + 6, above, width });
  };

  const card = (content: React.ReactNode) =>
    tip && (
      <div
        className="full-text-tip"
        role="tooltip"
        style={{
          left: tip.left,
          top: tip.top,
          width: tip.width,
          transform: tip.above ? 'translateY(-100%)' : undefined
        }}
      >
        {content}
      </div>
    );

  return { showFor, hide: () => setTip(null), card };
};

// Shows `content` in a floating card while the pointer is over `children`
export const HoverTip: React.FC<{ content: React.ReactNode; children: React.ReactNode }> = ({ content, children }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const { showFor, hide, card } = useFloatingTip();
  return (
    <>
      <span
        ref={ref}
        onMouseEnter={() => ref.current && showFor(ref.current)}
        onMouseLeave={hide}
        style={{ display: 'inline-flex', maxWidth: '100%' }}
      >
        {children}
      </span>
      {card(content)}
    </>
  );
};
