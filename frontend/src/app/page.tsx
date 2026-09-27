'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
  Code2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  GitBranch,
  Terminal,
  Cpu,
  Lock,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  FileCode2,
  Bot,
  Flame,
  Check,
  PlayCircle,
  Copy,
  Server,
  FileSearch,
  MessageSquareCode
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'security' | 'performance' | 'solid'>('security');
  const [copiedFix, setCopiedFix] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const auditDemos = {
    security: {
      fileName: 'auth.service.ts',
      mode: 'Security Vulnerability',
      score: '98/100 Quality Score',
      severity: 'CRITICAL',
      title: 'SQL Injection Risk Detected (Line 3)',
      desc: 'Direct string interpolation allows unescaped SQL payload execution. Replace with Prisma ORM parameterized queries.',
      code: `// ⚠️ High Risk Code Snippet
async function loginUser(email, password) {
  const query = \`SELECT * FROM users 
    WHERE email = '\${email}'\`;
  const user = await db.raw(query);
  return user;
}`,
      fix: `// ✓ AI Suggested Fix
async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}`
    },
    performance: {
      fileName: 'analytics.controller.ts',
      mode: 'Performance Bottleneck',
      score: '94/100 Speed Score',
      severity: 'HIGH',
      title: 'N+1 Query Problem in Loop (Line 4)',
      desc: 'Iterative DB fetching inside map loop causes O(N) database roundtrips. Batch fetch records using Prisma `in` operator.',
      code: `// ⚠️ O(N) Unoptimized Loop
async function getUserLogs(userIds: string[]) {
  const logs = await Promise.all(
    userIds.map(id => db.logs.findMany({ where: { userId: id } }))
  );
  return logs.flat();
}`,
      fix: `// ✓ AI Suggested Fix
async function getUserLogs(userIds: string[]) {
  return await prisma.log.findMany({
    where: { userId: { in: userIds } }
  });
}`
    },
    solid: {
      fileName: 'report-generator.ts',
      mode: 'SOLID Architecture',
      score: '91/100 SOLID Score',
      severity: 'MEDIUM',
      title: 'Single Responsibility Principle Violation',
      desc: 'Class handles data retrieval, PDF rendering, and email dispatching. Decouple into separate service interfaces.',
      code: `// ⚠️ Tightly Coupled Class
class ReportManager {
  async processReport(id: string) {
    const data = await fetchReport(id);
    const pdf = renderPDF(data);
    await sendEmail(pdf);
  }
}`,
      fix: `// ✓ AI Suggested Fix
interface ReportPublisher {
  publish(report: Report): Promise<void>;
}
class EmailReportPublisher implements ReportPublisher {
  async publish(report: Report) { /* decoupled logic */ }
}`
    }
  };

  const currentDemo = auditDemos[activeTab];

  const features = [
    {
      icon: ShieldCheck,
      title: 'Security Vulnerability Audit',
      desc: 'Detect SQL injection, secret leakage, broken authentication, and OWASP Top 10 vulnerabilities automatically.',
      badge: 'OWASP Certified',
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)'
    },
    {
      icon: Zap,
      title: 'Performance Profiler',
      desc: 'Pinpoint N+1 queries, unindexed DB calls, memory leaks, and high complexity loops with exact line callouts.',
      badge: 'High Velocity',
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      icon: CheckCircle2,
      title: 'SOLID & Clean Code',
      desc: 'Enforce modular architecture, type safety, low coupling, and SOLID design patterns across your codebase.',
      badge: 'Clean Tech',
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      icon: MessageSquareCode,
      title: 'Chat With Your Codebase',
      desc: 'Ask complex contextual questions about your repository files, architecture decisions, and dependency flows.',
      badge: 'Context AI',
      color: '#818cf8',
      bgGlow: 'rgba(129, 140, 248, 0.15)'
    },
    {
      icon: GitBranch,
      title: 'Multi-Provider Engine',
      desc: 'Connect OpenAI GPT-4o, Anthropic Claude 3.5, or run 100% offline local models via Ollama & LM Studio.',
      badge: 'Hybrid AI',
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.15)'
    },
    {
      icon: FileSearch,
      title: 'Auto Docs & Test Gen',
      desc: 'Instantly generate unit test suites and developer documentation markdown files with one click.',
      badge: 'Auto Specs',
      color: '#c084fc',
      bgGlow: 'rgba(192, 132, 252, 0.15)'
    }
  ];

  const handleCopyFix = () => {
    navigator.clipboard.writeText(currentDemo.fix);
    setCopiedFix(true);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-[#f8fafc] flex flex-col items-center overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      
      {/* Background SVG Grid & Radial Glowing spot lights */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-0" />
      
      <div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] pointer-events-none -z-0 opacity-50 animate-glow" 
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 70%)', filter: 'blur(70px)' }}
      />
      <div 
        className="absolute top-[45%] right-[-5%] w-[550px] h-[550px] pointer-events-none -z-0 opacity-25" 
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)', filter: 'blur(90px)' }}
      />
      <div 
        className="absolute top-[75%] left-[-5%] w-[600px] h-[600px] pointer-events-none -z-0 opacity-20" 
        style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)', filter: 'blur(90px)' }}
      />

      {/* STICKY TOP NAVBAR */}
      <header className="sticky top-0 w-full z-50 backdrop-blur-2xl bg-[#070a14]/92 border-b border-slate-700/70 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-5 sm:py-6 lg:py-7 flex items-center justify-between gap-4 min-h-[88px] sm:min-h-[96px] lg:min-h-[108px]">
          <Link href="/" className="flex items-center gap-4 group shrink-0">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_10px_30px_rgba(34,211,238,0.35)] ring-1 ring-white/25 group-hover:scale-105 transition-all duration-300">
              <Code2 className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-none">
                CodeReview
              </span>
              <span className="text-cyan-200 font-mono text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] whitespace-nowrap">
                AI v2.0
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-[15px] font-semibold text-slate-300">
            <a href="#demo" className="px-4 xl:px-5 py-2.5 rounded-xl hover:text-white hover:bg-white/5 transition-all">Live Demo</a>
            <a href="#features" className="px-4 xl:px-5 py-2.5 rounded-xl hover:text-white hover:bg-white/5 transition-all">Features</a>
            <a href="#providers" className="px-4 xl:px-5 py-2.5 rounded-xl hover:text-white hover:bg-white/5 transition-all">AI Models</a>
            <a href="#workflow" className="px-4 xl:px-5 py-2.5 rounded-xl hover:text-white hover:bg-white/5 transition-all">Workflow</a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/login" className="nav-btn nav-btn-ghost">
              Sign In
            </Link>
            <Link href="/register" className="nav-btn nav-btn-primary">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 lg:pt-24 pb-24 flex flex-col items-center text-center z-10 gap-y-20">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl gap-y-6 pt-2">
          
          {/* Hero Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs sm:text-sm font-semibold text-cyan-300 backdrop-blur-xl shadow-lg shadow-cyan-950/60">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Next-Gen Enterprise AI Code Review Engine</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] my-1">
            Ship Flawless Code with{' '}
            <span className="animate-shimmer">
              Instant AI Audits
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-slate-300/90 max-w-2xl leading-relaxed font-normal px-2">
            Upload project repositories or code snippets. Get instant security, performance, and SOLID architectural audits powered by OpenAI, Claude, or offline local LLMs.
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md sm:max-w-none pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap group"
            >
              Start Reviewing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xl whitespace-nowrap"
            >
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              Sign In to Dashboard
            </Link>
          </div>

          {/* Hero Stats & Trust Indicators */}
          <div className="pt-8 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-md">
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-cyan-400" /> &lt; 500ms
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">Instant AST Parse</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-md">
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> 100%
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">OWASP Top 10 Audit</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-md">
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <Server className="w-5 h-5 text-purple-400" /> Local & Cloud
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">OpenAI & Ollama</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/70 backdrop-blur-md">
              <div className="text-2xl font-black text-white flex items-center gap-1.5">
                <Lock className="w-5 h-5 text-amber-400" /> Zero Data
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">Retention Guaranteed</p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO TERMINAL SECTION */}
        <section id="demo" className="w-full max-w-5xl my-2 scroll-mt-24">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Interactive AI Code Audit Demo
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Select an audit mode to see how CodeReviewAI detects issues and delivers instant one-click fixes.
            </p>

            {/* Audit Mode Tabs */}
            <div className="flex items-center gap-2 mt-5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-xl">
              <button
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'security'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-400" /> Security Audit
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'performance'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" /> Performance
              </button>
              <button
                onClick={() => setActiveTab('solid')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'solid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOLID Clean Code
              </button>
            </div>
          </div>

          {/* IDE Window Container */}
          <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden text-left relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>

            {/* Window Topbar */}
            <div className="relative px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="ml-3 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> {currentDemo.fileName} — {currentDemo.mode}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/90 px-3 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {currentDemo.score}
              </div>
            </div>

            {/* Split Screen Audit Grid */}
            <div className="relative p-6 font-mono text-xs sm:text-sm leading-relaxed grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/95">
              
              {/* Left Side: Code Snippet */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-slate-400 text-xs mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5 font-sans font-semibold">
                    <span className="flex items-center gap-2 text-indigo-300">
                      <FileCode2 className="w-4 h-4 text-indigo-400" /> Vulnerable Source Code
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">TypeScript</span>
                  </div>
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre font-mono leading-relaxed py-2">
                    <code>{currentDemo.code}</code>
                  </pre>
                </div>
                <div className="mt-4 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-sans flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Flagged by AI Security Engine</span>
                </div>
              </div>

              {/* Right Side: AI Auditor Insights & Fix */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-950/40 flex flex-col justify-between">
                <div>
                  <div className="text-cyan-300 text-xs mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5 font-sans">
                    <span className="flex items-center gap-2 font-bold text-cyan-400">
                      <Sparkles className="w-4 h-4" /> AI Auditor Insights
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider ${
                      currentDemo.severity === 'CRITICAL' ? 'bg-red-950/90 text-red-400 border border-red-500/40' :
                      currentDemo.severity === 'HIGH' ? 'bg-amber-950/90 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {currentDemo.severity}
                    </span>
                  </div>
                  <div className="space-y-2 text-slate-300 font-sans">
                    <p className="text-red-400 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      ❌ {currentDemo.title}
                    </p>
                    <p className="text-slate-400 text-xs leading-normal">
                      {currentDemo.desc}
                    </p>
                  </div>
                </div>

                {/* Fix Code Box */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-sans font-bold mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Verified AI Refactor Fix:
                    </span>
                    <button
                      onClick={handleCopyFix}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copiedFix ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedFix ? 'Copied!' : 'Copy Fix'}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono overflow-x-auto">
                    <pre className="whitespace-pre"><code>{currentDemo.fix}</code></pre>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* AI PROVIDER STRATEGY MATRIX */}
        <section id="providers" className="w-full pt-4 pb-4 flex flex-col items-center scroll-mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-mono text-purple-300 mb-3">
              <Bot className="w-3.5 h-3.5" /> Multi-Model Architecture
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Powered by OpenAI, Claude & Local LLMs
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              Bring your own API keys or run completely offline with zero data leaving your machine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full text-left">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all group backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">OpenAI GPT-4o</h3>
              <p className="text-xs text-cyan-400 font-mono mb-3">Cloud AI Provider</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ultra-fast structural reasoning, high precision code auditing, and deep architectural suggestions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all group backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Anthropic Claude</h3>
              <p className="text-xs text-indigo-400 font-mono mb-3">Cloud AI Provider</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Exceptional multi-file code understanding, security analysis, and complex refactoring workflows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all group backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ollama / Local LLMs</h3>
              <p className="text-xs text-emerald-400 font-mono mb-3">100% Offline Privacy</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Run local models like DeepSeek-Coder or Llama-3 locally. Zero code ever leaves your environment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all group backdrop-blur-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">LM Studio Compatible</h3>
              <p className="text-xs text-purple-400 font-mono mb-3">Custom Server API</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect any custom OpenAI-compatible server URL endpoint with AES-256 encrypted API key storage.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURE GRID SECTION */}
        <section id="features" className="w-full pt-4 pb-4 flex flex-col items-center scroll-mt-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Engineered for Senior Developers & Security Teams
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Everything you need for static code analysis, structural refactoring, and AI-driven quality assurance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 group backdrop-blur-xl flex flex-col justify-between shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
                  <div>
                    <div 
                      className="w-13 h-13 rounded-2xl border border-slate-700/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform p-3 shadow-inner"
                      style={{ background: feature.bgGlow }}
                    >
                      <Icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 font-normal">
                      {feature.desc}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 w-fit flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-cyan-400" /> {feature.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKFLOW STEPS */}
        <section id="workflow" className="w-full pt-4 pb-4 flex flex-col items-center scroll-mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-3">
              <Flame className="w-3.5 h-3.5" /> High-Speed Pipeline
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
              4 Steps to Audit Production Code
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              From repository upload to one-click fix integration in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
              <span className="text-4xl font-black text-cyan-500/30 font-mono absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-sm mb-4 border border-cyan-500/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Repo / ZIP</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop your project ZIP file or paste single files directly into the code explorer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
              <span className="text-4xl font-black text-indigo-500/30 font-mono absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4 border border-indigo-500/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AST Parsing Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Abstract Syntax Tree parser analyzes project hierarchy, function signatures, and imports.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
              <span className="text-4xl font-black text-purple-500/30 font-mono absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center font-bold text-sm mb-4 border border-purple-500/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Audit Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your selected LLM scans for OWASP vulnerabilities, performance bottlenecks, and SOLID violations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
              <span className="text-4xl font-black text-emerald-500/30 font-mono absolute top-4 right-4">04</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-500/30">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Apply One-Click Fixes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review suggested fixes, copy clean refactored code snippets, or export markdown reports.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER (PERFECTLY CENTERED & STRUCTURED) */}
        <section className="w-full rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/40 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-center my-6">
          {/* Glowing Spotlights */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Centered Content Block */}
          <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-3xl w-full mx-auto">
            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20">
              <Code2 className="w-8 h-8 text-cyan-400" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to Audit Your Codebase?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-normal">
                Join developers using CodeReviewAI to eliminate security vulnerabilities, optimize performance, and enforce SOLID standards.
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-9 py-4 text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 rounded-xl shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 backdrop-blur-xl whitespace-nowrap"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>


      </main>

      {/* PREMIUM FOOTER */}
      <footer className="w-full bg-[#04060b] border-t border-slate-800/80 pt-16 pb-12 relative z-20 text-slate-400 font-sans">
        {/* Top ambient glowing accent border line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Brand Column (Col 1-5) */}
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                CodeReview<span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40">AI v2.0</span>
              </span>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md font-normal">
              Next-generation static code auditor and multi-provider AI review engine. Ship clean, secure, and SOLID-compliant production code in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All AI Audit Systems Operational</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Data Retention</span>
              </div>
            </div>
          </div>

          {/* Product Column (Col 6-7) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Product
            </h4>
            <ul className="space-y-2.5 text-sm font-normal">
              <li>
                <a href="#demo" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Security Audit
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Performance Profiler
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> SOLID Clean Code
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Interactive Chat
                </a>
              </li>
              <li>
                <a href="#workflow" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Auto Test & Docs
                </a>
              </li>
            </ul>
          </div>

          {/* AI Providers Column (Col 8-9) */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> AI Engines
            </h4>
            <ul className="space-y-2.5 text-sm font-normal">
              <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> OpenAI GPT-4o
              </li>
              <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Anthropic Claude 3.5
              </li>
              <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> Ollama Local LLMs
              </li>
              <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> LM Studio Endpoint
              </li>
              <li className="hover:text-purple-300 transition-colors flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> DeepSeek Coder
              </li>
            </ul>
          </div>

          {/* Architecture Column (Col 10-12) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase font-sans flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Architecture
            </h4>
            <ul className="space-y-2.5 text-sm font-normal">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Next.js 15 App Router
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> NestJS 12 Microservices
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Prisma ORM & SQLite
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Argon2 & JWT Security
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-14 pt-8 border-t border-slate-800/80 flex flex-col items-center justify-center gap-3 text-center text-xs sm:text-sm text-slate-400 font-sans">
          <div className="font-medium text-slate-300">
            © 2026 CodeReviewAI. Engineered for high-velocity software engineering teams.
          </div>
          <div className="flex items-center justify-center gap-6 font-medium text-xs text-slate-400 pt-1">
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <span className="text-slate-700">•</span>
            <Link href="/register" className="hover:text-cyan-400 transition-colors">Register Account</Link>
            <span className="text-slate-700">•</span>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Live Audits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

