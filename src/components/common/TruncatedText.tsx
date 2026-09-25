import React, { useEffect, useRef, useState } from 'react';

interface TruncatedTextProps {
  text: string;
  lines?: number;
  style?: React.CSSProperties;
}

// Clamps text to a few lines; hovering shows the full text in a floating card.
// The card is position: fixed so table scroll containers cannot clip it.
export const TruncatedText: React.FC<TruncatedTextProps> = ({ text, lines = 2, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ left: number; top: number; above: boolean; width: number } | null>(null);

  // The card is pinned to the viewport, so hide it as soon as anything scrolls
  useEffect(() => {
    if (!tip) return;
    const hide = () => setTip(null);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [tip]);

  const show = () => {
    const el = ref.current;
    if (!el || el.scrollHeight <= el.clientHeight + 1) return; // not truncated: nothing more to show
    const r = el.getBoundingClientRect();
    const width = Math.min(Math.max(r.width, 300), 420, window.innerWidth - 24);
    const left = Math.min(Math.max(12, r.left), window.innerWidth - width - 12);
    const above = r.bottom + 180 > window.innerHeight;
    setTip({ left, top: above ? r.top - 6 : r.bottom + 6, above, width });
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setTip(null)}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          ...style
        }}
      >
        {text}
      </div>
      {tip && (
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
          {text}
        </div>
      )}
    </>
  );
};
