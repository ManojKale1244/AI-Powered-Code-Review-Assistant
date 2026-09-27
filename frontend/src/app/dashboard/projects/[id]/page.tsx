'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Project, CodeFile, Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  FolderOpen,
  FileCode,
  Upload,
  Plus,
  Play,
  FileText,
  TestTube,
  Trash2,
  Code,
  Shield,
  Zap,
  BarChart3,
  X,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New file form
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('');

  // Upload files form
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Review form
  const [reviewMode, setReviewMode] = useState<'SECURITY' | 'PERFORMANCE' | 'QUALITY'>('SECURITY');
  const [reviewScope, setReviewScope] = useState<'FULL_PROJECT' | 'SINGLE_FILE'>('FULL_PROJECT');

  // Bonus feature outputs modal
  const [bonusResult, setBonusResult] = useState<{ title: string; content: string } | null>(null);

  const { data: project, isLoading: isProjectLoading, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get<Project>(`/projects/${projectId}`),
  });

  const selectedFile = project?.files?.find((f) => f.id === selectedFileId) || project?.files?.[0];

  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isUploadingDirect, setIsUploadingDirect] = useState(false);
  const [directUploadMessage, setDirectUploadMessage] = useState('');

  // Upload file / Zip mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploadError('');
      if (selectedFiles.length === 0) return;
      return api.uploadFiles(`/projects/${projectId}/files/upload`, selectedFiles);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await refetch();
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      setUploadError('');
    },
    onError: (err: any) => {
      setUploadError(err?.message || 'Failed to upload files. Please try again.');
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/files`, {
        path: filePath,
        content: fileContent,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await refetch();
      setIsNewFileModalOpen(false);
      setFilePath('');
      setFileContent('');
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => api.delete(`/files/${fileId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await refetch();
      if (selectedFileId) setSelectedFileId(null);
    },
  });

  const uploadDirectFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingDirect(true);
    setDirectUploadMessage(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`);
    try {
      await api.uploadFiles(`/projects/${projectId}/files/upload`, files);
      await queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await refetch();
    } catch (err: any) {
      alert(err?.message || 'Failed to upload files');
    } finally {
      setIsUploadingDirect(false);
      setDirectUploadMessage('');
    }
  };

  const loadSampleFilesMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/projects/${projectId}/files`, {
        path: 'src/auth.controller.ts',
        content: `import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  // Security Finding: Hardcoded secret key
  private readonly jwtSecret = 'super-secret-jwt-key-hardcoded-12345';

  @Post('login')
  async login(@Body() body: any) {
    if (body.username === 'admin' && body.password === 'admin123') {
      return { token: this.jwtSecret, status: 'authenticated' };
    }
    return { error: 'Invalid credentials' };
  }
}
`,
      });

      await api.post(`/projects/${projectId}/files`, {
        path: 'src/database.service.ts',
        content: `import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
  // Performance Finding: Synchronous file I/O blocking the event loop
  getUserRecord(userId: string) {
    const rawData = fs.readFileSync('./users.json', 'utf8');
    const users = JSON.parse(rawData);
    return users.find((u: any) => u.id === userId);
  }
}
`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const [reviewError, setReviewError] = useState('');

  // Trigger review mutation
  const triggerReviewMutation = useMutation({
    mutationFn: () => {
      setReviewError('');
      return api.post<Review>('/reviews', {
        projectId,
        mode: reviewMode,
        scope: reviewScope === 'FULL_PROJECT' ? 'PROJECT' : 'SINGLE_FILE',
        fileId: reviewScope === 'SINGLE_FILE' ? selectedFile?.id : undefined,
        filePaths: reviewScope === 'SINGLE_FILE' && selectedFile ? [selectedFile.path] : undefined,
      });
    },
    onSuccess: (review) => {
      setIsReviewModalOpen(false);
      setReviewError('');
      router.push(`/dashboard/reviews/${review.id}`);
    },
    onError: (err: any) => {
      setReviewError(err?.message || 'Failed to trigger review. Please try again.');
    },
  });

  // Bonus: Doc Gen mutation
  const generateDocsMutation = useMutation({
    mutationFn: () =>
      api.post<{ documentation: string }>(`/reviews/generate-docs`, {
        projectId,
        fileId: selectedFile?.id,
      }),
    onSuccess: (data) => {
      setBonusResult({
        title: `Generated Documentation (${selectedFile ? selectedFile.path : 'Project'})`,
        content: data.documentation,
      });
    },
  });

  // Bonus: Test Gen mutation
  const generateTestsMutation = useMutation({
    mutationFn: () =>
      api.post<{ tests: string }>(`/reviews/generate-tests`, {
        projectId,
        fileId: selectedFile?.id,
      }),
    onSuccess: (data) => {
      setBonusResult({
        title: `Generated Unit Tests (${selectedFile ? selectedFile.path : 'Project'})`,
        content: data.tests,
      });
    },
  });

  if (isProjectLoading) {
    return (
      <div className="max-w-6xl animate-fade-in py-12 flex justify-center">
        <div className="loader" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl animate-fade-in text-center py-12">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <button onClick={() => router.push('/dashboard/projects')} className="btn btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="text-xs flex items-center gap-1 mb-2 hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={14} /> Back to Projects
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FolderOpen style={{ color: 'var(--accent-secondary)' }} />
            {project.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {project.description || 'No description provided'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2 text-xs py-2 px-3"
          >
            <Upload size={15} /> Upload Code / ZIP
          </button>
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2 text-xs py-2 px-3"
          >
            <Plus size={15} /> Add File
          </button>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            disabled={!project.files || project.files.length === 0}
            className="btn btn-primary flex items-center gap-2 text-xs py-2 px-4"
          >
            <Play size={15} /> Run AI Review
          </button>
        </div>
      </div>

      {/* Main Grid: File List & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Files Explorer */}
        <div className="lg:col-span-4 card p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <FileCode size={16} style={{ color: 'var(--accent-secondary)' }} />
              Project Files ({project.files?.length || 0})
            </h3>
          </div>

          {!project.files || project.files.length === 0 ? (
            <div className="text-center py-8">
              <Code size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No files uploaded yet</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn btn-secondary mt-3 text-xs py-1.5 px-3"
              >
                Upload File or ZIP
              </button>
            </div>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {project.files.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-all-smooth group"
                    style={{
                      background: isSelected ? 'var(--bg-hover)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode size={15} style={{ color: isSelected ? 'var(--accent-secondary)' : 'var(--text-muted)' }} />
                      <span className="truncate font-mono">{file.path}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete file ${file.path}?`)) {
                          deleteFileMutation.mutate(file.id);
                        }
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all-smooth"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: File Viewer & Bonus AI Actions */}
        <div className="lg:col-span-8 space-y-4">
          {selectedFile ? (
            <div className="card p-0 overflow-hidden">
              {/* File Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                <div>
                  <span className="font-mono text-sm font-semibold">{selectedFile.path}</span>
                  <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>
                    {selectedFile.language || selectedFile.extension || 'text'} · {(selectedFile as any).sizeBytes ?? (selectedFile as any).size ?? 0} bytes
                  </span>
                </div>

                {/* Bonus Generator Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateDocsMutation.mutate()}
                    disabled={generateDocsMutation.isPending}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    title="Generate JSDoc/Markdown documentation"
                  >
                    {generateDocsMutation.isPending ? (
                      <div className="loader" style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <FileText size={14} className="text-blue-400" />
                    )}
                    Gen Docs
                  </button>

                  <button
                    onClick={() => generateTestsMutation.mutate()}
                    disabled={generateTestsMutation.isPending}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    title="Generate unit test suites"
                  >
                    {generateTestsMutation.isPending ? (
                      <div className="loader" style={{ width: '12px', height: '12px' }} />
                    ) : (
                      <TestTube size={14} className="text-emerald-400" />
                    )}
                    Gen Tests
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-4 font-mono text-xs overflow-x-auto max-h-[550px] overflow-y-auto" style={{ background: '#090d16' }}>
                <pre className="text-gray-300 leading-relaxed">
                  {selectedFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="table-row">
                      <span className="table-cell select-none pr-4 text-right" style={{ color: 'var(--text-muted)', width: '40px' }}>
                        {idx + 1}
                      </span>
                      <span className="table-cell whitespace-pre">{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          ) : !project.files || project.files.length === 0 ? (
            isUploadingDirect ? (
              <div className="card text-center py-16 px-6 flex flex-col items-center justify-center space-y-4">
                <div className="loader" style={{ width: '36px', height: '36px' }} />
                <h4 className="text-base font-semibold text-indigo-400">{directUploadMessage || 'Uploading files...'}</h4>
                <p className="text-xs text-slate-400">Parsing and indexing project files, please wait...</p>
              </div>
            ) : (
            <div
              className={`card text-center py-14 px-6 border-2 border-dashed transition-all flex flex-col items-center justify-center ${
                isDraggingUpload ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-indigo-500/50'
              }`}
              style={{
                borderColor: isDraggingUpload ? 'var(--accent-secondary)' : 'var(--border-primary)',
                background: isDraggingUpload ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-secondary)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingUpload(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  uploadDirectFiles(Array.from(e.dataTransfer.files));
                }
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' }}
              >
                <Upload size={28} style={{ color: 'var(--accent-secondary)' }} />
              </div>

              <h3 className="text-lg font-bold mb-1">No Files in This Project Yet</h3>
              <p className="text-xs max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
                Drag &amp; drop code files, an entire folder, or a .zip archive anywhere here, or load sample code to test AI reviews immediately.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('direct-file-input')?.click()}
                  className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  <Upload size={14} /> Select Files / ZIP
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('direct-folder-input')?.click()}
                  className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  <FolderOpen size={14} /> Select Folder
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleFilesMutation.mutate()}
                  disabled={loadSampleFilesMutation.isPending}
                  className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-2"
                >
                  {loadSampleFilesMutation.isPending ? (
                    <div className="loader" style={{ width: '12px', height: '12px' }} />
                  ) : (
                    <Sparkles size={14} className="text-amber-400" />
                  )}
                  Load Sample Code
                </button>
              </div>

              <input
                id="direct-file-input"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    uploadDirectFiles(Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
              />
              <input
                id="direct-folder-input"
                type="file"
                multiple
                {...({ webkitdirectory: '', directory: '' } as any)}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    uploadDirectFiles(Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
              />
            </div>
            )
          ) : (
            <div className="card text-center py-16">
              <FileCode size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Select a file from the explorer on the left to view its code</p>
            </div>
          )}
        </div>
      </div>

      {/* Trigger Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card w-full max-w-lg relative animate-fade-in">
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Sparkles size={20} style={{ color: 'var(--accent-secondary)' }} />
              Configure AI Code Review
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Select review focus mode and analysis scope
            </p>

            {reviewError && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-red-950/80 border border-red-500/50 text-red-200">
                {reviewError}
              </div>
            )}

            <div className="space-y-4">
              {/* Mode selection */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Review Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'SECURITY', label: 'Security', icon: Shield, color: '#ef4444', desc: 'OWASP vulnerabilities, sanitization, secrets' },
                    { id: 'PERFORMANCE', label: 'Performance', icon: Zap, color: '#eab308', desc: 'Memory leaks, complexity, query bottlenecks' },
                    { id: 'QUALITY', label: 'Quality', icon: BarChart3, color: '#3b82f6', desc: 'Clean code, design patterns, maintainability' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setReviewMode(m.id as any)}
                      className="p-3 rounded-xl cursor-pointer border transition-all-smooth flex flex-col items-center text-center"
                      style={{
                        background: reviewMode === m.id ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                        borderColor: reviewMode === m.id ? m.color : 'var(--border-primary)',
                      }}
                    >
                      <m.icon size={22} style={{ color: m.color }} className="mb-1" />
                      <span className="text-xs font-semibold">{m.label}</span>
                      <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope selection */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Review Scope
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewScope('FULL_PROJECT')}
                    className="p-3 rounded-xl text-left border transition-all-smooth"
                    style={{
                      background: reviewScope === 'FULL_PROJECT' ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      borderColor: reviewScope === 'FULL_PROJECT' ? 'var(--accent-primary)' : 'var(--border-primary)',
                    }}
                  >
                    <p className="text-xs font-semibold mb-0.5">Full Project</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Analyze all project files as a cohesive codebase</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewScope('SINGLE_FILE')}
                    disabled={!selectedFile}
                    className="p-3 rounded-xl text-left border transition-all-smooth disabled:opacity-50"
                    style={{
                      background: reviewScope === 'SINGLE_FILE' ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                      borderColor: reviewScope === 'SINGLE_FILE' ? 'var(--accent-primary)' : 'var(--border-primary)',
                    }}
                  >
                    <p className="text-xs font-semibold mb-0.5">Selected File</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {selectedFile ? selectedFile.path : 'Select a file first'}
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsReviewModalOpen(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() => triggerReviewMutation.mutate()}
                  disabled={triggerReviewMutation.isPending}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {triggerReviewMutation.isPending ? (
                    <>
                      <div className="loader" style={{ width: '18px', height: '18px' }} />
                      Analyzing...
                    </>
                  ) : (
                    'Start AI Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New File Modal */}
      {isNewFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card w-full max-w-lg relative animate-fade-in">
            <button onClick={() => setIsNewFileModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Code File</h2>
            <form onSubmit={(e) => { e.preventDefault(); createFileMutation.mutate(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  File Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., src/auth/auth.service.ts"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="input font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Code Content *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="// Paste your code here..."
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="input font-mono text-xs resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsNewFileModalOpen(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={createFileMutation.isPending} className="btn btn-primary flex-1">
                  {createFileMutation.isPending ? 'Saving...' : 'Add File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File / ZIP Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card w-full max-w-md relative animate-fade-in">
            <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Upload Code Files or ZIP</h2>

            {uploadError && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-red-950/80 border border-red-500/50 text-red-200">
                {uploadError}
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                isDraggingUpload
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'hover:border-indigo-500/50'
              }`}
              style={{
                borderColor: isDraggingUpload ? 'var(--accent-secondary)' : 'var(--border-primary)',
                background: isDraggingUpload ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingUpload(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  setSelectedFiles(Array.from(e.dataTransfer.files));
                }
              }}
            >
              <Upload size={32} className="mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-indigo-400">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (
                      {(
                        selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024
                      ).toFixed(1)}{' '}
                      KB)
                    </span>
                  </div>
                  <div className="max-h-28 overflow-y-auto text-[11px] flex flex-wrap justify-center gap-1.5 p-1">
                    {selectedFiles.slice(0, 8).map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                      >
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="text-slate-400 hover:text-red-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {selectedFiles.length > 8 && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-cyan-400 text-xs">
                        +{selectedFiles.length - 8} more
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('project-file-upload')?.click();
                      }}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Add more files
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles([]);
                        const fileInput = document.getElementById('project-file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                        const folderInput = document.getElementById('project-folder-upload') as HTMLInputElement;
                        if (folderInput) folderInput.value = '';
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag and drop files here, or choose an option:
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => document.getElementById('project-file-upload')?.click()}
                      className="btn btn-secondary py-1 px-2.5 text-xs"
                    >
                      Select Files / ZIP
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('project-folder-upload')?.click()}
                      className="btn btn-secondary py-1 px-2.5 text-xs"
                    >
                      Select Folder
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Supports multiple files (.ts, .js, .py, .go, .java), folder, or .zip
                  </p>
                </div>
              )}
              <input
                id="project-file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
                  }
                  e.target.value = '';
                }}
              />
              <input
                id="project-folder-upload"
                type="file"
                multiple
                {...({ webkitdirectory: '', directory: '' } as any)}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFiles(Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedFiles.length === 0 || uploadMutation.isPending}
                onClick={() => uploadMutation.mutate()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="loader" style={{ width: '18px', height: '18px' }} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Upload Files'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Result Modal (Docs / Tests) */}
      {bonusResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card w-full max-w-3xl relative animate-fade-in max-h-[85vh] flex flex-col">
            <button onClick={() => setBonusResult(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Sparkles size={18} style={{ color: 'var(--accent-secondary)' }} />
              {bonusResult.title}
            </h2>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl font-mono text-xs" style={{ background: '#090d16' }}>
              <pre className="text-gray-300 whitespace-pre-wrap">{bonusResult.content}</pre>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bonusResult.content);
                  alert('Copied to clipboard!');
                }}
                className="btn btn-secondary text-xs py-2 px-4"
              >
                Copy Content
              </button>
              <button onClick={() => setBonusResult(null)} className="btn btn-primary text-xs py-2 px-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
