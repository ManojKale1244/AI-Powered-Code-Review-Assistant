'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  FileCode,
  ArrowRight,
  X,
  Search,
} from 'lucide-react';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [search, setSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [modalError, setModalError] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
  });

  const createProject = useMutation({
    mutationFn: async () => {
      setModalError('');
      const project = await api.post<Project>('/projects', {
        name,
        description,
        language,
      });

      if (selectedFiles.length > 0 && project.id) {
        await api.uploadFiles(`/projects/${project.id}/files/upload`, selectedFiles);
      }

      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setSelectedFiles([]);
      setModalError('');
    },
    onError: (err: any) => {
      setModalError(err?.message || 'Failed to create project. Please try again.');
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your codebases and upload code for AI analysis
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card h-44 animate-pulse opacity-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <FolderOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-1">No projects found</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No projects match your search query' : 'Create your first project to start reviewing code'}
          </p>
          {!search && (
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              <Plus size={18} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <div key={project.id} className="card flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                    <FolderOpen size={22} style={{ color: 'var(--accent-secondary)' }} />
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete project? This will remove all files and reviews.')) {
                        deleteProject.mutate(project.id);
                      }
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all-smooth"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {project.description || 'No description provided'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-4 py-2 px-3 rounded-lg"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <FileCode size={14} /> {project._count?.files || 0} files
                  </span>
                  <span className="uppercase font-semibold">{project.language || 'TS'}</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>

                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="btn btn-secondary w-full justify-between group-hover:border-indigo-500/40"
                  style={{ fontSize: '13px' }}
                >
                  View Project <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating a new project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card w-full max-w-md relative animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Create New Project</h2>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-red-950/80 border border-red-500/50 text-red-200">
                {modalError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProject.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-Commerce Microservice"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of the codebase..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Primary Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="input"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Initial Code Upload (Optional)
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'hover:border-indigo-500/50'
                  }`}
                  style={{
                    borderColor: isDragging ? 'var(--accent-secondary)' : 'var(--border-primary)',
                    background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      setSelectedFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                >
                  <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--accent-secondary)' }} />
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
                            document.getElementById('file-upload-input')?.click();
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
                            const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                            if (fileInput) fileInput.value = '';
                            const folderInput = document.getElementById('folder-upload-input') as HTMLInputElement;
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
                      <p className="text-xs font-medium">
                        Drag and drop files here, or choose an option:
                      </p>
                      <div className="flex justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                          className="btn btn-secondary py-1 px-2.5 text-xs"
                        >
                          Select Files / ZIP
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById('folder-upload-input')?.click()}
                          className="btn btn-secondary py-1 px-2.5 text-xs"
                        >
                          Select Folder
                        </button>
                      </div>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Supports multiple source files, folder tree, or a .zip archive
                      </p>
                    </div>
                  )}
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
                      }
                    }}
                  />
                  <input
                    id="folder-upload-input"
                    type="file"
                    multiple
                    {...({ webkitdirectory: '', directory: '' } as any)}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createProject.isPending ? (
                    <>
                      <div className="loader" style={{ width: '18px', height: '18px' }} />
                      <span>{selectedFiles.length > 0 ? 'Uploading files...' : 'Creating...'}</span>
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
