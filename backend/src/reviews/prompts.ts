import { ReviewMode } from '@prisma/client';

/**
 * Structured prompt templates for code review.
 *
 * Design decision: Templates as TypeScript constants (not DB-stored).
 * - Version-controlled with the code
 * - Type-safe (ReviewMode enum)
 * - Easy to test
 * Trade-off: Changing prompts requires redeployment. Acceptable here.
 */

const REVIEW_SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code and return a structured JSON response.

Your response MUST be valid JSON with this exact structure:
{
  "summary": "Brief overall assessment of the code",
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "category": "string (e.g., security, performance, style, bug, maintainability)",
      "title": "Short issue title",
      "description": "Detailed explanation of the issue",
      "filePath": "path/to/file.ts",
      "lineStart": 10,
      "lineEnd": 15,
      "suggestion": "Suggested fix or improvement",
      "codeSnippet": "relevant code snippet"
    }
  ]
}

Rules:
- Be specific with line numbers when possible
- Provide actionable suggestions
- Prioritize issues by severity
- Be constructive, not just critical
- Include positive observations as "info" severity`;

const MODE_INSTRUCTIONS: Record<ReviewMode, string> = {
  SECURITY: `Focus on comprehensive SECURITY AUDIT (OWASP Top 10 & CWE Standards):
Analyze the provided code specifically for:
1. Hardcoded Secrets & Credentials: API keys, passwords, private keys, JWT secrets, database connection strings.
2. Authentication Flaws: Weak password policies, broken session handling, unverified token signatures, insecure cookie attributes.
3. Authorization Problems: Missing RBAC guards, Broken Object Level Authorization (BOLA/IDOR), privilege escalation.
4. Input Validation & Injection: SQL injection, NoSQL injection, Command injection (exec, eval), Path Traversal, Missing sanitization.
5. Client-Side Vulnerabilities: Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), insecure CORS origins.
6. Data Exposure & Cryptography: Weak hash algorithms (MD5, SHA1), plain-text storage, sensitive data logged to stdout.
7. File & Infrastructure Safety: Unsafe zip extraction/file operations, missing rate limiting (DoS), insecure configuration settings.
8. Dangerous Dependencies: Vulnerable package imports if visible in project files.

IMPORTANT ACCURACY RULES:
- Do NOT claim an issue definitely exists when there is insufficient context.
- State confidence level (High, Medium, Low) and reasoning clearly in the description if context is partial.`,

  PERFORMANCE: `Focus on PERFORMANCE & BOTTLENECK ANALYSIS:
Analyze the provided code specifically for:
1. Algorithm Complexity: Inefficient algorithms (O(N²) or worse where O(N) or O(N log N) is possible), duplicate computations, unnecessary nested loops.
2. Database Bottlenecks: N+1 query patterns, executing queries inside loops, missing pagination for large result sets, unindexed lookups.
3. Network & API Efficiency: Unnecessary or duplicate HTTP/API requests, serial async calls that could be parallelized via Promise.all().
4. Frontend & Component Rendering: Inefficient React re-renders, missing React.memo / useMemo / useCallback where clearly justified.
5. Memory & Resource Leaks: Unclosed stream listeners, accumulating uncollected items in memory, unhandled large payload buffers.
6. Execution Threading: Sync blocking calls (e.g. fs.readFileSync) in event loops, unbatched heavy calculations.
7. Caching Opportunities: Missing HTTP caching headers, missing query result memoization or Redis key caching.

IMPORTANT EVIDENCE RULE:
- Avoid recommending micro-optimizations without clear code evidence or tangible performance impact.
- Explain the precise bottleneck and expected asymptotic/runtime improvement for every suggestion.`,

  QUALITY: `Focus on CODE QUALITY, CLEAN CODE & ARCHITECTURE:
Analyze the provided code specifically for:
1. Naming & Readability: Misleading or ambiguous variable/function names, magic numbers, lack of expressive self-documenting identifiers.
2. Code Structure & Complexity: Overly long functions (>50 lines), God classes/components, high cognitive or cyclomatic complexity, deeply nested logic.
3. Separation of Concerns & Abstractions: Mixing business logic directly in HTTP controllers or UI view components, leaky abstractions, coupling.
4. Duplicate Code (DRY Principle): Repeated logic blocks that should be extracted into reusable helper utilities or custom hooks.
5. Error Handling & Robustness: Swallowed exceptions, empty try-catch blocks, missing null/undefined safety checks, unhandled promise rejections.
6. Type Safety & Guardrails: Overuse of 'any' or loose types, missing method parameter/return type annotations, unvalidated type assertions.
7. Dead Code & Hygiene: Unused variables, dead code paths, orphan imports, commented-out dead code blocks.
8. Pattern Consistency: Inconsistent conventions across files (e.g. mixing async/await with raw promises, conflicting file structure).

PRACTICALITY RULE:
- All recommendations MUST be practical, specific, and directly actionable.
- Provide a refactored code snippet showing how to implement the cleaner alternative.`,
};

const MAX_FILES_PER_REVIEW = 25;
const MAX_CHARS_PER_FILE = 8000;

export function buildReviewPrompt(
  mode: ReviewMode,
  files: Array<{ path: string; content: string }>,
): Array<{ role: 'system' | 'user'; content: string }> {
  const truncatedFiles = files.slice(0, MAX_FILES_PER_REVIEW);
  const wasFileCountTruncated = files.length > MAX_FILES_PER_REVIEW;

  const fileContents = truncatedFiles
    .map((f) => {
      let content = f.content;
      if (content.length > MAX_CHARS_PER_FILE) {
        content =
          content.slice(0, MAX_CHARS_PER_FILE) +
          `\n\n[... Note: Content truncated (${f.content.length - MAX_CHARS_PER_FILE} characters omitted to satisfy LLM context limits) ...]`;
      }
      return `--- File: ${f.path} ---\n${content}\n--- End of ${f.path} ---`;
    })
    .join('\n\n');

  const truncationNotice = wasFileCountTruncated
    ? `\n\n[NOTICE: Only the first ${MAX_FILES_PER_REVIEW} of ${files.length} total files were included due to context window limits.]`
    : '';

  return [
    {
      role: 'system' as const,
      content: `${REVIEW_SYSTEM_PROMPT}\n\n${MODE_INSTRUCTIONS[mode]}`,
    },
    {
      role: 'user' as const,
      content: `Please review the following code:${truncationNotice}\n\n${fileContents}`,
    },
  ];
}

/**
 * Prompt template for documentation generation (README, Setup Guide, API Docs).
 */
export function buildDocGenPrompt(
  files: Array<{ path: string; content: string }>,
  docType: 'README' | 'SETUP_GUIDE' | 'API_DOCS' = 'README',
): Array<{ role: 'system' | 'user'; content: string }> {
  const fileContents = files
    .slice(0, 25)
    .map(
      (f) => `--- File: ${f.path} ---\n${f.content.slice(0, 6000)}\n--- End of ${f.path} ---`,
    )
    .join('\n\n');

  let typeInstructions = '';
  if (docType === 'README') {
    typeInstructions = `Generate a production-grade README.md file. Must include:
- Project Title & High-level Overview
- Key Features list
- Technology Stack table
- Prerequisites & Installation steps
- Environment Variables configuration (.env)
- How to Run Locally (Dev & Production commands)
- API Overview / Summary
- Basic Usage examples`;
  } else if (docType === 'SETUP_GUIDE') {
    typeInstructions = `Generate a step-by-step Developer Setup Guide. Must include:
- System prerequisites & runtime dependencies
- Local database setup & schema migration steps
- Environment variables checklist
- Step-by-step installation commands
- Verification & troubleshooting steps`;
  } else {
    typeInstructions = `Generate comprehensive API Documentation. Must include:
- Authentication headers & security requirements
- Full list of REST API Endpoints with HTTP methods
- Request parameters & JSON payload schemas
- Response status codes & sample JSON outputs
- Error response formats`;
  }

  return [
    {
      role: 'system' as const,
      content: `You are an expert technical writer and software architect.
${typeInstructions}

Return the documentation in clean, professional GitHub-Flavored Markdown.`,
    },
    {
      role: 'user' as const,
      content: `Generate ${docType} documentation based on the following codebase source files:\n\n${fileContents}`,
    },
  ];
}

/**
 * Prompt template for test generation.
 */
export function buildTestGenPrompt(
  files: Array<{ path: string; content: string }>,
  testFramework: string = 'vitest',
): Array<{ role: 'system' | 'user'; content: string }> {
  const fileContents = files
    .map(
      (f) => `--- File: ${f.path} ---\n${f.content}\n--- End of ${f.path} ---`,
    )
    .join('\n\n');

  return [
    {
      role: 'system' as const,
      content: `You are an expert test engineer. Generate comprehensive test cases for the provided code using ${testFramework}.

Include:
- Unit tests for each function/method
- Edge cases and error scenarios
- Mock setup where needed
- Descriptive test names

Return the test code in properly formatted code blocks with the filename as a comment at the top.`,
    },
    {
      role: 'user' as const,
      content: `Generate tests for:\n\n${fileContents}`,
    },
  ];
}
