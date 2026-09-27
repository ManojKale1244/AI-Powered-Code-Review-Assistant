'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Project, Review } from '@/lib/types';
import { useAuthStore } from '@/lib/auth-store';
import { formatDate } from '@/lib/utils';
import {
  FolderOpen,
  Plus,
  History,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', { limit: 5 }],
    queryFn: () =>
      api.get<{ reviews: Review[]; pagination: { total?: number } }>(
        '/reviews?limit=5',
      ),
  });

  const recentReviews = reviewData?.reviews || [];

  const stats = {
    totalProjects: projects.length,
    totalReviews: reviewData?.pagination?.total || 0,
    totalFiles: projects.reduce((acc, p) => acc + (p._count?.files || 0), 0),
  };

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
    <div className="dashboard-page relative z-[1] mx-auto w-full max-w-7xl animate-fade-in px-1 sm:px-2">
      {/* Header */}
      <header className="mb-12 md:mb-14">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium tracking-wide"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(129, 140, 248, 0.25)',
            color: 'var(--accent-secondary)',
          }}
        >
          <Sparkles size={16} aria-hidden />
          Your workspace overview
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
          Welcome back,{' '}
          <span className="gradient-text">{user?.name}</span>
        </h1>
        <p
          className="mt-4 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          Here&apos;s an overview of your code review activity
        </p>
      </header>

      {/* Stats */}
      <section
        className="mb-0 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-7"
        aria-label="Statistics"
      >
        {[
          { label: 'Projects', value: stats.totalProjects, icon: FolderOpen },
          { label: 'Reviews', value: stats.totalReviews, icon: History },
          {
            label: 'Files Analyzed',
            value: stats.totalFiles,
            icon: BarChart3,
          },
        ].map((stat) => (
          <div key={stat.label} className="dashboard-stat-card">
            <div className="relative z-[1] flex items-center justify-between gap-6">
              <div>
                <p
                  className="text-base font-medium tracking-wide sm:text-lg"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {stat.label}
                </p>
                <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
                  {stat.value}
                </p>
              </div>
              <div
                className="flex shrink-0 items-center justify-center rounded-2xl p-4 sm:p-5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.2))',
                  border: '1px solid rgba(129, 140, 248, 0.2)',
                }}
              >
                <stat.icon
                  size={32}
                  strokeWidth={1.75}
                  style={{ color: 'var(--accent-primary)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-activity-section grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Recent Projects */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              Recent Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-2 text-base font-medium transition-all-smooth hover:gap-3"
              style={{ color: 'var(--accent-secondary)' }}
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="dashboard-panel-body">
          {projects.length === 0 ? (
            <div className="py-12 text-center sm:py-14">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(129, 140, 248, 0.2)',
                }}
              >
                <FolderOpen
                  size={40}
                  strokeWidth={1.5}
                  style={{ color: 'var(--accent-secondary)' }}
                />
              </div>
              <p
                className="text-lg font-medium sm:text-xl"
                style={{ color: 'var(--text-primary)' }}
              >
                No projects yet
              </p>
              <p
                className="mx-auto mt-2 max-w-xs text-base leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                Create a project to upload code and start AI-powered reviews.
              </p>
              <Link
                href="/dashboard/projects"
                className="btn btn-primary mt-8 text-base"
              >
                <Plus size={20} /> Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="dashboard-list-item flex items-center justify-between"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <div className="flex items-center gap-4">
                    <FolderOpen
                      size={22}
                      style={{ color: 'var(--accent-secondary)' }}
                    />
                    <div>
                      <p className="text-base font-semibold sm:text-lg">
                        {project.name}
                      </p>
                      <p
                        className="mt-1 text-sm sm:text-base"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {project._count?.files || 0} files ·{' '}
                        {project.language || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </Link>
              ))}
            </div>
          )}
          </div>
        </section>

        {/* Recent Reviews */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-header flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
              Recent Reviews
            </h2>
            <Link
              href="/dashboard/reviews"
              className="flex items-center gap-2 text-base font-medium transition-all-smooth hover:gap-3"
              style={{ color: 'var(--accent-secondary)' }}
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="dashboard-panel-body">
          {recentReviews.length === 0 ? (
            <div className="py-12 text-center sm:py-14">
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                }}
              >
                <History
                  size={40}
                  strokeWidth={1.5}
                  style={{ color: 'var(--accent-primary)' }}
                />
              </div>
              <p
                className="text-lg font-medium sm:text-xl"
                style={{ color: 'var(--text-primary)' }}
              >
                No reviews yet
              </p>
              <p
                className="mx-auto mt-3 max-w-sm text-base leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                Upload code to a project and start reviewing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => {
                const ModeIcon = modeIcons[review.mode];
                return (
                  <Link
                    key={review.id}
                    href={`/dashboard/reviews/${review.id}`}
                    className="dashboard-list-item flex items-center justify-between gap-4"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <ModeIcon
                        size={22}
                        style={{ color: modeColors[review.mode] }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold sm:text-lg">
                          {review.project?.name || 'Unknown'} —{' '}
                          {review.mode.toLowerCase()}
                        </p>
                        <p
                          className="mt-1 text-sm sm:text-base"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {formatDate(review.createdAt)} ·{' '}
                          {review._count?.issues || 0} issues
                        </p>
                      </div>
                    </div>
                    <span
                      className="badge shrink-0 text-sm capitalize"
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
                  </Link>
                );
              })}
            </div>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
