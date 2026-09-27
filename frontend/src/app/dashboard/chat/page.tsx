'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ChatSession, ChatMessage, Project } from '@/lib/types';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  FolderOpen,
  Bot,
  User,
  Sparkles,
  Code2,
} from 'lucide-react';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [promptInput, setPromptInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all projects for context dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<Project[]>('/projects'),
  });

  // Fetch all chat sessions
  const { data: sessions = [], isLoading: isSessionsLoading } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => api.get<ChatSession[]>('/chat/sessions'),
  });

  // Fetch active session messages
  const { data: activeSession, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat-session', activeSessionId],
    queryFn: () => api.get<ChatSession>(`/chat/sessions/${activeSessionId}`),
    enabled: !!activeSessionId,
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: () =>
      api.post<ChatSession>('/chat/sessions', {
        title: selectedProjectId
          ? `Chat: ${projects.find((p) => p.id === selectedProjectId)?.name}`
          : 'New Code Assistant Session',
        projectId: selectedProjectId || undefined,
      }),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setActiveSessionId(newSession.id);
    },
  });

  // Delete session
  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/chat/sessions/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      if (activeSessionId === id) setActiveSessionId(null);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        const newSession = await createSessionMutation.mutateAsync();
        targetSessionId = newSession.id;
        setActiveSessionId(newSession.id);
      }
      const newMsg = await api.post<ChatMessage>(`/chat/sessions/${targetSessionId}/messages`, {
        content: text,
      });
      return { newMsg, targetSessionId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', data.targetSessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setPromptInput('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(promptInput);
  };

  return (
    <div className="max-w-6xl animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles size={22} style={{ color: 'var(--accent-secondary)' }} />
            AI Code Assistant Chat
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Ask questions, debug errors, or request refactoring with context from your project
          </p>
        </div>

        {/* Project Context Selector */}
        <div className="flex items-center gap-2">
          <FolderOpen size={16} style={{ color: 'var(--text-muted)' }} />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="input py-1.5 px-3 text-xs w-56"
          >
            <option value="">No Project Context (Global)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Context: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 card p-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Session List */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col max-h-48 md:max-h-none"
          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <button
              onClick={() => createSessionMutation.mutate()}
              className="btn btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Plus size={15} /> New Chat Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isSessionsLoading ? (
              <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-xs px-2" style={{ color: 'var(--text-muted)' }}>
                No active chat sessions
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-all-smooth group"
                    style={{
                      background: isActive ? 'var(--bg-hover)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={14} style={{ color: isActive ? 'var(--accent-secondary)' : 'var(--text-muted)' }} />
                      <span className="truncate font-medium">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSessionMutation.mutate(session.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all-smooth"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Messages & Input */}
        <div className="flex-1 flex flex-col justify-between" style={{ background: 'var(--bg-secondary)' }}>
          {/* Chat Messages History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!activeSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bot size={48} className="mb-3" style={{ color: 'var(--accent-secondary)' }} />
                <h3 className="text-lg font-bold mb-1">How can I help with your code today?</h3>
                <p className="text-xs max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Select a project context above to ask questions directly about your codebase files, or start a new chat session.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md w-full text-left">
                  {[
                    'Explain the architecture of this project',
                    'How can I optimize performance?',
                    'Check for potential security flaws',
                    'Write a unit test for my auth logic',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setPromptInput(prompt);
                      }}
                      className="p-3 rounded-xl border text-xs text-left transition-all-smooth hover:border-indigo-500/50"
                      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : isMessagesLoading ? (
              <div className="flex justify-center py-12">
                <div className="loader" style={{ width: '32px', height: '32px' }} />
              </div>
            ) : activeSession?.messages?.length === 0 ? (
              <div className="text-center py-12 text-xs" style={{ color: 'var(--text-muted)' }}>
                Send your first message to start the conversation!
              </div>
            ) : (
              activeSession?.messages?.map((msg) => {
                const isUser = msg.role === 'USER';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isUser ? 'var(--accent-gradient)' : 'rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      {isUser ? <User size={16} color="white" /> : <Bot size={16} style={{ color: 'var(--accent-secondary)' }} />}
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'rounded-tr-none text-white'
                          : 'rounded-tl-none border'
                      }`}
                      style={{
                        background: isUser ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        borderColor: isUser ? 'transparent' : 'var(--border-primary)',
                      }}
                    >
                      <pre className="font-sans whitespace-pre-wrap">{msg.content}</pre>
                    </div>
                  </div>
                );
              })
            )}

            {sendMessageMutation.isPending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/20">
                  <Bot size={16} style={{ color: 'var(--accent-secondary)' }} />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none border text-xs"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
                  <div className="flex items-center gap-2">
                    <div className="loader" style={{ width: '14px', height: '14px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>AI is thinking and analyzing codebase...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={selectedProjectId ? 'Ask AI about your project code...' : 'Type a message...'}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="input flex-1 text-xs py-3"
              />
              <button
                type="submit"
                disabled={!promptInput.trim() || sendMessageMutation.isPending}
                className="btn btn-primary px-4 py-3 text-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={15} /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
