# 🛡️ AI-Powered Code Review Assistant

> **Enterprise-Grade Automated Code Review, Vulnerability Auditing, Codebase Chat, and Test Generation Platform.**  
> Built with Next.js 15, NestJS, TypeScript, Prisma ORM, and Multi-LLM Orchestration (OpenAI, OpenRouter, LM Studio, Ollama).

---

## 📑 Table of Contents
1. [Executive Overview](#-executive-overview)
2. [Key Capabilities & Feature Matrix](#-key-capabilities--feature-matrix)
3. [Technology Stack](#-technology-stack)
4. [High-Level Architecture](#-high-level-architecture)
5. [Getting Started (Two Deployment Tracks)](#-getting-started)
   - [Track A: Instant Zero-Config (SQLite Local)](#track-a-instant-zero-config-sqlite-local)
   - [Track B: Production Docker (PostgreSQL)](#track-b-production-docker-postgresql)
6. [Environment Variables Reference](#-environment-variables-reference)
7. [Comprehensive REST API Reference](#-comprehensive-rest-api-reference)
8. [AI Provider Configuration Guide](#-ai-provider-configuration-guide)
9. [Security, Privacy & Encryption](#-security-privacy--encryption)
10. [Testing & Quality Assurance](#-testing--quality-assurance)
11. [License & Acknowledgments](#-license--acknowledgments)

---

## 🌟 Executive Overview

The **AI-Powered Code Review Assistant** is an end-to-end pair-programming and code audit system engineered to accelerate code quality assurance in modern engineering teams. It analyzes codebases across three core audit dimensions:
1. **Security Vulnerabilities** (OWASP Top 10, credential leaks, injection vectors, unsafe deserialization).
2. **Performance Bottlenecks** (Event loop blocking, excessive memory allocation, unoptimized I/O, N+1 query patterns).
3. **Code Quality & Architecture** (SOLID principles, DRY violations, circular dependencies, type safety regressions).

Equipped with an **interactive codebase-grounded AI chat**, an **automated unit test generator**, and **documentation synthesizers**, the platform ensures developer velocity without sacrificing architectural rigor.

---

## 🚀 Key Capabilities & Feature Matrix

| Feature | Description | Enterprise Value |
|---|---|---|
| **Multi-Mode Code Review** | Deep inspection targeting **Security**, **Performance**, or **Quality** with scorecards (0–100) and severity ratings (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`). | Pinpoints urgent security hazards and algorithmic regressions before pull requests merge. |
| **Full Project & Single File Scopes** | Audit an entire repository context or focus specifically on a single changed file. | Flexible CI/CD and developer workstation review workflows. |
| **Multi-LLM Provider Strategy** | Seamless integration with **OpenAI** (`gpt-4o`), **OpenRouter** (Claude 3.5 Sonnet, DeepSeek R1), and **Local Offline Engines** (**LM Studio**, **Ollama**). | Eliminates vendor lock-in, ensures compliance for sensitive IP, and supports zero-cost local inference. |
| **Zero-Downtime Static Fallback** | Built-in heuristic static analysis engine triggers automatically if external LLM quotas are exhausted or offline. | 100% platform availability even during cloud API outages. |
| **Ground-Truth Codebase Chat** | Interactive chat assistant with direct project code context, automatic file citations, and session history tracking. | Instant architectural onboarding and codebase Q&A without leaking context outside the project boundary. |
| **Automated Documentation** | Generates production-ready JSDoc / Markdown technical documentation directly from AST and file content. | Keeps technical specifications synchronized with active code. |
| **Unit Test Suite Generator** | Synthesizes comprehensive unit tests (Jest, PyTest, Go test) covering edge cases and exception handling. | Dramatically increases test coverage with zero boilerplate burden on developers. |
| **ZIP & Multi-File Ingestion** | Drag-and-drop ZIP archive upload with automated decompression, directory filtering, and Zip-Slip attack prevention. | Instant project onboarding with zero manual file creation. |
| **AES-256-GCM Key Encryption** | All user-supplied AI Provider API keys are encrypted at rest using authenticated AES-256-GCM encryption. | Enterprise credential isolation and cryptographic defense against database leaks. |

---

## 🛠️ Technology Stack

```
+-------------------------------------------------------------------------------+
| FRONTEND LAYER                                                                |
| Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · TanStack    |
| Query v5 · Lucide Icons · Monaco/Prism Syntax Highlighting                   |
+-------------------------------------------------------------------------------+
                                        │ (HTTP / REST with Credentials)
+-------------------------------------------------------------------------------+
| BACKEND API LAYER                                                             |
| NestJS 11 · TypeScript · Express · Class-Validator · Passport JWT · AdmZip   |
+-------------------------------------------------------------------------------+
                                        │ (Prisma Client)
+-------------------------------------------------------------------------------+
| PERSISTENCE & DATA LAYER                                                      |
| SQLite (Zero-Config Dev) / PostgreSQL 16 (Production) · Prisma ORM Migrate   |
+-------------------------------------------------------------------------------+
                                        │ (Unified AI Strategy)
+-------------------------------------------------------------------------------+
| AI & INFERENCE ENGINE                                                         |
| OpenAI API · OpenRouter Gateway · LM Studio · Ollama · Static Heuristics     |
+-------------------------------------------------------------------------------+
```

---

## 📐 High-Level Architecture

For detailed architectural schematics, sequence diagrams, and design decisions, refer to [ARCHITECTURE.md](file:///c:/Users/manoj/OneDrive/Desktop/Backup/Sigma%20Apna%20College/MAJOR%20PROJECTS/AI%20Code%20Review/ARCHITECTURE.md).

For comprehensive prompt engineering templates and resilience pipelines, refer to [AI_USAGE.md](file:///c:/Users/manoj/OneDrive/Desktop/Backup/Sigma%20Apna%20College/MAJOR%20PROJECTS/AI%20Code%20Review/AI_USAGE.md).

---

## 🏁 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Git**

---

### Track A: Instant Zero-Config (SQLite Local)

The fastest way to test and run the full stack locally with **zero external database dependencies**:

1. **Clone Repository & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd "AI Code Review"

   # Install Backend Dependencies
   cd backend
   npm install

   # Install Frontend Dependencies
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   # From the project root
   cp .env.example .env
   ```
   *(The backend is pre-configured to utilize `DATABASE_URL="file:./dev.db"` out of the box).*

3. **Initialize Database Schema**:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

4. **Launch Development Servers**:
   - **Terminal 1 (Backend API - Port 3001)**:
     ```bash
     cd backend
     npm run start:dev
     ```
   - **Terminal 2 (Frontend Client - Port 3000)**:
     ```bash
     cd frontend
     npm run dev
     ```

5. **Access Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser. Register an account and begin reviewing code.

---

### Track B: Production Docker (PostgreSQL)

For production deployment with PostgreSQL 16:

1. **Start Docker Services**:
   ```bash
   docker compose up -d
   ```
2. **Switch Database Provider in `backend/prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. **Execute Prisma Migrations**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

---

## ⚙️ Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
|---|:---:|---|---|
| `PORT` | Yes | `3001` | Port on which the NestJS backend listens. |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `production`, `test`). |
| `DATABASE_URL` | Yes | `file:./dev.db` | Database connection string (SQLite file URI or PostgreSQL DSN). |
| `JWT_SECRET` | Yes | *Cryptographic 64-char string* | Secret key used to sign and verify short-lived access tokens. |
| `JWT_EXPIRATION` | Yes | `7d` | Access token lifespan. |
| `JWT_REFRESH_SECRET` | Yes | *Cryptographic 64-char string* | Secret key for issuing refresh tokens. |
| `JWT_REFRESH_EXPIRATION` | Yes | `7d` | Refresh token lifespan stored in HTTP-only cookies. |
| `ENCRYPTION_KEY` | Yes | *64 hex characters (32 bytes)* | AES-256-GCM key used to encrypt AI Provider API keys at rest. |
| `MAX_FILE_SIZE` | No | `52428800` (50MB) | Maximum payload size for file/zip uploads. |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Allowed CORS origin for the frontend client. |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001/api` | Base API endpoint exposed to the Next.js client. |

---

## 📡 Comprehensive REST API Reference

All protected endpoints require authentication via JWT bearer token in the `Authorization: Bearer <token>` header or valid HTTP-only session cookies.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate and issue JWT cookies | `{ email, password }` |
| `POST` | `/api/auth/logout` | Clear authentication cookies | None |
| `POST` | `/api/auth/refresh` | Rotate access token using refresh cookie | None |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | None |

### 📁 Projects (`/api/projects`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/projects` | List all projects belonging to user | None |
| `POST` | `/api/projects` | Create a new project workspace | `{ name, description?, language? }` |
| `GET` | `/api/projects/:id` | Get project detail with indexed files | None |
| `PUT` | `/api/projects/:id` | Update project metadata | `{ name?, description?, language? }` |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-remove files | None |

### 📄 Files & Uploads (`/api/projects/:projectId/files`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/files/upload` | Multipart upload (multiple files / folders / zip) | `FormData: files[]` |
| `POST` | `/api/projects/:projectId/files` | Create single file manually | `{ path, content }` |
| `GET` | `/api/projects/:projectId/files` | Fetch file tree hierarchy | None |
| `GET` | `/api/files/:fileId` | Fetch individual file source content | None |
| `DELETE` | `/api/files/:fileId` | Delete specific file from project | None |

### 🤖 Reviews & AI Audits (`/api/reviews`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `POST` | `/api/reviews` | Trigger AI review | `{ projectId, mode, scope, fileId?, filePaths? }` |
| `GET` | `/api/reviews` | List past reviews (filters: project, mode) | Query params: `projectId`, `mode`, `page` |
| `GET` | `/api/reviews/:id` | Retrieve comprehensive review result & issues | None |
| `POST` | `/api/reviews/generate-docs` | Generate JSDoc/Markdown documentation | `{ projectId, fileId? }` |
| `POST` | `/api/reviews/generate-tests` | Generate unit test suites | `{ projectId, fileId? }` |

### 💬 Codebase Chat (`/api/chat`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/chat/sessions` | List active chat sessions | Optional Query: `projectId` |
| `POST` | `/api/chat/sessions` | Create a new chat session | `{ title, projectId? }` |
| `GET` | `/api/chat/sessions/:sessionId` | Retrieve chat session with messages | None |
| `POST` | `/api/chat/sessions/:sessionId/messages`| Send message and receive AI response | `{ content }` |
| `DELETE` | `/api/chat/sessions/:sessionId` | Delete chat session & conversation | None |

### ⚙️ AI Providers (`/api/ai/providers`)
| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/ai/providers` | List saved provider configurations | None |
| `POST` | `/api/ai/providers` | Save new provider configuration | `{ providerType, name, apiKey?, baseUrl?, model, isDefault? }` |
| `POST` | `/api/ai/providers/test` | Validate provider connectivity | `{ providerType, apiKey?, baseUrl?, model }` |
| `DELETE` | `/api/ai/providers/:id` | Remove provider configuration | None |

---

## 🤖 AI Provider Configuration Guide

The assistant supports **Bring Your Own Model (BYOM)** architecture. Configure any of the following options in **Dashboard → Settings**:

### Option 1: OpenRouter (Free Cloud Models — No Credit Card Required)
1. Sign up at [openrouter.ai](https://openrouter.ai/keys) and create a free API key.
2. In Settings:
   - **Provider Type:** `OpenRouter Gateway`
   - **Base URL:** `https://openrouter.ai/api/v1`
   - **Model:** `google/gemini-2.0-flash-exp:free` or `meta-llama/llama-3.2-3b-instruct:free`
   - **API Key:** Paste your `sk-or-v1-...` key.

### Option 2: LM Studio or Ollama (100% Local & Offline — Zero Cost)
1. Download [LM Studio](https://lmstudio.ai/) or [Ollama](https://ollama.com/).
2. Start the local server:
   - LM Studio: Start Local Server on port `1234`.
   - Ollama: Run `ollama serve` (default port `11434`).
3. In Settings:
   - **Provider Type:** `LM Studio` or `Ollama`
   - **Base URL:** `http://localhost:1234/v1` or `http://localhost:11434/v1`
   - **Model:** Model identifier loaded locally (e.g. `qwen2.5-coder-7b-instruct`).
   - **API Key:** Leave blank.

### Option 3: OpenAI Official Cloud
1. Generate an API key from [platform.openai.com](https://platform.openai.com/api-keys).
2. Ensure your account balance has positive credits ($5 minimum).
3. In Settings:
   - **Provider Type:** `OpenAI Cloud API`
   - **Model:** `gpt-4o` or `gpt-4o-mini`
   - **API Key:** Paste your `sk-proj-...` key.

---

## 🔒 Security, Privacy & Encryption

1. **At-Rest Cryptography**: AI API keys are encrypted with **AES-256-GCM** using the master `ENCRYPTION_KEY`. Neither plain-text keys nor raw initialization vectors are ever exposed in responses.
2. **Zip Slip Prevention**: During ZIP decompression, all target paths are normalized and validated to prevent directory traversal attacks (`../../`).
3. **Tenant Data Isolation**: Database queries strictly filter across all models by the authenticated `userId`.
4. **Binary Stripping**: Binary executables, images, and non-UTF-8 compiled objects are discarded during upload to protect review pipelines from payload injection.

---

## 🧪 Testing & Quality Assurance

```bash
# Run Backend Unit & Integration Tests
cd backend
npm run test

# Run End-to-End Suite
npm run test:e2e

# Run Frontend Type Checking
cd ../frontend
npx tsc --noEmit
```

---

## 📄 License
This project is licensed under the **MIT License**.
