'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Review, ReviewIssue } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Shield,
  Zap,
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
  Code,
  Sparkles,
} from 'lucide-react';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => api.get<Review>(`/reviews/${reviewId}`),
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl animate-fade-in py-12 flex justify-center">
        <div className="loader" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-6xl animate-fade-in text-center py-12">
        <h2 className="text-xl font-bold mb-2">Review Not Found</h2>
        <button onClick={() => router.push('/dashboard/reviews')} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Reviews
        </button>
      </div>
    );
  }

  const issues = review.issues || [];
  const filteredIssues = issues.filter(
    (i) => severityFilter === 'ALL' || i.severity === severityFilter
  );

  const severityCounts = {
    CRITICAL: issues.filter((i) => i.severity === 'CRITICAL').length,
    HIGH: issues.filter((i) => i.severity === 'HIGH').length,
    MEDIUM: issues.filter((i) => i.severity === 'MEDIUM').length,
    LOW: issues.filter((i) => i.severity === 'LOW').length,
  };

  const modeIcons = {
    SECURITY: Shield,
    PERFORMANCE: Zap,
    QUALITY: BarChart3,
  };

  const ModeIcon = modeIcons[review.mode];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/reviews')}
          className="text-xs flex items-center gap-1 mb-2 hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Back to Reviews
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <ModeIcon size={28} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {review.project?.name || 'Project'} — {review.mode} Audit
                </h1>
                <span
                  className="badge text-xs"
                  style={{
                    background:
                      review.status === 'COMPLETED'
                        ? 'rgba(34, 197, 94, 0.15)'
                        : review.status === 'FAILED'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(234, 179, 8, 0.15)',
                    color:
                      review.status === 'COMPLETED'
                        ? 'var(--success)'
                        : review.status === 'FAILED'
                        ? 'var(--error)'
                        : 'var(--warning)',
                  }}
                >
                  {review.status.toLowerCase()}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Audited on {formatDate(review.createdAt)} · Scope:{' '}
                <span className="font-semibold uppercase">{review.scope.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Score Header Banner */}
      <div className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Sparkles size={18} style={{ color: 'var(--accent-secondary)' }} />
            Executive Summary
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {review.summaryText || 'Review completed successfully. Inspect individual findings below.'}
          </p>
        </div>

        {review.summaryScore !== undefined && review.summaryScore !== null && (
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl min-w-[120px]"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <span
              className="text-4xl font-extrabold"
              style={{
                color:
                  review.summaryScore >= 80
                    ? 'var(--success)'
                    : review.summaryScore >= 50
                    ? 'var(--warning)'
                    : 'var(--error)',
              }}
            >
              {review.summaryScore}
            </span>
            <span className="text-xs uppercase font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
              Overall Score
            </span>
          </div>
        )}
      </div>

      {/* Severity Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'ALL', label: 'All Issues', count: issues.length, color: 'var(--accent-secondary)' },
          { id: 'CRITICAL', label: 'Critical', count: severityCounts.CRITICAL, color: '#ef4444' },
          { id: 'HIGH', label: 'High', count: severityCounts.HIGH, color: '#f97316' },
          { id: 'MEDIUM', label: 'Medium', count: severityCounts.MEDIUM, color: '#eab308' },
          { id: 'LOW', label: 'Low', count: severityCounts.LOW, color: '#3b82f6' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSeverityFilter(s.id)}
            className="card p-3 text-left transition-all-smooth cursor-pointer"
            style={{
              background: severityFilter === s.id ? 'var(--bg-hover)' : 'var(--bg-secondary)',
              borderColor: severityFilter === s.id ? s.color : 'var(--border-primary)',
            }}
          >
            <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </span>
            <span className="text-xl font-bold" style={{ color: s.color }}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center justify-between">
          <span>Detected Findings ({filteredIssues.length})</span>
        </h2>

        {filteredIssues.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 size={44} className="mx-auto mb-3 text-emerald-400" />
            <h3 className="text-base font-semibold mb-1">No issues match filter</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {severityFilter === 'ALL'
                ? 'Great news! AI did not detect any security vulnerabilities or flaws.'
                : `No issues with severity standard "${severityFilter}"`}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const sevColor =
              issue.severity === 'CRITICAL'
                ? '#ef4444'
                : issue.severity === 'HIGH'
                ? '#f97316'
                : issue.severity === 'MEDIUM'
                ? '#eab308'
                : '#3b82f6';

            return (
              <div
                key={issue.id}
                className="card p-5 space-y-4 border-l-4 transition-all-smooth"
                style={{ borderLeftColor: sevColor }}
              >
                {/* Issue Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="badge text-[10px] font-bold uppercase"
                        style={{ background: `${sevColor}20`, color: sevColor }}
                      >
                        {issue.severity}
                      </span>
                      {issue.category && (
                        <span className="badge text-[10px] uppercase font-semibold" style={{ background: 'var(--bg-tertiary)' }}>
                          {issue.category}
                        </span>
                      )}
                      <span className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <FileCode size={13} />
                        {issue.filePath}
                        {issue.lineStart ? ` (L${issue.lineStart}${issue.lineEnd ? `-${issue.lineEnd}` : ''})` : ''}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold">{issue.title}</h3>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {issue.description}
                </p>

                {/* Code Snippet / Fix Recommendation */}
                {issue.suggestion && (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold"
                      style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                      <span className="flex items-center gap-1.5" style={{ color: 'var(--success)' }}>
                        <Sparkles size={14} /> AI Suggested Solution
                      </span>
                      <button
                        onClick={() => handleCopy(issue.suggestion!, issue.id)}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded transition-colors hover:bg-white/10"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {copiedId === issue.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copiedId === issue.id ? 'Copied' : 'Copy Fix'}
                      </button>
                    </div>

                    <div className="p-3 font-mono text-xs overflow-x-auto" style={{ background: '#090d16' }}>
                      <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">{issue.suggestion}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
