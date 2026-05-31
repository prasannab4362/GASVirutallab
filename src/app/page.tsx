"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send, HelpCircle, ArrowRight, BookOpen, Clock, Calendar, Check, GraduationCap, X, Loader2 } from "lucide-react";
import { verifyCertificateAction } from "@/lib/actions/certificate-actions";

export default function LandingPage() {
  const [certNumber, setCertNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setIsModalOpen(true);

    try {
      const res = await verifyCertificateAction(certNumber);
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({ success: false, error: "System error. Please try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate successful contact form submission
    setContactSuccess(true);
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const faqs = [
    { q: "What is the GAS Virtual AI Lab?", a: "We provide an immersive, cohort-based learning platform where students execute real-world machine learning and deep learning projects under the direct guidance of industry mentors." },
    { q: "How does the certificate verification work?", a: "Every graduate receives a unique certificate number (e.g. GAS-2026-ALEX-0089). You can input this code directly on our homepage to instantly verify the certificate's validity and see the student's program details." },
    { q: "Who are the mentors?", a: "Our mentors are seasoned practitioners, PhDs, and engineers working on production AI systems in top technology firms and research labs." }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Navigation */}
      <nav className="h-16 bg-white/70 backdrop-blur-md sticky top-0 border-b border-zinc-200/60 flex items-center justify-between px-6 sm:px-12 z-30">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.jpg" 
            alt="Green Automation Solution Logo" 
            className="w-8 h-8 rounded-lg object-contain bg-white border border-zinc-150 shadow-sm"
          />
          <span className="font-bold text-zinc-950 tracking-tight text-lg">GAS Virtual Lab</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="#programs" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Programs</Link>
          <Link href="#verification" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Verify</Link>
          <Link href="#contact" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Contact</Link>
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20"
          >
            Portal Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full -z-10" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6 border border-blue-100 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Advanced AI Cohort Starting Soon</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-950 max-w-4xl leading-tight">
          Build Real AI Projects.<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Learn From Industry Mentors.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-zinc-600 max-w-2xl leading-relaxed">
          An intensive, hands-on fellowship platform. Code dynamic neural networks, deploy scalable RAG pipelines, and earn verified corporate certifications.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="#programs" 
            className="px-6 py-3.5 text-sm font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            <span>Explore Fellowships</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="#verification" 
            className="px-6 py-3.5 text-sm font-semibold rounded-2xl text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/80 transition-all flex items-center justify-center gap-2"
          >
            <span>Verify Credentials</span>
          </Link>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <section id="verification" className="bg-zinc-900 text-white py-16 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10 blur-[150px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tight">Instant Credential Verification</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
            Input a graduate's certificate number to verify their achievements and program details directly from our database.
          </p>

          <form onSubmit={handleVerify} className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                suppressHydrationWarning
                placeholder="Enter certificate number (e.g. GAS-2026-ALEX-0089)"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-800 border border-zinc-700/80 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-500 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              suppressHydrationWarning
              className="px-6 py-3.5 text-sm font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20"
            >
              Verify Certificate
            </button>
          </form>
        </div>
      </section>

      {/* Programs List */}
      <section id="programs" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <GraduationCap className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Active Fellowships</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Structured curricula designed for high-performance execution.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-100">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                Cohort A
              </span>
              <h3 className="text-xl font-bold text-zinc-950 mt-2">Advanced AI and Deep Learning Fellowship</h3>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200/50">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                6 Months
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200/50">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Ongoing
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-600 mt-6 leading-relaxed">
            A comprehensive, project-driven fellowship. Deep dive into convolutional architectures, implement custom attention layers, train transformers from scratch, and deploy RAG systems locally.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              "PyTorch & Custom Neural Networks",
              "Attention Mechanism & Transformer Architectures",
              "FAISS, LangChain & Hybrid Search RAGs",
              "Production Deployment & Latency Optimization",
              "1-on-1 Direct Industry Mentor Syncs",
              "Verified Corporate Graduation Certificate"
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-zinc-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-zinc-100/60 border-t border-b border-zinc-200/40 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <HelpCircle className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">{faq.q}</h3>
                <p className="text-zinc-600 text-xs sm:text-sm mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 px-6 sm:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Send className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Contact Admissions</h2>
          <p className="text-sm text-zinc-500 mt-2">
            Have questions about application timelines or requirements? Drop us a line.
          </p>
        </div>

        {contactSuccess ? (
          <div className="p-6 bg-green-50 text-green-800 border border-green-150 rounded-2xl flex items-center gap-3 animate-scale-in">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <span className="font-semibold block">Message Sent Successfully!</span>
              <span className="text-sm mt-0.5 block">Our admissions team will get back to you within 24 hours.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-5 bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  suppressHydrationWarning
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all"
                  placeholder="Alex Jones"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  suppressHydrationWarning
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-655/20 focus:border-blue-600 transition-all"
                  placeholder="alex@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Message</label>
              <textarea
                required
                rows={4}
                suppressHydrationWarning
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-650/20 focus:border-blue-600 transition-all"
                placeholder="Tell us about your background and interest in AI..."
              />
            </div>
            <button
              type="submit"
              suppressHydrationWarning
              className="w-full py-3.5 text-sm font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20"
            >
              Send Message
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 bg-zinc-950 text-zinc-550 border-t border-zinc-800 px-6 sm:px-12 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} GAS Virtual AI Lab. All rights reserved.</p>
      </footer>

      {/* Verification Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden animate-scale-in">
            {/* Modal close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isVerifying ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contacting Verification Registry...</span>
              </div>
            ) : verificationResult?.success ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-semibold uppercase tracking-wider">
                    Verified Credential
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white mt-3">
                    {verificationResult.certificate.studentName}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Matric Number: {verificationResult.certificate.matricNumber}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 text-left space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Program Title</span>
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{verificationResult.certificate.programTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Batch Code</span>
                      <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{verificationResult.certificate.batchCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Issue Date</span>
                      <p className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">
                        {new Date(verificationResult.certificate.issueDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Verification Number</span>
                    <p className="text-zinc-800 dark:text-zinc-200 text-xs font-mono font-bold">{verificationResult.certificate.certificateNumber}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link 
                    href={`/verify?id=${verificationResult.certificate.certificateNumber}`}
                    className="flex-1 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md shadow-blue-500/10 text-center block"
                  >
                    View Verification Page
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                  <AlertCircle className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                    Verification Failed
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    {verificationResult?.error || "We couldn't verify the certificate number you entered. Please double-check for errors."}
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all"
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
