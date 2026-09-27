'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  History,
  Shield,
  Zap,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { page, mode: modeFilter, status: statusFilter, search }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (modeFilter !== 'ALL') params.append('mode', modeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);

      return api.get<{ reviews: Review[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
        `/reviews?${params.toString()}`
      );
    },
  });

  const reviews = data?.reviews || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const modeIcons = {
    SECURITY: Shield,
    PERFORMANCE: Zap,
    QUALITY: BarChart3,
  };

  const modeColors = {
    SECURITY: '#ef4444',
    PERFORMANCE: '#eab308',
    QUALITY: '#3b82f6',
  };

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Code Reviews</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          History of automated AI security, performance, and code quality audits
        </p>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-10 text-xs"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              className="input py-1.5 px-3 text-xs w-auto"
            >
              <option value="ALL">All Modes</option>
              <option value="SECURITY">Security</option>
              <option value="PERFORMANCE">Performance</option>
              <option value="QUALITY">Quality</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input py-1.5 px-3 text-xs w-auto"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card h-20 animate-pulse opacity-50" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-12 flex flex-col items-center">
          <History size={48} className="mb-3" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-1">No code reviews found</h3>
          <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-muted)' }}>
            Select any project from your dashboard and click <strong>&quot;AI Review&quot;</strong> to start an automated Security, Performance, or Quality audit.
          </p>
          <Link href="/dashboard/projects" className="btn btn-primary inline-flex items-center gap-2">
            Go to Projects <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const ModeIcon = modeIcons[review.mode];
            const issueCount = review._count?.issues || review.issues?.length || 0;

            return (
              <Link
                key={review.id}
                href={`/dashboard/reviews/${review.id}`}
                className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all-smooth hover:border-indigo-500/40 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ background: `${modeColors[review.mode]}15` }}
                  >
                    <ModeIcon size={24} style={{ color: modeColors[review.mode] }} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base group-hover:text-indigo-400 transition-colors">
                        {review.project?.name || 'Project Review'}
                      </h3>
                      <span
                        className="badge text-[10px] uppercase font-bold"
                        style={{
                          background: `${modeColors[review.mode]}20`,
                          color: modeColors[review.mode],
                        }}
                      >
                        {review.mode}
                      </span>
                    </div>

                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Scope: <span className="font-medium uppercase">{review.scope.replace('_', ' ')}</span>
                      {review.file && ` (${review.file.path})`} · Created {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0"
                  style={{ borderColor: 'var(--border-primary)' }}>
                  {/* Score badge if completed */}
                  {review.status === 'COMPLETED' && review.summaryScore != null && (
                    <div className="text-center">
                      <span className="text-2xl font-bold" style={{
                        color: review.summaryScore >= 80 ? 'var(--success)' : review.summaryScore >= 50 ? 'var(--warning)' : 'var(--error)'
                      }}>
                        {review.summaryScore}
                      </span>
                      <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Score</span>
                    </div>
                  )}

                  {/* Issues Count */}
                  <div className="text-center">
                    <span className="text-lg font-semibold">{issueCount}</span>
                    <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Issues</span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className="badge text-xs px-3 py-1 font-semibold"
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

                  <ArrowRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total reviews)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
