'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AIProviderConfig } from '@/lib/types';
import { useAuthStore } from '@/lib/auth-store';
import {
  User,
  Shield,
  Cpu,
  Key,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [providerType, setProviderType] = useState<string>('OPENAI');
  const [name, setName] = useState<string>('My OpenAI Config');
  const [baseUrl, setBaseUrl] = useState<string>('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gpt-4o');
  const [isDefault, setIsDefault] = useState<boolean>(true);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preset default URLs per provider
  const handleProviderTypeChange = (type: string) => {
    setProviderType(type);
    if (type === 'OPENAI') {
      setName('OpenAI Cloud');
      setBaseUrl('https://api.openai.com/v1');
      setModel('gpt-4o');
    } else if (type === 'LM_STUDIO') {
      setName('Local LM Studio');
      setBaseUrl('http://localhost:1234/v1');
      setModel('qwen2.5-coder-7b-instruct');
    } else if (type === 'OLLAMA') {
      setName('Local Ollama');
      setBaseUrl('http://localhost:11434/v1');
      setModel('codellama');
    } else if (type === 'OPEN_ROUTER') {
      setName('OpenRouter Gateway');
      setBaseUrl('https://openrouter.ai/api/v1');
      setModel('anthropic/claude-3.5-sonnet');
    } else {
      setName('Custom AI Provider');
      setBaseUrl('');
      setModel('custom-model');
    }
  };

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => api.get<AIProviderConfig[]>('/ai/providers'),
  });

  const createConfigMutation = useMutation({
    mutationFn: () =>
      api.post<AIProviderConfig>('/ai/providers', {
        providerType,
        name,
        baseUrl: baseUrl || undefined,
        apiKey: apiKey || undefined,
        model,
        isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      setApiKey('');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/ai/providers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; message: string }>('/ai/providers/test', {
        providerType,
        baseUrl: baseUrl || undefined,
        apiKey: apiKey || undefined,
        model,
      }),
    onSuccess: (res) => {
      setTestResult(res);
    },
    onError: () => {
      setTestResult({ success: false, message: 'Unable to connect to provider.' });
    },
  });

  return (
    <div className="max-w-4xl animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Account & Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your profile, configure AI Providers (OpenAI, LM Studio, Ollama, OpenRouter), and security controls
        </p>
      </div>

      {/* Premium Subscription Card */}
      <div
        className="card p-6 border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          borderColor: 'rgba(168, 85, 247, 0.4)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="badge font-bold text-xs uppercase px-2.5 py-1"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white' }}
              >
                PRO Enterprise Tier
              </span>
              <span className="text-xs font-semibold text-emerald-400">● Active Plan</span>
            </div>
            <h2 className="text-xl font-bold mt-2">AI Code Review Assistant — Professional</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Includes unlimited security audits, performance profiling, codebase context chat, and test suite generator.
            </p>
          </div>
        </div>
      </div>

      {/* AI Provider Configurator (Section 13 & 14) */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Cpu size={18} style={{ color: 'var(--accent-secondary)' }} />
            Configure AI Provider (OpenAI, LM Studio, Ollama, OpenRouter)
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createConfigMutation.mutate();
          }}
          className="space-y-4 pt-2 border-t"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                Provider Type *
              </label>
              <select
                value={providerType}
                onChange={(e) => handleProviderTypeChange(e.target.value)}
                className="input text-xs"
              >
                <option value="OPENAI">OpenAI Cloud API</option>
                <option value="LM_STUDIO">LM Studio (Local Host)</option>
                <option value="OLLAMA">Ollama (Local Host)</option>
                <option value="OPEN_ROUTER">OpenRouter Gateway</option>
                <option value="COMPATIBLE">Custom OpenAI-Compatible API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                Config Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input text-xs"
                placeholder="e.g. Local LM Studio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                Base URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="input text-xs font-mono"
                placeholder="e.g. http://localhost:1234/v1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
                Model Name *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input text-xs font-mono"
                placeholder="e.g. gpt-4o, qwen2.5-coder"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>
              API Key (Masked & Encrypted at Rest)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input text-xs font-mono"
              placeholder="•••••••••••••••••••• (Leave blank for offline local models)"
            />
          </div>

          {/* Test Connection Alert Banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-center justify-between text-xs animate-fade-in ${
                testResult.success ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span className="font-semibold">{testResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={testConnectionMutation.isPending}
              onClick={() => testConnectionMutation.mutate()}
              className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-2"
            >
              {testConnectionMutation.isPending ? (
                <div className="loader" style={{ width: '14px', height: '14px' }} />
              ) : (
                <LinkIcon size={14} />
              )}
              Test Connection
            </button>

            <button
              type="submit"
              disabled={createConfigMutation.isPending}
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              {createConfigMutation.isPending ? (
                <div className="loader" style={{ width: '14px', height: '14px' }} />
              ) : (
                <Plus size={14} />
              )}
              Save Configuration
            </button>
          </div>
        </form>

        {/* Existing Configs List */}
        <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="font-semibold text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
            Saved Providers ({configs.length})
          </h3>

          {isLoading ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading configs...</p>
          ) : configs.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No custom AI provider configured. Add your OpenAI API key or LM Studio local endpoint above.
            </p>
          ) : (
            configs.map((cfg) => (
              <div
                key={cfg.id}
                className="p-3 rounded-xl flex items-center justify-between text-xs"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{cfg.name}</span>
                    <span className="badge text-[10px] uppercase font-bold" style={{ background: 'var(--bg-hover)' }}>
                      {cfg.providerType}
                    </span>
                    {cfg.isDefault && (
                      <span className="badge text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">Default</span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Model: <span className="font-mono">{cfg.model}</span> · Base URL: <span className="font-mono">{cfg.baseUrl || 'Default Cloud'}</span> · Key: <span className="font-mono">••••••••</span>
                  </p>
                </div>

                <button
                  onClick={() => deleteConfigMutation.mutate(cfg.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <User size={18} style={{ color: 'var(--accent-secondary)' }} />
          User Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Full Name
            </label>
            <input type="text" readOnly value={user?.name || ''} className="input text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Email Address
            </label>
            <input type="email" readOnly value={user?.email || ''} className="input text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
