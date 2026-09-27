'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Code2,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  ShieldCheck,
  Zap,
  LockKeyhole,
} from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleQuickDemoFill = () => {
    setValue('email', 'admin@codereview.ai');
    setValue('password', 'AdminPass123!');
  };

  return (
    <div className="auth-page font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div
        className="absolute -top-32 -left-24 w-[520px] h-[520px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 65%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[640px] pointer-events-none opacity-40 animate-glow"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.18) 0%, rgba(56, 189, 248, 0.1) 42%, transparent 72%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-28 w-[480px] h-[480px] pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.24) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <Link href="/" className="flex items-center gap-3.5 w-fit group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_10px_30px_rgba(34,211,238,0.35)] ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              CodeReview
              <span className="text-cyan-200 font-mono text-xs px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400/40">
                AI v2.0
              </span>
            </span>
          </Link>

          <div>
            <p className="text-cyan-300 text-sm font-semibold tracking-wide uppercase mb-3">
              Developer access
            </p>
            <h1 className="text-5xl font-black tracking-tight text-white leading-[1.08]">
              Welcome back to instant AI audits
            </h1>
            <p className="mt-5 text-lg text-slate-300/90 leading-relaxed max-w-lg">
              Sign in to review security, performance, and architecture findings across your uploaded repositories.
            </p>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">OWASP-ready scans</strong>
                <br />
                Catch injection risks, leaked secrets, and auth gaps before merge.
              </span>
            </li>
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/25 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-indigo-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">Performance callouts</strong>
                <br />
                Surface N+1 queries and hot paths with file-level evidence.
              </span>
            </li>
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center shrink-0">
                <LockKeyhole className="w-5 h-5 text-purple-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">JWT session security</strong>
                <br />
                HTTP-only cookies and Argon2 hashing protect every login.
              </span>
            </li>
          </ul>
        </aside>

        <section className="w-full max-w-[520px] mx-auto lg:mx-0">
          <div className="flex justify-center lg:hidden mb-7">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                CodeReview
                <span className="text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/30">
                  AI v2.0
                </span>
              </span>
            </Link>
          </div>

          <div className="auth-card">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-purple-500" />
            <div className="auth-card-inner">
              <div className="text-center mb-9">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Sign in
                </h2>
                <p className="text-slate-400 text-[15px] mt-3 leading-relaxed">
                  Enter your credentials to open the developer dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="px-4 py-3.5 rounded-2xl text-[13px] font-medium bg-red-950/80 border border-red-500/30 text-red-300 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="auth-label">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-[18px] h-[18px] text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="name@company.com"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 font-medium mt-2">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="auth-label">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-[18px] h-[18px] text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-4 text-slate-500 hover:text-slate-200 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 font-medium mt-2">{errors.password.message}</p>
                  )}
                </div>

                <div className="pt-1 space-y-3">
                  <button type="submit" disabled={isSubmitting} className="auth-submit">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign in to account
                      </>
                    )}
                  </button>

                  <button type="button" onClick={handleQuickDemoFill} className="auth-ghost">
                    <Sparkles className="w-4 h-4" />
                    Auto-fill demo credentials
                  </button>
                </div>
              </form>

              <div className="mt-9 pt-6 border-t border-slate-800/80 text-center">
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                  >
                    Create account <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Secured with JWT &amp; end-to-end encryption</span>
          </div>
        </section>
      </div>
    </div>
  );
}
