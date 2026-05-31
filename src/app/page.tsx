"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send,
  HelpCircle, ArrowRight, X, ChevronDown, Award, Users,
  Zap, Check, Cpu, BookOpen, Clock, Calendar, Brain, Layers, Loader2
} from "lucide-react";
import { verifyCertificateAction } from "@/lib/actions/certificate-actions";
import { sendContactEmailAction } from "@/lib/actions/email-actions";
import NeuralCanvas from "@/components/neural-canvas";
import CinematicOrb from "@/components/cinematic-orb";

/* ── Animated counter ── */
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0;
      const step = Math.ceil(end / 50);
      const id = setInterval(() => { n = Math.min(n + step, end); setV(n); if (n >= end) clearInterval(id); }, 28);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{v}{suffix}</span>;
}

const MARQUEE_ITEMS = [
  "Artificial Intelligence", "Smart Automation", "IoT Systems",
  "Robotics", "Embedded C", "Arduino", "Deep Learning",
  "RAG Pipelines", "Full-Stack Web", "Computer Vision",
];

const ACTIVE_FELLOWSHIPS = [
  {
    cohort: "Cohort A — Live",
    title: "Advanced AI & Deep Learning Fellowship",
    duration: "6 Months",
    timeline: "Ongoing",
    description: "Deep dive into convolutional architectures, implement custom attention layers, train transformers from scratch, and deploy RAG systems locally.",
    bullets: [
      "PyTorch & Custom Neural Networks",
      "Attention Mechanism & Transformer Architectures",
      "FAISS, LangChain & Hybrid Search RAGs",
      "Production Deployment & Latency Optimization",
      "1-on-1 Direct Industry Mentor Syncs",
      "Verified Corporate Graduation Certificate",
    ]
  },
  {
    cohort: "Cohort B — Live",
    title: "Smart Automation & IoT Systems Fellowship",
    duration: "6 Months",
    timeline: "Ongoing",
    description: "Design and implement industrial-grade automation platforms, wireless sensor networks, telemetry pipelines, and real-time remote monitoring systems.",
    bullets: [
      "ESP32 & Raspberry Pi System Designs",
      "MQTT, Modbus & WebSocket Protocols",
      "Sensors & Actuators Hardware Calibration",
      "Node-RED & Custom Telemetry Dashboards",
      "Real-Time Edge Analytics Pipelines",
      "Verified Corporate Graduation Certificate",
    ]
  },
  {
    cohort: "Cohort C — Live",
    title: "Robotics & Embedded Systems Fellowship",
    duration: "6 Months",
    timeline: "Ongoing",
    description: "Deep dive into microcontroller architectures, register-level configuration, hardware protocols, firmware optimization, and robotic kinetic controls using Embedded C and Arduino.",
    bullets: [
      "Embedded C & C++ Firmware Engineering",
      "AVR/ARM Architectures & Register Access",
      "I2C, SPI & UART Communication Protocols",
      "Motor Kinematics & PID Feedback Loops",
      "Hardware Debugging & Logic Analyzers",
      "Verified Corporate Graduation Certificate",
    ]
  },
  {
    cohort: "Cohort D — Live",
    title: "Full-Stack Web Development & Web AI Fellowship",
    duration: "6 Months",
    timeline: "Ongoing",
    description: "Construct production-grade, highly responsive web systems integrated with agentic AI models, real-time sync databases, and modern cloud deployment pipelines.",
    bullets: [
      "Next.js, React & TailwindCSS Frontends",
      "Node.js Backend & SQLite/Postgres DBs",
      "AI API Integrations (OpenAI, Anthropic, Gemini)",
      "WebSocket Real-Time Sync Engines",
      "Docker Containerization & Vercel/VPS Deploy",
      "Verified Corporate Graduation Certificate",
    ]
  }
];

export default function LandingPage() {
  const [certNumber,  setCertNumber]  = useState("");
  const [verResult,   setVerResult]   = useState<any>(null);
  const [verifying,   setVerifying]   = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [contact,     setContact]     = useState({ name: "", email: "", message: "" });
  const [contactOk,   setContactOk]   = useState(false);
  const [sendingContact, setSendingContact] = useState(false);
  const [contactError,   setContactError]   = useState<string | null>(null);
  const [activeFaq,   setActiveFaq]   = useState<number | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mousePos,    setMousePos]    = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => setMousePos({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll");
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
    }), { threshold: 0.08 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setVerifying(true); setVerResult(null); setModalOpen(true);
    try { setVerResult(await verifyCertificateAction(certNumber)); }
    catch { setVerResult({ success: false, error: "System error. Please try again." }); }
    finally { setVerifying(false); }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) return;

    setSendingContact(true);
    setContactError(null);
    try {
      const res = await sendContactEmailAction(contact.name, contact.email, contact.message);
      if (res.success) {
        setContactOk(true);
        setContact({ name: "", email: "", message: "" });
        setTimeout(() => setContactOk(false), 5000);
      } else {
        setContactError(res.error || "Failed to send message.");
      }
    } catch (err) {
      setContactError("An unexpected error occurred. Please try again.");
    } finally {
      setSendingContact(false);
    }
  };

  const faqs = [
    {
      q: "What is the GAS Virtual Lab?",
      a: "Green Automation Solution (GAS) Virtual Lab is the company's internal R&D and internship portal — where selected members work on real AI, automation, IoT, robotics, and web projects under direct guidance from company engineers.",
    },
    {
      q: "How does the certificate verification work?",
      a: "Every intern who completes their R&D cycle receives a unique certificate number (e.g. GAS-2026-ALEX-0089). Employers and partners can verify this directly on our homepage to confirm the intern's contributions and program track.",
    },
    {
      q: "Who guides the interns?",
      a: "Our core team of engineers, researchers, and developers guide each intern through production-grade project work — not classroom exercises.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900">

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <nav className={`h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-14 transition-all duration-500 ${
        navScrolled ? "glass shadow-lg shadow-black/5 border-b border-white/60" : "bg-transparent"
      }`}>
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="GAS Logo"
            className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300"
          />
          <div className="leading-none">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] hidden sm:block">
              Green Automation Solution
            </div>
            <div className="font-black text-zinc-900 tracking-tight text-base">
              GAS <span className="text-emerald-600">Virtual Lab</span>
            </div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="https://gas-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group">
            Corporate Site
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
          </a>
          {[["#programs", "Programs"], ["#verification", "Verify"], ["#contact", "Contact"]].map(([href, label]) => (
            <Link key={href} href={href} className="relative text-sm font-medium text-zinc-650 hover:text-zinc-955 transition-colors group">
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link href="/login" className="relative px-5 py-2 text-sm font-bold rounded-xl text-white overflow-hidden group shadow-md shadow-emerald-500/20 hover:shadow-lg transition-shadow">
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
            <span className="absolute inset-0 beam-sweep" />
            <span className="relative flex items-center gap-1.5">
              Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{
        background: "radial-gradient(ellipse 80% 65% at 68% 50%, rgba(16,185,129,0.09) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 28% 22%, rgba(139,92,246,0.07) 0%, transparent 55%), #ffffff"
      }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ background: `radial-gradient(ellipse 52% 42% at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.08) 0%, transparent 65%)` }}
        />
        <NeuralCanvas />
        <div className="absolute top-16 -left-16 w-[480px] h-[480px] bg-emerald-300/10 rounded-full blur-[140px] animate-drift-slow pointer-events-none" />
        <div className="absolute bottom-0 right-4 w-[400px] h-[400px] bg-violet-400/07 rounded-full blur-[130px] animate-drift-slower pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 w-full pt-24 pb-16 grid lg:grid-cols-2 gap-10 items-center min-h-screen">

          {/* Left — copy */}
          <div className="flex flex-col items-start space-y-8">

            {/* Company R&D badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 text-emerald-700 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Company R&amp;D Virtual Internship Lab
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-[68px] font-black tracking-tight text-zinc-950 leading-[1.04] animate-fade-in-up">
              The AI &amp;{" "}
              <span className="text-shimmer">Automation Hub.</span>
            </h1>

            {/* Sub-copy — clear company R&D positioning */}
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed max-w-lg animate-fade-in-up [animation-delay:180ms]">
              Green Automation Solution's internal virtual lab — where selected interns build
              production-grade systems across <strong className="text-zinc-700 font-semibold">AI, IoT, Robotics, Embedded C, and Web</strong> under direct company engineering guidance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:320ms]">
              <Link href="#programs" className="relative group px-7 py-3.5 text-sm font-bold rounded-2xl text-white overflow-hidden shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 animate-gradient-x" />
                <span className="absolute inset-0 beam-sweep opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Explore Programs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <a href="https://gas-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-7 py-3.5 text-sm font-bold rounded-2xl text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                Corporate Site
              </a>
              <Link href="#verification" className="px-7 py-3.5 text-sm font-bold rounded-2xl text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-250 transition-all flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verify Credentials
              </Link>
            </div>

            <div className="flex items-center gap-2 animate-fade-in-up [animation-delay:500ms] opacity-40">
              <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
              <span className="text-xs text-zinc-400 font-medium">Scroll to explore</span>
            </div>
          </div>

          {/* Right — Cinematic Orb, clean and minimal */}
          <div className="relative flex items-center justify-center animate-fade-in-up [animation-delay:250ms]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-br from-emerald-400/18 via-violet-400/08 to-blue-400/12 blur-[70px] animate-glow-pulse" />
            </div>

            <div className="relative w-[360px] h-[400px] sm:w-[440px] sm:h-[480px] lg:w-[500px] lg:h-[540px]">
              <CinematicOrb />
            </div>

            {/* 3 clean floating status chips */}
            {[
              { label: "R&D Lab Active",     sub: "10 members online",  pos: "-left-4 top-16",    color: "border-emerald-200 bg-emerald-50",  dot: "bg-emerald-500" },
              { label: "AI Pipeline",        sub: "Model training live", pos: "-right-2 top-1/3", color: "border-violet-200 bg-violet-50",    dot: "bg-violet-500"  },
              { label: "Automation Hub",     sub: "IoT + Robotics sync", pos: "-left-4 bottom-20",color: "border-blue-200 bg-blue-50",        dot: "bg-blue-500"    },
            ].map((chip, i) => (
              <div
                key={chip.label}
                className={`absolute ${chip.pos} glass rounded-2xl px-3.5 py-2.5 border ${chip.color} shadow-lg animate-float-slow`}
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${chip.dot} animate-pulse shrink-0`} />
                  <span className="text-[11px] font-bold text-zinc-800 whitespace-nowrap">{chip.label}</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">{chip.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE — subtle tech strip ════════════════════════════════ */}
      <div className="relative bg-zinc-950 py-4 overflow-hidden border-t border-b border-zinc-800/80">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-10 text-xs font-semibold text-zinc-500 whitespace-nowrap">
              <span className="w-1 h-1 rounded-full bg-emerald-500" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS — company-accurate numbers ════════════════════════════ */}
      <section className="py-20 px-6 sm:px-14 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Users,  label: "Team Members",        color: "bg-emerald-100 text-emerald-700", end: 10,  suffix: "+"  },
            { icon: Cpu,    label: "Active R&D Projects", color: "bg-blue-100 text-blue-700",       end: 50,  suffix: "+"  },
            { icon: Zap,    label: "Automation Systems",  color: "bg-violet-100 text-violet-700",   end: 20,  suffix: "+"  },
            { icon: Award,  label: "Month Lab Cycle",     color: "bg-amber-100 text-amber-700",     end: 6,   suffix: "mo" },
          ].map(({ icon: Icon, label, color, end, suffix }, i) => (
            <div key={label} className={`reveal-on-scroll stagger-${i + 1} glass rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-lg transition-shadow group cursor-default`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-3xl font-black text-zinc-900"><CountUp end={end} suffix={suffix} /></span>
              <span className="text-xs font-medium text-zinc-500 text-center leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VERIFICATION ════════════════════════════════════════════════ */}
      <section id="verification" className="relative py-24 px-6 sm:px-14 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(16,185,129,0.15),transparent)]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" style={{ animation: "scan 3s ease-in-out infinite" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-glow-pulse" />
            <ShieldCheck className="relative w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 reveal-on-scroll">
            Instant Credential Verification
          </h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-10 reveal-on-scroll stagger-2">
            Verify any GAS intern's certificate number directly from our registry.
          </p>

          <form onSubmit={handleVerify} className="reveal-on-scroll stagger-3 max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text" required suppressHydrationWarning
                placeholder="e.g. GAS-2026-ALEX-0089"
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-800 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
              />
            </div>
            <button type="submit" suppressHydrationWarning className="relative px-6 py-3.5 text-sm font-bold rounded-2xl text-white overflow-hidden shrink-0 group">
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
              <span className="absolute inset-0 beam-sweep" />
              <span className="relative">Verify</span>
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-5 flex-wrap reveal-on-scroll stagger-4">
            {["Tamper-Proof", "Instant", "Employer-Ready", "Blockchain-Anchored"].map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600">
                <Check className="w-3 h-3 text-emerald-500" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS ════════════════════════════════════════════════════ */}
      <section id="programs" className="py-24 px-6 sm:px-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-100/30 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4">
              <BookOpen className="w-3.5 h-3.5" /> Lab Programs
            </div>
            <h2 className="text-4xl font-black text-zinc-950 tracking-tight">Active Fellowships</h2>
            <p className="text-sm text-zinc-500 mt-3 max-w-sm mx-auto">
              Structured R&D cycles designed for high-performance execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {ACTIVE_FELLOWSHIPS.map((f, idx) => (
              <div key={idx} className="relative group reveal-on-scroll">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/40 via-violet-500/20 to-blue-500/30 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
                <div className="relative bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-zinc-100">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {f.cohort}
                        </span>
                        <h3 className="text-lg font-black text-zinc-950 mt-2.5 leading-snug">{f.title}</h3>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100 font-semibold">
                          <Clock className="w-3 h-3 text-emerald-600" /> {f.duration}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100 font-semibold">
                          <Calendar className="w-3 h-3 text-violet-500" /> {f.timeline}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-600 mt-5 leading-relaxed">
                      {f.description}
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-2 border-t border-zinc-50 pt-5">
                      {f.bullets.map((item) => (
                        <div key={item} className="flex items-start gap-2 p-2 rounded-lg hover:bg-emerald-50/20 transition-all">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-zinc-700 text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-50/80">
                    <a 
                      href="https://docs.google.com/forms/d/e/1FAIpQLSe0q_g9lVSP3yYwcSws2NJukx80_xGePg56DuJzZ_8T2R-OMA/viewform?pli=1"
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white overflow-hidden group shadow-md shadow-emerald-500/10 hover:shadow-lg transition-shadow w-full justify-center"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                      <span className="absolute inset-0 beam-sweep" />
                      <span className="relative flex items-center gap-1.5">Apply for Fellowship <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-14 relative overflow-hidden bg-zinc-50/60">
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </div>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`reveal-on-scroll stagger-${i + 1}`}>
                <button type="button" onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full text-left">
                  <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                    activeFaq === i
                      ? "border-emerald-300 shadow-md shadow-emerald-100"
                      : "border-zinc-200/80 shadow-sm hover:border-zinc-300"
                  }`}>
                    <div className="flex justify-between items-center px-6 py-4 gap-4">
                      <h3 className="font-bold text-zinc-900 text-sm flex-1">{faq.q}</h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        activeFaq === i ? "bg-emerald-500 rotate-180" : "bg-zinc-100"
                      }`}>
                        <ChevronDown className={`w-4 h-4 ${activeFaq === i ? "text-white" : "text-zinc-500"}`} />
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${activeFaq === i ? "max-h-40" : "max-h-0"}`}>
                      <p className="px-6 pb-5 text-zinc-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6 sm:px-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-violet-50/30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-200/25 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-12 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
              <Send className="w-3.5 h-3.5" /> Contact
            </div>
            <h2 className="text-3xl font-black text-zinc-950 tracking-tight">Contact Admissions</h2>
            <p className="text-sm text-zinc-500 mt-2">Questions about the internship or R&D programs? Reach out.</p>
          </div>

          {contactOk ? (
            <div className="p-7 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-4 shadow-md animate-scale-in">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-emerald-800 block">Message Sent Successfully!</span>
                <span className="text-sm text-emerald-700 mt-0.5 block">Our team will respond within 24 hours.</span>
              </div>
            </div>
          ) : (
            <div className="reveal-on-scroll stagger-2 relative group">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-400/25 via-violet-400/15 to-blue-400/20 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              <form onSubmit={handleContact} className="relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-lg space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
                    <input type="text" required suppressHydrationWarning value={contact.name}
                      onChange={e => setContact({ ...contact, name: e.target.value })}
                      placeholder="Alex Jones"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email</label>
                    <input type="email" required suppressHydrationWarning value={contact.email}
                      onChange={e => setContact({ ...contact, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
                  <textarea required rows={4} suppressHydrationWarning value={contact.message}
                    onChange={e => setContact({ ...contact, message: e.target.value })}
                    placeholder="Tell us about your background and interest..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" />
                </div>
                {contactError && (
                  <div className="p-4 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-150 flex items-center gap-2 animate-scale-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{contactError}</span>
                  </div>
                )}
                <button type="submit" disabled={sendingContact} suppressHydrationWarning className="relative w-full py-3.5 text-sm font-bold rounded-2xl text-white overflow-hidden group shadow-md shadow-emerald-500/15 hover:shadow-lg transition-shadow disabled:opacity-60">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                  <span className="absolute inset-0 beam-sweep" />
                  <span className="relative flex items-center justify-center gap-2">
                    {sendingContact ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 sm:px-14 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="GAS Logo" className="w-8 h-8 object-contain opacity-90" />
            <div className="leading-none">
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Green Automation Solution</div>
              <div className="font-black text-white text-sm">GAS <span className="text-emerald-400">Virtual Lab</span></div>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <a href="https://gas-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">Corporate Site</a>
            {[["#programs", "Programs"], ["#verification", "Verify"], ["#contact", "Contact"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link>
            ))}
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Green Automation Solution. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ══ CERT MODAL ═══════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-200 z-[101] overflow-hidden animate-scale-in">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-300/15 rounded-full blur-2xl" />
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {verifying ? (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-100" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                  <ShieldCheck className="absolute inset-3 w-10 h-10 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-zinc-800">Verifying Certificate...</span>
                <span className="text-xs text-zinc-400">Querying secure registry</span>
              </div>
            ) : verResult?.success ? (
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-emerald-50 rounded-full animate-glow-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider">Verified Credential</span>
                  <h3 className="text-2xl font-black text-zinc-950 mt-3">{verResult.certificate.studentName}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Matric: {verResult.certificate.matricNumber}</p>
                </div>
                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 text-left space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Program</span>
                    <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verResult.certificate.programTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Batch</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verResult.certificate.batchCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Issued</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">
                        {new Date(verResult.certificate.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Certificate ID</span>
                    <p className="text-zinc-800 text-xs font-mono font-bold mt-0.5">{verResult.certificate.certificateNumber}</p>
                  </div>
                </div>
                <Link
                  href={`/verify?id=${verResult.certificate.certificateNumber}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20"
                >
                  View Verification Page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-950">Verification Failed</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xs mx-auto">
                    {verResult?.error || "Certificate not found. Please check the number and try again."}
                  </p>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-full py-3 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all">
                  Try Another Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
