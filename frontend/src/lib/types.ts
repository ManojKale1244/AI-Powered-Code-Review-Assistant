// ===========================
// User & Auth
// ===========================
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

// ===========================
// Projects & Files
// ===========================
export interface ProjectFile {
  id: string;
  path: string;
  name: string;
  extension: string | null;
  sizeBytes: number;
  content: string;
  language?: string;
  projectId?: string;
}

export type CodeFile = ProjectFile;

export interface Project {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  _count?: {
    files: number;
    reviews: number;
    chatSessions?: number;
  };
}

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  file?: ProjectFile;
}

// ===========================
// Reviews
// ===========================
export type ReviewMode = 'SECURITY' | 'PERFORMANCE' | 'QUALITY';
export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type ReviewScope = 'SINGLE_FILE' | 'MULTI_FILE' | 'FULL_PROJECT';
export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Review {
  id: string;
  mode: ReviewMode;
  status: ReviewStatus;
  scope: ReviewScope;
  summary: string | null;
  summaryText?: string | null;
  summaryScore?: number | null;
  metadata: Record<string, any> | null;
  filePaths: string[];
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  project?: { name: string };
  file?: { id: string; path: string };
  _count?: { issues: number };
  issues?: ReviewIssue[];
}

export interface ReviewIssue {
  id: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  description: string;
  filePath: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  suggestion: string | null;
  codeSnippet: string | null;
}

export interface PaginatedResponse<T> {
  reviews: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// AI Provider
// ===========================
export type ProviderType =
  | 'OPENAI'
  | 'LM_STUDIO'
  | 'COMPATIBLE'
  | 'OLLAMA'
  | 'OPEN_ROUTER';

export interface AIProviderConfig {
  id: string;
  providerType: ProviderType;
  name: string;
  baseUrl: string | null;
  model: string;
  isDefault: boolean;
  createdAt: string;
}

// ===========================
// Chat
// ===========================
export interface ChatSession {
  id: string;
  title: string;
  projectId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
  _count?: { messages: number };
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
}
