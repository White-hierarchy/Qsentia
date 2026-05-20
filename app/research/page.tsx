'use client';

import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import Link from 'next/link';

export default function ResearchPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-20 flex items-center justify-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center border-4 border-[#4b3fd1] bg-white/60 text-5xl font-black shadow-[0_24px_90px_rgba(75,63,209,0.14)] backdrop-blur-xl">
            Q
          </div>
          <div className="tracking-[0.75em] text-6xl font-black max-md:text-4xl">
            SENTIA
          </div>
        </div>

        <div className="relative mb-10 max-w-6xl">
          <div className="absolute -left-10 top-8 h-5 w-5 rotate-45 border-2 border-[#4b3fd1]/70" />
          <div className="absolute -right-8 bottom-10 h-4 w-4 rotate-45 border-2 border-black/40" />
          <div className="absolute left-1/2 top-[-34px] h-[2px] w-72 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#4b3fd1]/45 to-transparent" />
          <div className="absolute bottom-[-30px] left-1/2 h-[2px] w-96 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/30 to-transparent" />

          <h1 className="relative text-[clamp(72px,10vw,156px)] font-light leading-[0.84] tracking-[-0.105em] text-black">
            More Alpha
            <br />
            Less Risk
          </h1>

          <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-40 w-[78%] -translate-y-1/2 rounded-full bg-[#4b3fd1]/10 blur-3xl" />
        </div>

        <p className="mb-14 max-w-3xl text-xl leading-8 text-neutral-600">
          Where intelligent reinforcement learning meets market perception.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-[#4b3fd1] px-14 py-5 text-lg font-medium text-white shadow-[0_24px_80px_rgba(75,63,209,0.25)] transition hover:bg-[#372db8]"
          >
            View Live Research Terminal
          </Link>

          <a
            href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request"
            className="border border-black/20 bg-white/70 px-14 py-5 text-lg font-medium text-black shadow-[0_18px_70px_rgba(25,20,90,0.08)] backdrop-blur-xl transition hover:border-[#4b3fd1] hover:text-[#4b3fd1]"
          >
            Request Information
          </a>
        </div>

        <div className="absolute bottom-8 text-4xl font-light text-neutral-500">⌄</div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 px-6 pb-24 md:grid-cols-4">
        <ThesisCard
          number="01"
          title="Adaptive Allocation"
          text="BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior."
        />
        <ThesisCard
          number="02"
          title="Benchmark Discipline"
          text="Every model is evaluated against transparent market benchmarks and normalized performance curves."
        />
        <ThesisCard
          number="03"
          title="Risk First"
          text="Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions."
        />
        <ThesisCard
          number="04"
          title="Execution Transparency"
          text="Orders, positions, target weights, and decisions are logged and visible from the same source of truth."
        />
      </section>
    </main>
  );
}

function ThesisCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-white/78 p-6 shadow-[0_26px_100px_rgba(25,20,90,0.10)] backdrop-blur-2xl">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#4b3fd1]/8 blur-2xl" />
      <div className="relative mb-10 text-xs font-black tracking-[0.24em] text-[#4b3fd1]">
        {number}
      </div>
      <h3 className="relative mb-4 text-3xl font-light tracking-[-0.065em] text-black">
        {title}
      </h3>
      <p className="relative text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}