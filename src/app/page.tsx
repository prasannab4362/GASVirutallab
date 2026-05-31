"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send,
  HelpCircle, ArrowRight, BookOpen, Clock, Calendar, Check,
  GraduationCap, X, Loader2, Cpu, Network, Zap, Globe,
  ChevronDown, Star, Award, Users, TrendingUp, Code2, Brain
} from "lucide-react";
import { verifyCertificateAction } from "@/lib/actions/certificate-actions";
import NeuralCanvas from "@/components/neural-canvas";
import AIConsoleSimulator from "@/components/ai-console-simulator";

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Floating particle component ─── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-0"
          style={{
            width:  `${3 + (i % 5)}px`,
            height: `${3 + (i % 5)}px`,
            left:   `${(i * 457) % 100}%`,
            top:    `${(i * 317) % 100}%`,
            background: i % 3 === 0 ? "#059669" : i % 3 === 1 ? "#7c3aed" : "#2563eb",
            filter: "blur(1px)",
            animation: `float-slow ${5 + (i % 4)}s ${i * 0.4}s ease-in-out infinite`,
            opacity: 0.35 + (i % 4) * 0.1,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated counter ─── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(t);
      }, 24);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Stat card ─── */
function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string;
}) {
  return (
    <div className="reveal-on-scroll glass rounded-3xl p-6 flex flex-col items-center gap-3 shadow-lg hover:shadow-xl transition-shadow group cursor-default">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-3xl font-black text-zinc-900">{value}</span>
      <span className="text-xs font-medium text-zinc-500 text-center leading-snug">{label}</span>
    </div>
  );
}

/* ─── Technology marquee items ─── */
const TECH_STACK = [
  "PyTorch", "TensorFlow", "LangChain", "FAISS", "Hugging Face", "OpenAI API",
  "RAG Pipelines", "Vector DBs", "Transformers", "CNN Architectures", "Docker", "FastAPI",
];

export default function LandingPage() {
  const [certNumber, setCertNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  /* Nav scroll effect */
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Mouse glow tracking */
  useEffect(() => {
    const fn = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  /* Scroll reveal initialiser */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setIsModalOpen(true);
    try {
      const res = await verifyCertificateAction(certNumber);
      setVerificationResult(res);
    } catch {
      setVerificationResult({ success: false, error: "System error. Please try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const faqs = [
    { q: "What is the GAS Virtual AI Lab?", a: "We provide an immersive, cohort-based learning platform where students execute real-world machine learning and deep learning projects under the direct guidance of industry mentors." },
    { q: "How does the certificate verification work?", a: "Every graduate receives a unique certificate number (e.g. GAS-2026-ALEX-0089). You can input this code directly on our homepage to instantly verify the certificate's validity and see the student's program details." },
    { q: "Who are the mentors?", a: "Our mentors are seasoned practitioners, PhDs, and engineers working on production AI systems in top technology firms and research labs." },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900">

      {/* ════════════════════════════════════════════
          NAVIGATION
      ════════════════════════════════════════════ */}
      <nav className={`h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 transition-all duration-500 ${
        navScrolled ? "glass shadow-lg shadow-black/5 border-b border-white/60" : "bg-transparent"
      }`}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img src="/logo.png" alt="GAS Logo" className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -inset-1 rounded-full bg-emerald-400/20 scale-0 group-hover:scale-100 transition-transform duration-300" />
          </div>
          <span className="font-black text-zinc-900 tracking-tight text-lg leading-none">
            GAS <span className="text-emerald-600">Virtual Lab</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["#programs", "Programs"], ["#verification", "Verify"], ["#contact", "Contact"]].map(([href, label]) => (
            <Link key={href} href={href} className="relative text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group">
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link
            href="/login"
            className="relative px-5 py-2 text-sm font-bold rounded-xl text-white overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 group-hover:from-emerald-500 group-hover:to-teal-500 transition-all duration-500" />
            <span className="absolute inset-0 beam-sweep" />
            <span className="relative flex items-center gap-1.5">Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          HERO SECTION — video-quality animated
      ════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center hero-mesh overflow-hidden pt-16">
        {/* Mouse-following radial glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse 60% 50% at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.12) 0%, transparent 60%)`,
          }}
        />

        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern z-0 opacity-80" />

        {/* Neural canvas constellation */}
        <NeuralCanvas />

        {/* Floating orbs */}
        <div className="absolute top-24 left-12 w-72 h-72 bg-emerald-400/20 rounded-full blur-[90px] animate-drift-slow z-0" />
        <div className="absolute bottom-24 right-16 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px] animate-drift-slower z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/6 rounded-full blur-[140px] z-0" />

        {/* Floating particles */}
        <Particles />

        {/* Content grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 w-full py-20 grid lg:grid-cols-12 gap-12 items-center">

          {/* ── Left copy ── */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7">

            {/* Badge */}
            <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 text-emerald-700 text-xs font-bold shadow-sm shadow-emerald-100 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Advanced AI Cohort Starting Soon
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-950 leading-[1.02] animate-fade-in-up">
              Build Real AI Projects.{" "}
              <span className="block text-shimmer">
                Learn From Industry Mentors.
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed max-w-xl animate-fade-in-up [animation-delay:200ms]">
              An intensive, hands-on fellowship platform. Code dynamic neural networks, deploy scalable RAG pipelines, and earn{" "}
              <span className="text-emerald-700 font-semibold">verified corporate certifications.</span>
            </p>

            {/* Stats mini strip */}
            <div className="flex items-center gap-6 animate-fade-in-up [animation-delay:300ms]">
              {[
                { val: "200+", label: "Graduates" },
                { val: "98%", label: "Placement Rate" },
                { val: "15+", label: "Industry Mentors" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black text-zinc-900">{val}</div>
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up [animation-delay:400ms]">
              <Link href="#programs" className="relative group px-7 py-3.5 text-sm font-bold rounded-2xl text-white overflow-hidden shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 animate-gradient-x" />
                <span className="absolute inset-0 beam-sweep opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Explore Fellowships
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="#verification" className="px-7 py-3.5 text-sm font-bold rounded-2xl text-zinc-700 bg-white/90 hover:bg-white border border-zinc-200 hover:border-zinc-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verify Credentials
              </Link>
            </div>

            {/* Scroll hint */}
            <div className="flex items-center gap-2 animate-fade-in-up [animation-delay:600ms] opacity-60">
              <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
              <span className="text-xs text-zinc-400 font-medium">Scroll to explore</span>
            </div>
          </div>

          {/* ── Right console ── */}
          <div className="lg:col-span-5 animate-fade-in-up [animation-delay:300ms]">
            <div className="relative">
              {/* Glow halo behind the card */}
              <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/20 via-violet-500/10 to-blue-500/15 rounded-[40px] blur-2xl animate-glow-pulse" />
              {/* Card */}
              <div className="relative rounded-3xl overflow-hidden hover:scale-[1.015] transition-transform duration-500 shadow-2xl shadow-emerald-900/10">
                <AIConsoleSimulator />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TECH MARQUEE STRIP
      ════════════════════════════════════════════ */}
      <div className="relative bg-zinc-950 py-5 overflow-hidden border-t border-b border-zinc-800">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
        <div className="marquee-track">
          {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-semibold text-zinc-400 whitespace-nowrap hover:text-emerald-400 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STATS SECTION
      ════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users,     value: "200+",  label: "Graduates Certified",     color: "bg-emerald-100 text-emerald-700" },
            { icon: TrendingUp,value: "98%",   label: "Placement Success Rate",  color: "bg-violet-100 text-violet-700"  },
            { icon: Brain,     value: "15+",   label: "Industry Mentors Active", color: "bg-blue-100 text-blue-700"      },
            { icon: Award,     value: "6mo",   label: "Intensive Fellowship",    color: "bg-amber-100 text-amber-700"    },
          ].map((s, i) => (
            <div key={i} className={`reveal-on-scroll stagger-${i + 1}`}>
              <StatCard {...s} />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CERTIFICATE VERIFICATION — DARK SECTION
      ════════════════════════════════════════════ */}
      <section id="verification" className="relative py-24 px-6 sm:px-12 overflow-hidden bg-zinc-950">
        {/* Animated background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(139,92,246,0.1),transparent)]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          {/* Scan line */}
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" style={{ animation: "scan 2.5s ease-in-out infinite" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Icon with glow */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8 rounded-3xl">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl animate-glow-pulse" />
            <ShieldCheck className="relative w-10 h-10 text-emerald-400" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 reveal-on-scroll">
            Instant Credential Verification
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto mb-10 reveal-on-scroll stagger-2">
            Input a graduate's certificate number to verify their achievements and program details directly from our blockchain-secured registry.
          </p>

          {/* Verification form */}
          <form onSubmit={handleVerify} className="reveal-on-scroll stagger-3 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-violet-500/10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity" />
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                suppressHydrationWarning
                placeholder="Enter certificate number (e.g. GAS-2026-ALEX-0089)"
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                className="relative w-full pl-12 pr-4 py-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              suppressHydrationWarning
              className="relative px-6 py-4 text-sm font-bold rounded-2xl text-white overflow-hidden group shrink-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
              <span className="absolute inset-0 beam-sweep" />
              <span className="relative">Verify Certificate</span>
            </button>
          </form>

          {/* Trusted badge strip */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap reveal-on-scroll stagger-4">
            {["Tamper-Proof Record", "Instant Lookup", "Employer Ready", "Blockchain-Anchored"].map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROGRAMS / ACTIVE FELLOWSHIPS
      ════════════════════════════════════════════ */}
      <section id="programs" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/50 rounded-full blur-[100px] -z-10" />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Active Fellowships
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight">
            Active{" "}
            <span className="relative">
              Fellowships
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
            </span>
          </h2>
          <p className="text-sm text-zinc-500 mt-5">Structured curricula designed for high-performance execution.</p>
        </div>

        {/* Program card */}
        <div className="max-w-3xl mx-auto reveal-on-scroll stagger-2">
          <div className="relative group">
            {/* Animated border */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/50 via-violet-500/30 to-blue-500/40 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            <div className="relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-lg shadow-zinc-200/50 hover:shadow-xl transition-shadow">
              {/* Card header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cohort A — Live
                  </span>
                  <h3 className="text-xl font-black text-zinc-950 mt-3">Advanced AI and Deep Learning Fellowship</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> 6 Months
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-600 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                    <Calendar className="w-3.5 h-3.5 text-violet-500" /> Ongoing
                  </span>
                </div>
              </div>

              <p className="text-sm text-zinc-600 mt-6 leading-relaxed">
                A comprehensive, project-driven fellowship. Deep dive into convolutional architectures, implement custom attention layers, train transformers from scratch, and deploy RAG systems locally.
              </p>

              {/* Feature grid */}
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {[
                  { text: "PyTorch & Custom Neural Networks",           icon: Code2,   color: "text-emerald-600 bg-emerald-50" },
                  { text: "Attention Mechanism & Transformer Architectures", icon: Brain,   color: "text-violet-600 bg-violet-50"  },
                  { text: "FAISS, LangChain & Hybrid Search RAGs",     icon: Network, color: "text-blue-600 bg-blue-50"     },
                  { text: "Production Deployment & Latency Optimization", icon: Zap,    color: "text-amber-600 bg-amber-50"   },
                  { text: "1-on-1 Direct Industry Mentor Syncs",       icon: Users,   color: "text-emerald-600 bg-emerald-50" },
                  { text: "Verified Corporate Graduation Certificate",  icon: Award,   color: "text-violet-600 bg-violet-50"  },
                ].map(({ text, icon: Icon, color }, i) => (
                  <div key={text} className={`reveal-on-scroll stagger-${i + 1} flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-700 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8">
                <Link href="/login" className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl text-white overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                  <span className="absolute inset-0 beam-sweep" />
                  <span className="relative flex items-center gap-2">Apply for Fellowship <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY GAS — Feature strip
      ════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-12 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="text-4xl font-black text-white tracking-tight">Why Choose <span className="text-emerald-400">GAS Virtual Lab?</span></h2>
            <p className="text-zinc-400 mt-3 text-sm max-w-lg mx-auto">Built by industry veterans. Proven by graduates. Powered by real AI systems.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Real Production AI",
                desc: "Build systems that actually work in the real world, not just toy examples. Deploy models, serve APIs, and optimize latency.",
                gradient: "from-emerald-500/20 to-teal-500/10",
                iconColor: "text-emerald-400 bg-emerald-900/40",
              },
              {
                icon: Users,
                title: "1-on-1 Mentor Access",
                desc: "Weekly syncs with PhDs and engineers from top-tier AI labs. Get code reviewed, architecture critiqued, and career mentored.",
                gradient: "from-violet-500/20 to-purple-500/10",
                iconColor: "text-violet-400 bg-violet-900/40",
              },
              {
                icon: Award,
                title: "Verifiable Credentials",
                desc: "Earn a blockchain-anchored certificate with a unique ID employers can instantly verify. Not a generic completion badge.",
                gradient: "from-blue-500/20 to-indigo-500/10",
                iconColor: "text-blue-400 bg-blue-900/40",
              },
            ].map(({ icon: Icon, title, desc, gradient, iconColor }, i) => (
              <div key={title} className={`reveal-on-scroll stagger-${i + 1} relative glass-dark rounded-3xl p-7 hover:scale-[1.02] transition-transform group overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="relative text-base font-black text-white mb-2">{title}</h3>
                <p className="relative text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ SECTION
      ════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30" />

        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-black text-zinc-950 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`reveal-on-scroll stagger-${i + 1}`}>
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left"
                >
                  <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                    activeFaq === i
                      ? "border-emerald-300 shadow-lg shadow-emerald-100"
                      : "border-zinc-200/80 shadow-sm hover:border-zinc-300 hover:shadow-md"
                  }`}>
                    <div className="flex justify-between items-center p-6 gap-4">
                      <h3 className="font-bold text-zinc-900 text-sm sm:text-base flex-1">{faq.q}</h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        activeFaq === i ? "bg-emerald-500 rotate-180" : "bg-zinc-100"
                      }`}>
                        <ChevronDown className={`w-4 h-4 ${activeFaq === i ? "text-white" : "text-zinc-500"}`} />
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-400 ${activeFaq === i ? "max-h-40" : "max-h-0"}`}>
                      <p className="px-6 pb-6 text-zinc-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CONTACT / ADMISSIONS
      ════════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-violet-50/40" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/20 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
              <Send className="w-3.5 h-3.5" />
              Contact Admissions
            </div>
            <h2 className="text-4xl font-black text-zinc-950 tracking-tight">Contact Admissions</h2>
            <p className="text-sm text-zinc-500 mt-3">Have questions about application timelines or requirements? Drop us a line.</p>
          </div>

          {contactSuccess ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-4 shadow-lg shadow-emerald-100 animate-scale-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="font-bold text-emerald-800 block text-base">Message Sent Successfully!</span>
                <span className="text-sm text-emerald-700 mt-0.5 block">Our admissions team will get back to you within 24 hours.</span>
              </div>
            </div>
          ) : (
            <div className="reveal-on-scroll stagger-2 relative group">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-400/30 via-violet-400/20 to-blue-400/25 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
              <form onSubmit={handleContactSubmit} className="relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-xl shadow-zinc-200/30 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
                    <input
                      type="text" required suppressHydrationWarning
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Alex Jones"
                      className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                    <input
                      type="email" required suppressHydrationWarning
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
                  <textarea
                    required rows={4} suppressHydrationWarning
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about your background and interest in AI..."
                    className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit" suppressHydrationWarning
                  className="relative w-full py-4 text-sm font-bold rounded-2xl text-white overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-shadow"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                  <span className="absolute inset-0 beam-sweep" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 sm:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="GAS Logo" className="w-8 h-8 object-contain opacity-90" />
            <span className="font-black text-white text-base">GAS <span className="text-emerald-400">Virtual Lab</span></span>
          </Link>

          <div className="flex items-center gap-8">
            {[["#programs", "Programs"], ["#verification", "Verify"], ["#contact", "Contact"]].map(([href, label]) => (
              <Link key={href} href={href} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link>
            ))}
          </div>

          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Green Automation Solution. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          CERT VERIFICATION MODAL
      ════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-200 z-[101] overflow-hidden animate-scale-in">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                  <ShieldCheck className="absolute inset-3 w-10 h-10 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-zinc-800">Contacting Verification Registry...</span>
                <span className="text-xs text-zinc-400">Querying blockchain-secured record</span>
              </div>
            ) : verificationResult?.success ? (
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-glow-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider">Verified Credential</span>
                  <h3 className="text-2xl font-black text-zinc-950 mt-3">{verificationResult.certificate.studentName}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Matric Number: {verificationResult.certificate.matricNumber}</p>
                </div>
                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 text-left space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Program Title</span>
                    <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verificationResult.certificate.programTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Batch Code</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verificationResult.certificate.batchCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Issue Date</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">
                        {new Date(verificationResult.certificate.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Certificate ID</span>
                    <p className="text-zinc-800 text-xs font-mono font-bold mt-0.5">{verificationResult.certificate.certificateNumber}</p>
                  </div>
                </div>
                <Link
                  href={`/verify?id=${verificationResult.certificate.certificateNumber}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  View Full Verification Page <ArrowRight className="w-4 h-4" />
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
                    {verificationResult?.error || "We couldn't verify the certificate number you entered. Please double-check for errors."}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all"
                >
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
