'use client';

const shapeData = [
  { type: 'sq', size: 54, top: 10, left: 4, dur: 18, delay: 0 },
  { type: 'sq', size: 28, top: 8, left: 8, dur: 14, delay: 2.5 },
  { type: 'dot', size: 12, top: 30, left: 3, dur: 16, delay: 1 },
  { type: 'sq', size: 38, top: 54, left: 4, dur: 20, delay: 3 },
  { type: 'sq', size: 46, top: 74, left: 6, dur: 17, delay: 0.5 },
  { type: 'dot', size: 8, top: 84, left: 5, dur: 15, delay: 2.5 },
  { type: 'sq', size: 32, top: 28, left: 93, dur: 19, delay: 1.5 },
  { type: 'sq', size: 16, top: 14, left: 96, dur: 13, delay: 0.25 },
  { type: 'dot', size: 10, top: 50, left: 95, dur: 18, delay: 3 },
  { type: 'sq', size: 42, top: 66, left: 92, dur: 16, delay: 1.5 },
  { type: 'sq', size: 22, top: 80, left: 96, dur: 15, delay: 4 },
  { type: 'sq', size: 34, top: 90, left: 8, dur: 21, delay: 2 },
];

export default function QSentiaMotionBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(141,130,255,0.10),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(125,227,255,0.08),transparent_28%),linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[length:auto,auto,36px_36px,36px_36px] opacity-90" />
      <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#8d82ff]/12 blur-3xl" />
      <div className="absolute right-[-8%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[#7de3ff]/10 blur-3xl" />
      {shapeData.map((shape, idx) => (
        <div
          key={`shape-${idx}`}
          className={`absolute ${shape.type === 'dot' ? 'rounded-full bg-white/20' : 'rounded-[6px] border border-white/12 bg-white/4'}`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            animation: `floatDrift ${shape.dur}s linear infinite`,
            animationDelay: `-${shape.delay}s`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
