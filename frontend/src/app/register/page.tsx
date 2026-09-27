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
  UserPlus,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Check,
  Shield,
  FileSearch,
  Bot,
  GitBranch,
} from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { useAuthStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    try {
      await registerUser(data.name, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleQuickDemoFill = () => {
    const randomId = Math.floor(Math.random() * 8999 + 1000);
    setValue('name', 'Senior Developer');
    setValue('email', `dev_${randomId}@codereview.ai`);
    setValue('password', 'DevPass123!');
    setValue('confirmPassword', 'DevPass123!');
  };

  return (
    <div className="auth-page font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div
        className="absolute -top-32 -left-24 w-[520px] h-[520px] pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 65%)',
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
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="auth-layout">
        <aside className="auth-brand-panel">
          <Link href="/" className="flex items-center gap-3.5 w-fit group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_10px_30px_rgba(168,85,247,0.35)] ring-1 ring-white/20 group-hover:scale-105 transition-transform">
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
            <p className="text-purple-300 text-sm font-semibold tracking-wide uppercase mb-3">
              Create your workspace
            </p>
            <h1 className="text-5xl font-black tracking-tight text-white leading-[1.08]">
              Start reviewing production code in minutes
            </h1>
            <p className="mt-5 text-lg text-slate-300/90 leading-relaxed max-w-lg">
              Upload a repo, pick an audit mode, and get structured findings with suggested fixes from your chosen LLM.
            </p>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center shrink-0">
                <FileSearch className="w-5 h-5 text-cyan-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">ZIP to file tree</strong>
                <br />
                Drop a project archive and browse source with syntax highlighting.
              </span>
            </li>
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/25 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-indigo-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">Bring your own model</strong>
                <br />
                Connect OpenAI, Ollama, LM Studio, or any compatible endpoint.
              </span>
            </li>
            <li className="flex items-start gap-3.5 text-slate-300">
              <span className="mt-0.5 w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5 text-purple-300" />
              </span>
              <span>
                <strong className="text-white font-semibold">Chat with the codebase</strong>
                <br />
                Ask architecture questions against the files you just uploaded.
              </span>
            </li>
          </ul>
        </aside>

        <section className="w-full max-w-[520px] mx-auto lg:mx-0">
          <div className="flex justify-center lg:hidden mb-7">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
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
            <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-cyan-400" />
            <div className="auth-card-inner">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Create account
                </h2>
                <p className="text-slate-400 text-[15px] mt-3 leading-relaxed">
                  Start getting instant AI-powered code reviews in seconds
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <div className="px-4 py-3.5 rounded-2xl text-[13px] font-medium bg-red-950/80 border border-red-500/30 text-red-300 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="auth-label">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-[18px] h-[18px] text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Senior Developer"
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-400 font-medium mt-2">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="auth-label">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-[18px] h-[18px] text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="you@company.com"
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
                      placeholder="At least 8 characters"
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

                  {passwordValue && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <span className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="w-3 h-3" /> 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="w-3 h-3" /> Uppercase (A-Z)
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="w-3 h-3" /> Number (0-9)
                      </span>
                      <span className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <Check className="w-3 h-3" /> Symbol (!@#$)
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="auth-label">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-[18px] h-[18px] text-slate-500 pointer-events-none" />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 font-medium mt-2">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="pt-1 space-y-3">
                  <button type="submit" disabled={isSubmitting} className="auth-submit">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create developer account
                      </>
                    )}
                  </button>

                  <button type="button" onClick={handleQuickDemoFill} className="auth-ghost">
                    <Sparkles className="w-4 h-4" />
                    Auto-fill registration details
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                  >
                    Sign in <ArrowRight className="w-3.5 h-3.5" />
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
