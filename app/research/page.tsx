"use client";

import React, { useEffect, useRef, useState } from "react";
import { Inter, Cormorant_Garamond } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowRight, Twitter, Linkedin, Activity, Shield, Globe, Zap, BarChart2 } from "lucide-react";
import { motion, useInView } from "framer-motion";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"] });

// --- PARTICLES COMPONENT ---
function CanvasParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number, y: number, radius: number, vx: number, vy: number, alpha: number }[] = [];
    const numParticles = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 160, 61, ${p.alpha})`; // Gold particles
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />;
}

// --- SVG CIRCULAR GAUGE ---
function CircularGauge({ value, label, delay }: { value: number, label: string, delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = isInView ? circumference - (value / 100) * circumference : circumference;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      <div className="relative w-36 h-36 flex items-center justify-center mb-4">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="72" cy="72" r="45" fill="none" stroke="#222" strokeWidth="4" />
          <circle 
            cx="72" cy="72" r="45" 
            fill="none" 
            stroke="url(#goldGradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF" />
              <stop offset="100%" stopColor="#C9A03D" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-3xl font-bold tracking-tighter text-white">
          <Counter from={0} to={value} isActive={isInView} />
        </div>
      </div>
      <div className="text-[13px] tracking-[1.5px] font-semibold text-[#888] uppercase">{label}</div>
    </motion.div>
  );
}

// --- NUMBER COUNTER ---
function Counter({ from, to, isActive }: { from: number, to: number, isActive: boolean }) {
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    if (!isActive) return;
    let start = from;
    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (to - start) * easeOutQuart));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [from, to, isActive]);
  
  return <>{count}</>;
}

// --- PENDING CARD ---
function PendingCard({ label }: { label: string }) {
  return (
    <div className="relative overflow-hidden group bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-500 hover:border-[#C9A03D]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
      <div className="text-[13px] tracking-[1.5px] uppercase text-[#888] font-semibold mb-4">{label}</div>
      <div className="text-2xl text-[#666] font-light tracking-tight mb-4">Pending</div>
      <div className="text-[11px] uppercase tracking-[1.5px] text-[#C9A03D]/70 font-semibold flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A03D] animate-pulse"></span>
        Live Q3 2026
      </div>
    </div>
  );
}

// --- MAIN PORTAL ---
export default function LuxuryResearchPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });

    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Scroll listener for nav
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);

    // GSAP Animations
    gsap.fromTo(".hero-headline", 
      { opacity: 0, scale: 0.98, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.2 }
    );

    gsap.utils.toArray(".fade-up-element").forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { 
          ScrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
          opacity: 1, y: 0, duration: 1, ease: "power3.out"
        }
      );
    });

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={`bg-[#050505] text-white min-h-screen ${inter.className} selection:bg-[#C9A03D]/30`}>
      
      {/* NOISE OVERLAY */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.02] mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"}} />

      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-12 transition-all duration-500 border-b border-white/5 backdrop-blur-[20px] ${scrolled ? 'h-[60px] bg-[#050505]/95' : 'h-[100px] bg-transparent border-transparent'}`}>
        <div className={`font-[800] tracking-[-0.03em] text-white transition-all duration-700 ease-out origin-left ${scrolled ? 'text-[28px] opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-[-20px] pointer-events-none'}`}>
          QSENTIA
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {["Strategy", "Framework", "Performance", "Methodology"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[13px] tracking-[1.5px] uppercase font-semibold text-[#888] hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A03D] opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        <button className="px-6 py-2 rounded-none border border-white text-[13px] tracking-[1.5px] uppercase font-semibold hover:bg-white hover:text-black transition-colors duration-300">
          Sign In
        </button>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <CanvasParticles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,rgba(5,5,5,1)_70%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-5xl">
          {/* Central Logo Before Scroll */}
          <div className={`font-[800] tracking-[-0.03em] transition-all duration-700 ease-in-out ${scrolled ? 'opacity-0 scale-90 -translate-y-20' : 'opacity-100 scale-100 mb-16 text-[56px] text-white hero-headline'}`}>
            <span className="relative">
              QSENTIA
              <span className="absolute inset-0 blur-[30px] bg-[#C9A03D] opacity-10" />
            </span>
          </div>

          <div className="w-[80px] h-[1px] bg-gradient-to-r from-transparent via-[#C9A03D]/60 to-transparent mb-12 hero-headline origin-center scale-x-0 animate-[scaleX_1s_ease-out_forwards_0.5s]" />

          <h1 className="text-[clamp(72px,8vw,120px)] font-[800] tracking-[-0.02em] leading-[0.9] text-white mb-8">
            <div className="hero-headline opacity-0">More Alpha.</div>
            <div className="hero-headline opacity-0 text-[#E5E5E5]">Less Risk.</div>
          </h1>

          <p className={`${cormorant.className} text-[22px] text-[#C0C0C0] max-w-2xl font-[400] leading-[1.6] mb-16 hero-headline opacity-0`}>
            Qsentia combines advanced BR-PPO reinforcement learning with real-time market intelligence to deliver institutional-grade quantitative alpha to every investor.
          </p>

          <div className="flex gap-6 hero-headline opacity-0">
            <button className="px-10 py-5 bg-[#0A0A0A] border border-[#222] text-white font-[600] tracking-[1.5px] uppercase text-[13px] hover:border-[#C9A03D] hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Explore Platform
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS & SIGNALS */}
      <section id="methodology" className="py-40 px-6 max-w-7xl mx-auto border-t border-[#1A1A1A]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center mb-40 fade-up-element opacity-0">
          <div>
            <div className="text-[64px] font-[800] text-white tracking-tighter mb-2">5+</div>
            <div className="text-[13px] uppercase tracking-[1.5px] text-[#888] font-[600]">Alpha Families</div>
          </div>
          <div>
            <div className="text-[64px] font-[800] text-white tracking-tighter mb-2">40+</div>
            <div className="text-[13px] uppercase tracking-[1.5px] text-[#888] font-[600]">Live Markets</div>
          </div>
          <div>
            <div className="text-[64px] font-[800] text-white tracking-tighter mb-2">12M</div>
            <div className="text-[13px] uppercase tracking-[1.5px] text-[#888] font-[600]">Data Points/Sec</div>
          </div>
        </div>

        <div className="text-center mb-24 fade-up-element opacity-0">
          <h2 className="text-[48px] font-[700] tracking-[-0.02em] text-white mb-6">Signal Intelligence</h2>
          <p className={`${cormorant.className} text-[20px] text-[#C0C0C0] max-w-2xl mx-auto`}>Real-time heuristic evaluation across quantitative regimes.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-16 fade-up-element opacity-0">
          <CircularGauge value={82} label="Momentum" delay={0} />
          <CircularGauge value={67} label="Mean Reversion" delay={0.1} />
          <CircularGauge value={74} label="Sentiment NLP" delay={0.2} />
          <CircularGauge value={55} label="Macro" delay={0.3} />
          <CircularGauge value={91} label="Alt Data" delay={0.4} />
        </div>
      </section>

      {/* 3. PREMIUM GRID CARDS */}
      <section id="framework" className="py-40 px-6 bg-[#0A0A0A] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 fade-up-element opacity-0">
            <h2 className="text-[48px] font-[700] tracking-[-0.02em] text-white mb-6">Investment Framework</h2>
            <div className="w-[60px] h-[1px] bg-[#C9A03D]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#050505] border border-white/5 rounded-[20px] p-12 hover:-translate-y-1 hover:border-[#C9A03D]/30 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] fade-up-element opacity-0 group">
              <Activity className="w-8 h-8 text-[#C9A03D] mb-8" />
              <div className="text-[13px] tracking-[1.5px] uppercase font-semibold text-[#888] mb-4">01</div>
              <h3 className="text-[28px] font-[700] text-white mb-4">Adaptive Allocation</h3>
              <p className="text-[18px] text-[#C0C0C0] leading-[1.6]">BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior.</p>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-[20px] p-12 hover:-translate-y-1 hover:border-[#C9A03D]/30 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] fade-up-element opacity-0 group">
              <BarChart2 className="w-8 h-8 text-[#C9A03D] mb-8" />
              <div className="text-[13px] tracking-[1.5px] uppercase font-semibold text-[#888] mb-4">02</div>
              <h3 className="text-[28px] font-[700] text-white mb-4">Benchmark Discipline</h3>
              <p className="text-[18px] text-[#C0C0C0] leading-[1.6]">Every model is evaluated against transparent market benchmarks and normalized performance curves.</p>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-[20px] p-12 hover:-translate-y-1 hover:border-[#C9A03D]/30 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] fade-up-element opacity-0 group">
              <Shield className="w-8 h-8 text-[#C9A03D] mb-8" />
              <div className="text-[13px] tracking-[1.5px] uppercase font-semibold text-[#888] mb-4">03</div>
              <h3 className="text-[28px] font-[700] text-white mb-4">Risk First</h3>
              <p className="text-[18px] text-[#C0C0C0] leading-[1.6]">Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions.</p>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-[20px] p-12 hover:-translate-y-1 hover:border-[#C9A03D]/30 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] fade-up-element opacity-0 group">
              <Globe className="w-8 h-8 text-[#C9A03D] mb-8" />
              <div className="text-[13px] tracking-[1.5px] uppercase font-semibold text-[#888] mb-4">04</div>
              <h3 className="text-[28px] font-[700] text-white mb-4">Execution Transparency</h3>
              <p className="text-[18px] text-[#C0C0C0] leading-[1.6]">Orders, positions, target weights, and decisions are logged and visible from the same source of truth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE / TRACK RECORD */}
      <section id="performance" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="mb-24 fade-up-element opacity-0">
          <h2 className="text-[48px] font-[700] tracking-[-0.02em] text-white mb-6">Track Record</h2>
          <div className="w-[60px] h-[1px] bg-[#C9A03D]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 fade-up-element opacity-0">
          <PendingCard label="Annualised Alpha" />
          <PendingCard label="Sharpe Ratio" />
          <PendingCard label="Signal Accuracy" />
          <PendingCard label="Max Drawdown" />
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#050505] border-t border-[#1A1A1A] pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24">
            <h2 className="text-[64px] md:text-[96px] font-[800] tracking-[-0.03em] text-white leading-[0.9] mb-12 md:mb-0">
              Transform<br />Your Strategy.
            </h2>
            <button className="px-12 py-6 bg-white text-black font-[700] tracking-[1.5px] uppercase text-[13px] hover:bg-[#E5E5E5] hover:scale-[0.98] transition-all duration-300">
              Request Access
            </button>
          </div>

          <div className="h-[1px] w-full bg-[#1A1A1A] mb-12" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[32px] font-[800] tracking-[-0.03em] text-white">QSENTIA</div>
            <div className="text-[12px] text-[#666] tracking-widest uppercase">© 2026 Qsentia AI. All rights reserved.</div>
            <div className="flex items-center gap-6 text-[#888]">
              <Twitter className="w-5 h-5 hover:text-[#C9A03D] cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-[#C9A03D] cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetCreate={`
        @keyframes scaleX { to { transform: scaleX(1); } }
      `}></style>

    </div>
  );
}
