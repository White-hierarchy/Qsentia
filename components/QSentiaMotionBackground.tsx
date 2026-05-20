'use client';

const shapeData = [
  { type: 'sq', size: 48, top: 12, left: 4, dur: 9, delay: 0 },
  { type: 'sq', size: 28, top: 8, left: 6, dur: 11, delay: 2 },
  { type: 'dot', size: 10, top: 30, left: 2, dur: 8, delay: 1 },
  { type: 'sq', size: 36, top: 52, left: 3, dur: 12, delay: 3 },
  { type: 'sq', size: 42, top: 72, left: 5, dur: 10, delay: 0.5 },
  { type: 'dot', size: 8, top: 82, left: 3, dur: 7, delay: 2.5 },
  { type: 'sq', size: 30, top: 30, left: 94, dur: 13, delay: 1 },
  { type: 'sq', size: 14, top: 15, left: 97, dur: 9, delay: 0 },
  { type: 'dot', size: 10, top: 50, left: 96, dur: 11, delay: 3 },
  { type: 'sq', size: 40, top: 65, left: 93, dur: 8, delay: 1.5 },
  { type: 'sq', size: 20, top: 80, left: 96, dur: 10, delay: 4 },
  { type: 'sq', size: 32, top: 88, left: 8, dur: 14, delay: 2 },
];

export default function QSentiaMotionBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[length:48px_48px] opacity-60" />
      {shapeData.map((shape, idx) => (
        <div
          key={`shape-${idx}`}
          className={`absolute ${shape.type === 'dot' ? 'rounded-full bg-[#c7c3f8]/40' : 'rounded-[3px] border border-[#8c88d6]/35'} animate-[floatDrift_linear_infinite]`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            animationDuration: `${shape.dur}s`,
            animationDelay: `-${shape.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
