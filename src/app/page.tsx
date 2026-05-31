"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send,
  HelpCircle, ArrowRight, BookOpen, Clock, Calendar, Check,
  X, ChevronDown, Award, Users, TrendingUp, Code2, Brain,
  Cpu, Wifi, Globe, Zap, Wrench, Bot, Layers, CircuitBoard
} from "lucide-react";
import { verifyCertificateAction } from "@/lib/actions/certificate-actions";
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

/* ── Tech / Domain marquee items ── */
const TECH = [
  "Artificial Intelligence", "Machine Learning", "Deep Learning",
  "IoT Systems", "Smart Automation", "Robotics Engineering",
  "Arduino & Embedded C", "LangChain & RAG", "Website Development",
  "PyTorch", "Sensor Networks", "Motor Control", "FastAPI", "FAISS",
  "Microcontrollers", "Full-Stack Web", "TensorFlow", "Computer Vision",
];

/* ── Domain cards for the "What We Teach" strip ── */
const DOMAINS = [
  {
    icon: Brain,
    title: "Artificial Intelligence",
    desc: "Deep learning, NLP, computer vision, transformer architectures, and RAG pipelines — built and deployed from scratch.",
    grad: "from-emerald-500/20 to-teal-500/10",
    ic:   "text-emerald-500 bg-emerald-50",
    dark: "text-emerald-400 bg-emerald-900/40",
  },
  {
    icon: Wifi,
    title: "IoT & Smart Automation",
    desc: "Connected devices, sensor fusion, MQTT protocols, cloud dashboards, and end-to-end smart system pipelines.",
    grad: "from-blue-500/20 to-sky-500/10",
    ic:   "text-blue-500 bg-blue-50",
    dark: "text-blue-400 bg-blue-900/40",
  },
  {
    icon: Bot,
    title: "Robotics Engineering",
    desc: "Servo and stepper motor control, robot kinematics, path planning, autonomous systems, and mechatronics integration.",
    grad: "from-violet-500/20 to-purple-500/10",
    ic:   "text-violet-500 bg-violet-50",
    dark: "text-violet-400 bg-violet-900/40",
  },
  {
    icon: CircuitBoard,
    title: "Embedded C & Arduino",
    desc: "Low-level firmware, Arduino sketches, AVR microcontrollers, real-time OS concepts, and hardware–software co-design.",
    grad: "from-amber-500/20 to-orange-500/10",
    ic:   "text-amber-600 bg-amber-50",
    dark: "text-amber-400 bg-amber-900/40",
  },
  {
    icon: Globe,
    title: "Website Development",
    desc: "Modern full-stack web: React, Next.js, REST APIs, databases, deployment, and UI/UX design principles.",
    grad: "from-pink-500/20 to-rose-500/10",
    ic:   "text-pink-500 bg-pink-50",
    dark: "text-pink-400 bg-pink-900/40",
  },
  {
    icon: Zap,
    title: "Smart Systems Integration",
    desc: "Bridging AI, IoT, and Web — building full-stack smart products from sensor to cloud dashboard to intelligent decision-making.",
    grad: "from-cyan-500/20 to-teal-500/10",
    ic:   "text-cyan-600 bg-cyan-50",
    dark: "text-cyan-400 bg-cyan-900/40",
  },
];

export default function LandingPage() {
  const [certNumber,  setCertNumber]  = useState("");
  const [verResult,   setVerResult]   = useState<any>(null);
  const [verifying,   setVerifying]   = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [contact,     setContact]     = useState({ name: "", email: "", message: "" });
  const [contactOk,   setContactOk]   = useState(false);
  const [activeFaq,   setActiveFaq]   = useState<number | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mousePos,    setMousePos]    = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal-on-scroll");
    const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } }), { threshold: 0.08 });
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

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactOk(true);
    setContact({ name: "", email: "", message: "" });
    setTimeout(() => setContactOk(false), 5000);
  };

  const faqs = [
    { q: "What is the GAS Virtual Lab?", a: "Green Automation Solution (GAS) Virtual Lab is an immersive, cohort-based learning platform covering AI, IoT, Robotics, Embedded C, and Web Development — students execute real-world projects under the direct guidance of industry mentors." },
    { q: "How does the certificate verification work?", a: "Every graduate receives a unique certificate number (e.g. GAS-2026-ALEX-0089). You can input this code directly on our homepage to instantly verify the certificate's validity and see the student's program details." },
    { q: "Who are the mentors?", a: "Our mentors are seasoned practitioners, PhDs, and engineers working on production AI, embedded systems, and IoT solutions in top technology firms and research labs." },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900">

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <nav className={`h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-14 transition-all duration-500 ${navScrolled ? "glass shadow-lg shadow-black/5 border-b border-white/60" : "bg-transparent"}`}>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <img src="/logo.png" alt="GAS Logo" className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Green Automation Solution</span>
            <span className="font-black text-zinc-900 tracking-tight text-base">GAS <span className="text-emerald-600">Virtual Lab</span></span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[["#domains","Domains"],["#programs","Programs"],["#verification","Verify"],["#contact","Contact"]].map(([href, label]) => (
            <Link key={href} href={href} className="relative text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors group">
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-emerald-500 rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
          <Link href="/login" className="relative px-5 py-2 text-sm font-bold rounded-xl text-white overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-shadow">
            <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
            <span className="absolute inset-0 beam-sweep" />
            <span className="relative flex items-center gap-1.5">Portal Login <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
          </Link>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{
        background: "radial-gradient(ellipse 90% 70% at 70% 50%,rgba(16,185,129,0.10) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 30% 20%,rgba(139,92,246,0.08) 0%,transparent 55%),radial-gradient(ellipse 70% 60% at 10% 80%,rgba(59,130,246,0.06) 0%,transparent 50%),#ffffff"
      }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none transition-all duration-700" style={{
          background: `radial-gradient(ellipse 55% 45% at ${mousePos.x}% ${mousePos.y}%,rgba(16,185,129,0.09) 0%,transparent 65%)`
        }} />
        <NeuralCanvas />
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[130px] animate-drift-slow pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-violet-500/08 rounded-full blur-[120px] animate-drift-slower pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 w-full pt-24 pb-16 grid lg:grid-cols-2 gap-8 items-center min-h-screen">

          {/* ── Left copy ── */}
          <div className="flex flex-col items-start space-y-7 lg:pr-8">

            {/* Full brand name badge */}
            <div className="animate-fade-in space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50/90 text-emerald-700 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Green Automation Solution — GAS Virtual Lab</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-zinc-950 leading-[1.03] animate-fade-in-up">
              AI · IoT · Robotics<br />
              Web · Automation.
              <span className="block text-shimmer mt-2 text-4xl sm:text-5xl">
                Built. Deployed. Certified.
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed max-w-xl animate-fade-in-up [animation-delay:180ms]">
              An intensive, hands-on fellowship platform spanning{" "}
              <span className="text-emerald-700 font-semibold">Artificial Intelligence</span>,{" "}
              <span className="text-blue-600 font-semibold">IoT & Smart Automation</span>,{" "}
              <span className="text-violet-600 font-semibold">Robotics</span>,{" "}
              <span className="text-amber-600 font-semibold">Embedded C & Arduino</span>,{" "}
              and <span className="text-pink-600 font-semibold">Web Development</span> — under direct industry mentor guidance.
            </p>

            {/* Domain pill strip */}
            <div className="flex flex-wrap gap-2 animate-fade-in-up [animation-delay:260ms]">
              {[
                { label: "AI / ML",         color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { label: "IoT",             color: "bg-blue-50 text-blue-700 border-blue-200"          },
                { label: "Robotics",        color: "bg-violet-50 text-violet-700 border-violet-200"    },
                { label: "Arduino",         color: "bg-amber-50 text-amber-700 border-amber-200"       },
                { label: "Web Dev",         color: "bg-pink-50 text-pink-700 border-pink-200"          },
                { label: "Smart Systems",   color: "bg-cyan-50 text-cyan-700 border-cyan-200"          },
              ].map(({ label, color }) => (
                <span key={label} className={`px-3 py-1 rounded-full text-xs font-bold border ${color}`}>{label}</span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:360ms]">
              <Link href="#domains" className="relative group px-7 py-3.5 text-sm font-bold rounded-2xl text-white overflow-hidden shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/35 transition-shadow">
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 animate-gradient-x" />
                <span className="absolute inset-0 beam-sweep opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">Explore All Domains <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              <Link href="#verification" className="px-7 py-3.5 text-sm font-bold rounded-2xl text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verify Credentials
              </Link>
            </div>

            <div className="flex items-center gap-2 animate-fade-in-up [animation-delay:520ms] opacity-50">
              <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" />
              <span className="text-xs text-zinc-400 font-medium">Scroll to explore all domains</span>
            </div>
          </div>

          {/* ── Right: Cinematic Orb ── */}
          <div className="relative flex items-center justify-center animate-fade-in-up [animation-delay:250ms]">
            {/* Glow aura */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[440px] h-[440px] rounded-full bg-gradient-to-br from-emerald-400/20 via-violet-400/10 to-blue-400/15 blur-[65px] animate-glow-pulse" />
            </div>

            {/* Canvas */}
            <div className="relative w-[380px] h-[420px] sm:w-[460px] sm:h-[500px] lg:w-[520px] lg:h-[560px]">
              <CinematicOrb />
            </div>

            {/* Domain chips — 6 domains around the orb */}
            {[
              { label: "AI / Deep Learning",  sub: "Neural nets live",    pos: "-left-6 top-14",    color: "border-emerald-200 bg-emerald-50",  dot: "bg-emerald-500" },
              { label: "IoT Network",          sub: "12 sensors online",   pos: "-right-4 top-20",   color: "border-blue-200 bg-blue-50",        dot: "bg-blue-500"    },
              { label: "Robotics",             sub: "Arm at 96% acc",      pos: "-left-8 top-[45%]", color: "border-violet-200 bg-violet-50",    dot: "bg-violet-500"  },
              { label: "Arduino / Embedded",   sub: "Firmware v2.4",       pos: "-right-6 top-[45%]",color: "border-amber-200 bg-amber-50",      dot: "bg-amber-500"   },
              { label: "Web Development",      sub: "React + Next.js",     pos: "-left-4 bottom-20", color: "border-pink-200 bg-pink-50",        dot: "bg-pink-500"    },
              { label: "Cert Issued",          sub: "GAS-2026-✓",          pos: "-right-2 bottom-14",color: "border-teal-200 bg-teal-50",        dot: "bg-teal-500"    },
            ].map((chip, i) => (
              <div
                key={chip.label}
                className={`absolute ${chip.pos} glass rounded-2xl px-3 py-2 border ${chip.color} shadow-lg animate-float-slow`}
                style={{ animationDelay: `${i * 0.45}s` }}
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

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════ */}
      <div className="relative bg-zinc-950 py-5 overflow-hidden border-t border-b border-zinc-800/80">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
        <div className="marquee-track">
          {[...TECH, ...TECH].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-semibold text-zinc-400 whitespace-nowrap hover:text-emerald-400 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 sm:px-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users,      label: "Graduates Certified",     color: "bg-emerald-100 text-emerald-700", end: 200, suffix: "+" },
            { icon: Layers,     label: "Domains Covered",         color: "bg-blue-100 text-blue-700",       end: 6,   suffix: "+"  },
            { icon: Brain,      label: "Industry Mentors Active",  color: "bg-violet-100 text-violet-700",   end: 15,  suffix: "+" },
            { icon: Award,      label: "Month Intensive Program",  color: "bg-amber-100 text-amber-700",     end: 6,   suffix: "mo" },
          ].map(({ icon: Icon, label, color, end, suffix }, i) => (
            <div key={label} className={`reveal-on-scroll stagger-${i + 1} glass rounded-3xl p-6 flex flex-col items-center gap-3 shadow-md hover:shadow-xl transition-shadow group cursor-default`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-zinc-900"><CountUp end={end} suffix={suffix} /></span>
              <span className="text-xs font-medium text-zinc-500 text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DOMAINS — ALL 6 ════════════════════════════════════════════════ */}
      <section id="domains" className="py-24 px-6 sm:px-14 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/08 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-500/08 rounded-full blur-[130px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> All Learning Domains
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Six Domains.<br />
              <span className="text-shimmer">One Platform.</span>
            </h2>
            <p className="text-zinc-400 mt-4 text-sm max-w-xl mx-auto">
              Green Automation Solution covers everything from low-level firmware to cloud-deployed AI — a complete engineering education ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map(({ icon: Icon, title, desc, grad, dark }, i) => (
              <div key={title} className={`reveal-on-scroll stagger-${(i % 3) + 1} relative glass-dark rounded-3xl p-7 hover:scale-[1.025] transition-transform duration-300 group overflow-hidden cursor-default`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${dark} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="relative text-base font-black text-white mb-2">{title}</h3>
                <p className="relative text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VERIFICATION — DARK ════════════════════════════════════════════ */}
      <section id="verification" className="relative py-28 px-6 sm:px-14 overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_90%,rgba(139,92,246,0.12),transparent)]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" style={{ animation: "scan 3s ease-in-out infinite" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl animate-glow-pulse" />
            <ShieldCheck className="relative w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 reveal-on-scroll">
            Instant Credential Verification
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto mb-10 reveal-on-scroll stagger-2">
            Input a graduate's certificate number to verify their achievements and program details directly from our blockchain-secured registry.
          </p>
          <form onSubmit={handleVerify} className="reveal-on-scroll stagger-3 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500"><Search className="w-5 h-5" /></span>
              <input
                type="text" required suppressHydrationWarning
                placeholder="Enter certificate number (e.g. GAS-2026-ALEX-0089)"
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
              />
            </div>
            <button type="submit" suppressHydrationWarning className="relative px-6 py-4 text-sm font-bold rounded-2xl text-white overflow-hidden shrink-0 group">
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
              <span className="absolute inset-0 beam-sweep" />
              <span className="relative">Verify Certificate</span>
            </button>
          </form>
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap reveal-on-scroll stagger-4">
            {["Tamper-Proof Record","Instant Lookup","Employer Ready","Blockchain-Anchored"].map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS ═══════════════════════════════════════════════════════ */}
      <section id="programs" className="py-24 px-6 sm:px-14 max-w-7xl mx-auto relative">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-violet-100/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/50 rounded-full blur-[100px] -z-10" />

        <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Active Fellowships
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight">
            Active{" "}
            <span className="relative">Fellowships<span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" /></span>
          </h2>
          <p className="text-sm text-zinc-500 mt-5">Structured curricula designed for high-performance execution across all domains.</p>
        </div>

        <div className="max-w-3xl mx-auto reveal-on-scroll stagger-2">
          <div className="relative group">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/50 via-violet-500/30 to-blue-500/40 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
            <div className="relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Cohort A — Live
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

              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {[
                  { text: "PyTorch & Custom Neural Networks",                 icon: Brain,        color: "text-emerald-600 bg-emerald-50" },
                  { text: "Attention Mechanism & Transformer Architectures",  icon: Cpu,          color: "text-violet-600 bg-violet-50"   },
                  { text: "FAISS, LangChain & Hybrid Search RAGs",           icon: Layers,       color: "text-blue-600 bg-blue-50"       },
                  { text: "Production Deployment & Latency Optimization",    icon: Zap,          color: "text-amber-600 bg-amber-50"     },
                  { text: "1-on-1 Direct Industry Mentor Syncs",             icon: Users,        color: "text-emerald-600 bg-emerald-50" },
                  { text: "Verified Corporate Graduation Certificate",        icon: Award,        color: "text-violet-600 bg-violet-50"   },
                ].map(({ text, icon: Icon, color }, i) => (
                  <div key={text} className={`reveal-on-scroll stagger-${i + 1} flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-zinc-700 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/login" className="relative inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl text-white overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                  <span className="absolute inset-0 beam-sweep" />
                  <span className="relative flex items-center gap-2">Apply for Fellowship <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-16 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </div>
            <h2 className="text-4xl font-black text-zinc-950 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`reveal-on-scroll stagger-${i + 1}`}>
                <button type="button" onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full text-left">
                  <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${activeFaq === i ? "border-emerald-300 shadow-lg shadow-emerald-100" : "border-zinc-200/80 shadow-sm hover:border-zinc-300 hover:shadow-md"}`}>
                    <div className="flex justify-between items-center p-6 gap-4">
                      <h3 className="font-bold text-zinc-900 text-sm sm:text-base flex-1">{faq.q}</h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${activeFaq === i ? "bg-emerald-500 rotate-180" : "bg-zinc-100"}`}>
                        <ChevronDown className={`w-4 h-4 ${activeFaq === i ? "text-white" : "text-zinc-500"}`} />
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${activeFaq === i ? "max-h-48" : "max-h-0"}`}>
                      <p className="px-6 pb-6 text-zinc-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-6 sm:px-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-violet-50/40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14 reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4">
              <Send className="w-3.5 h-3.5" /> Contact Admissions
            </div>
            <h2 className="text-4xl font-black text-zinc-950 tracking-tight">Contact Admissions</h2>
            <p className="text-sm text-zinc-500 mt-3">Have questions about application timelines or requirements? Drop us a line.</p>
          </div>

          {contactOk ? (
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
              <form onSubmit={handleContact} className="relative bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-xl space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
                    <input type="text" required suppressHydrationWarning value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })}
                      placeholder="Alex Jones"
                      className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                    <input type="email" required suppressHydrationWarning value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
                  <textarea required rows={4} suppressHydrationWarning value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })}
                    placeholder="Tell us about your background and interest in AI, IoT, Robotics, or Web Development..."
                    className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" />
                </div>
                <button type="submit" suppressHydrationWarning className="relative w-full py-4 text-sm font-bold rounded-2xl text-white overflow-hidden group shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-shadow">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all" />
                  <span className="absolute inset-0 beam-sweep" />
                  <span className="relative flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send Message</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="bg-zinc-950 border-t border-zinc-800 px-6 sm:px-14 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Brand row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="GAS Logo" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Green Automation Solution</div>
                <div className="font-black text-white text-lg">GAS <span className="text-emerald-400">Virtual Lab</span></div>
              </div>
            </div>

            {/* Domain pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "AI / ML",       color: "border-emerald-800 text-emerald-400" },
                { label: "IoT",           color: "border-blue-800 text-blue-400"       },
                { label: "Robotics",      color: "border-violet-800 text-violet-400"   },
                { label: "Arduino",       color: "border-amber-800 text-amber-400"     },
                { label: "Web Dev",       color: "border-pink-800 text-pink-400"       },
                { label: "Automation",    color: "border-cyan-800 text-cyan-400"       },
              ].map(({ label, color }) => (
                <span key={label} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>{label}</span>
              ))}
            </div>

            <div className="flex items-center gap-6">
              {[["#domains","Domains"],["#programs","Programs"],["#verification","Verify"],["#contact","Contact"]].map(([href, label]) => (
                <Link key={href} href={href} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div className="pt-6 text-xs text-zinc-600 text-center">
            © {new Date().getFullYear()} Green Automation Solution (GAS) Virtual Lab. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ══ CERT MODAL ══════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-200 z-[101] overflow-hidden animate-scale-in">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-2xl" />
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors"><X className="w-5 h-5" /></button>

            {verifying ? (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                  <ShieldCheck className="absolute inset-3 w-10 h-10 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-zinc-800">Contacting Verification Registry...</span>
                <span className="text-xs text-zinc-400">Querying blockchain-secured record</span>
              </div>
            ) : verResult?.success ? (
              <div className="text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-glow-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
                </div>
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 uppercase tracking-wider">Verified Credential</span>
                  <h3 className="text-2xl font-black text-zinc-950 mt-3">{verResult.certificate.studentName}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Matric Number: {verResult.certificate.matricNumber}</p>
                </div>
                <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 text-left space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Program Title</span>
                    <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verResult.certificate.programTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Batch Code</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">{verResult.certificate.batchCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Issue Date</span>
                      <p className="text-zinc-800 text-sm font-semibold mt-0.5">{new Date(verResult.certificate.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Certificate ID</span>
                    <p className="text-zinc-800 text-xs font-mono font-bold mt-0.5">{verResult.certificate.certificateNumber}</p>
                  </div>
                </div>
                <Link href={`/verify?id=${verResult.certificate.certificateNumber}`} className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/20">
                  View Full Verification Page <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto"><AlertCircle className="w-10 h-10 text-red-500" /></div>
                <div>
                  <h3 className="text-xl font-black text-zinc-950">Verification Failed</h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-xs mx-auto">{verResult?.error || "We couldn't verify the certificate number you entered. Please double-check for errors."}</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-full py-3 text-sm font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-2xl transition-all">Try Another Code</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
