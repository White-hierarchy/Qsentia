"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { ArrowRight, Activity, Shield, Zap, Globe } from "lucide-react";

// ----------------------------------------------------------------------
// 3D BACKGROUND (Particle Orb)
// ----------------------------------------------------------------------
function HeroOrb() {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.5}>
      <MeshDistortMaterial
        color="#7000FF"
        envMapIntensity={1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0.1}
        roughness={0.4}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  );
}

function Scene() {
  return (
    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#4A00FF" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#00E5FF" />
        <HeroOrb />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
export default function ResearchLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
    });

    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Staggered reveals for bento
    gsap.utils.toArray(".bento-card").forEach((card: any) => {
      gsap.fromTo(card, 
        { opacity: 0, y: 50 },
        { 
          ScrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power3.out"
        }
      );
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-[#050505] text-white min-h-screen font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Noise Texture */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-8 py-6 w-full flex items-center justify-between mix-blend-difference backdrop-blur-md border-b border-white/[0.05]">
        <div className="text-xl font-bold tracking-tighter uppercase whitespace-nowrap">QSENTIA<span className="text-zinc-500">.AI</span></div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#vision" className="hover:text-white transition-colors duration-300">Vision</a>
          <a href="#platform" className="hover:text-white transition-colors duration-300">Platform</a>
          <a href="#intelligence" className="hover:text-white transition-colors duration-300">Intelligence</a>
        </div>
        <button onClick={() => { window.location.href = '/dashboard' }} className="group relative px-5 py-2 overflow-hidden rounded-full bg-white text-black text-sm font-semibold tracking-wide hover:scale-105 transition-transform duration-300">
          <span className="relative z-10 flex items-center gap-2">
            Access System <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100vh] flex items-center justify-center pt-24 px-6 md:px-12 w-full">
        <Scene />
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse block"></span>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-300">Qsentia Intelligence Engine v2.0</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-bold tracking-tighter leading-[0.9] mb-8"
          >
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
              Quantitative AI.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light mb-12"
          >
            Institution-grade infrastructure powering the next generation of algorithmic strategies. 
            Built for precision. Designed for scale.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row items-center gap-4"
          >
            <button onClick={() => { window.location.href = '#platform' }} className="px-8 py-4 w-full md:w-auto rounded-full bg-white text-black font-semibold text-lg hover:bg-zinc-200 transition-colors">
              Explore Research
            </button>
            <button className="px-8 py-4 w-full md:w-auto rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-colors">
              View Documentation
            </button>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent block hidden md:block"
        />
      </section>

      {/* 2. TRUST/MARQUEE SECTION */}
      <section className="py-20 border-y border-white/[0.05] overflow-hidden bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 w-full hidden md:block"></div>
        <div className="flex gap-16 whitespace-nowrap opacity-50 font-bold uppercase tracking-widest text-2xl md:text-4xl text-zinc-700">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-16"
          >
            <span>Qsentia Core</span>
            <span>Neural Network</span>
            <span>Alpha Generation</span>
            <span>Predictive Modeling</span>
            <span>Deep Learning</span>
            <span>Qsentia Core</span>
            <span>Neural Network</span>
            <span>Alpha Generation</span>
            <span>Predictive Modeling</span>
            <span>Deep Learning</span>
          </motion.div>
        </div>
      </section>

      {/* 3. BENTO GRID / FEATURES SECTION */}
      <section id="platform" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Unprecedented Scale.<br/><span className="text-zinc-500">Uncompromised Power.</span></h2>
          <p className="text-zinc-400 text-lg max-w-xl font-light">
            We abstract away the complexity of high-frequency infrastructure so you can focus strictly on signal generation and model refinement.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[700px]">
          {/* Card 1 */}
          <div className="bento-card group relative col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 overflow-hidden hover:border-white/20 transition-all duration-500 min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <Activity className="w-8 h-8 text-blue-400 mb-4" />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Real-time Analytics</h3>
                <p className="text-zinc-400 font-light text-lg">Sub-millisecond data pipelines processing petabytes of market indicators globally.</p>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bento-card group relative col-span-1 row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 overflow-hidden hover:border-white/20 transition-all duration-500 min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Globe className="w-8 h-8 text-purple-400 mb-4" />
            <div className="mt-auto pt-24">
              <h3 className="text-2xl font-semibold mb-2">Global Routing</h3>
              <p className="text-zinc-400 font-light text-sm">Direct connections to 40+ exchanges worldwide.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bento-card group relative col-span-1 row-span-1 border border-white/10 rounded-3xl bg-zinc-900/50 p-8 overflow-hidden hover:border-white/20 transition-all duration-500 min-h-[300px]">
            <Shield className="w-8 h-8 text-emerald-400 mb-4" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="mt-auto pt-24 z-10 relative">
              <h3 className="text-2xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-zinc-400 font-light text-sm">Multi-layer encryption and rigorous execution risk limits.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bento-card group relative col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-zinc-900/50 border border-white/10 p-8 overflow-hidden hover:border-white/20 transition-all duration-500 min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <div>
                <h3 className="text-2xl font-semibold mb-2">Neural Execution</h3>
                <p className="text-zinc-400 font-light text-lg">Our proprietary execution algorithms use reinforced learning to predict optimal routing and minimize slippage across volatile landscapes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCROLL STORYTELLING / EXPERIENCE */}
      <section className="relative py-32 bg-black min-h-[120vh]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 sticky top-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Intelligence applied.<br/>At every layer.</h2>
              
              <div className="space-y-16 mt-20">
                <div className="opacity-100 transition-opacity duration-500">
                  <h4 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">1</span> 
                    Data Ingestion
                  </h4>
                  <p className="text-zinc-400 font-light text-lg">Continuous streams of structured and unstructured datasets are normalized, cleaned, and piped directly into model environments.</p>
                </div>
                
                <div className="opacity-50 hover:opacity-100 transition-opacity duration-500">
                  <h4 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">2</span> 
                    Signal Generation
                  </h4>
                  <p className="text-zinc-400 font-light text-lg">Sophisticated architectures discover alpha through vast noise, identifying subtle, non-linear market patterns invisible to traditional models.</p>
                </div>
                
                <div className="opacity-50 hover:opacity-100 transition-opacity duration-500">
                  <h4 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">3</span> 
                    Portfolio Construction
                  </h4>
                  <p className="text-zinc-400 font-light text-lg">Dynamic risk allocation algorithms construct resilient portfolios built to weather exogenous shocks while maximizing Sharpe.</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full aspect-square rounded-[3rem] border border-white/10 bg-zinc-900/30 overflow-hidden relative shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                {/* Simulated Complex Tech Graphic */}
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50 animate-[spin_20s_linear_infinite]">
                  <circle cx="100" cy="100" r="99" stroke="white" strokeWidth="0.5" strokeDasharray="4 4"/>
                  <circle cx="100" cy="100" r="75" stroke="#3B82F6" strokeWidth="1"/>
                  <circle cx="100" cy="100" r="50" stroke="white" strokeWidth="0.5" strokeDasharray="2 6"/>
                  <path d="M100 0L100 200M0 100L200 100" stroke="white" strokeWidth="0.5" strokeOpacity="0.3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS SECTION */}
      <section className="py-40 px-6 md:px-12 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">.2B+</h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Volume Routed Daily</p>
          </div>
          <div className="w-[1px] h-20 bg-white/10 hidden md:block"></div>
          <div className="flex-1 text-center">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">{"<"}12ms</h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Average Latency</p>
          </div>
          <div className="w-[1px] h-20 bg-white/10 hidden md:block"></div>
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">99.99%</h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm font-semibold">Uptime Reliability</p>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="relative py-40 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 z-0"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8">Ready to Scale?</h2>
          <p className="text-zinc-400 text-xl font-light mb-12 max-w-2xl mx-auto">
            Join the ecosystem of elite researchers and quantitative institutions leveraging Qsentia to drive alpha.
          </p>
          <button className="px-10 py-5 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Partner With Us
          </button>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/[0.05] bg-black py-12 px-6 md:px-12 text-sm font-medium text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <span className="text-white font-bold tracking-tighter">QSENTIA.AI</span> 
             <span>© 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
